import handleError from "../errorhandler/ErrorHandler";
import { errToAppError } from "../errors/AppError";

process.on("uncaughtException", (err) => {
  if (err instanceof Error) handleError(errToAppError(err, true));
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  if (err instanceof Error) handleError(errToAppError(err, true));
  process.exit(1);
});
