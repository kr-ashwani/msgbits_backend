import config from "config";
import { Queue } from "bullmq";
import RedisConnection from "../redisConnection";
import { errToAppError } from "../../errors/AppError";
import handleError from "../../errors/errorhandler/ErrorHandler";

class BaseQueue<DataType, ResultType> {
  private readonly queue;
  private readonly errorQueue;
  private readonly connection;

  private static readonly queueConfig = {
    port: config.get<number>("REDIS_PORT"),
    host: config.get<string>("REDIS_HOST"),
    lazyConnect: true,
  };
  constructor(queueName: string) {
    this.connection = new RedisConnection(BaseQueue.queueConfig, queueName);
    this.queue = new Queue<DataType, ResultType, string>(queueName, {
      connection: this.connection.getConnection(),
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    });
    this.errorQueue = new Queue<DataType, ResultType, string>("Error" + queueName, {
      connection: this.connection.getConnection(),
    });
    this.registerErrorHandler();
  }

  private registerErrorHandler() {
    this.queue.on("error", this.errorHandler);
    this.errorQueue.on("error", this.errorHandler);
  }
  private errorHandler(err: Error) {
    //if error is connection refused then just return
    //connection refused is already handled by RedisConnection
    if (err.message.includes("ECONNREFUSED")) return;
    handleError(errToAppError(err, false));
  }

  public getQueue() {
    return this.queue;
  }
  public getErrorQueue() {
    return this.errorQueue;
  }
}

export default BaseQueue;
