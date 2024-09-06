import logger from "../../logger";
import { SocketService } from "../../service/socket/SocketService";
import { SocketManager } from "../SocketIOManager/SocketManager";

// Entry point for Namespace / socket io handlers
function registerSocketHandlers(socketService: SocketService) {
  logSocketConnection(socketService.getSocket(), "User");

  const { chatRoomService, chatUserService, messageService, fileService } =
    socketService.getChatServices();
}
// Entry point for Namespace /admin socket io handlers
function registerAdminSocketHandlers(socketService: SocketService) {
  logSocketConnection(socketService.getSocket(), "Admin");
}

function logSocketConnection(socket: SocketManager, role: "User" | "Admin") {
  logger.info(
    `${role} ${socket.getAuthUser().name}-${
      socket.getAuthUser().email
    } connected with socketid - ${socket.getSocketId()}`
  );
}

export { registerSocketHandlers, registerAdminSocketHandlers };
