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
import { MathUtil } from "../utils/MathUtil";
import { OAuthUserInputAuthCodeOpt } from "../schema/user/OAuthUserSchema";
import randomColor from "randomcolor";
import { getFileLinkFromLink } from "../utils/getFileLinkFromLink";

type Condition<T> = T | QuerySelector<T | any>;
type FilterQuery<T> = {
  [P in keyof T]?: Condition<T[P]>;
} & RootQuerySelector<T>;

export type userDoc = Omit<IUser, "createdAt" | "updatedAt" | "comparePassword">;
class UserDAO extends DmlDAO<OAuthUserInputAuthCodeOpt, IUser> {
  /**
   *
   * @param docs OAuthUserInputAuthCodeOpt or OAuthUserInputAuthCodeOpt Array
   * @param rowMapper
   * @param options
   */
  async create(
    docs: OAuthUserInputAuthCodeOpt | OAuthUserInputAuthCodeOpt[],
    rowMapper: RowMapper<HydratedDocument<IUser>>,
    options?: CreateOptions
  ) {
    try {
      const userDocs: userDoc[] = [];
      if (!Array.isArray(docs)) docs = [docs];

      docs.forEach((doc) => {
        const isVerified = doc.isVerified || false;
        const authCode = doc.authCode ?? MathUtil.generateSecureRandomNumber(6).toString();
        const authCodeValidTime = doc.isVerified === true ? 0 : Date.now() + 5 * 60 * 1000;
        const authCodeType: "VerifyAccount" = "VerifyAccount";
        const authType = doc.authType;
        const profileColor = randomColor({ luminosity: "bright" });
        const lastOnline = new Date();

        const user = {
          ...doc,
          authCodeType,
          isVerified,
          authCode,
          authCodeValidTime,
          authType,
          profileColor,
          lastOnline,
        };
        userDocs.push(user);
      });

      const userResultSet = await UserModel.create(userDocs, options);

      userResultSet.map((row) => {
        if (row?.profilePicture) row.profilePicture = getFileLinkFromLink(row.profilePicture);
        rowMapper.mapRow(row);
      });
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
    options?: QueryOptions<IUser> | null | undefined,
    projection?: ProjectionType<IUser> | null | undefined
  ) {
    try {
      const userResultSet = await UserModel.find(filter, projection, options);

      userResultSet.map((row) => {
        if (row?.profilePicture) row.profilePicture = getFileLinkFromLink(row.profilePicture);
        rowMapper.mapRow(row);
      });
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
      if (userResultSet) {
        if (userResultSet?.profilePicture)
          userResultSet.profilePicture = getFileLinkFromLink(userResultSet.profilePicture);
        rowMapper.mapRow(userResultSet);
      }
    } catch (err: any) {
      throw err;
    }
  }
}

const userDAO = new UserDAO();
export { userDAO };
