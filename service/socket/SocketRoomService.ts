import logger from "../../logger";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";

export class SocketRoomService {
  private socket: SocketManager;
  private io: IOManager;

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.io = io;
    this.init();
  }
  init() {
    this.joinRoom();
    this.socket.onDisconnect(this.leaveRoom);
  }
  async joinRoom() {
    const room = this.socket.getAuthUser().id;
    this.socket.join(room);
    this.logRoomInfo(room, "joined");
  }
  leaveRoom = async () => {
    const room = this.socket.getAuthUser().id;
    this.socket.leave(room);
    this.logRoomInfo(room, "left");
  };
  // Get all sockets in a room
  getAllSocketsInRoom = async (roomName: string): Promise<string[]> => {
    const socketIds = await this.io.in(roomName).fetchSockets(); // Fetch all sockets in the room
    return socketIds.map((socket) => socket.id); // Return the array of socket IDs
  };

  async logRoomInfo(room: string, event: "joined" | "left") {
    if (event === "left")
      logger.info(
        `User ${this.socket.getAuthUser().name} : ${
          this.socket.getAuthUser().email
        } disconnected with socketid : ${this.socket.getSocketId()}`
      );
    const members = await this.getAllSocketsInRoom(room);
    logger.info(
      `Socket ${
        this.socket.getAuthUser().email
      } with id ${this.socket.getSocketId()} has ${event} ${room}. Room has ${
        members.length
      } member : ${members.join(", ")}`
    );
  }
}
