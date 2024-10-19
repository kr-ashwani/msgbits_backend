import { errToAppError } from "../errors/AppError";
import handleError from "../errors/errorhandler/ErrorHandler";

process.on("uncaughtException", (err) => {
  if (err instanceof Error) handleError(errToAppError(err, true));
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  if (err instanceof Error) handleError(errToAppError(err, true));
  process.exit(1);
});
