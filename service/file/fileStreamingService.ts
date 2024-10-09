import config from "config";
import express from "express";
import crypto from "crypto";
import { pipeline, PassThrough, Transform, Readable } from "stream";
import { promisify } from "util";
import busboy from "busboy";
import { fileService } from "../database/chat/file/fileService";
import { LocalStorageProvider, S3StorageProvider, StorageProvider } from "./StorageProvideService";
import { EventEmitter } from "events";

// Increase the default max listeners
EventEmitter.defaultMaxListeners = 20;

const pipelineAsync = promisify(pipeline);

interface FileStreamingServiceConfig {
  encryptionKey: string;
  uploadToS3: boolean;
  s3Bucket?: string;
  algorithm?: string;
  blockSize?: number;
  ivSize?: number;
  localStoragePath?: string;
}

interface NodeJSError extends Error {
  code?: string;
}

function isNodeJSError(error: unknown): error is NodeJSError {
  return error instanceof Error && "code" in error;
}

class FileStreamingService {
  private encryptionKey: Buffer;
  private algorithm: string;
  private blockSize: number;
  private static ivSize: number;
  private storageProvider: StorageProvider;

  constructor(config: FileStreamingServiceConfig) {
    const salt = crypto.randomBytes(16);
    this.encryptionKey = crypto.scryptSync(config.encryptionKey, salt, 32);
    this.algorithm = config.algorithm || "aes-256-cbc";
    this.blockSize = config.blockSize || 16;
    FileStreamingService.ivSize = config.ivSize || 16;
    this.storageProvider =
      config.uploadToS3 && config.s3Bucket
        ? new S3StorageProvider(config.s3Bucket)
        : new LocalStorageProvider(config.localStoragePath || "./encryptedFiles");
  }

  async processFileAndEncrypt(req: express.Request, res: express.Response) {
    const fileId = req.params.fileId;
    if (!fileId) return res.status(400).send("fileId is missing");

    const bb = busboy({ headers: req.headers });

    bb.on("file", async (name: string, file: NodeJS.ReadableStream, info: busboy.FileInfo) => {
      try {
        const { passThrough, iv } = this.createEncryptStream();

        const savePromise = this.storageProvider.save(passThrough, fileId);

        file.on("end", () => {
          passThrough.end();
        });

        await pipelineAsync(file, passThrough);
        await savePromise;

        res.json({ fileId, message: "File uploaded successfully", url: fileId });
      } catch (error) {
        console.error("Upload error:", error);
        res.status(500).send("Error processing file upload");
      }
    });

    bb.on("error", (error: Error) => {
      console.error("Busboy error:", error);
      res.status(500).send("Error processing upload");
    });

    req.pipe(bb);
  }

  private createEncryptStream() {
    const iv = crypto.randomBytes(FileStreamingService.ivSize);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    const passThrough = new PassThrough();

    passThrough.write(iv);

    pipeline(cipher, passThrough, (err) => {
      if (err) console.error("Encryption pipeline failed:", err);
    });

    return { passThrough, iv };
  }

  async decryptAndStreamFile(req: express.Request, res: express.Response) {
    const fileId = req.params.fileId;
    const metadata = await fileService.getFileById(fileId);
    if (!metadata) return res.status(400).send("fileId is not accurate");

    try {
      const encryptedFileSize = await this.storageProvider.getFileSize(fileId);
      const iv = await this.readIV(fileId);
      const actualFileSize = encryptedFileSize - FileStreamingService.ivSize;

      res.setHeader("Content-Disposition", `inline; filename="${metadata.fileName}"`);
      res.setHeader("Content-Type", metadata.fileType || "application/octet-stream");

      const range = req.headers.range;
      if (range) {
        await this.handleRangeRequest(req, res, fileId, iv, actualFileSize, encryptedFileSize);
      } else {
        await this.handleFullRequest(req, res, fileId, iv, actualFileSize);
      }
    } catch (error) {
      console.error("Streaming error:", error);
      if (!res.headersSent) {
        res.status(500).send("Error streaming file");
      }
    }
  }

