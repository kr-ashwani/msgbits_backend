import { ChatRoomDTO } from "./../../../../schema/chat/ChatRoomDTOSchema";
import { IChatRoom } from "../../../../model/chatRoom.model";
import { chatRoomDAO } from "../../../../Dao/ChatRoomDAO";
import { ChatRoomRowMapper } from "../../../../Dao/RowMapper/ChatRoomRowMapper";
import { GenericRowMapper } from "../../../../Dao/RowMapper/GenericRowMapper";
import mongoose, { FilterQuery } from "mongoose";
import { ChatAddNewMember } from "../../../../schema/chat/ChatAddNewMemberSchema";
import { LeaveChatRoom } from "../../../../schema/chat/LeaveChatRoomSchema";

// userId must be first parameter of all methods
// It checks requesting user has all privilege
class ChatRoomService {
  // remove user from chatRoom
  async leaveChatRoom(userId: string, { chatRoomId, memberId }: LeaveChatRoom) {
    try {
      //user itself is leaving the chatRoom
      if (userId !== memberId) throw new Error("user id mismatch ");

      let chatRoom: IChatRoom | null = null;

      const filter: FilterQuery<IChatRoom> = {
        chatRoomId,
        members: memberId,
        $or: [{ admins: { $ne: memberId } }, { "admins.1": { $exists: true } }],
      };

      await chatRoomDAO.update(
        filter,
        {
          $pull: { members: memberId, admins: memberId },
        },
        new ChatRoomRowMapper((result) => {
          chatRoom = result.toObject();
        }),
        {
          new: true,
        }
      );

      return chatRoom ? this.convertIChatRoomToDTO(chatRoom) : null;
    } catch (err) {
      throw err;
    }
  }
  // to add new members to chatRoom. user must be admin to add them
  async addNewMembers(userId: string, chatAddNewMember: ChatAddNewMember) {
    try {
      let chatRoom: IChatRoom | null = null;
      const { chatRoomId, newMember } = chatAddNewMember;

      await chatRoomDAO.update(
        {
          chatRoomId,
          members: { $nin: newMember },
          admins: userId,
        },
        {
          $push: {
            members: { $each: newMember },
          },
        },
        new ChatRoomRowMapper((result) => {
          chatRoom = result.toObject();
        }),
        { new: true }
      );

      return chatRoom ? this.convertIChatRoomToDTO(chatRoom) : null;
    } catch (err) {
      throw err;
    }
  }
  //
  async updateLastMessageId(
    userId: string,
    chatRoomId: string,
    messageId: string,
    updatedAt: string
  ) {
    try {
      let success = false;

      await chatRoomDAO.update(
        { chatRoomId, members: { $in: [userId] } },
        {
          lastMessageId: messageId,
          updatedAt,
        },
        new ChatRoomRowMapper(() => {
          success = true;
        })
      );

      return success;
    } catch (err) {
      throw err;
    }
  }
  // to get chatRoom info. user must be member to access
  async getChatRoomByID(userId: string, chatRoomId: string) {
    try {
      let chatRoomArr: IChatRoom[] = [];

      await chatRoomDAO.find(
        { chatRoomId, members: { $in: [userId] } },
        new ChatRoomRowMapper((chatRoom) => {
          chatRoomArr.push(chatRoom.toObject());
        })
      );

      return chatRoomArr.length ? this.convertIChatRoomToDTO(chatRoomArr[0]) : null;
    } catch (err) {
      throw err;
    }
  }
  async createChatRoom(chatRoomDTO: ChatRoomDTO) {
    try {
      let success = false;
      const chatRoom = this.convertDTOToIChatRoom(chatRoomDTO);
      await chatRoomDAO.create(
        chatRoom,
        new ChatRoomRowMapper(() => {
          success = true;
        })
      );

      return success;
    } catch (err) {
      throw err;
    }
  }
  async getAllChatRoomIdAssociatedWithUserId(userId: string) {
    try {
      const chatRooms: string[] = [];

      await chatRoomDAO.find(
        {
          members: { $in: [userId] },
        },
        new GenericRowMapper<{ chatRoomId: string }>((data) => {
          chatRooms.push(data.chatRoomId);
        }),
        null,
        "chatRoomId"
      );

      return chatRooms;
    } catch (err) {
      throw err;
    }
  }

  async getUpdatedChatRoom(
    userId: string,
    chatRoomId: string,
    updatedTimestamp: string | null | undefined
  ): Promise<ChatRoomDTO | null> {
    try {
      const chatRoomArr: IChatRoom[] = [];

      const filter: FilterQuery<IChatRoom> = {
        chatRoomId,
        members: { $in: [userId] },
      };
      // Conditionally include the `updatedAt` filter
      // get chatRoom if updatedtimestamp is not mentioned
      if (updatedTimestamp) {
        filter.updatedAt = { $gt: updatedTimestamp };
      }

      await chatRoomDAO.find(
        filter,
        new ChatRoomRowMapper((chatRoom) => {
          chatRoomArr.push(chatRoom.toObject());
        })
      );

      return chatRoomArr.length ? this.convertIChatRoomToDTO(chatRoomArr[0]) : null;
    } catch (err) {
      throw err;
    }
  }

  //function overloads
  convertIChatRoomToDTO(chatRoom: IChatRoom): ChatRoomDTO;
  convertIChatRoomToDTO(chatRoom: IChatRoom[]): ChatRoomDTO[];

  //function implementations
  convertIChatRoomToDTO(chatRoom: IChatRoom | IChatRoom[]): ChatRoomDTO | ChatRoomDTO[] {
    if (Array.isArray(chatRoom)) {
      return chatRoom.map(this.convertSingleChatRoomToDTO);
    } else {
      return this.convertSingleChatRoomToDTO(chatRoom);
    }
  }
  private convertSingleChatRoomToDTO(chatRoom: IChatRoom): ChatRoomDTO {
    return {
      ...chatRoom,
      createdAt: chatRoom.createdAt.toISOString(),
      updatedAt: chatRoom.updatedAt.toISOString(),
      createdBy: chatRoom.createdBy.toString(),
    };
  }

  private convertDTOToIChatRoom(chatRoom: ChatRoomDTO): IChatRoom {
    const IchatRoom: IChatRoom = {
      ...chatRoom,
      createdBy: new mongoose.Types.ObjectId(chatRoom.createdBy),
      createdAt: new Date(chatRoom.createdAt),
      updatedAt: new Date(chatRoom.updatedAt),
    };
    return IchatRoom;
  }
}

const chatRoomService = new ChatRoomService();
export { chatRoomService };
