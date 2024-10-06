import { IUser } from "../../model/user.model";
import { ChatAddNewMember } from "../../schema/chat/ChatAddNewMemberSchema";
import { ChatRoomAndMember } from "../../schema/chat/ChatRoomAndMemberSchema";
import { ChatRoomDTO } from "../../schema/chat/ChatRoomDTOSchema";
import { GroupChatProfileUpdate } from "../../schema/user/GroupChatProfileUpdate";
import { SocketAuthData } from "../../socket/EventHandlers/validateSocketConnection";
import { IOManager } from "../../socket/SocketIOManager/IOManager";
import { SocketManager } from "../../socket/SocketIOManager/SocketManager";
import { ChatRoomEmitterMapping } from "../../socket/SocketIOManager/types";
import { getFileLinkFromLink } from "../../utils/getFileLinkFromLink";
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
    this.socket.on("chatroom-create", this.createChatRoom);
    this.socket.on("chatroom-addNewMembers", this.addNewMember);
    this.socket.on("chatroom-leave", this.leaveChatRoom);
    this.socket.on("chatroom-makeAdmin", (payload) =>
      this.chatRoomMemberOperation("makeAdmin", payload)
    );
    this.socket.on("chatroom-removeAdmin", (payload) =>
      this.chatRoomMemberOperation("removeAdmin", payload)
    );
    this.socket.on("chatroom-removeUser", (payload) =>
      this.chatRoomMemberOperation("removeUser", payload)
    );
    this.socket.on("chatroom-memberTyping", this.sendTypingIndicator);
    this.socket.on("chatroom-updateChatNameOrPic", this.updateChatRoomNameOrPicture);
  }

  createChatRoom = async (chatRoomDTO: ChatRoomDTO) => {
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

  leaveChatRoom = async (chatRoomAndMember: ChatRoomAndMember) => {
    if (chatRoomAndMember.memberId !== this.userId) throw new Error("user id mismatch ");

    const chatRoom = await chatRoomService.leaveChatRoom(this.userId, chatRoomAndMember);

    this.socket.to(chatRoomAndMember.memberId).emit("chatroom-leave", chatRoomAndMember);
    // now emit this leaveChatRoom to all participants
    if (chatRoom)
      chatRoom.members.forEach((userId) => {
        this.socket.to(userId).emit("chatroom-leave", chatRoomAndMember);
      });
    else throw Error("Something went wrong while removing user from chatRoom");
  };

  chatRoomMemberOperation = async (
    action: "makeAdmin" | "removeAdmin" | "removeUser",
    chatRoomAndMember: ChatRoomAndMember
  ) => {
    let chatRoom: ChatRoomDTO | null = null;
    let event: keyof ChatRoomEmitterMapping | null = null;

    switch (action) {
      case "makeAdmin":
        chatRoom = await chatRoomService.modifyChatRoomMember(
          this.userId,
          chatRoomAndMember,
          "makeAdmin"
        );
        event = "chatroom-makeAdmin";
        break;
      case "removeAdmin":
        chatRoom = await chatRoomService.modifyChatRoomMember(
          this.userId,
          chatRoomAndMember,
          "removeAdmin"
        );
        event = "chatroom-removeAdmin";
        break;
      case "removeUser":
        chatRoom = await chatRoomService.modifyChatRoomMember(
          this.userId,
          chatRoomAndMember,
          "removeUser"
        );
        event = "chatroom-removeUser";
        break;
    }

    //emit remove itself event
    if (action === "removeUser")
      this.socket.to(chatRoomAndMember.memberId).emit("chatroom-leave", chatRoomAndMember);

    if (chatRoom && event)
      // now emit this leaveChatRoom to all participants
      chatRoom.members.forEach((userId) => {
        if (event) this.socket.to(userId).emit(event, chatRoomAndMember);
      });
    else throw Error("Something went wrong while performing chatRoom memeber operations");
  };

  sendTypingIndicator = async (chatRoomAndMember: ChatRoomAndMember) => {
    const chatRoom = await chatRoomService.getChatRoomByID(
      this.userId,
      chatRoomAndMember.chatRoomId
    );

    // now emit this typing event to all participants
    if (chatRoom)
      chatRoom.members.forEach((userId) => {
        this.socket.to(userId).emit("chatroom-memberTyping", chatRoomAndMember);
      });
    else throw Error("Something went wrong while sending typing event");
  };

  updateChatRoomNameOrPicture = async (payload: GroupChatProfileUpdate) => {
    const updatedValue = {
      userId: this.socket.getAuthUser().id,
      updatedValue: payload,
    };
    const chatRoom = await chatRoomService.updateChatRoomNameOrPicture(updatedValue);
    if (!chatRoom) throw new Error("Something went wrong while updating chat room name or profile");

    const updatedProfilePicture = payload.updatedProfilePicture
      ? getFileLinkFromLink(payload.updatedProfilePicture)
      : null;

    chatRoom.members.forEach((memberId) => {
      this.socket.to(memberId).emit("chatroom-updateChatNameOrPic", {
        chatRoomId: payload.chatRoomId,
        updatedProfilePicture,
        updatedName: payload.updatedName,
      });
    });
  };
}
