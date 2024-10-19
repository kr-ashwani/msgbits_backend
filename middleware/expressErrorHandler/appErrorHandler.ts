import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";
import AuthenticationError from "../../errors/httperror/AuthenticationError";
import AuthorizationError from "../../errors/httperror/AuthorizationError";
import InsufficientRoleError from "../../errors/httperror/InsufficientRoleError";
import EmailVerificationError from "../../errors/httperror/EmailVerificationError";
import { ClientResponse } from "../../utils/clientResponse";

const AppErrorErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.writableFinished) next(err);
  if (err instanceof AppError) {
    const clientRes = new ClientResponse(res);
    if (err instanceof AuthenticationError)
      clientRes.send("Bad Request", clientRes.createErrorObj("Authentication Error", err.message));
    else if (err instanceof AuthorizationError)
      clientRes.send("Bad Request", clientRes.createErrorObj("Authorization Error", err.message));
    else if (err instanceof InsufficientRoleError)
      clientRes.send(
        "Bad Request",
        clientRes.createErrorObj("Insufficient Role Error", err.message)
      );
    else if (err instanceof EmailVerificationError)
      clientRes.send(
        "Bad Request",
        clientRes.createErrorObj("Email Verification Error", err.message)
      );
    else
      clientRes.send("Bad Request", clientRes.createErrorObj("Internal Server Error", err.message));
  } else next(err);
};

export default AppErrorErrorHandler;
