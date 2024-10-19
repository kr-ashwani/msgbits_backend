import { Request, Response } from "express";
import { oauthProviderService } from "../../../service/database/auth/oauth/OAuthProviderService";
import { oauthService } from "../../../service/database/auth/oauth/OAuthService";
import { ClientResponse } from "../../../utils/clientResponse";

export const facebookOAuthController = async (req: Request, res: Response) => {
  const clientRes = new ClientResponse(res);
  const oauthUserInfo = await oauthProviderService.getFacebookUserDetail(req.body.accessToken);
  const user = await oauthService.createOAuthUser(oauthUserInfo, "FacebookOAuth");
  clientRes.sendJWTToken(user);
  clientRes.send("OK", clientRes.createSuccessObj("User is verified", user));
};
