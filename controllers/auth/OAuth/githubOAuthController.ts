import { Request, Response } from "express";
import { oauthProviderService } from "../../../service/database/auth/oauth/OAuthProviderService";
import { oauthService } from "../../../service/database/auth/oauth/OAuthService";
import { ClientResponse } from "../../../utils/clientResponse";

export const githubOAuthController = async (req: Request, res: Response) => {
  const clientRes = new ClientResponse(res);
  try {
    const query = typeof req.query.code === "string" ? req.query.code : "";
    const oauthUserInfo = await oauthProviderService.getGithubUserDetail(query);
    const user = await oauthService.createOAuthUser(oauthUserInfo, "GithubOAuth");
    clientRes.sendJWTToken(user);
    clientRes.redirectToAuthURL("success=true&message=User is verified");
  } catch (err) {
    clientRes.redirectToAuthURL("success=false&error=github OAuth failed.Try again");
  }
};
