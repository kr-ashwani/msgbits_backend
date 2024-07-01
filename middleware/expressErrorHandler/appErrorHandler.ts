import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";
import { ClientResponse } from "../../utilityClasses/clientResponse";
import AuthenticationError from "../../errors/httperror/AuthenticationError";
import AuthorizationError from "../../errors/httperror/AuthorizationError";
import InsufficientRoleError from "../../errors/httperror/InsufficientRoleError";

const AppErrorErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.writableFinished) next(err);
  const clientRes = new ClientResponse();
  if (err instanceof AppError) {
    if (err instanceof AuthenticationError)
      clientRes.send(
        res,
        "Bad Request",
        clientRes.createErrorObj("Authentication Error", err.message)
      );
    else if (err instanceof AuthorizationError)
      clientRes.send(
        res,
        "Bad Request",
        clientRes.createErrorObj("Authorization Error", err.message)
      );
    else if (err instanceof InsufficientRoleError)
      clientRes.send(
        res,
        "Bad Request",
        clientRes.createErrorObj("Insufficient Role Error", err.message)
      );
    else
      clientRes.send(
        res,
        "Bad Request",
        clientRes.createErrorObj("Internal Server Error", err.message)
      );
  } else next(err);
};

export default AppErrorErrorHandler;
