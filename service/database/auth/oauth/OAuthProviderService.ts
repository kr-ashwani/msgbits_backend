import axios from "axios";
import { AppError } from "../../../../errors/AppError";
import AuthenticationError from "../../../../errors/httperror/AuthenticationError";
import { OAuthUserSchema } from "../../../../schema/user/OAuthUserSchema";
import { OAuth2Client } from "google-auth-library";
import config from "config";
import handleError from "../../../../errors/errorhandler/ErrorHandler";

class OAuthProviderService {
  static GOOGLE_CLIENT_ID = config.get<string>("GOOGLE_CLIENT_ID");
  static GoogleOAuthclient = new OAuth2Client(OAuthProviderService.GOOGLE_CLIENT_ID);

  async getFacebookUserDetail(access_token: string) {
    try {
      const response: any = await axios.get(
        `https://graph.facebook.com/me?fields=["email","name","picture.type(large)"]&access_token=${access_token}`
      );

      const facebookPayload = OAuthUserSchema.parse({
        email: response.data.email,
        isVerified: true,
        name: response.data.name,
        profilePicture: response.data.picture.data.url,
      });
      return facebookPayload;
    } catch (err: any) {
      handleError(err);
      if (err instanceof AppError) throw err;
      throw new AuthenticationError(err?.message || "Facebook Authentication failed");
    }
  }

  async getGoogleUserDetail(jwt: string) {
    try {
      const token = jwt;
      const ticket = await OAuthProviderService.GoogleOAuthclient.verifyIdToken({
        idToken: token,
        audience: OAuthProviderService.GOOGLE_CLIENT_ID,
      });

      const payload: any = ticket.getPayload();
      payload.picture = payload.picture.replace(/s\d+-c/, `s${800}-c`); // get higher quality of picture

      const googlePayload = OAuthUserSchema.parse({
        email: payload.email,
        isVerified: payload.email_verified,
        name: payload.name,
        profilePicture: payload.picture,
      });
      return googlePayload;
    } catch (err: any) {
      handleError(err);
      throw new AuthenticationError(err?.message || "Github Authentication failed");
    }
  }

  private async getGithubAccessToken(code: string) {
    try {
      const clientID = config.get<string>("GITHUB_OAUTH_CLIENT_ID");
      const clientSecret = config.get<string>("GITHUB_OAUTH_CLIENT_SECRET");
      const tokenUrl = await axios.get(
        `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${code}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      const { access_token } = tokenUrl.data;
      return access_token;
    } catch (err: any) {
      throw new AuthenticationError(err?.message || "Github Authentication failed");
    }
  }
  async getGithubUserDetail(code: string) {
    try {
      const access_token = await this.getGithubAccessToken(code);
      const userDetail = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      });

      const userEmail = await axios.get("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      const [primaryEmail] = userEmail.data.filter((e: any) => e.primary);

      const githubPayload = OAuthUserSchema.parse({
        name: userDetail.data.name,
        email: primaryEmail.email,
        isVerified: primaryEmail.verified,
        profilePicture: userDetail.data.avatar_url,
      });
      return githubPayload;
    } catch (err: any) {
      handleError(err);
      if (err instanceof AppError) throw err;
      throw new AuthenticationError(err?.message || "Github Authentication failed");
    }
  }
}
const oauthProviderService = new OAuthProviderService();
export { oauthProviderService };
