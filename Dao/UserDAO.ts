import { IUser } from "./../model/user.model";
import UserModel from "../model/user.model";
import { DmlDAO } from "./DmlDAO";
import {
  HydratedDocument,
  CreateOptions,
  ProjectionType,
  QueryOptions,
  QuerySelector,
  RootQuerySelector,
  UpdateQuery,
} from "mongoose";
import { RowMapper } from "./RowMapper/RowMapper";
import { UserInput } from "../schema/user/userSchema";
import { MathUtil } from "../utils/MathUtil";
import { OAuthUserInput } from "../schema/user/OAuthUserSchema";

type Condition<T> = T | QuerySelector<T | any>;
type FilterQuery<T> = {
  [P in keyof T]?: Condition<T[P]>;
} & RootQuerySelector<T>;

export type userDoc = Omit<IUser, "createdAt" | "updatedAt" | "comparePassword">;
class UserDAO extends DmlDAO<OAuthUserInput, IUser> {
  /**
   *
   * @param docs OAuthUserInput or OAuthUserInput Array
   * @param rowMapper
   * @param options
   */
  async create(
    docs: OAuthUserInput | OAuthUserInput[],
    rowMapper: RowMapper<HydratedDocument<IUser>>,
    options?: CreateOptions
  ) {
    try {
      const userDocs: userDoc[] = [];
      if (!Array.isArray(docs)) docs = [docs];

      docs.forEach((doc) => {
        const isVerified = doc.isVerified || false;
        const authCode = MathUtil.generateRandomNumber(100000, 999999);
        const authCodeValidTime = doc.isVerified === true ? 0 : Date.now() + 5 * 60 * 1000;
        const authCodeType: "VerifyAccount" = "VerifyAccount";
        const authType = doc.authType;
        const user = { ...doc, authCodeType, isVerified, authCode, authCodeValidTime, authType };
        userDocs.push(user);
      });

      const userResultSet = await UserModel.create(userDocs, options);

      userResultSet.map((row) => rowMapper.mapRow(row));
    } catch (err: any) {
      throw err;
    }
  }
  /**
   *
   * @param filter
   * @param rowMapper
   * @param projection
   * @param options
   */
  async find(
    filter: FilterQuery<IUser>,
    rowMapper: RowMapper<HydratedDocument<IUser>>,
    projection?: ProjectionType<IUser> | null | undefined,
    options?: QueryOptions<IUser> | null | undefined
  ) {
    try {
      const userResultSet = await UserModel.find(filter, projection, options);

      userResultSet.map((row) => rowMapper.mapRow(row));
    } catch (err: any) {
      throw err;
    }
  }

  /**
   *
   * @param filter
   * @param update
   * @param rowMapper
   * @param options
   */
  async update(
    filter: FilterQuery<IUser>,
    update: UpdateQuery<IUser>,
    rowMapper: RowMapper<HydratedDocument<IUser>>,
    options?: QueryOptions<IUser> | null | undefined
  ) {
    try {
      const userResultSet = await UserModel.findOneAndUpdate(filter, update, options);
      if (userResultSet) rowMapper.mapRow(userResultSet);
    } catch (err: any) {
      throw err;
    }
  }
}

const userDAO = new UserDAO();
export { userDAO };
