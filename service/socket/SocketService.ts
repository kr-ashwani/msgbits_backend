import { Server, Socket } from "socket.io";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SocketAuthData } from "../../socket/EventHandlers/validateSocketConnection";
import { SocketChatRoomService } from "./SocketChatRoomService";
import { SocketChatUserService } from "./SocketChatUserService";
import { SocketFileService } from "./SocketFileService";
import { SocketMessageService } from "./SocketMessageService";

export class SocketService {
  private socket: SocketManager;
  private io: IOManager;
  private socketMessageService;
  private socketChatRoomService;
  private socketFileService;
  private socketChatUserService;

  constructor(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketAuthData>,
    io: Server
  ) {
    this.socket = new SocketManager(socket);
    this.io = new IOManager(io);
    this.socketChatRoomService = new SocketChatRoomService(this.socket, this.io);
    this.socketMessageService = new SocketMessageService(this.socket, this.io);
    this.socketFileService = new SocketFileService(this.socket, this.io);
    this.socketChatUserService = new SocketChatUserService(this.socket, this.io);
  }

  getSocket() {
    return this.socket;
  }
  getIO() {
    return this.io;
  }
  getChatServices() {
    return {
      chatRoomService: this.socketChatRoomService,
      chatUserService: this.socketChatUserService,
      fileService: this.socketFileService,
      messageService: this.socketMessageService,
    };
  }
}
