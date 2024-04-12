import { createLogger, format, transports } from "winston";
import path from "path";

const { combine, timestamp, label, printf, json } = format;

const devLogger = () => {
  const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  });

  return createLogger({
    level: "info",
    format: combine(
      format.colorize(),
      label({ label: "right meow!" }),
      timestamp({ format: "HH:mm:ss" }),
      myFormat
    ),

    transports: [
      new transports.Console(),
      new transports.File({
        filename: path.join(__dirname, "./logs/development/error.log"),
        level: "error",
      }),
    ],
  });
};

export default devLogger;
