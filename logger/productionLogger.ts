import config from "config";
import { createLogger, format, transports } from "winston";
import path from "path";
import dbTansport from "./dbTransport";
import handleError from "../errorhandler/ErrorHandler";

const { combine, timestamp, json, errors } = format;

const MONGODB_URI_LOG = config.get<string>("MONGODB_URI_LOG");

const productionLogger = function () {
  return createLogger({
    level: "error",
    format: combine(errors({ stack: true })),
    exitOnError: (err: Error) => {
      handleError(err);
      return true;
    },

    transports: [
      new transports.Console(),
      new transports.File({
        filename: path.join(__dirname, "./logs/production/error.log"),
      }),
      new dbTansport({
        db: MONGODB_URI_LOG,
        collection: "msgbits",
        level: "http",
        format: combine(timestamp(), json()),
      }),
    ],
  });
};

export default productionLogger;
