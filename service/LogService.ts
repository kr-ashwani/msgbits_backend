import { LogSchemaType } from "./../schema/Log";
import mongoose from "mongoose";
import DbCollectionMissingError from "../errors/parameterMissingError/DbCollectionMissingError";
import LogSchema from "../schema/Log";

interface dbLog {
  log: Omit<LogSchemaType, "timestamp">;
  db?: string;
  collection?: string;
}

let connMap = new Map<string, mongoose.Connection>();
async function writeLogsToDB(data: dbLog) {
  try {
    let LogModel = null;
    const modelName = `${data.log.level}Log`;
    let conn: mongoose.Connection | null = null;

    if (data.db) {
      if (!data.collection) throw new DbCollectionMissingError("collection name is missing");
      const db_uri = data.db;
      if (connMap.has(db_uri)) conn = connMap.get(db_uri)!;
      else {
        conn = mongoose.createConnection(db_uri);
        connMap.set(db_uri, conn);
      }
      LogModel = conn.model(modelName, LogSchema, modelName);
    } else LogModel = mongoose.model(modelName, LogSchema, modelName);

    await LogModel.create(data.log);
  } catch (err: unknown) {
    if (err instanceof Error) {
      //logger.error(err.message);
      // dont use logger here
      //logger will call this function to write logs to DB
      //and try will again catch the same error making an infinite loop
      console.log("winston unable to write log to DB ", err.message);
    }
  }
}

export type { dbLog };
export default writeLogsToDB;
