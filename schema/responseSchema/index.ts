import { HydratedDocument } from "mongoose";
import { IUser } from "../../model/user.model";
import { pick } from "lodash";
import { IRole } from "../../model/role.model";

export type ResponseUserSchema = Pick<
  HydratedDocument<IUser>,
  | "name"
  | "email"
  | "isVerified"
  | "createdAt"
  | "updatedAt"
  | "_id"
  | "profilePicture"
  | "profileColor"
  | "lastOnline"
>;
export type ResponseUserAndAuthCodeSchema = Pick<
  HydratedDocument<IUser>,
  "name" | "email" | "isVerified" | "createdAt" | "updatedAt" | "authCode" | "_id"
>;
export type ResponseRoleShema = Pick<HydratedDocument<IRole>, "role" | "userId" | "_id">;
class ResponseSchemaForModel {
  getUser(userDoc: HydratedDocument<IUser>): ResponseUserSchema {
    return pick(userDoc, [
      "name",
      "email",
      "isVerified",
      "createdAt",
      "updatedAt",
      "_id",
      "profilePicture",
      "profileColor",
      "lastOnline",
    ]);
  }

  getUserAndAuthcode(userDoc: HydratedDocument<IUser>): ResponseUserAndAuthCodeSchema {
    return pick(userDoc, [
      "name",
      "email",
      "isVerified",
      "createdAt",
      "updatedAt",
      "authCode",
      "_id",
    ]);
  }

  getRole(roleDoc: HydratedDocument<IRole>): ResponseRoleShema {
    return pick(roleDoc, ["role", "userId", "_id"]);
  }
}

export const resSchemaForModel = new ResponseSchemaForModel();
