import handleError from "../../errorhandler/ErrorHandler";
import { AppError } from "../../errors/AppError";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { UserStatusTracker } from "./ChatStatusTracker";

const userStatusTracker = new UserStatusTracker();
export class SocketChatUserService {
  private socket: SocketManager;
  private io: IOManager;

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.io = io;

    this.init();
  }

  init() {
    this.handleUserStatus();
    this.socket.on("heartbeat", this.handleHeartbeat);
    this.socket.on("sync-allUserStatus", this.syncOnlineUsers);
  }

  async handleUserStatus() {
    const userId = this.socket.getAuthUser().id;

    this.emitStatus(userId, "online");
    await userStatusTracker.updateUserStatus(userId, this.socket.getSocketId());
    userStatusTracker.registerStatusCallback((userId, status) => {
      this.emitStatus(userId, status);
    });
  }

  syncOnlineUsers = async () => {
    try {
      const userId = this.socket.getAuthUser().id;
      this.emitStatus(userId, "online");
      const onlineUsers = await userStatusTracker.getOnlineUsers();
      this.socket.emit("sync-allUserStatus", onlineUsers);
    } catch (error) {
      handleError(new AppError("Error processing online users command:"));
    }
  };

  private emitStatus = (userId: string | string[], status: "online" | "offline") => {
    this.io.emit("chatuser-statusChange", {
      userId,
      status,
    });
  };

  handleHeartbeat = async () => {
    const userId = this.socket.getAuthUser().id;
    await userStatusTracker.updateUserStatus(userId, this.socket.getSocketId());
  };
}
