import { FilterQuery } from "mongoose";
import { messageDAO } from "../../../../Dao/MessageDAO";
import { MessageRowMapper } from "../../../../Dao/RowMapper/MessageRowMapper";
import { IMessage } from "../../../../model/message.model";
import { MessageDTO } from "../../../../schema/chat/MessageDTOSchema";
import { fileService } from "../file/fileService";
import { isMember } from "../chatRoom/chatRoomDecorators";
import cryptoSingleton from "../../../encryption/CryptoSingleton";

// Each method must accept an object that includes the userId and chatRoomId property.
// The userId represents the ID of the user attempting to access the chatroom messages.
class MessageService {
  @isMember()
  async updateDeliveredTo({
    userId,
    messageId,
    chatRoomId,
  }: {
    messageId: string;
    userId: string;
    chatRoomId: string;
  }) {
    try {
      let success = false;
      await messageDAO.update(
        { messageId, deliveredTo: { $nin: [userId] } },
        {
          $push: { deliveredTo: userId },
        },
        new MessageRowMapper(() => {
          success = true;
        })
      );

      return success;
    } catch (err) {
      throw err;
    }
  }
  @isMember()
  async updateSeenBy({
    messageId,
    userId,
    chatRoomId,
  }: {
    messageId: string;
    userId: string;
    chatRoomId: string;
  }) {
    try {
      let success = false;
      await messageDAO.update(
        { messageId, seenBy: { $nin: [userId] } },
        {
          $push: { seenBy: userId },
        },
        new MessageRowMapper(() => {
          success = true;
        })
      );

      return success;
    } catch (err) {
      throw err;
    }
  }
  @isMember()
  async createMessage({
    messageDTO,
    userId,
    chatRoomId,
  }: {
    messageDTO: MessageDTO;
    userId: string;
    chatRoomId: string;
  }) {
    try {
      let success = false;
      const message = this.convertDTOToIMessage(messageDTO);
      message.message = await cryptoSingleton.encrypt(message.message);
      await messageDAO.create(
        message,
        new MessageRowMapper(() => {
          success = true;
        })
      );

      return success;
    } catch (err) {
      throw err;
    }
  }
  @isMember()
  async getUpdatedMessagesOfChatRoom({
    chatRoomId,
    lastUpdatedTimestamp,
    userId,
  }: {
    chatRoomId: string;
    lastUpdatedTimestamp: string | null | undefined;
    userId: string;
  }): Promise<MessageDTO[]> {
    try {
      const messageArr: IMessage[] = [];

      // Prepare the filter object conditionally
      const filter: FilterQuery<IMessage> = {
        chatRoomId,
      };

      // Conditionally include the `updatedAt` filter
      // get all messages of chatRoom if lastUpdatedTimestamp is not provided
      if (lastUpdatedTimestamp) {
        filter.updatedAt = { $gt: lastUpdatedTimestamp };
      }

      await messageDAO.find(
        filter,
        new MessageRowMapper((message) => messageArr.push(message.toObject()))
      );

      const messageDTO: MessageDTO[] = [];
      const output = await Promise.all(this.convertIMessageToDTO(messageArr));
      output.forEach((dto) => (dto ? messageDTO.push(dto) : null));
      return messageDTO;
    } catch (err) {
      throw err;
    }
  }

  //function overloads
  convertIMessageToDTO(chatRoom: IMessage): Promise<MessageDTO | null>;
  convertIMessageToDTO(chatRoom: IMessage[]): Promise<MessageDTO | null>[];

  //function implementations
  convertIMessageToDTO(
    message: IMessage | IMessage[]
  ): Promise<MessageDTO | null> | Promise<MessageDTO | null>[] {
    if (Array.isArray(message)) return message.map(this.convertSingleIMessageToDTO);
    else return this.convertSingleIMessageToDTO(message);
  }
  private async convertSingleIMessageToDTO(message: IMessage): Promise<MessageDTO | null> {
    message.message = await cryptoSingleton.decrypt(message.message);
    if (message.type === "file") {
      const file = await fileService.getFileById(message.fileId);
      return file
        ? {
            ...message,
            createdAt: message.createdAt.toISOString(),
            updatedAt: message.updatedAt.toISOString(),
            file,
          }
        : null;
    } else
      return {
        ...message,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
      };
  }
  private convertDTOToIMessage(messageDTO: MessageDTO): IMessage {
    if (messageDTO.type === "file") {
      return {
        ...messageDTO,
        createdAt: new Date(messageDTO.createdAt),
        updatedAt: new Date(messageDTO.updatedAt),
        fileId: messageDTO.file.fileId,
        status: "sent",
      };
    }
    return {
      ...messageDTO,
      createdAt: new Date(messageDTO.createdAt),
      updatedAt: new Date(messageDTO.updatedAt),
      status: "sent",
    };
  }
}

const messageService = new MessageService();
export { messageService };