  private async readIV(fileId: string): Promise<Buffer> {
    const ivStream = await this.storageProvider.createReadStream(
      fileId,
      0,
      FileStreamingService.ivSize - 1
    );
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      ivStream.on("data", (chunk) => chunks.push(chunk));
      ivStream.on("end", () => resolve(Buffer.concat(chunks)));
      ivStream.on("error", reject);
    });
  }

  private async handleRangeRequest(
    req: express.Request,
    res: express.Response,
    fileId: string,
    iv: Buffer,
    actualFileSize: number,
    encryptedFileSize: number
  ) {
    const range = req.headers.range!;
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : actualFileSize - 1;

    const chunkSize = end - start + 1;
    const encryptedStart =
      Math.floor(start / this.blockSize) * this.blockSize + FileStreamingService.ivSize;
    const encryptedEnd =
      Math.ceil((end + 1) / this.blockSize) * this.blockSize + FileStreamingService.ivSize - 1;

    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${actualFileSize}`);
    res.setHeader("Content-Length", chunkSize);

    const fileStream = await this.storageProvider.createReadStream(
      fileId,
      encryptedStart,
      encryptedEnd
    );
    const { decryptedStream } = this.createDecryptStream(iv, start);

    const trimStream = this.createTrimStream(start % this.blockSize, chunkSize);

    let isClosed = false;

    const cleanup = (err?: unknown) => {
      if (isClosed) return;
      isClosed = true;

      if (fileStream.unpipe) fileStream.unpipe(decryptedStream);
      decryptedStream.unpipe(trimStream);
      trimStream.unpipe(res);

      this.safelyCloseStream(fileStream);
      this.safelyCloseStream(decryptedStream);
      this.safelyCloseStream(trimStream);

      if (
        err &&
        isNodeJSError(err) &&
        err.code !== "ERR_STREAM_PREMATURE_CLOSE" &&
        !res.headersSent
      ) {
        res.status(500).send("Error streaming file");
      }
    };

    fileStream.on("error", cleanup);
    decryptedStream.on("error", cleanup);
    trimStream.on("error", cleanup);
    res.on("close", cleanup);

    fileStream.pipe(decryptedStream).pipe(trimStream).pipe(res);
  }

  private async handleFullRequest(
    req: express.Request,
    res: express.Response,
    fileId: string,
    iv: Buffer,
    actualFileSize: number
  ) {
    const fileStream = await this.storageProvider.createReadStream(
      fileId,
      FileStreamingService.ivSize
    );

    res.setHeader("Content-Length", actualFileSize);

    const { decryptedStream } = this.createDecryptStream(iv);

    let isClosed = false;

    const cleanup = (err?: unknown) => {
      if (isClosed) return;
      isClosed = true;

      if (fileStream.unpipe) fileStream.unpipe(decryptedStream);
      decryptedStream.unpipe(res);

      this.safelyCloseStream(fileStream);
      this.safelyCloseStream(decryptedStream);

      if (
        err &&
        isNodeJSError(err) &&
        err.code !== "ERR_STREAM_PREMATURE_CLOSE" &&
        !res.headersSent
      ) {
        res.status(500).send("Error streaming file");
      }
    };

    fileStream.on("error", cleanup);
    decryptedStream.on("error", cleanup);
    res.on("close", cleanup);

    fileStream.pipe(decryptedStream).pipe(res);
  }

  private createDecryptStream(iv: Buffer, start: number = 0) {
    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    const decryptedStream = new PassThrough();

    let buffer = Buffer.alloc(0);
    let startOffset = start % this.blockSize;
    const blockSize = this.blockSize;

    const transform = new Transform({
      transform(chunk: Buffer, encoding, callback) {
        buffer = Buffer.concat([buffer, chunk]);

        while (buffer.length >= blockSize) {
          const decryptChunk = buffer.slice(0, blockSize);
          buffer = buffer.slice(blockSize);

          let decrypted = decipher.update(decryptChunk);

          if (startOffset > 0) {
            decrypted = decrypted.slice(startOffset);
            startOffset = 0;
          }

          this.push(decrypted);
        }

        callback();
      },
      flush(callback) {
        if (buffer.length > 0) {
          try {
            let decrypted = decipher.update(buffer);
            this.push(decrypted);
            const final = decipher.final();
            this.push(final);
          } catch (err) {
            console.error("Error in decryption flush:", err);
            callback(err as Error);
            return;
          }
        }
        callback();
      },
    });

    let isClosed = false;

    const cleanup = (err?: unknown) => {
      if (isClosed) return;
      isClosed = true;

      transform.unpipe(decryptedStream);
      this.safelyCloseStream(transform);
      this.safelyCloseStream(decryptedStream);

      if (err && isNodeJSError(err) && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        console.error("Decryption pipeline failed:", err);
      }
    };

    transform.on("end", cleanup);
    transform.on("error", cleanup);
    decryptedStream.on("end", cleanup);
    decryptedStream.on("error", cleanup);

    transform.pipe(decryptedStream);

    return { decryptedStream, transform };
  }

  private createTrimStream(startOffset: number, length: number): Transform {
    let bytesOutput = 0;

    return new Transform({
      transform(chunk: Buffer, encoding, callback) {
        if (bytesOutput >= length) {
          callback();
          return;
        }

        let outputChunk = chunk;
        if (startOffset > 0) {
          outputChunk = chunk.slice(startOffset);
          startOffset = 0;
        }

        if (bytesOutput + outputChunk.length > length) {
          outputChunk = outputChunk.slice(0, length - bytesOutput);
        }

        bytesOutput += outputChunk.length;
        this.push(outputChunk);
        callback();
      },
    });
  }

  private safelyCloseStream(stream: any) {
    if (stream.destroy && typeof stream.destroy === "function") {
      stream.destroy();
    } else if (stream.cancel && typeof stream.cancel === "function") {
      stream.cancel();
    }
  }
}

// Usage
const serviceConfig: FileStreamingServiceConfig = {
  encryptionKey: process.env.ENCRYPTION_KEY || "default-key",
  uploadToS3: process.env.UPLOAD_FILES_TO_S3 === "true",
  s3Bucket: process.env.S3_BUCKET,
  // Optional: algorithm, blockSize, ivSize, localStoragePath
};

const fileStreamingService = new FileStreamingService(serviceConfig);

export { fileStreamingService };
