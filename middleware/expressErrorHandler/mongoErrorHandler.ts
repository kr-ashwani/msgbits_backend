import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { MongoError, MongoServerError } from "mongodb";
import { ClientResponse } from "../../utils/clientResponse";

const mongoErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  //mongodb error handling
  if (err instanceof MongoError) {
    const clientRes = new ClientResponse(res);
    let message = "";
    // duplicate keys error handling
    if (err instanceof MongoServerError && err.code === 11000)
      Object.entries(err?.keyValue).forEach((elem) => {
        const strArr = elem[0].split("");
        strArr[0] = strArr[0].toUpperCase();
        message += `${strArr.join("")} '${elem[1]}' is already registered. `;
      });

    if (message)
      return clientRes.send(
        "Bad Request",
        clientRes.createErrorObj("Authentication Error", message)
      );
  }
  //mongoose error handling
  if (err instanceof mongoose.MongooseError) {
    const clientRes = new ClientResponse(res);

    let message = "";
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map((el) => el.message);
      message = `Invalid input data. ${errors.join(". ")}`;
    } else if (err instanceof mongoose.Error.DocumentNotFoundError)
      message = "database document not found";
    else if (err instanceof mongoose.Error.DocumentNotFoundError)
      message = "database document not found";
    else message = "database error";

    clientRes.send("Bad Request", clientRes.createErrorObj("Database Error", err.message));
    return;
  }
  next(err);
};

export default mongoErrorHandler;
