// import Redis from "ioredis";
// import { redisConfig } from "./redisConfig";
// import logger from "../logger";
// import handleError from "../errorhandler/ErrorHandler";

// class RedisPubSub {
//   private readonly redis: Redis;

//   constructor(config: { port: number; host: string }) {
//     this.redis = new Redis(config);
//     this.registerErrorHandler();
//     this.connect();
//   }
//   public getConnection() {
//     return this.redis;
//   }

//   private async connect() {
//     try {
//       await this.redis.connect();
//       const connInfo = this.redis.options;
//       logger.info(`connected to redis instance on ${connInfo.host}:${connInfo.port}`);
//     } catch (err) {
//       if (err instanceof Error) handleError(err);
//     }
//   }

//   private registerErrorHandler() {
//     this.redis.on("error", function (err) {
//       handleError(err);
//     });
//   }
// }

// const redisInstance = new RedisPubSub(redisConfig);

// export default redisInstance;
