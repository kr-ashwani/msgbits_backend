import { HydratedDocument } from "mongoose";
import { UserInput } from "./../../schema/user/userSchema";
import { omit } from "lodash";
import UserModel, { IUser } from "../../model/user.model";
import { userDAO } from "../../Dao/UserDAO";
import { UserRowMapper } from "../../Dao/RowMapper/UserRowMapper";
import { sendMail } from "../mail/sendMail";

export async function createUser(input: UserInput) {
  try {
    const user: HydratedDocument<IUser>[] = [];
    await userDAO.create(
      input,
      new UserRowMapper((data) => {
        // send mail to successfull created account
        sendMail.sendOTPtoUser(data);
        user.push(data);
      })
    );
    //we are sure user will have atleast 1 element
    return omit(
      user[0].toJSON(),
      "password",
      "_id",
      "__v",
      "isVerified",
      "authCode",
      "authCodeValidTime"
    );
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function validatePassword({ email, password }: { email: string; password: string }) {
  const user = await UserModel.findOne({ email });

  if (!user) {
    return false;
  }

  //const isValid = await user.comparePassword(password);

  // if (!isValid) return false;

  return omit(user.toJSON(), "password");
}

// export async function findUser(query: FilterQuery<UserDocument>) {
//   return UserModel.findOne(query).lean();
// }
