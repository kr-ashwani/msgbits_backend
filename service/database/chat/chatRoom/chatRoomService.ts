import { ChatRoomDTO } from "./../../../../schema/chat/ChatRoomDTOSchema";
import { IChatRoom } from "../../../../model/chatRoom.model";
import { chatRoomDAO } from "../../../../Dao/ChatRoomDAO";
import { ChatRoomRowMapper } from "../../../../Dao/RowMapper/ChatRoomRowMapper";
import { GenericRowMapper } from "../../../../Dao/RowMapper/GenericRowMapper";
import mongoose, { FilterQuery, UpdateQuery } from "mongoose";
import { ChatAddNewMember } from "../../../../schema/chat/ChatAddNewMemberSchema";
import { ChatRoomAndMember } from "../../../../schema/chat/ChatRoomAndMemberSchema";
import { ObjectId } from "mongodb";
import { GroupChatProfileUpdate } from "../../../../schema/user/GroupChatProfileUpdate";

// userId must be first parameter of all methods
// It checks requesting user has all privilege
class ChatRoomService {
  async modifyChatRoomMember(
    userId: string,
    { chatRoomId, memberId }: ChatRoomAndMember,
    action: "makeAdmin" | "removeAdmin" | "removeUser"
  ) {
    try {
      //user itself is leaving the chatRoom
      if (userId === memberId) throw new Error("Operation on oneself is not allowed");

      let chatRoom: IChatRoom | null = null;

      const filter: FilterQuery<IChatRoom> = {
        chatRoomId,
        createdBy: { $ne: new ObjectId(memberId) }, // member should not be the owner of group
        members: { $all: [memberId, userId] }, // Ensure both users are part of the chat room
        admins: userId, // Ensure userId is an admin
      };
      const update: UpdateQuery<IChatRoom> = {};

      switch (action) {
        case "makeAdmin":
          update.$addToSet = { admins: memberId }; // Avoid adding duplicates with $addToSet
          break;
        case "removeAdmin":
          update.$pull = { admins: memberId }; // Remove memberId from admins
          break;
        case "removeUser":
          update.$pull = { members: memberId, admins: memberId }; // Remove from both members and admins
          break;
      }

      await chatRoomDAO.update(
        filter,
        update,
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
  // remove user from chatRoom
  async leaveChatRoom(userId: string, { chatRoomId, memberId }: ChatRoomAndMember) {
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

  async updateChatRoomNameOrPicture({
    userId,
    updatedValue,
  }: {
    userId: string;
    updatedValue: GroupChatProfileUpdate;
  }) {
    try {
      const chatRoomArr: IChatRoom[] = [];
      const update: UpdateQuery<IChatRoom> = {};

      if (updatedValue.updatedName) update.chatName = updatedValue.updatedName;
      if (updatedValue.updatedProfilePicture)
        update.chatRoomPicture = updatedValue.updatedProfilePicture;

      await chatRoomDAO.update(
        {
          chatRoomId: updatedValue.chatRoomId,
          members: { $in: [userId] },
          type: "group",
        },
        update,
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
