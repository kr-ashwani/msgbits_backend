import { Socket, Server, Namespace } from "socket.io";
import logger from "../../logger";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SocketAuthData } from "./validateSocketConnection";
import { message } from "../../test/messageData";
import { chatRoom } from "../../test/chatRoomData";
import { chatUser } from "../../test/chatUserData";

// Entry point for Namespace / socket io handlers
function registerSocketHandlers(socket: Socket, io: Server) {
  logger.info(
    `User ${socket.data.auth.name}-${socket.data.auth.email} connected with socketid - ${socket.id}`
  );

  socket.on("chatroom-op", (payload: any, ack: any) => {
    console.log(payload, ack);
    ack({ sucess: true });
  });

  socket.emit("chatuser-getall", chatUser);
  socket.emit(
    "message-chatroom",
    message.reduce((prev: any, item) => {
      if (prev[item.chatRoomId]) prev[item.chatRoomId].push(item);
      else prev[item.chatRoomId] = [item];
      return prev;
    }, {})
  );
  socket.emit("chatroom-getall", chatRoom);
}
// Entry point for Namespace /admin socket io handlers
function registerAdminSocketHandlers(
  socket: Socket,
  namespace: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketAuthData>
) {
  logger.info(
    `Admin ${socket.data.auth.name}-${socket.data.auth.email} connected with socketid - ${socket.id}`
  );
}
export { registerSocketHandlers, registerAdminSocketHandlers };
