import config from "config";
import Redis from "ioredis";
import logger from "../../logger";
import RedisConnection from "../../redis/redisConnection";
import { userService } from "../database/user/userService";

const BATCH_INTERVAL = 10 * 1000; // 10 seconds
const BATCH_SIZE = 1000; // Max items to process in a batch
const SOCKET_TTL = 60; // 40 seconds
const OFFLINE_BATCH_INTERVAL = 1.005 * 60 * 1000; // 1 minute in seconds

const USER_STATUS_KEY = "user:status";

interface UserStatus {
  userId: string;
  status: "online" | "offline";
}

export class UserStatusTracker {
  private heartbeatQueue: [string, string][] = [];
  private processingBatch = false;
  private batchTimer: NodeJS.Timeout;
  private offlineBatchTimer: NodeJS.Timeout;
  private redisClient: Redis;
  private statusCallback: ((p: string[], status: "online" | "offline") => void) | null = null;

  private static readonly redisConfig = {
    port: config.get<number>("REDIS_PORT"),
    host: config.get<string>("REDIS_HOST"),
    lazyConnect: true,
  };

  constructor() {
    this.redisClient = new RedisConnection(
      UserStatusTracker.redisConfig,
      "User Status Tracker"
    ).getConnection();
    this.batchTimer = setInterval(() => this.processBatchedHeartbeats(), BATCH_INTERVAL);
    this.offlineBatchTimer = setInterval(() => this.removeOfflineUsers(), OFFLINE_BATCH_INTERVAL);
  }
  async updateUserStatus(userId: string, socketId: string): Promise<void> {
    // Check if the user is already in the heartbeat queue
    const existingIndex = this.heartbeatQueue.findIndex(
      ([qUserId, qSocketId]) => qUserId === userId && qSocketId === socketId
    );

    if (existingIndex === -1) this.heartbeatQueue.push([userId, socketId]);

    if (this.heartbeatQueue.length >= BATCH_SIZE && !this.processingBatch) {
      clearInterval(this.batchTimer);
      await this.processBatchedHeartbeats();
      this.batchTimer = setInterval(() => this.processBatchedHeartbeats(), BATCH_INTERVAL);
    }
  }

  registerStatusCallback(callback: (p: string[], status: "online" | "offline") => void) {
    this.statusCallback = callback;
  }

  private async processBatchedHeartbeats(): Promise<void> {
    if (this.processingBatch || this.heartbeatQueue.length === 0) return;

    this.processingBatch = true;
    const batch = this.heartbeatQueue.splice(0, BATCH_SIZE);
    const pipeline = this.redisClient.pipeline();
    const onlineUsers: string[] = [];

    try {
      for (const [userId, socketId] of batch) {
        const key = `${USER_STATUS_KEY}:${userId}`;
        // first find if there is any key
        if (await this.checkIfUserWasOffline(userId)) onlineUsers.push(userId);

        pipeline.sadd(key, socketId);
        // Add user to the set of all users if not already present
        pipeline.sadd("allUsers", userId);
        pipeline.set(socketId, userId, "EX", SOCKET_TTL);
      }

      if (this.statusCallback && onlineUsers.length) this.statusCallback(onlineUsers, "online");

      await pipeline.exec();
    } catch (error) {
      logger.error("Error processing batched heartbeats:", error);
      this.heartbeatQueue.unshift(...batch);
    } finally {
      this.processingBatch = false;
    }
  }

  private async checkIfUserWasOffline(userId: string) {
    try {
      const key = `${USER_STATUS_KEY}:${userId}`;
      // first find if there is any key
      const sockets = await this.redisClient.smembers(key);
      let status = false;
      for (const socketId of sockets) {
        const socketStatus = await this.redisClient.exists(socketId);
        if (socketStatus) status ||= true;
      }
      return status;
    } catch (err) {
      logger.error("Error in checking user offline");
      return false;
    }
  }

  async getUserStatus(userId: string): Promise<UserStatus> {
    try {
      const status = await this.redisClient.exists(`${USER_STATUS_KEY}:${userId}`);
      return {
        userId,
        status: status ? "online" : "offline",
      };
    } catch (error) {
      logger.error("Error getting online user");
      return {
        userId,
        status: "offline",
      };
    }
  }

  async getOnlineUsers(): Promise<string[]> {
    try {
      const users = await this.redisClient.smembers("allUsers");

      const onlineUsers: string[] = [];
      for (let i = 0; i < users.length; i++) {
        const userId = users[i];
        const userStatus = await this.getUserStatus(userId);
        if (userStatus.status === "online") onlineUsers.push(userId);
      }
      return onlineUsers;
    } catch (error) {
      logger.error("Error getting online users:", error);
      return [];
    }
  }

  async removeOfflineUsers() {
    try {
      const allUserIds = await this.redisClient.smembers("allUsers");

      const offlineUsers: string[] = [];

      for (let i = 0; i < allUserIds.length; i += BATCH_SIZE) {
        const userIdsBatch = allUserIds.slice(i, i + BATCH_SIZE);

        for (const userId of userIdsBatch) {
          const key = `${USER_STATUS_KEY}:${userId}`;
          const sockets = await this.redisClient.smembers(key);

          // userId don't have any socket list
          if (sockets.length === 0) continue;

          let status = false;
          for (const socketId of sockets) {
            const socketStatus = await this.redisClient.exists(socketId);
            if (socketStatus) status ||= true;
            else await this.redisClient.srem(key, socketId);
          }

          if (!status) {
            offlineUsers.push(userId);
            await this.redisClient.del(key);
            //user service to update last online time
            await userService.updateLastOnline({ userId });
          }
        }

        if (this.statusCallback && offlineUsers.length)
          this.statusCallback(offlineUsers, "offline");
      }

      logger.info(`Batch update completed. ${offlineUsers.length} users are offline.`);
    } catch (error) {
      logger.error("Error in batchUpdateUserStatuses:", error);
    }
  }

  shutdown(): void {
    clearInterval(this.batchTimer);
    clearInterval(this.offlineBatchTimer);
    this.redisClient.quit();
  }
}
