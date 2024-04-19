import { NextFunction } from "express";

function asyncWrapper(fn: () => void, req: Request, res: Response, next: NextFunction) {
  Promise.resolve(fn()).catch((err) => next(err));
}

export default asyncWrapper;
