import { Server, Socket } from "socket.io";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SocketAuthData } from "../../socket/EventHandlers/validateSocketConnection";
import { SocketChatRoomService } from "./SocketChatRoomService";
import { SocketChatUserService } from "./SocketChatUserService";
import { SocketFileService } from "./SocketFileService";
import { SocketMessageService } from "./SocketMessageService";
import { SocketSyncService } from "./SocketSyncService";
import logger from "../../logger";
import { SocketRoomService } from "./SocketRoomService";

export class SocketService {
  private socket: SocketManager;
  private io: IOManager;

  constructor(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketAuthData>,
    io: Server
  ) {
    this.socket = new SocketManager(socket);
    this.io = new IOManager(io);
  }

  init() {
    this.logSocketConnection();
    new SocketRoomService(this.socket, this.io);
    new SocketChatRoomService(this.socket, this.io);
    new SocketMessageService(this.socket, this.io);
    new SocketFileService(this.socket, this.io);
    new SocketChatUserService(this.socket, this.io);
    new SocketSyncService(this.socket, this.io);
  }
  getSocket() {
    return this.socket;
  }
  getIO() {
    return this.io;
  }
  logSocketConnection() {
    logger.info(
      `User ${this.socket.getAuthUser().name} : ${
        this.socket.getAuthUser().email
      } connected with socketid : ${this.socket.getSocketId()}`
    );
  }
}
