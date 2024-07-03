import Transport, { TransportStreamOptions } from "winston-transport";
import type { LogEntry } from "winston";
import { logService } from "../service/log/logService";

export default class dbTansport extends Transport {
  private db: string | undefined;
  private collection: string | undefined;
  constructor(opts: TransportStreamOptions & { db: string; collection: string }) {
    super(opts);
    this.db = opts?.db || undefined;
    this.collection = opts?.collection || undefined;
  }

  // this functions run when something is logged so here's where you can add you custom logic to do stuff when something is logged.
  log(info: LogEntry, callback: any) {
    //default behavior
    setImmediate(() => {
      this.emit("logged", info);
    });

    const { level, message, stack, ...meta } = info;
    logService.writeLogsToDB({
      log: {
        level,
        message,
        stack,
      },
      db: this.db,
      collection: this.collection,
    });

    callback();
  }
}
