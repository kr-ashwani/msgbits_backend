import { ArrayElement } from "mongodb";
import { HydratedDocument } from "mongoose";
import { UserRowMapper } from "../../../../Dao/RowMapper/UserRowMapper";
import { userDAO } from "../../../../Dao/UserDAO";
import { authType, IUser } from "../../../../model/user.model";
import { resSchemaForModel } from "../../../../schema/responseSchema";
import { IOAuthUserSchema } from "../../../../schema/user/OAuthUserSchema";
import crypto from "crypto";
import EmailVerificationError from "../../../../errors/httperror/EmailVerificationError";
import { userService } from "../../user/userService";

class OAuthService {
  async createOAuthUser(input: IOAuthUserSchema, oauthType: ArrayElement<authType>) {
    const user: HydratedDocument<IUser>[] = [];

    await userDAO.find(
      {
        email: input.email,
      },
      new UserRowMapper((data) => {
        user.push(data);
      })
    );

    //existing user with unverified account using an unverified OAuth service
    if (user.length && user[0].isVerified === false && input.isVerified === false)
      throw new EmailVerificationError(
        `Email is not verified by ${oauthType}. Please use different Email or OAuth Service.`
      );
    //existing user with unverified account using a verified OAuth service
    else if (user.length && user[0].isVerified === false) {
      user[0].isVerified = input.isVerified;
      await user[0].save();
      return user[0];
    }
    //existing user is verified
    else if (user.length) return user[0];

    // user will be an empty array
    await userDAO.create(
      {
        ...input,
        authType: [oauthType],
        password: crypto.randomBytes(50).toString("hex"),
      },
      new UserRowMapper((data) => user.push(data))
    );

    const resUser = resSchemaForModel.getUser(user[0]);

    userService.emitNewVerifiedUserCreated(resUser);
    return resUser;
  }
}

const oauthService = new OAuthService();
export { oauthService };
