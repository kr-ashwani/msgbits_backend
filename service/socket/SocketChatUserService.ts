import { AppError } from "../../errors/AppError";
import handleError from "../../errors/errorhandler/ErrorHandler";
import { UserUpdateProfile } from "../../schema/user/UserUpdateProfileSchema";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { getFileLinkFromLink } from "../../utils/getFileLinkFromLink";
import { userService } from "../database/user/userService";
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
    this.socket.on("chatuser-updateProfile", this.updateProfile);
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

  updateProfile = async (payload: UserUpdateProfile) => {
    const updatedValue = {
      userId: this.socket.getAuthUser().id,
      updatedValue: payload,
    };
    await userService.updateProfile(updatedValue);

    const updatedProfilePicture = payload.updatedProfilePicture
      ? getFileLinkFromLink(payload.updatedProfilePicture)
      : null;
    this.socket.broadcast.emit("chatuser-updateProfile", {
      userId: updatedValue.userId,
      updatedProfilePicture,
      updatedName: payload.updatedName,
    });
  };

  handleHeartbeat = async () => {
    const userId = this.socket.getAuthUser().id;
    await userStatusTracker.updateUserStatus(userId, this.socket.getSocketId());
  };
}
