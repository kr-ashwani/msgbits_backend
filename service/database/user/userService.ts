import bcrypt from "bcrypt";
import { HydratedDocument, UpdateQuery } from "mongoose";
import { UserInput } from "../../../schema/user/userSchema";
import { IUser, userModelEvents } from "../../../model/user.model";
import { userDAO, userDoc } from "../../../Dao/UserDAO";
import { UserRowMapper } from "../../../Dao/RowMapper/UserRowMapper";
import { MathUtil } from "../../../utils/MathUtil";
import { IresetPassword } from "../../../schema/user/resetPasswordSchema";
import { IforgotPassword } from "../../../schema/user/forgotPasswordSchema";
import AuthenticationError from "../../../errors/httperror/AuthenticationError";
import { ResponseUserSchema, resSchemaForModel } from "../../../schema/responseSchema";
import mailService from "../../mail/mailService";
import EmailVerificationError from "../../../errors/httperror/EmailVerificationError";
import { UserUpdateProfile } from "../../../schema/user/UserUpdateProfileSchema";

class UserService {
  async createUser(input: UserInput) {
    try {
      const user: HydratedDocument<IUser>[] = [];
      const authCode = MathUtil.generateSecureRandomNumber(6).toString();
      await userDAO.create(
        {
          ...input,
          isVerified: false,
          authType: ["EmailPassword"],
          authCode,
        },
        new UserRowMapper((data) => {
          // send mail to successfull created account
          mailService.addOTPmailToQueue(this.getUserNameEmailAuthCode(data, authCode));
          user.push(data);
        })
      );

      if (user.length !== 1)
        throw new AuthenticationError(`Failed to create user with email ${input.email}`);

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
      // as Reset password link will be shared through mail only
      const authCode = MathUtil.generateSecureRandomNumber(6).toString();
      await userDAO.update(
        {
          email: input.email,
        },
        {
          authCode,
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
      mailService.addPasswordResetMailToQueue(this.getUserNameEmailAuthCode(user[0], authCode));
      return `Password reset mail has been successfully sent to ${input.email}. Follow the instructions in the email to reset your password.`;
    } catch (err: any) {
      throw err;
    }
  }

  async accountVerificationThroughEmail(input: IforgotPassword) {
    try {
      const user: HydratedDocument<IUser>[] = [];
      //send OTP to email for account verification
      const authCode = MathUtil.generateSecureRandomNumber(6).toString();
      await userDAO.update(
        {
          email: input.email,
        },
        {
          authCode,
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
      mailService.addOTPmailToQueue(this.getUserNameEmailAuthCode(user[0], authCode));
      return `Email Verification mail has been successfully sent to ${input.email}. Follow the instructions in the email to reset your password.`;
    } catch (err: any) {
      throw err;
    }
  }

  async resetPassword(input: IresetPassword) {
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
      if (user.length !== 1) failureMsg = "User is not registered.Try signing up";
      else if (!user[0].isVerified)
        failureMsg = `User with email ${user[0].email} is not verified. User must verify`;
      else if (!(await bcrypt.compare(String(input.code), user[0].authCode)))
        failureMsg = "Authentication code is tampered";
      else if (user[0].authCodeValidTime <= Date.now())
        failureMsg = "Authentication code has expired";

      if (failureMsg) throw new AuthenticationError(failureMsg);

      const userAuthCode = user[0].authCode;
      user.length = 0;

      await userDAO.update(
        {
          email: input.email,
          isVerified: true,
          authCode: userAuthCode,
          authCodeValidTime: { $gte: Date.now() },
          authCodeType: "ResetPassword",
        },
        {
          authCodeValidTime: 0,
          password: input.password,
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

  async updateLastOnline(input: { userId: string }) {
    try {
      const user: HydratedDocument<IUser>[] = [];
      await userDAO.update(
        {
          _id: input.userId,
          isVerified: true,
        },
        {
          lastOnline: new Date(),
        },
        new UserRowMapper((data) => {
          user.push(data);
        })
      );

      if (user.length === 1) return resSchemaForModel.getUser(user[0]);
      return null;
    } catch (err) {
      throw err;
    }
  }

  async updateProfile({
    userId,
    updatedValue,
  }: {
    userId: string;
    updatedValue: UserUpdateProfile;
  }) {
    try {
      const user: HydratedDocument<IUser>[] = [];

      const update: UpdateQuery<IUser> = {};

      if (updatedValue.updatedName) update.name = updatedValue.updatedName;
      if (updatedValue.updatedProfilePicture)
        update.profilePicture = updatedValue.updatedProfilePicture;

      await userDAO.update(
        {
          _id: userId,
          isVerified: true,
        },
        update,
        new UserRowMapper((data) => {
          user.push(data);
        })
      );

      if (user.length === 1) return resSchemaForModel.getUser(user[0]);
      return null;
    } catch (err) {
      throw err;
    }
  }

  getUserNameEmailAuthCode(
    userDoc: userDoc,
    authCode?: string
  ): { name: string; email: string; authCode: string } {
    return {
      name: userDoc.name,
      email: userDoc.email,
      authCode: authCode ?? userDoc.authCode,
    };
  }

  emitNewVerifiedUserCreated(userDoc: ResponseUserSchema) {
    userModelEvents.emit("created", userDoc);
  }
}

const userService = new UserService();
export { userService };
