import config from "config";
import Redis from "ioredis";
import RedisConnection from "../../redis/redisConnection";
import { IWebRTCCallInfo } from "../../schema/webRTC/WebRTCSchema";

export class CallingService {
  private redisClient: Redis;

  private static readonly redisConfig = {
    port: config.get<number>("REDIS_PORT"),
    host: config.get<string>("REDIS_HOST"),
    lazyConnect: true,
  };

  constructor() {
    this.redisClient = new RedisConnection(
      CallingService.redisConfig,
      "Calling Service"
    ).getConnection();
  }

  private getRedisKey(type: "user" | "participants" | "callType", id: string) {
    if (type === "user") return `call_user:${id}`;
    else if (type === "participants") return `call_active_participants:${id}`;
    else if (type === "callType") return `call_type:${id}`;
    else return "";
  }

  async getActiveCallSession(chatRoomIds: string[]) {
    const activeChatRoomIds: IWebRTCCallInfo[] = [];

    const promise = chatRoomIds.map(async (roomId) => {
      const keyExists = await this.redisClient.exists(this.getRedisKey("participants", roomId));
      const callType = await this.redisClient.get(this.getRedisKey("callType", roomId));
      if (keyExists && callType && (callType === "audio" || callType === "video"))
        activeChatRoomIds.push({
          chatRoomId: roomId,
          callType,
        });
    });

    await Promise.all(promise);
    return activeChatRoomIds;
  }

  async addActiveParticipants(
    type: "new" | "existing",
    callId: string,
    userId: string,
    socketId: string,
    callType?: "audio" | "video"
  ) {
    const keyExists = await this.redisClient.exists(this.getRedisKey("participants", callId));

    if (type === "new" && keyExists) throw new Error("A call session already exists.");
    if (type === "existing" && !keyExists) throw new Error("Call session does not exist.");

    const isParticipant = await this.redisClient.sismember(
      this.getRedisKey("participants", callId),
      userId
    );

    if (isParticipant) throw new Error("User is already in the call.");

    // add user to call
    await this.redisClient.sadd(this.getRedisKey("participants", callId), userId);
    // add user to call
    if (type === "new")
      await this.redisClient.set(this.getRedisKey("callType", callId), callType || "audio");
    // attach callId and socketId to user
    await this.redisClient.hset(this.getRedisKey("user", userId), {
      callId,
      socketId,
    });

    return true;
  }

  async getActiveParticipants(callId: string, userId: string) {
    const keyExists = await this.redisClient.exists(this.getRedisKey("participants", callId));
    if (!keyExists) throw new Error("Call session does not exist.");

    const participants = await this.redisClient.smembers(this.getRedisKey("participants", callId));

    if (!participants?.length) return [];
    return participants.filter((memId) => memId !== userId);
  }

  async removeActiveParticipants(userId: string, socketIdparams: string) {
    const userCallInfo = await this.redisClient.hgetall(this.getRedisKey("user", userId));

    if (!userCallInfo) return;
    const { callId, socketId } = userCallInfo;
    if (!callId || !socketId) return;

    if (socketId !== socketIdparams) return;

    const isParticipant = await this.redisClient.sismember(
      this.getRedisKey("participants", callId),
      userId
    );

    if (!isParticipant) return;

    await this.redisClient.srem(this.getRedisKey("participants", callId), userId);
    await this.redisClient.del(this.getRedisKey("user", userId));

    // Get remaining members count
    const remainingMembers = await this.redisClient.scard(this.getRedisKey("participants", callId));

    // If no members left, delete the key
    if (remainingMembers === 0) {
      await this.redisClient.del(this.getRedisKey("callType", callId));
      await this.redisClient.del(this.getRedisKey("participants", callId));
      return { empty: true, callId };
    }

    return { empty: false, callId };
  }

  async getSocketIdOfUser(userId: string) {
    const userCallInfo = await this.redisClient.hgetall(this.getRedisKey("user", userId));

    const { callId, socketId } = userCallInfo;
    if (!callId || !socketId) return "";

    return socketId;
  }
}

export const callingService = new CallingService();
