import * as crypto from "crypto";

class CryptoSingleton {
  private static instance: CryptoSingleton;
  private key: Buffer;

  private constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) throw new Error("Encryption key is not set");
    this.key = this.deriveKey(encryptionKey);
  }

  public static getInstance(): CryptoSingleton {
    if (!CryptoSingleton.instance) {
      CryptoSingleton.instance = new CryptoSingleton();
    }
    return CryptoSingleton.instance;
  }

  private deriveKey(input: string): Buffer {
    return crypto.createHash("sha256").update(input).digest();
  }

  public async encrypt(text: string): Promise<string> {
    try {
      const nonce = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv("aes-256-gcm", this.key, nonce);
      const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
      const tag = cipher.getAuthTag();
      return Buffer.concat([nonce, tag, encrypted]).toString("base64");
    } catch (err) {
      throw new Error("Encryption failed");
    }
  }

  public async decrypt(encryptedData: string): Promise<string> {
    try {
      const buffer = Buffer.from(encryptedData, "base64");
      const nonce = buffer.subarray(0, 12);
      const tag = buffer.subarray(12, 28);
      const encrypted = buffer.subarray(28);
      const decipher = crypto.createDecipheriv("aes-256-gcm", this.key, nonce);
      decipher.setAuthTag(tag);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString("utf8");
    } catch (error) {
      throw new Error("Decryption failed");
    }
  }

  public async hashData(data: string): Promise<string> {
    return crypto.createHash("sha256").update(data).digest("hex");
  }
}

const cryptoSingleton = CryptoSingleton.getInstance();

export default cryptoSingleton;
