import { MessageDTO } from "../../schema/chat/MessageDTOSchema";
import { MessageStatusInput } from "../../schema/chat/MessageStatusInputSchema";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { EmitterMapping } from "../../socket/SocketIOManager/types";
import { chatRoomService } from "../database/chat/chatRoom/chatRoomService";
import { messageService } from "../database/chat/message/messageService";

export class SocketMessageService {
  private socket: SocketManager;
  private io: IOManager;

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.io = io;
    this.init();
  }
  init() {
    this.socket.on("message-create", this.createMessage);
    this.socket.on("message-delivered", (payload) => {
      this.updateMessageStatus("delivered", payload);
    });
    this.socket.on("message-seen", (payload) => {
      this.updateMessageStatus("delivered", payload);
    });
  }
  createMessage = async (payload: MessageDTO) => {
    const success = await messageService.createMessage(payload);

    //update last messageId of chatRoom
    await chatRoomService.updateLastMessageId(
      payload.chatRoomId,
      payload.messageId,
      payload.updatedAt
    );

    this.socket.emit("message-sent", payload.messageId);
    this.emitToAllRoomParticipantsExceptThisSocket(payload.chatRoomId, "message-create", payload);
  };
  updateMessageStatus = async (action: "delivered" | "seen", payload: MessageStatusInput) => {
    const chatRoomToMsgs: { [p in string]: string[] } = {};
    const userId = this.socket.getAuthUser().id;
    for (let i = 0; i < payload.length; i++) {
      const { chatRoomId, messageId } = payload[i];
      if (action === "delivered")
        await messageService.updateDeliveredTo(payload[i].messageId, userId);
      else await messageService.updateSeenBy(payload[i].messageId, userId);

      if (chatRoomToMsgs[chatRoomId]) chatRoomToMsgs[chatRoomId].push(messageId);
      else chatRoomToMsgs[chatRoomId] = [messageId];
    }

    Object.entries(chatRoomToMsgs).forEach((state) => {
      const [chatRoomId, messageIds] = state;
      const event = action === "delivered" ? "message-delivered" : "message-seen";
      this.emitToAllRoomParticipantsExceptThisSocket(chatRoomId, event, {
        messageIds,
        userId,
      });
    });
  };

  private emitToAllRoomParticipantsExceptThisSocket = async <K extends keyof EmitterMapping>(
    chatRoomId: string,
    event: K,
    data: EmitterMapping[K]
  ) => {
    const chatRoom = await chatRoomService.getChatRoomByID(chatRoomId);

    // now emit this chatRoomDTO to all participants
    if (chatRoom)
      chatRoom.members.forEach((userId) => {
        this.socket.to(userId).emit(event, data);
      });
  };
}
