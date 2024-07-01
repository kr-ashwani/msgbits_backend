import { Request, Response, NextFunction } from "express";
import handleError from "../../errorhandler/ErrorHandler";
import { errToAppError } from "../../errors/AppError";
import { ClientResponse } from "../../utilityClasses/clientResponse";

const SomethingWentWrongErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientRes = new ClientResponse();
  if (!res.writableFinished)
    clientRes.send(
      res,
      "Internal Server Error",
      clientRes.createErrorObj("Internal Server Error", "Something went wrong")
    );

  handleError(errToAppError(err, false));
};

export default SomethingWentWrongErrorHandler;
