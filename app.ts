import "dotenv/config";
import "./utils/registerProcessUncaughtError";
import express from "express";
import config from "config";
import dbConnection from "./utils/dbConnection";
import logger from "./logger";
import registerErrorHandler from "./middleware/registerErrorHandler";
import morganMiddleware from "./logger/morgan";
import routes from "./routes";
import swaggerDocs from "./utils/swagger";
import "./redis/queues/MailQueue";
import "./redis/workers/MailWorker";

const PORT = config.get<number>("PORT");

const app = express();
app.use(morganMiddleware);
app.use(express.json());

//Routes of the app
routes(app);

// last middleware must be error handler
registerErrorHandler(app);
app.listen(PORT, () => {
  logger.info(`App is running at http://localhost:${PORT}`);
  dbConnection();

  swaggerDocs(app, PORT);
});
