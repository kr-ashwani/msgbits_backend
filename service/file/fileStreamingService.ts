import config from "config";
import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { pipeline, Transform } from "stream";
import { promisify } from "util";
import busboy from "busboy";
import { fileService } from "../database/chat/file/fileService";

const pipelineAsync = promisify(pipeline);

class FileStreamingService {
  private encryptionKey: Buffer;
  private storagePath: string;
  private algorithm: string = "aes-256-cbc";
  private blockSize: number = 16;
  private static ivSize: number = 16;

  constructor(encryptionKey: string) {
    this.encryptionKey = crypto.scryptSync(encryptionKey, "salt", 32);
    const storagePath = "./encryptedFiles";
    if (!fs.existsSync(storagePath)) fs.mkdirSync(storagePath, { recursive: true });
    this.storagePath = storagePath;
  }
  async processFileAndEncrypt(req: express.Request, res: express.Response) {
    const fileId = req.params.fileId;
    if (!fileId) res.status(400).send("fileId is missing");

    const bb = busboy({ headers: req.headers });

    bb.on("file", (name: string, file: any, info: any) => {
      this.encryptAndSave(file, fileId)
        .then(() => {
          res.json({ fileId, message: "File uploaded successfully", url: fileId });
        })
        .catch((error) => {
          res.status(500).send("Error processing file upload");
        });
    });

    bb.on("error", (error: any) => {
      res.status(500).send("Error processing upload");
    });

    req.pipe(bb);
  }
  async decryptAndStreamFile(req: express.Request, res: express.Response) {
    const fileId = req.params.fileId;
    const metadata = await fileService.getFileById(fileId);
    if (!metadata) return res.status(400).send("fileId is not accurate");
    const filePath = path.join(this.storagePath, `${fileId}.enc`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }
    res.setHeader("Content-Disposition", `inline; filename="${metadata.fileName}"`);
    res.setHeader("Content-Type", metadata.fileType || "application/octet-stream");

    const ivSize = FileStreamingService.ivSize;
    const iv = Buffer.alloc(ivSize);
    await new Promise<void>((resolve, reject) => {
      fs.read(fs.openSync(filePath, "r"), iv, 0, ivSize, 0, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const actualFileSize = metadata.size;
    const stat = fs.statSync(filePath);
    const encryptedFileSize = stat.size;

    const range = req.headers.range;
    if (range)
      this.decryptAndStreamRangeFiles(req, res, iv, filePath, actualFileSize, encryptedFileSize);
    else
      this.decryptAndStreamNonRangeFiles(req, res, iv, filePath, actualFileSize, encryptedFileSize);
  }

  private async encryptAndSave(readStream: NodeJS.ReadableStream, fileId: string): Promise<void> {
    const iv = crypto.randomBytes(FileStreamingService.ivSize);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    const filePath = path.join(this.storagePath, `${fileId}.enc`);
    const writeStream = fs.createWriteStream(filePath);

    writeStream.write(iv);
    await pipelineAsync(readStream, cipher, writeStream);
  }

  private createDecryptStream(key: Buffer, iv: Buffer, start: number = 0): Transform {
    let decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    let buffer = Buffer.alloc(0);
    let startOffset = start % this.blockSize;
    const blockSize = this.blockSize;

    return new Transform({
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
          let decrypted = decipher.update(buffer);
          this.push(decrypted);
        }

        try {
          const final = decipher.final();
          this.push(final);
        } catch (err) {
          console.error("Error in decipher final:", err);
        }

        callback();
      },
    });
  }

  private async decryptAndStreamRangeFiles(
    req: express.Request,
    res: express.Response,
    iv: Buffer,
    filePath: string,
    actualFileSize: number,
    encryptedFileSize: number
  ) {
    const range = req.headers.range;
    let start = 0;
    let end = encryptedFileSize - 1;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : actualFileSize - 1;

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${actualFileSize}`);
    }

    let chunkSize = end - start + 1;
    res.setHeader("Content-Length", chunkSize);

    const ivSize = 16;
    const encryptedStart = Math.floor(start / this.blockSize) * this.blockSize;

    const readStream = fs.createReadStream(filePath, {
      start: encryptedStart + ivSize,
      end: encryptedFileSize - 1,
      highWaterMark: 64 * 1024, // 64KB chunks
    });

    const decryptStream = this.createDecryptStream(this.encryptionKey, iv, encryptedStart);
    const blockSize = this.blockSize;
    const trimStream = new Transform({
      transform(chunk: Buffer, encoding, callback) {
        if (start > 0) {
          const startOffset = start % blockSize;
          chunk = chunk.slice(startOffset);
          start = 0;
        }
        if (chunk.length > chunkSize) {
          chunk = chunk.slice(0, chunkSize);
        }
        chunkSize -= chunk.length;
        this.push(chunk);
        callback();
      },
    });

    res.on("close", () => {
      readStream.destroy();
    });

    try {
      await pipelineAsync(readStream, decryptStream, trimStream, res);
    } catch (error: any) {
      if (error.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        console.error("Error in decryptAndStream:", error.message);
        if (!res.headersSent) {
          res.status(500).send("Internal Server Error");
        }
      }
    }
  }

  private async decryptAndStreamNonRangeFiles(
    req: express.Request,
    res: express.Response,
    iv: Buffer,
    filePath: string,
    actualFileSize: number,
    encryptedFileSize: number
  ) {
    const ivSize = FileStreamingService.ivSize;

    const readStream = fs.createReadStream(filePath, {
      start: ivSize,
      end: encryptedFileSize,
      highWaterMark: 64 * 1024, // 64KB chunks
    });
    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);

    res.setHeader("Content-Length", actualFileSize);

    try {
      await pipelineAsync(readStream, decipher, res);
    } catch (error) {
      console.error("Download failed:", error);
      if (!res.headersSent) {
        res.status(500).send("Download failed");
      }
    }
  }
}

const encryptionKey = process.env.ENCRYPTION_KEY || "xxx";
const fileStreamingService = new FileStreamingService(encryptionKey);
export { fileStreamingService };
