import path from "path";
import config from "config";
import fs from "fs";
import { pipeline, Readable } from "stream";
import { promisify } from "util";
import { S3, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const pipelineAsync = promisify(pipeline);

interface StorageProvider {
  save(encryptedStream: NodeJS.ReadableStream, fileId: string): Promise<void>;
  createReadStream(fileId: string, start?: number, end?: number): Promise<NodeJS.ReadableStream>;
  getFileSize(fileId: string): Promise<number>;
  cleanup(): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  constructor(private storagePath: string) {
    if (!fs.existsSync(storagePath)) fs.mkdirSync(storagePath, { recursive: true });
  }

  async save(encryptedStream: NodeJS.ReadableStream, fileId: string): Promise<void> {
    const filePath = path.join(this.storagePath, `${fileId}.enc`);
    const writeStream = fs.createWriteStream(filePath);
    try {
      await pipelineAsync(encryptedStream, writeStream);
    } catch (error) {
      console.error(`Error saving file ${fileId}:`, error);
      throw error;
    }
  }

  async createReadStream(
    fileId: string,
    start?: number,
    end?: number
  ): Promise<NodeJS.ReadableStream> {
    const filePath = path.join(this.storagePath, `${fileId}.enc`);
    return fs.createReadStream(filePath, { start, end });
  }

  async getFileSize(fileId: string): Promise<number> {
    const filePath = path.join(this.storagePath, `${fileId}.enc`);
    try {
      const stat = await fs.promises.stat(filePath);
      return stat.size;
    } catch (error) {
      console.error(`Error getting file size for ${fileId}:`, error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for local storage
  }
}

interface S3Config {
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  // Add other S3 configuration options as needed
}

class S3StorageProvider implements StorageProvider {
  private s3: S3;
  private bucket: string;

  constructor(bucket?: string, s3config: S3Config = {}) {
    const S3Config: S3Config = {
      region: config.get("AWS_REGION"),
      credentials: {
        accessKeyId: config.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: config.get("AWS_SECRET_ACCESS_KEY"),
      },
    };
    this.s3 = new S3(s3config);
    this.bucket = bucket || config.get("S3_BUCKET");
  }

  async save(encryptedStream: NodeJS.ReadableStream, fileId: string): Promise<void> {
    // Convert NodeJS.ReadableStream to Readable if necessary
    const readableStream =
      encryptedStream instanceof Readable ? encryptedStream : Readable.from(encryptedStream);

    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: `${fileId}.enc`,
        Body: readableStream,
      },
    });

    try {
      await upload.done();
    } catch (error) {
      console.error(`Error uploading file ${fileId}:`, error);
      throw error;
    }
  }

  async createReadStream(
    fileId: string,
    start?: number,
    end?: number
  ): Promise<NodeJS.ReadableStream> {
    const params = {
      Bucket: this.bucket,
      Key: `${fileId}.enc`,
      Range: start !== undefined ? `bytes=${start}-${end ? end : ""}` : undefined,
    };
    try {
      const { Body } = await this.s3.send(new GetObjectCommand(params));
      if (Body instanceof Readable) {
        return Body;
      } else {
        throw new Error("Unexpected response body type");
      }
    } catch (error) {
      console.error(`Error creating read stream for ${fileId}:`, error);
      throw error;
    }
  }

  async getFileSize(fileId: string): Promise<number> {
    try {
      const { ContentLength } = await this.s3.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: `${fileId}.enc`,
        })
      );
      return ContentLength ?? 0;
    } catch (error) {
      console.error(`Error getting file size for ${fileId}:`, error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for S3 client
  }
}

export { StorageProvider, LocalStorageProvider, S3StorageProvider };
