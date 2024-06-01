import { HydratedDocument } from "mongoose";
import { IUser } from "../../model/user.model";
import { userDAO } from "../../Dao/UserDAO";
import { UserRowMapper } from "../../Dao/RowMapper/UserRowMapper";
import { OTPSchema } from "../../schema/user/OTPSchema";

export async function verifyOTPService(input: OTPSchema) {
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
    const res = {
      success: false,
      message: "",
      error: "",
      data: { email: "", name: "" },
    };

    if (user.length !== 1) res.message = "User is not registered";
    else if (user[0].authCode !== Number(input.otp)) res.message = "OTP did not match";
    else if (user[0].authCodeValidTime <= Date.now()) res.message = "OTP has expired";
    else {
      res.success = true;
      res.message = `user with email ${user[0].email} is now verified.`;
      res.data = { email: user[0].email, name: user[0].name };
    }
    res.error = res.message;
    return res;
  } catch (e: any) {
    throw new Error(e);
  }
}
