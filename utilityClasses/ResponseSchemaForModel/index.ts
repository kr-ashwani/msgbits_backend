import { HydratedDocument } from "mongoose";
import { IUser } from "../../model/user.model";
import { pick } from "lodash";
class ResponseSchemaForModel {
  getUser(userDoc: HydratedDocument<IUser>) {
    return pick(userDoc, ["name", "email", "isVerified", "createdAt", "updatedAt"]);
  }
}

export const resSchemaForModel = new ResponseSchemaForModel();
