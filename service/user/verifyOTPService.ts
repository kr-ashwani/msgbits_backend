import { HydratedDocument } from "mongoose";
import { IUser } from "../../model/user.model";
import { userDAO } from "../../Dao/UserDAO";
import { UserRowMapper } from "../../Dao/RowMapper/UserRowMapper";
import { OTPSchema } from "../../schema/user/OTPSchema";
import AuthenticationError from "../../errors/httperror/AuthenticationError";
import { resSchemaForModel } from "../../responseSchema";

export async function verifyOTPService(input: OTPSchema) {
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
