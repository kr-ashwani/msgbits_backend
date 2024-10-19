import { Request, Response, NextFunction } from "express";
import { errToAppError } from "../../errors/AppError";
import handleError from "../../errors/errorhandler/ErrorHandler";
import { ClientResponse } from "../../utils/clientResponse";

const SomethingWentWrongErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientRes = new ClientResponse(res);
  if (!res.writableFinished)
    clientRes.send(
      "Internal Server Error",
      clientRes.createErrorObj("Internal Server Error", "Something went wrong")
    );

  handleError(errToAppError(err, false));
};

export default SomethingWentWrongErrorHandler;
