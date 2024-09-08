import { FilterQuery } from "mongoose";
import { messageDAO } from "../../../../Dao/MessageDAO";
import { MessageRowMapper } from "../../../../Dao/RowMapper/MessageRowMapper";
import { IMessage } from "../../../../model/message.model";
import { MessageDTO } from "../../../../schema/chat/MessageDTOSchema";
import { fileService } from "../file/fileService";

class MessageService {
  async getUpdatedMessagesOfChatRoom(
    chatRoomId: string,
    lastUpdatedTimestamp: string | null | undefined
  ): Promise<MessageDTO[]> {
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
      new MessageRowMapper((message) => {
        messageArr.push(message);
      }),
      {
        sort: { createAt: 1 },
      }
    );

    const messageDTO: MessageDTO[] = [];
    const output = await Promise.all(this.convertIChatRoomToDTO(messageArr));
    output.forEach((dto) => (dto ? messageDTO.push(dto) : null));
    return messageDTO;
  }

  //function overloads
  convertIChatRoomToDTO(chatRoom: IMessage): Promise<MessageDTO | null>;
  convertIChatRoomToDTO(chatRoom: IMessage[]): Promise<MessageDTO | null>[];

  //function implementations
  convertIChatRoomToDTO(
    message: IMessage | IMessage[]
  ): Promise<MessageDTO | null> | Promise<MessageDTO | null>[] {
    if (Array.isArray(message)) return message.map(this.convertSingleChatRoomToDTO);
    else return this.convertSingleChatRoomToDTO(message);
  }
  private async convertSingleChatRoomToDTO(message: IMessage): Promise<MessageDTO | null> {
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
}

const messageService = new MessageService();
export { messageService };
