import { ChatRoomDTO } from "../../schema/chat/ChatRoomDTOSchema";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { chatRoomService } from "../database/chat/chatRoom/chatRoomService";

export class SocketChatRoomService {
  private socket: SocketManager;
  private io: IOManager;

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.io = io;
    this.init();
  }
  init() {
    this.socket.on("chatroom-create", this.createChatUser);
  }
  createChatUser = async (payload: ChatRoomDTO) => {
    const success = await chatRoomService.createChatRoom(payload);

    // now emit this chatRoomDTO to all participants
    payload.members.forEach((userId) => {
      this.socket.to(userId).emit("chatroom-create", payload);
    });
  };
}
