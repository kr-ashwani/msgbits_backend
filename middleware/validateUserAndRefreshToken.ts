import { NextFunction, Request, Response } from "express";
import { validateAuthTokenService } from "../service/user/validateAuthTokenService";
import { ClientResponse } from "../utilityClasses/clientResponse";

async function validateUserAndRefreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, jwtPayload } = await validateAuthTokenService(req.cookies);
    const timeDiff = (jwtPayload.exp || 0) * 1000 - Date.now();
    if (timeDiff >= 0) {
      //set authUser
      req.authUser = user;
      //generate new token
      if (timeDiff <= 2 * 24 * 60 * 60 * 1000) new ClientResponse().sendJWTToken(res, jwtPayload);
    }
  } catch (e) {
    //don't do anything
  }

  next();
}

export default validateUserAndRefreshToken;
