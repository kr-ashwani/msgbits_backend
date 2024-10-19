import { Request, Response } from "express";
import { oauthProviderService } from "../../../service/database/auth/oauth/OAuthProviderService";
import { oauthService } from "../../../service/database/auth/oauth/OAuthService";
import { ClientResponse } from "../../../utils/clientResponse";

export const googleOAuthController = async (req: Request, res: Response) => {
  const clientRes = new ClientResponse(res);
  const oauthUserInfo = await oauthProviderService.getGoogleUserDetail(req.body.jwt);
  const user = await oauthService.createOAuthUser(oauthUserInfo, "GoogleOAuth");
  clientRes.sendJWTToken(user);
  clientRes.send("OK", clientRes.createSuccessObj("User is verified", user));
};
