import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

/**
 * validates schema for incomming request
 * @param schema AnyZodObject
 * @returns void
 */
const validateResource =
  (schema: AnyZodObject, reqType: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    schema.parse(req[reqType]);
    next();
  };

export default validateResource;
