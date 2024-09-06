import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";

export class SocketMessageService {
  private socket: SocketManager;
  private io: IOManager;

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.io = io;
  }
}
