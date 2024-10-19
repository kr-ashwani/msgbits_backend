import logger from "../../logger";

function sendErrToLogger(err: Error) {
  logger.error(err);
}

export default sendErrToLogger;
