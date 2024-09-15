import config from "config";
import { createLogger, format, transports, addColors } from "winston";
import dbTansport from "./dbTransport";
import path from "path";
import { parseStack } from "../utils/parseStack";

const { combine, timestamp, colorize, errors } = format;

const MONGODB_URI_LOG = config.get<string>("MONGODB_URI_LOG");

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};
addColors(colors);

// Updated myFormat function
const myFormat = format((info) => {
  const { level, message, stack, timestamp } = info;
  const colorizer = colorize();
  const timeAndPid = `${timestamp} [pid:${process.pid}]`;
  let colorizedMessage = `${level.toUpperCase()}: ${message}`;

  if (level === "error" && stack) {
    const parsedStack = parseStack(stack);
    if (parsedStack)
      colorizedMessage += ` (${parsedStack.absoluteFilePath}:${parsedStack.lineNumber})`;
  }

  colorizedMessage = colorizer.colorize(info.level, colorizedMessage);
  info[Symbol.for("message")] = `${timeAndPid} ${colorizedMessage}`;
  return info;
});

const devLogger = () => {
  return createLogger({
    level: "debug",
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
        filename: path.join(__dirname, "./logs/development/error.log"),
        level: "error",
        format: format.uncolorize(),
      }),
      new dbTansport({
        db: MONGODB_URI_LOG,
        collection: "msgbits",
        level: "http",
        format: format.uncolorize(),
      }),
    ],
  });
};

export default devLogger;
