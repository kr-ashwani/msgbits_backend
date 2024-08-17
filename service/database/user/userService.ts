import { HydratedDocument } from "mongoose";
import { UserInput } from "../../../schema/user/userSchema";
import { IUser } from "../../../model/user.model";
import { userDAO } from "../../../Dao/UserDAO";
import { UserRowMapper } from "../../../Dao/RowMapper/UserRowMapper";
import { MathUtil } from "../../../utils/MathUtil";
import { IresetPassword } from "../../../schema/user/resetPasswordSchema";
import { IforgotPassword } from "../../../schema/user/forgotPasswordSchema";
import AuthenticationError from "../../../errors/httperror/AuthenticationError";
import { resSchemaForModel } from "../../../responseSchema";
import mailService from "../../mail/mailService";
import EmailVerificationError from "../../../errors/httperror/EmailVerificationError";

class UserService {
  async createUser(input: UserInput) {
    try {
      const user: HydratedDocument<IUser>[] = [];
      await userDAO.create(
        {
          ...input,
          isVerified: false,
          authType: ["EmailPassword"],
        },
        new UserRowMapper((data) => {
          // send mail to successfull created account
          mailService.addOTPmailToQueue(data);
          user.push(data);
        })
      );
      //we are sure user will have atleast 1 element
      return resSchemaForModel.getUser(user[0]);
    } catch (err) {
      throw err;
    }
  }
  // this service should only be used by login controller
  async findAndValidateUser(input: Omit<UserInput, "name">) {
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

      if (user.length !== 1)
        throw new AuthenticationError(
          `User with email ${input.email} is not registered. Try signing up`
        );

      const isValidUser = await user[0].comparePassword(input.password);
      //we are sure user will have atleast 1 element

      if (isValidUser) {
        if (!user[0].isVerified) {
          await this.accountVerificationThroughEmail({ email: user[0].email });
          throw new EmailVerificationError(
            `User with email ${input.email} is not verified. Please log in and verify your account.`
          );
        }
        return resSchemaForModel.getUser(user[0]);
      } else throw new AuthenticationError("password did not match");
    } catch (err) {
      throw err;
    }
  }

  async findUserByEmail(input: { email: string }) {
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

      if (user.length !== 1)
        throw new AuthenticationError(
          `User with email ${input.email} is not registered. Try signing up`
        );

      if (!user[0].isVerified)
        throw new EmailVerificationError(
          `User with email ${input.email} is not verified. Please Login and verify your account`
        );

      return resSchemaForModel.getUser(user[0]);
    } catch (err) {
      throw err;
    }
  }

  async forgotPassword(input: IforgotPassword) {
    try {
      const user: HydratedDocument<IUser>[] = [];
      // we will allow both unverified and verified user to reset their password
      // as Reset passwprd link will be shared through mail only
      await userDAO.update(
        {
          email: input.email,
        },
        {
          authCode: MathUtil.generateSecureRandomNumber(6),
          authCodeValidTime: Date.now() + 30 * 60 * 1000,
          authCodeType: "ResetPassword",
        },
        new UserRowMapper((data) => {
          user.push(data);
        }),
        {
          new: true,
        }
      );

      if (user.length !== 1)
        throw new AuthenticationError(
          `User with email ${input.email} is not registered. Try signing up`
        );

      //send password reset mail to userDoc
      mailService.addPasswordResetMailToQueue(user[0]);
      return `Password reset mail has been successfully sent to ${input.email}. Follow the instructions in the email to reset your password.`;
    } catch (err: any) {
      throw err;
    }
  }

  async accountVerificationThroughEmail(input: IforgotPassword) {
    try {
      const user: HydratedDocument<IUser>[] = [];
      //send OTP to email for account verification
      await userDAO.update(
        {
          email: input.email,
        },
        {
          authCode: MathUtil.generateSecureRandomNumber(6),
          authCodeValidTime: Date.now() + 5 * 60 * 1000,
          authCodeType: "VerifyAccount",
        },
        new UserRowMapper((data) => {
          user.push(data);
        }),
        {
          new: true,
        }
      );

      if (user.length !== 1)
        throw new AuthenticationError(
          `User with email ${input.email} is not registered. Try signing up`
        );

      //send password reset mail to userDoc
      mailService.addOTPmailToQueue(user[0]);
      return `Email Verification mail has been successfully sent to ${input.email}. Follow the instructions in the email to reset your password.`;
    } catch (err: any) {
      throw err;
    }
  }

  async resetPassword(input: IresetPassword) {
    try {
      const user: HydratedDocument<IUser>[] = [];
      await userDAO.update(
        {
          email: input.email,
          isVerified: true,
          authCode: input.code,
          authCodeValidTime: { $gte: Date.now() },
          authCodeType: "ResetPassword",
        },
        {
          authCodeValidTime: 0,
        },
        new UserRowMapper((data) => {
          user.push(data);
        })
      );

      // if previous query is successful then user will be returned
      if (user.length === 1) {
        //change password
        user[0].password = input.password;
        user[0].save();
        return resSchemaForModel.getUser(user[0]);
      }

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
      if (user.length !== 1) failureMsg = "User is not registered.Try signing up";
      else if (!user[0].isVerified)
        failureMsg = `User with email ${user[0].email} is not verified. User must verify`;
      else if (user[0].authCode !== Number(input.code))
        failureMsg = "Authentication code is tampered";
      else if (user[0].authCodeValidTime <= Date.now())
        failureMsg = "Authentication code has expired";

      throw new AuthenticationError(failureMsg);
    } catch (err) {
      throw err;
    }
  }
}

const userService = new UserService();
export { userService };
