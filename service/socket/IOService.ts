import { Server } from "socket.io";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { chatUserService } from "../database/chat/chatUser/chatUser";

export class IOService {
  private io: IOManager;

  constructor(io: Server) {
    this.io = new IOManager(io);
  }

  init() {
    this.broadcastNewlySignedUpUser();
  }

  broadcastNewlySignedUpUser = async () => {
    const io = this.io;
    chatUserService.registerForNewlyCreatedChatUser((user) => {
      io.emit("chatuser-new", user);
    });
  };

  getIO() {
    return this.io;
  }
}
