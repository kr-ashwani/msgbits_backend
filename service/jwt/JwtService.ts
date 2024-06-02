import config from "config";
import jwt from "jsonwebtoken";

export interface userJWTPayload {
  name: string;
  email: string;
  createdAt: number;
}

class JwtService {
  private refresh_secret_key = config.get<string>("REFRESH_TOKEN_SECRET_KEY");
  private refresh_exp_time = config.get<number>("REFRESH_TOKEN_EXP_TIME");
  verifyToken(token: string) {
    try {
      jwt.verify(token, this.refresh_secret_key);
      return true;
    } catch (err) {
      return false;
    }
  }
  createToken(payload: userJWTPayload) {
    const refreshToken = jwt.sign(payload, this.refresh_secret_key, {
      expiresIn: this.refresh_exp_time,
    });
    return refreshToken;
  }
}

const jwtService = new JwtService();
export { jwtService };
