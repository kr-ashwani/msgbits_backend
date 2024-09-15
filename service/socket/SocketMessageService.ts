import { MessageDTO } from "../../schema/chat/MessageDTOSchema";
import { MessageStatusInput } from "../../schema/chat/MessageStatusInputSchema";
import { SocketAuthData } from "../../socket/EventHandlers/validateSocketConnection";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { EmitterMapping } from "../../socket/SocketIOManager/types";
import { chatRoomService } from "../database/chat/chatRoom/chatRoomService";
import { messageService } from "../database/chat/message/messageService";

export class SocketMessageService {
  private socket: SocketManager;
  private io: IOManager;
  private user: SocketAuthData["auth"];
  private userId: string;

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.io = io;
    this.user = socket.getAuthUser();
    this.userId = this.user.id;
    this.init();
  }
  init() {
    this.socket.on("message-create", this.createMessage);
    this.socket.on("message-delivered", async (payload) => {
      await this.updateMessageStatus("delivered", payload);
    });
    this.socket.on("message-seen", async (payload) => {
      await this.updateMessageStatus("seen", payload);
    });
  }

  createMessage = async (messageDTO: MessageDTO) => {
    messageDTO.status = "sent";

    //update last messageId of chatRoom
    await chatRoomService.updateLastMessageId(
      this.userId,
      messageDTO.chatRoomId,
      messageDTO.messageId,
      messageDTO.updatedAt
    );

    const success = await messageService.createMessage({
      userId: this.userId,
      chatRoomId: messageDTO.chatRoomId,
      messageDTO,
    });

    if (messageDTO.type !== "info") this.socket.emit("message-sent", messageDTO.messageId);
    this.emitToAllRoomParticipantsExceptThisSocket(
      messageDTO.chatRoomId,
      "message-create",
      messageDTO
    );
  };

  updateMessageStatus = async (action: "delivered" | "seen", payload: MessageStatusInput) => {
    const chatRoomToMsgs: { [p in string]: string[] } = {};

    for (let i = 0; i < payload.length; i++) {
      const { chatRoomId, messageId } = payload[i];
      if (action === "delivered")
        await messageService.updateDeliveredTo({
          chatRoomId,
          messageId,
          userId: this.userId,
        });
      else
        await messageService.updateSeenBy({
          chatRoomId,
          messageId,
          userId: this.userId,
        });

      if (chatRoomToMsgs[chatRoomId]) chatRoomToMsgs[chatRoomId].push(messageId);
      else chatRoomToMsgs[chatRoomId] = [messageId];
    }

    Object.entries(chatRoomToMsgs).forEach((state) => {
      const [chatRoomId, messageIds] = state;
      const event = action === "delivered" ? "message-delivered" : "message-seen";

      this.emitToAllRoomParticipantsExceptThisSocket(chatRoomId, event, {
        messageIds,
        userId: this.userId,
      });
    });
  };

  private emitToAllRoomParticipantsExceptThisSocket = async <K extends keyof EmitterMapping>(
    chatRoomId: string,
    event: K,
    data: EmitterMapping[K]
  ) => {
    const chatRoom = await chatRoomService.getChatRoomByID(this.userId, chatRoomId);

    // now emit this chatRoomDTO to all participants
    if (chatRoom)
      chatRoom.members.forEach((userId) => {
        this.socket.to(userId).emit(event, data);
      });
  };
}
