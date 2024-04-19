import { Request, Response, NextFunction } from "express";
import handleError from "../../errorhandler/ErrorHandler";

const SomethingWentWrongErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!res.writableFinished) res.status(500).json({ message: "Something went wrong" });
  handleError(err);
};

export default SomethingWentWrongErrorHandler;
