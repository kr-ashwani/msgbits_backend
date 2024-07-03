import { Request, Response, NextFunction } from "express";
import { roleService } from "../service/database/role/roleService";
import AuthorizationError from "../errors/httperror/AuthorizationError";
import AuthenticationError from "../errors/httperror/AuthenticationError";
async function AdminProtectedRoutes(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.authUser) {
      const userRole = await roleService.findAdminById({ userId: req.authUser._id });

      if (userRole.role === "admin") return next();
      else
        throw new AuthorizationError(
          `user with email ${req.authUser.email} donot have Admin Privilege`
        );
    } else throw new AuthenticationError(`Auth token cookie is missing or tampered`);
  } catch (err) {
    next(err);
  }
}

export default AdminProtectedRoutes;
