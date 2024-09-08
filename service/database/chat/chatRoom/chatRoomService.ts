import { ChatRoomDTO } from "./../../../../schema/chat/ChatRoomDTOSchema";
import { IChatRoom } from "../../../../model/chatRoom.model";
import { chatRoomDAO } from "../../../../Dao/ChatRoomDAO";
import { ChatRoomRowMapper } from "../../../../Dao/RowMapper/ChatRoomRowMapper";
import { GenericRowMapper } from "../../../../Dao/RowMapper/GenericRowMapper";
import { FilterQuery } from "mongoose";

class ChatRoomService {
  async getAllChatRoomIdAssociatedWithUserId(userId: string) {
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
  }
  async getUpdatedChatRoom(
    chatRoomId: string,
    updatedTimestamp: string | null | undefined
  ): Promise<ChatRoomDTO | null> {
    const chatRoomArr: IChatRoom[] = [];

    const filter: FilterQuery<IChatRoom> = {
      chatRoomId,
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
}

const chatRoomService = new ChatRoomService();
export { chatRoomService };
