import winston from "winston";
import devLogger from "./devLogger";
import productionLogger from "./productionLogger";

let tempLogger: winston.Logger | null = null;

if (process.env.NODE_ENV === "production") {
  tempLogger = productionLogger();
} else if (process.env.NODE_ENV === "development") {
  tempLogger = devLogger();
} else {
  tempLogger = devLogger();
}

const logger: winston.Logger = tempLogger;

export default logger;
