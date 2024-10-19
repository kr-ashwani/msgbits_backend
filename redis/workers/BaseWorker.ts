import config from "config";
import RedisConnection from "../redisConnection";
import { Job, Processor, RedisOptions, Worker } from "bullmq";
import { errToAppError } from "../../errors/AppError";
import handleError from "../../errors/errorhandler/ErrorHandler";

abstract class BaseWorker<DataType, ResultType> {
  private readonly worker;
  private readonly connection;

  private static readonly workerConfig: RedisOptions = {
    port: config.get<number>("REDIS_PORT"),
    host: config.get<string>("REDIS_HOST"),
    lazyConnect: true,
    maxRetriesPerRequest: null,
  };
  constructor(
    workerName: string,
    queueName: string,
    processor?: string | URL | null | Processor<DataType, ResultType, string>
  ) {
    this.connection = new RedisConnection(BaseWorker.workerConfig, workerName);
    const workerProcessor = processor ? processor : this.workerCallback;

    this.worker = new Worker<DataType, ResultType, string>(queueName, workerProcessor, {
      connection: this.connection.getConnection(),
      useWorkerThreads: true,
    });
    this.registerErrorHandler();
    this.registerFailedJobHandler(workerName);
  }

  private registerErrorHandler() {
    this.worker.on("error", (err) => {
      //if error is connection refused then just return
      //connection refused is already handled by RedisConnection
      if (err.message.includes("ECONNREFUSED")) return;
      handleError(errToAppError(err, false));
    });
  }
  private registerFailedJobHandler(workerName: string) {
    this.worker.on("failed", (job: Job | undefined, err: Error) => {
      if (job) err.message = `Job at ${workerName} failed because ${job.failedReason}`;
      handleError(errToAppError(err, true));
    });
  }

  public getWorker() {
    return this.worker;
  }

  protected abstract workerCallback(job: Job<DataType, ResultType, string>): Promise<ResultType>;
}

export default BaseWorker;
