import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { chatUserService } from "../database/chat/chatUser/chatUser";

export class SocketChatUserService {
  private socket: SocketManager;
  private io: IOManager;

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.io = io;
    //this.init();
  }

  init() {
    this.provideAllChatUser();
  }
  async provideAllChatUser() {
    const chatUsers = await chatUserService.getAllChatUsers();

    this.socket.emit("chatuser-getall", chatUsers);
  }
}
