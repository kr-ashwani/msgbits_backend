import config from "config";
import mongoose from "mongoose";
import logger from "../logger";
import handleError from "../errorhandler/ErrorHandler";

const MONGODB_URI = config.get<string>("MONGODB_URI");

export default async function dbConnection() {
  try {
    mongoose.connection.on("error", function (err) {
      logger.error("MongoDB event error: " + err);
    });
    await mongoose.connect(MONGODB_URI);
    logger.info(`connected to mongodb`);
  } catch (err: unknown) {
    if (err instanceof Error) handleError(err);
  }
}
