import { Request, Response, NextFunction } from "express";
import AuthorizationError from "../errors/httperror/AuthorizationError";

function UserProtectedRoutes(req: Request, res: Response, next: NextFunction) {
  if (req.authUser) next();
  throw new AuthorizationError("Insufficient Role to access the resource");
}

export default UserProtectedRoutes;
