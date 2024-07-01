import config from "config";
import { createLogger, format, transports, addColors } from "winston";
import path from "path";
import dbTansport from "./dbTransport";
import handleError from "../errorhandler/ErrorHandler";
import { errToAppError } from "../errors/AppError";

const { combine, timestamp, colorize, printf, errors } = format;

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};
addColors(colors);

const MONGODB_URI_LOG = config.get<string>("MONGODB_URI_LOG");
const devLogger = () => {
  const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} pid:${process.pid} ${level}: ${message}`;
  });

  return createLogger({
    level: "http",
    format: combine(errors({ stack: true })),
    exitOnError: (err: Error) => {
      handleError(errToAppError(err, true));
      return true;
    },

    transports: [
      new transports.Console({
        format: combine(
          colorize({ all: true }),
          timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          myFormat
        ),
      }),
      new transports.File({
        filename: path.join(__dirname, "./logs/development/error.log"),
        level: "error",
        format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), myFormat),
      }),
      new dbTansport({
        db: MONGODB_URI_LOG,
        collection: "msgbits",
        level: "http",
        format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), myFormat),
      }),
    ],
  });
};

export default devLogger;
