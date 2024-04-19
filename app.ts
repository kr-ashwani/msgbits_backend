import "dotenv/config";
import express from "express";
import config from "config";
import dbConnection from "./utils/dbConnection";
import logger from "./logger";
import registerErrorHandler from "./middleware/registerErrorHandler";
import "./utils/registerProcessUncaughtError";

const PORT = config.get<number>("PORT");

const app = express();
app.use(express.json());

app.get("/hello", (req, res) => {
  res.send("hello");
});

// last middleware must be error handler
registerErrorHandler(app);

app.listen(PORT, () => {
  logger.info(`App is running at http://localhost:${PORT}`);
  dbConnection();
});
