import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SocketAuthData } from "../../../socket/EventHandlers/validateSocketConnection";
import { IOManager } from "../../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../../socket/SocketIOManager/SocketManager";
import { Server, Socket } from "socket.io";
import logger from "../../../logger";

export class AdminSocketService {
  private socket: SocketManager;
  private io: IOManager;

  constructor(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketAuthData>,
    io: Server
  ) {
    this.socket = new SocketManager(socket);
    this.io = new IOManager(io);
    this.logSocketConnection();
  }
  init() {}

  getSocket() {
    return this.socket;
  }
  getIO() {
    return this.io;
  }
  logSocketConnection() {
    logger.info(
      `$Admin ${this.socket.getAuthUser().name} - ${
        this.socket.getAuthUser().email
      } connected with socketid : ${this.socket.getSocketId()}`
    );
  }
}
