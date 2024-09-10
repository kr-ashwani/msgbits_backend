import { MessageDTO } from "../../schema/chat/MessageDTOSchema";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
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
  }
  createMessage = async (payload: MessageDTO) => {
    const success = await messageService.createMessage(payload);

    //update last messageId of chatRoom
    await chatRoomService.updateLastMessageId(
      payload.chatRoomId,
      payload.messageId,
      payload.updatedAt
    );

    const chatRoom = await chatRoomService.getChatRoomByID(payload.chatRoomId);

    // now emit this chatRoomDTO to all participants
    if (chatRoom)
      chatRoom.members.forEach((userId) => {
        this.socket.to(userId).emit("message-create", payload);
      });
  };
}
