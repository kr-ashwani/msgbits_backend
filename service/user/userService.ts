import { UserInput } from "./../../schema/user/userSchema";
import { omit } from "lodash";
import UserModel from "../../model/user.model";

export async function createUser(input: UserInput) {
  try {
    const user = await UserModel.create(input);

    return omit(user.toJSON(), "password", "_id", "__v");
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