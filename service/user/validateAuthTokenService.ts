import { ClientResponse } from "../../utilityClasses/clientResponse";
import { jwtService } from "../jwt/JwtService";
import { userService } from "./userService";

export async function validateAuthTokenService(cookie: any) {
  try {
    const res = new ClientResponse();
    console.log(cookie);
    if (!(cookie && cookie._auth_token))
      return res.createErrorObj("Authentication Error", "Auth token in cookies is missing");

    const jwtPayload = jwtService.verifyToken(String(cookie._auth_token));
    if (!jwtPayload) return res.createErrorObj("Authentication Error", "JWT token is tampered");

    const resObj = await userService.findUserByEmail({ email: jwtPayload.email });
    if (!resObj.success)
      return res.createErrorObj(
        "Authentication Error",
        `User with email ${jwtPayload.email} is not registered. Try signing up`
      );
    else {
      if (!resObj.data.originalUser.isVerified) {
        return res.createErrorObj(
          "Authentication Error",
          `User with email ${jwtPayload.email} is not verified. Try signing up`
        );
      }
    }

    return res.createSuccessObj("User is authenticated successfully", {
      ...resObj.data,
      jwtPayload,
    });
  } catch (e: any) {
    throw new Error(e);
  }
}
