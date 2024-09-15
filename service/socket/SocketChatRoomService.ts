import { IUser } from "../../model/user.model";
import { ChatAddNewMember } from "../../schema/chat/ChatAddNewMemberSchema";
import { ChatRoomDTO } from "../../schema/chat/ChatRoomDTOSchema";
import { LeaveChatRoom } from "../../schema/chat/LeaveChatRoomSchema";
import { SocketAuthData } from "../../socket/EventHandlers/validateSocketConnection";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { chatRoomService } from "../database/chat/chatRoom/chatRoomService";
import { messageService } from "../database/chat/message/messageService";

export class SocketChatRoomService {
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
    this.socket.on("chatroom-create", this.createChatUser);
    this.socket.on("chatroom-addNewMembers", this.addNewMember);
    this.socket.on("chatroom-leave", this.leaveChatRoom);
  }

  createChatUser = async (chatRoomDTO: ChatRoomDTO) => {
    const success = await chatRoomService.createChatRoom(chatRoomDTO);

    // now emit this chatRoomDTO to all participants
    chatRoomDTO.members.forEach((userId) => {
      this.socket.to(userId).emit("chatroom-create", chatRoomDTO);
    });
  };

  addNewMember = async (chatAddNewMember: ChatAddNewMember) => {
    const chatRoom = await chatRoomService.addNewMembers(this.userId, chatAddNewMember);
    if (!chatRoom) throw new Error("Something went wrong while adding new members to chatRoom");

    const messages = await messageService.getUpdatedMessagesOfChatRoom({
      userId: this.userId,
      chatRoomId: chatAddNewMember.chatRoomId,
      lastUpdatedTimestamp: null,
    });

    // Newly added participants emit chatRoom and its messages
    chatAddNewMember.newMember.forEach((userId) => {
      this.socket.to(userId).emit("sync-updateChatRoom:Messages:ChatUsers", {
        chatRoom: [chatRoom],
        message: { [chatRoom.chatRoomId]: messages },
        chatUser: [],
      });
    });
    // now emit this chatRoom new member to all existing participants

    chatRoom.members.forEach((userId) => {
      if (!chatAddNewMember.newMember.includes(userId))
        this.socket.to(userId).emit("chatroom-addNewMembers", chatAddNewMember);
    });
  };

  leaveChatRoom = async (leaveChatRoom: LeaveChatRoom) => {
    if (leaveChatRoom.memberId !== this.userId) throw new Error("user id mismatch ");

    const chatRoom = await chatRoomService.leaveChatRoom(this.userId, leaveChatRoom);

    // now emit this leaveChatRoom to all participants
    if (chatRoom)
      chatRoom.members.forEach((userId) => {
        this.socket.to(userId).emit("chatroom-leave", leaveChatRoom);
      });
    else throw Error("Something went wrong while removing user from chatRoom");
  };
}
