import Redis, { RedisOptions } from "ioredis";
import logger from "../logger";
import { errToAppError } from "../errors/AppError";
import handleError from "../errors/errorhandler/ErrorHandler";

class RedisConnection {
  private readonly redis: Redis;
  private readonly loggerPrefix: string;
  private errorOccured;

  constructor(config: RedisOptions, loggerPrefix?: string) {
    this.loggerPrefix = loggerPrefix ? loggerPrefix + " " : "";
    this.errorOccured = false;
    config.lazyConnect = true;
    this.redis = new Redis(config);
    this.registerEventHandler();
    this.connect();
  }

  private async connect() {
    try {
      await this.redis.connect();
    } catch (err) {
      if (err instanceof Error) {
        this.redisErrorHandler(err);
      }
    }
  }

  private registerEventHandler() {
    const errCallback = function (this: RedisConnection, err: unknown) {
      if (this.errorOccured) return;
      if (err instanceof Error) this.redisErrorHandler(err);
      this.errorOccured = true;
    };
    this.redis.on("error", errCallback.bind(this));
    this.redis.on("connect", () => {
      this.errorOccured = false;
      const connInfo = this.redis.options;
      logger.info(
        `${this.loggerPrefix}connected to redis instance on ${connInfo.host}:${connInfo.port}`
      );
    });
  }

  private redisErrorHandler(err: Error) {
    err.message =
      `${this.loggerPrefix}unable to establish connection with redis instance because ` +
      err.message;
    handleError(errToAppError(err, false));
  }

  /**
   * get redis connection instanceconfig: RedisOptions, loggerPrefix?: string
   * @returns Redis
   */
  public getConnection(): Redis {
    return this.redis;
  }
}

export default RedisConnection;
