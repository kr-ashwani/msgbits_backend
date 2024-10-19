import { HydratedDocument } from "mongoose";
import { UserRowMapper } from "../../../../Dao/RowMapper/UserRowMapper";
import { userDAO } from "../../../../Dao/UserDAO";
import { IUser, userModelEvents } from "../../../../model/user.model";
import { ChatUserDTO } from "../../../../schema/chat/ChatUserDTOSchema";
import { ResponseUserSchema } from "../../../../schema/responseSchema";

class ChatUserService {
  async getChatUsersCreatedAfterTimestamp(createdAt: string | null): Promise<ChatUserDTO[]> {
    try {
      const userArr: HydratedDocument<IUser>[] = [];

      if (!createdAt) return await this.getAllChatUsers();

      await userDAO.find(
        { updatedAt: { $gt: createdAt } },
        new UserRowMapper((user) => {
          userArr.push(user);
        })
      );

      return this.convertIUserToDTO(userArr);
    } catch (err) {
      throw err;
    }
  }
  async getAllChatUsers(): Promise<ChatUserDTO[]> {
    try {
      const userArr: HydratedDocument<IUser>[] = [];

      await userDAO.find(
        {},
        new UserRowMapper((user) => {
          userArr.push(user);
        })
      );

      return this.convertIUserToDTO(userArr);
    } catch (err) {
      throw err;
    }
  }

  async registerForNewlyCreatedChatUser(callback: (user: ChatUserDTO) => void) {
    userModelEvents.on("created", async (doc: ResponseUserSchema) => {
      const user = this.convertSingleUserToDTO(doc);
      callback(user);
    });
  }

  //function overloads
  convertIUserToDTO(file: HydratedDocument<IUser>): ChatUserDTO;
  convertIUserToDTO(file: HydratedDocument<IUser>[]): ChatUserDTO[];

  //function implementations
  convertIUserToDTO(
    user: HydratedDocument<IUser> | HydratedDocument<IUser>[]
  ): ChatUserDTO | ChatUserDTO[] {
    if (Array.isArray(user)) {
      return user.map(this.convertSingleUserToDTO);
    } else {
      return this.convertSingleUserToDTO(user);
    }
  }
  private convertSingleUserToDTO(user: HydratedDocument<IUser> | ResponseUserSchema): ChatUserDTO {
    return {
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      profilePicture: user.profilePicture,
      _id: user._id.toString(),
      profileColor: user.profileColor,
      lastOnline: user.lastOnline.toISOString(),
    };
  }
}

const chatUserService = new ChatUserService();
export { chatUserService };
