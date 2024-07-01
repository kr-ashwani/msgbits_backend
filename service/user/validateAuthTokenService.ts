import AuthenticationError from "../../errors/httperror/AuthenticationError";
import { jwtService } from "../jwt/JwtService";
import { userService } from "./userService";

export async function validateAuthTokenService(cookie: any) {
  try {
    if (!(cookie && cookie._auth_token))
      throw new AuthenticationError("Auth token in cookies is missing");

    const jwtPayload = jwtService.verifyToken(String(cookie._auth_token));
    if (!jwtPayload) throw new AuthenticationError("Auth token is tampered");

    const user = await userService.findUserByEmail({ email: jwtPayload.email });

    return { user, jwtPayload };
  } catch (err) {
    throw err;
  }
}
