import { createLogger, format, transports } from "winston";
import path from "path";

const { combine, timestamp, label, printf, json } = format;

const productionLogger = () => {
  return createLogger({
    level: "error",
    format: combine(timestamp(), json()),

    transports: [
      new transports.Console(),
      new transports.File({
        filename: path.join(__dirname, "./logs/production/error.log"),
      }),
    ],
  });
};

export default productionLogger;
