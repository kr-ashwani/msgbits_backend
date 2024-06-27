import { HydratedDocument, Types } from "mongoose";
import { IUser } from "../model/user.model";

declare global {
  namespace Express {
    // Inject additional properties on express.Request
    interface Request {
      /**
       * if user is not authenticated then authUser will be null.
       * only if user is authenticated then authUser will contain user info
       */
      authUser: HydratedDocument<IUser> | null;
    }
  }
}
