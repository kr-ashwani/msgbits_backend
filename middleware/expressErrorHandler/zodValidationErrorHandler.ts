import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { clientRes } from "../../utilityClasses/clientResponse";

const zodValidationErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    clientRes
      .setRes(res)
      .setStatus(404)
      .setMessage("user validation failed")
      .setData(err.message)
      .send();
    return;
  }
  next(err);
};

export default zodValidationErrorHandler;
