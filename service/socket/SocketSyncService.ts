import { ChatRoomDTO } from "../../schema/chat/ChatRoomDTOSchema";
import { MessageDTO } from "../../schema/chat/MessageDTOSchema";
import { SyncUpdateInput } from "../../schema/chat/SyncUpdateInputSchema";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { chatRoomService } from "../database/chat/chatRoom/chatRoomService";
import { messageService } from "../database/chat/message/messageService";

export class SocketSyncService {
  private socket: SocketManager;
  private io: IOManager;

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.io = io;
  }
  init() {
    this.requestForSync();
    this.socket.on("sync-updateChatRoomAndMessages", this.updateChatRoomAndMessages);
  }
  private requestForSync() {
    this.socket.emit("sync-update", "ask for updates");
  }
  /**
   *
   * @param payload
   */
  private async updateChatRoomAndMessages(payload: SyncUpdateInput) {
    const userId = this.socket.getAuthUser().id;

    const chatRooms = await chatRoomService.getAllChatRoomIdAssociatedWithUserId(userId);

    const chatRoomOut: ChatRoomDTO[] = [];
    const messagesOut: { [p in string]: MessageDTO[] } = {};

    for (let i = 0; i < chatRooms.length; i++) {
      const chatRoomId = chatRooms[i];
      const clientRoomSyncPayload = payload[chatRoomId];

      const room = await chatRoomService.getUpdatedChatRoom(
        chatRoomId,
        clientRoomSyncPayload?.lastUpdateTimestamp
      );
      if (room) chatRoomOut.push(room);
      const messages = await messageService.getUpdatedMessagesOfChatRoom(
        chatRoomId,
        clientRoomSyncPayload?.lastMessageTimestamp
      );
      messagesOut[chatRoomId] = messages;
    }

    //await Promise.all(promisesOut);
    this.socket.emit("sync-updateChatRoomAndMessages", {
      chatRoom: chatRoomOut,
      message: messagesOut,
    });
  }
}
