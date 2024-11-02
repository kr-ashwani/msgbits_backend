import { ChatRoomDTO } from "../../schema/chat/ChatRoomDTOSchema";
import { MessageDTO } from "../../schema/chat/MessageDTOSchema";
import { SyncUpdateInput } from "../../schema/chat/SyncUpdateInputSchema";
import { SocketAuthData } from "../../socket/EventHandlers/validateSocketConnection";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { chatRoomService } from "../database/chat/chatRoom/chatRoomService";
import { chatUserService } from "../database/chat/chatUser/chatUser";
import { messageService } from "../database/chat/message/messageService";
import { callingService } from "./CallingService";

export class SocketSyncService {
  private socket: SocketManager;
  private io: IOManager;
  private user: SocketAuthData["auth"];
  private userId: string;

  constructor(socket: SocketManager, io: IOManager) {
    this.socket = socket;
    this.io = io;
    this.user = socket.getAuthUser();
    this.userId = this.user.id;
    this.init();
  }
  init() {
    this.requestForSync();
    this.socket.on("sync-updateChatRoom:Messages:ChatUsers", this.getUpdatedChatRoomAndMessages);
  }
  private requestForSync() {
    this.socket.emit("sync-update", "ask for updates");
  }

  private getUpdatedChatRoomAndMessages = async (payload: SyncUpdateInput) => {
    const chatRooms = await chatRoomService.getAllChatRoomIdAssociatedWithUserId(this.userId);

    const chatRoomOut: ChatRoomDTO[] = [];
    const messagesOut: { [p in string]: MessageDTO[] } = {};

    for (let i = 0; i < chatRooms.length; i++) {
      const chatRoomId = chatRooms[i];
      const clientRoomSyncPayload = payload.chatRoom[chatRoomId];

      const room = await chatRoomService.getUpdatedChatRoom(
        this.userId,
        chatRoomId,
        clientRoomSyncPayload
          ? this.getSmallerTime(
              clientRoomSyncPayload.lastUpdateTimestamp,
              payload.socketLastDisconnectedAt
            )
          : null
      );
      if (room) chatRoomOut.push(room);

      const lastUpdatedTimestamp = clientRoomSyncPayload
        ? this.getSmallerTime(
            clientRoomSyncPayload?.lastMessageTimestamp,
            payload.socketLastDisconnectedAt
          )
        : null;
      const messages = await messageService.getUpdatedMessagesOfChatRoom({
        userId: this.userId,
        chatRoomId,
        lastUpdatedTimestamp,
      });

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

    const chatRoomIds = chatRoomOut.map((room) => room.chatRoomId);
    const activeChatRoomIds = await callingService.getActiveCallSession(chatRoomIds);

    this.socket.emit("sync-chatRoomCallSession", activeChatRoomIds);
  };

  private getSmallerTime = (timeA: string | null, timeB: string | null): string | null => {
    try {
      if (timeA && timeB) {
        const timeAinMS = new Date(timeA).getTime();
        const timeBinMS = new Date(timeB).getTime();
        return timeAinMS < timeBinMS ? timeA : timeB;
      } else return timeA || timeB;
    } catch (err) {
      return null;
    }
  };
}
