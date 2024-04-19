import config from "config";
import { createLogger, format, transports } from "winston";
import path from "path";
import dbTansport from "./dbTransport";

const { combine, timestamp, colorize, printf, errors } = format;

const MONGODB_URI_LOG = config.get<string>("MONGODB_URI_LOG");
const devLogger = () => {
  const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  });

  return createLogger({
    level: "http",
    format: combine(errors({ stack: true })),

    transports: [
      new transports.Console({
        format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), myFormat),
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
