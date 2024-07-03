import { Request, Response } from "express";
import { ClientResponse } from "../../../utilityClasses/clientResponse";
import { oauthProviderService } from "../../../service/database/auth/oauth/OAuthProviderService";
import { oauthService } from "../../../service/database/auth/oauth/OAuthService";

export const googleOAuthController = async (req: Request, res: Response) => {
  const clientRes = new ClientResponse(res);
  const oauthUserInfo = await oauthProviderService.getGoogleUserDetail(req.body.jwt);
  const user = await oauthService.createOAuthUser(oauthUserInfo, "GoogleOAuth");
  clientRes.sendJWTToken(user);
  clientRes.send("OK", clientRes.createSuccessObj("User is verified", user));
};
