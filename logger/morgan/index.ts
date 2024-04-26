import morgan from "morgan";
import logger from "..";

const stream = {
  // Use the http severity
  write: (message: string) => logger.http(message.trim()),
};

const morganMiddleware = morgan("combined", { stream });
export default morganMiddleware;
