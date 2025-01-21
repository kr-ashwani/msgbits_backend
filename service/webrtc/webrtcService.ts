import config from "config";
import { ResponseUserSchema } from "../../schema/responseSchema";
import AuthorizationError from "../../errors/httperror/AuthorizationError";
import crypto from "crypto";

class WebrtcService {
  private readonly TURN_STATIC_AUTH_SECRET: string;
  private readonly TURN_CREDENTIALS_TTL: number;
  private readonly STUN_URL: string;
  private readonly TURN_URL: string;

  constructor() {
    this.TURN_STATIC_AUTH_SECRET = config.get<string>("TURN_STATIC_AUTH_SECRET");
    this.TURN_CREDENTIALS_TTL = 10 * 60; // 10 minutes
    this.STUN_URL = config.get<string>("STUN_URL");
    this.TURN_URL = config.get<string>("TURN_URL");
  }

  async generateStunTurnCredentials(authUser: ResponseUserSchema | null) {
    try {
      if (!authUser) throw new AuthorizationError("Permission denied to access this resource");

      const userId = authUser._id;

      // Generate username with timestamp (24 hours from now)
      const username = `${Math.floor(Date.now() / 1000) + this.TURN_CREDENTIALS_TTL}:${userId}`;

      // Generate credential using HMAC-SHA1
      const credential = crypto
        .createHmac("sha1", this.TURN_STATIC_AUTH_SECRET)
        .update(username)
        .digest("base64");

      return {
        stunUrl: this.STUN_URL,
        turnUrl: this.TURN_URL,
        username,
        credential,
        ttl: this.TURN_CREDENTIALS_TTL,
      };
    } catch (err) {
      throw err;
    }
  }
}

const webrtcService = new WebrtcService();
export { webrtcService };
