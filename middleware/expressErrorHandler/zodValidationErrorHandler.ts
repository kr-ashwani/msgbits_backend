import { Request, Response, NextFunction } from "express";

const zodValidationErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  next(err);
};

export default zodValidationErrorHandler;
