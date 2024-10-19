import config from "config";
import { createLogger, format, transports } from "winston";
import path from "path";
import dbTansport from "./dbTransport";
import { parseStack } from "../utils/parseStack";

const { combine, timestamp, json, errors } = format;

const MONGODB_URI_LOG = config.get<string>("MONGODB_URI_LOG");

// Updated myFormat function
const myFormat = format((info) => {
  const { level, message, stack, timestamp } = info;
  let errorMsg = `${timestamp} [pid:${process.pid}] ${level.toUpperCase()}: ${message}`;

  if (level === "error" && stack) {
    const parsedStack = parseStack(stack);
    if (parsedStack) errorMsg += ` (${parsedStack.absoluteFilePath}:${parsedStack.lineNumber})`;
  }

  info[Symbol.for("message")] = errorMsg;
  return info;
});

const productionLogger = function () {
  return createLogger({
    level: "error",
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      myFormat()
    ),
    exitOnError: (err: Error) => {
      console.log(err.message);
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
