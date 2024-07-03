import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ClientResponse } from "../../utilityClasses/clientResponse";
import { fromError } from "zod-validation-error";

const zodValidationErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    const clientRes = new ClientResponse(res);
    const validationError = fromError(err);
    const failureRes = clientRes.createErrorObj("Validation Error", validationError.toString());

    clientRes.send("Bad Request", failureRes);
    return;
  }
  next(err);
};

export default zodValidationErrorHandler;
