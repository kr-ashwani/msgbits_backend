import handleError from "../errorhandler/ErrorHandler";

process.on("uncaughtException", (err) => {
  if (err instanceof Error) handleError(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  if (err instanceof Error) handleError(err);
  process.exit(1);
});
