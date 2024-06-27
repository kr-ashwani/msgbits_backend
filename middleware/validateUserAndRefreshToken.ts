import { NextFunction, Request, Response } from "express";
import { validateAuthTokenService } from "../service/user/validateAuthTokenService";
import { ClientResponse } from "../utilityClasses/clientResponse";

async function validateUserAndRefreshToken(req: Request, res: Response, next: NextFunction) {
  const response = await validateAuthTokenService(req.cookies);
  if (response.success) {
    const timeDiff = (response.data.jwtPayload.exp || 0) * 1000 - Date.now();
    if (timeDiff >= 0) {
      //set authUser
      req.authUser = response.data.originalUser;

      //generate new token
      if (timeDiff <= 2 * 24 * 60 * 60 * 1000)
        new ClientResponse().sendJWTToken(res, response.data.jwtPayload);
      return next();
    }
    // else not a valid JWT
  }
  // User is null
  req.authUser = null;
  next();
}

export default validateUserAndRefreshToken;
