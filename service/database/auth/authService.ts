import { HydratedDocument } from "mongoose";
import { UserRowMapper } from "../../../Dao/RowMapper/UserRowMapper";
import { userDAO } from "../../../Dao/UserDAO";
import AuthenticationError from "../../../errors/httperror/AuthenticationError";
import { IUser } from "../../../model/user.model";
import { resSchemaForModel } from "../../../schema/responseSchema";
import { OTPSchema } from "../../../schema/user/OTPSchema";
import { jwtService } from "../../jwt/JwtService";
import { userService } from "../user/userService";
import bcrypt from "bcrypt";

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

      await userDAO.find(
        {
          email: input.email,
        },
        new UserRowMapper((data) => {
          user.push(data);
        })
      );

      let failureMsg = "";
      if (user.length !== 1) failureMsg = "User is not registered";
      else if (user[0].isVerified)
        failureMsg = `User with email ${user[0].email} is already registered. Try logging in`;
      else if (!(await bcrypt.compare(String(input.otp), user[0].authCode)))
        failureMsg = "OTP did not match";
      else if (user[0].authCodeValidTime <= Date.now()) failureMsg = "OTP has expired";
      else if (user[0].authCodeType !== "VerifyAccount") failureMsg = "Code is invalid";

      if (failureMsg) throw new AuthenticationError(failureMsg);

      const userAuthCode = user[0].authCode;
      user.length = 0;

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
          authCode: userAuthCode,
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

      if (user.length !== 1) throw new AuthenticationError("Something went wrong");

      return resSchemaForModel.getUser(user[0]);
    } catch (err) {
      throw err;
    }
  }
}

const authService = new AuthService();
export { authService };
