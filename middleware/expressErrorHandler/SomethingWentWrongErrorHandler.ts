import { Request, Response, NextFunction } from "express";
import handleError from "../../errorhandler/ErrorHandler";
import { errToBaseError } from "../../errors/BaseError";
import { clientRes } from "../../utilityClasses/clientResponse";

const SomethingWentWrongErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!res.writableFinished)
    clientRes
      .setRes(res)
      .setStatus(500)
      .setMessage("Something went wrong")
      .setData(err.message)
      .send();

  handleError(errToBaseError(err, false));
};

export default SomethingWentWrongErrorHandler;
