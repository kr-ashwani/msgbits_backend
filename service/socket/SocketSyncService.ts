import { ChatRoomDTO } from "../../schema/chat/ChatRoomDTOSchema";
import { MessageDTO } from "../../schema/chat/MessageDTOSchema";
import { SyncUpdateInput } from "../../schema/chat/SyncUpdateInputSchema";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { chatRoomService } from "../database/chat/chatRoom/chatRoomService";
import { chatUserService } from "../database/chat/chatUser/chatUser";
import { messageService } from "../database/chat/message/messageService";

export class SocketSyncService {
  private socket: SocketManager;
  private io: IOManager;

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.io = io;
    this.init();
  }
  init() {
    this.requestForSync();
    this.socket.on("sync-updateChatRoom:Messages:ChatUsers", this.updateChatRoomAndMessages);
  }
  private requestForSync() {
    this.socket.emit("sync-update", "ask for updates");
  }
  /**
   *
   * @param payload
   */
  private updateChatRoomAndMessages = async (payload: SyncUpdateInput) => {
    const userId = this.socket.getAuthUser().id;

    const chatRooms = await chatRoomService.getAllChatRoomIdAssociatedWithUserId(userId);

    const chatRoomOut: ChatRoomDTO[] = [];
    const messagesOut: { [p in string]: MessageDTO[] } = {};

    for (let i = 0; i < chatRooms.length; i++) {
      const chatRoomId = chatRooms[i];
      const clientRoomSyncPayload = payload.chatRoom[chatRoomId];

      const room = await chatRoomService.getUpdatedChatRoom(
        chatRoomId,
        clientRoomSyncPayload?.lastUpdateTimestamp
      );
      if (room) chatRoomOut.push(room);
      const messages = await messageService.getUpdatedMessagesOfChatRoom(
        chatRoomId,
        clientRoomSyncPayload?.lastMessageTimestamp
      );

      if (messages.length) messagesOut[chatRoomId] = messages;
    }

    const chatUser = await chatUserService.getChatUsersCreatedAfterTimestamp(
      payload.lastChatUserCreatedAt
    );

    this.socket.emit("sync-updateChatRoom:Messages:ChatUsers", {
      chatRoom: chatRoomOut,
      message: messagesOut,
      chatUser,
    });
  };
}
