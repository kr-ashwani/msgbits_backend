import Redis from "ioredis";
import config from "config";
import {
  IWebRTCAnswer,
  IWebRTCEndCall,
  IWebRTCGetActiveParticipants,
  IWebRTCIceCandidate,
  IWebRTCMediaStateChange,
  IWebRTCOffer,
  IWebRTCStartCall,
} from "../../schema/webRTC/WebRTCSchema";
import { SocketAuthData } from "../../socket/EventHandlers/validateSocketConnection";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { chatRoomService } from "../database/chat/chatRoom/chatRoomService";
import RedisConnection from "../../redis/redisConnection";
import { omit } from "lodash";

export class SocketWebRTCService {
  private socket: SocketManager;
  private io: IOManager;
  private user: SocketAuthData["auth"];
  private userId: string;
  private redisClient: Redis;

  private static readonly redisConfig = {
    port: config.get<number>("REDIS_PORT"),
    host: config.get<string>("REDIS_HOST"),
    lazyConnect: true,
  };

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.io = io;
    this.user = socket.getAuthUser();
    this.userId = this.user.id;
    this.redisClient = new RedisConnection(SocketWebRTCService.redisConfig).getConnection();
    this.init();
  }
  init() {
    this.socket.on("webrtc-startCall", this.handleStartCall);
    this.socket.on("webrtc-getActiveParticipants", this.handleGetActiveParticipants);
    this.socket.on("webrtc-endCall", this.handleEndCall);
    this.socket.on("webrtc-offer", this.handleOffer);
    this.socket.on("webrtc-answer", this.handleAnswer);
    this.socket.on("webrtc-iceCandidate", this.handleIceCandidate);
    this.socket.on("webrtc-mediaStateChange", this.handleMediaStateChange);
    this.socket.on("webrtc-roomFull", this.handleRoomFull);

    this.socket.onDisconnect(this.handleSocketDisconnect.bind(this));
  }
  private handleSocketDisconnect() {
    this.removeActiveParticipants(this.userId);
  }

  private handleStartCall = async (payload: IWebRTCStartCall) => {
    const { callId } = payload;

    await this.addActiveParticipants("new", callId, this.userId);
    const participants = await this.getOtherParticipants(callId);

    participants.forEach((memberId) =>
      this.socket.to(memberId).emit("webrtc-incomingCall", payload)
    );
  };

  private handleEndCall = async (payload: IWebRTCEndCall) => {
    const { callId } = payload;

    const participants = await this.getOtherParticipants(callId);
    await this.removeActiveParticipants(this.userId);
    participants.forEach((memberId) => this.socket.to(memberId).emit("webrtc-endCall", payload));
  };

  private handleGetActiveParticipants = async (payload: IWebRTCGetActiveParticipants) => {
    const { callId } = payload;
    await this.addActiveParticipants("existing", callId, this.userId);

    const participants = await this.getActiveParticipants(callId);
    participants.forEach((memberId) =>
      this.socket
        .to(memberId)
        .emit(
          "webrtc-joinCall",
          omit({ ...payload, from: this.userId, to: memberId }, "activeParticipants")
        )
    );
    this.socket.emit("webrtc-getActiveParticipants", {
      ...payload,
      activeParticipants: participants,
    });
  };
  private handleOffer = async (payload: IWebRTCOffer) => {
    const { callId } = payload;

    const destinationSocketid = await this.getSocketIdOfUser(payload.to);
    this.socket.to(destinationSocketid).emit("webrtc-offer", payload);
  };
  private handleAnswer = async (payload: IWebRTCAnswer) => {
    const { callId } = payload;
    const destinationSocketid = await this.getSocketIdOfUser(payload.to);
    this.socket.to(destinationSocketid).emit("webrtc-answer", payload);
  };
  private handleIceCandidate = async (payload: IWebRTCIceCandidate) => {
    const { callId } = payload;
    const destinationSocketid = await this.getSocketIdOfUser(payload.to);
    this.socket.to(destinationSocketid).emit("webrtc-iceCandidate", payload);
  };
  private handleMediaStateChange = async (payload: IWebRTCMediaStateChange) => {
    const { callId } = payload;
    const destinationSocketid = await this.getSocketIdOfUser(payload.to);
    this.socket.to(destinationSocketid).emit("webrtc-mediaStateChange", payload);
  };

  private handleRoomFull = async () => {};

  private getOtherParticipants = async (chatRoomId: string) => {
    const chatRoom = await chatRoomService.getChatRoomByID(this.userId, chatRoomId);
    if (!chatRoom) throw Error("no chatRoom");
    return chatRoom.members.filter((mem) => mem !== this.userId);
  };

  private async addActiveParticipants(type: "new" | "existing", callId: string, userId: string) {
    const keyExists = await this.redisClient.exists(`call:${callId}:active_participants`);

    if (type === "new" && keyExists) throw new Error("Call session already exists");
    if (type === "existing" && !keyExists) throw new Error("call session doesnot exists");

    await this.redisClient.hset(`call_user:${userId}`, {
      callId,
      socketId: this.socket.getSocketId(),
    });

    const isParticipant = await this.redisClient.sismember(
      `call:${callId}:active_participants`,
      userId
    );

    if (isParticipant) throw new Error("User already present in call");

    await this.redisClient.sadd(`call:${callId}:active_participants`, userId);
    return true;
  }
  private async getActiveParticipants(callId: string) {
    const participants = await this.redisClient.smembers(`call:${callId}:active_participants`);

    if (!participants?.length) return [];
    return participants.filter((memId) => memId !== this.userId);
  }
  private async removeActiveParticipants(userId: string) {
    const userCallInfo = await this.redisClient.hgetall(`call_user:${userId}`);

    const { callId, socketId } = userCallInfo;
    if (!callId || !socketId) return;

    if (socketId !== this.socket.getSocketId()) return;

    const isParticipant = await this.redisClient.sismember(
      `call:${callId}:active_participants`,
      userId
    );

    if (!isParticipant) throw new Error("User not found in call");

    await this.redisClient.srem(`call:${callId}:active_participants`, userId);
    await this.redisClient.del(`call_user:${userId}`);

    // Get remaining members count
    const remainingMembers = await this.redisClient.scard(`call:${callId}:active_participants`);

    // If no members left, delete the key
    if (remainingMembers === 0) {
      await this.redisClient.del(`call:${callId}:active_participants`);
      return { empty: true };
    }

    return { empty: false };
  }
  private async getSocketIdOfUser(userId: string) {
    const userCallInfo = await this.redisClient.hgetall(`call_user:${userId}`);

    const { callId, socketId } = userCallInfo;
    if (!callId || !socketId) return "";

    return socketId;
  }
}
