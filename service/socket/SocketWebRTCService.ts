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
import { omit } from "lodash";
import { callingService } from "./CallingService";
import handleError from "../../errors/errorhandler/ErrorHandler";
import { errToAppError } from "../../errors/AppError";

export class SocketWebRTCService {
  private socket: SocketManager;
  private io: IOManager;
  private user: SocketAuthData["auth"];
  private userId: string;
  private socketId: string;

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.socketId = socket.getSocketId();
    this.io = io;
    this.user = socket.getAuthUser();
    this.userId = this.user.id;
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

    this.socket.onDisconnect(this.handleSocketDisconnect);
  }
  private handleSocketDisconnect = async () => {
    try {
      const status = await callingService.removeActiveParticipants(this.userId, this.socketId);
      if (status && status.empty) this.handleCallSessionTerminated(status.callId);
    } catch (err) {
      if (err instanceof Error) handleError(errToAppError(err));
    }
  };

  private handleStartCall = async (payload: IWebRTCStartCall) => {
    const { callId, callType } = payload;

    await callingService.addActiveParticipants("new", callId, this.userId, this.socketId);
    const participants = await this.getOtherParticipants(callId);

    participants.forEach((memberId) => {
      this.socket.to(memberId).emit("webrtc-incomingCall", payload);
    });
    [...participants, this.userId].forEach((memId) =>
      this.socket.to(memId).emit("sync-chatRoomCallSession", [
        {
          chatRoomId: callId,
          callType,
        },
      ])
    );
    this.socket.emit("sync-chatRoomCallSession", [
      {
        chatRoomId: callId,
        callType,
      },
    ]);
  };

  private handleEndCall = async (payload: IWebRTCEndCall) => {
    const { callId } = payload;

    const participants = await this.getOtherParticipants(callId);
    const status = await callingService.removeActiveParticipants(this.userId, this.socketId);
    if (status && status.empty) this.handleCallSessionTerminated(status.callId);
    const promise = participants.map(async (memberId) => {
      const destinationSocketid = await callingService.getSocketIdOfUser(memberId);
      this.socket.to(destinationSocketid).emit("webrtc-endCall", payload);
    });

    await Promise.all(promise);
  };

  private handleGetActiveParticipants = async (payload: IWebRTCGetActiveParticipants) => {
    const { callId } = payload;
    await callingService.addActiveParticipants("existing", callId, this.userId, this.socketId);

    const participants = await callingService.getActiveParticipants(callId, this.socketId);
    const promise = participants.map(async (memberId) => {
      const destinationSocketid = await callingService.getSocketIdOfUser(memberId);
      this.socket
        .to(destinationSocketid)
        .emit(
          "webrtc-joinCall",
          omit({ ...payload, from: this.userId, to: memberId }, "activeParticipants")
        );
    });
    await Promise.all(promise);
    this.socket.emit("webrtc-getActiveParticipants", {
      ...payload,
      activeParticipants: participants,
    });
  };
  private handleOffer = async (payload: IWebRTCOffer) => {
    const destinationSocketid = await callingService.getSocketIdOfUser(payload.to);
    this.socket.to(destinationSocketid).emit("webrtc-offer", payload);
  };
  private handleAnswer = async (payload: IWebRTCAnswer) => {
    const destinationSocketid = await callingService.getSocketIdOfUser(payload.to);
    this.socket.to(destinationSocketid).emit("webrtc-answer", payload);
  };
  private handleIceCandidate = async (payload: IWebRTCIceCandidate) => {
    const destinationSocketid = await callingService.getSocketIdOfUser(payload.to);
    this.socket.to(destinationSocketid).emit("webrtc-iceCandidate", payload);
  };
  private handleMediaStateChange = async (payload: IWebRTCMediaStateChange) => {
    const { callId } = payload;
    const participants = await this.getOtherParticipants(callId);
    const promise = participants.map(async (memberId) => {
      const destinationSocketid = await callingService.getSocketIdOfUser(memberId);
      this.socket.to(destinationSocketid).emit("webrtc-mediaStateChange", payload);
    });
    await Promise.all(promise);
  };

  private handleRoomFull = async () => {};

  private getOtherParticipants = async (chatRoomId: string) => {
    const chatRoom = await chatRoomService.getChatRoomByID(this.userId, chatRoomId);
    if (!chatRoom) throw Error("no chatRoom");
    return chatRoom.members.filter((mem) => mem !== this.userId);
  };

  private handleCallSessionTerminated = async (callId: string) => {
    const chatRoom = await chatRoomService.getChatRoomByID(this.userId, callId);
    if (!chatRoom) return;

    chatRoom.members.forEach((mem) => {
      this.socket.to(mem).emit("webrtc-callSessionTerminated", callId);
    });
    this.socket.emit("webrtc-callSessionTerminated", callId);
  };
}
