import { Request, Response, NextFunction } from "express";

const mongoErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  next(err);
};

export default mongoErrorHandler;
