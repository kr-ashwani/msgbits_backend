import "dotenv/config";
import express from "express";
import config from "config";
import dbConnection from "./utils/dbConnection";
import logger from "./logger";

const PORT: string = config.get("PORT");

const app = express();
app.use(express.json());

app.get("/hello", (req, res) => {
  res.send("hello");
});

app.listen(PORT, async () => {
  logger.info(`App is running at http://localhost:${PORT}`);
  dbConnection();
});
