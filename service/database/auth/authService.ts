import { HydratedDocument } from "mongoose";
import { UserRowMapper } from "../../../Dao/RowMapper/UserRowMapper";
import { userDAO } from "../../../Dao/UserDAO";
import AuthenticationError from "../../../errors/httperror/AuthenticationError";
import { IUser } from "../../../model/user.model";
import { resSchemaForModel } from "../../../responseSchema";
import { OTPSchema } from "../../../schema/user/OTPSchema";
import { jwtService } from "../../jwt/JwtService";
import { userService } from "../user/userService";

class AuthService {
  async validateAuthTokenService(cookie: any) {
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

  async verifyOTPService(input: OTPSchema) {
    try {
      const user: HydratedDocument<IUser>[] = [];
      /**
       * checks for email matches input email
       * account is not already verified
       * authCode is same as input otp
       * authCodeValidTime >= Date.now() (auth code is not expired)
       */
      await userDAO.update(
        {
          email: input.email,
          isVerified: false,
          authCode: input.otp,
          authCodeValidTime: { $gte: Date.now() },
          authCodeType: "VerifyAccount",
        },
        {
          isVerified: true,
          authCodeValidTime: 0,
        },
        new UserRowMapper((data) => {
          user.push(data);
        })
      );
      // if previous update is successful then update query will return that user
      if (user.length === 1) return resSchemaForModel.getUser(user[0]);

      // if user update is unsuccessful, then find used by input email and check what went wrong
      await userDAO.find(
        {
          email: input.email,
        },
        new UserRowMapper((data) => {
          user.push(data);
        })
      );

      let failureMsg = "Something Went Wrong";
      if (user.length !== 1) failureMsg = "User is not registered";
      else if (user[0].isVerified)
        failureMsg = `User with email ${user[0].email} is already registered. Try logging in`;
      else if (user[0].authCode !== Number(input.otp)) failureMsg = "OTP did not match";
      else if (user[0].authCodeValidTime <= Date.now()) failureMsg = "OTP has expired";

      throw new AuthenticationError(failureMsg);
    } catch (err) {
      throw err;
    }
  }
}

const authService = new AuthService();
export { authService };
