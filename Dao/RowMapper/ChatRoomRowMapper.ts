import { HydratedDocument } from "mongoose";
import { RowMapper } from "./RowMapper";
import { IChatRoom } from "../../model/chatRoom.model";

class ChatRoomRowMapper extends RowMapper<HydratedDocument<IChatRoom>> {
  private callbackFunc: (user: HydratedDocument<IChatRoom>) => void;

  constructor(callback: (user: HydratedDocument<IChatRoom>) => void) {
    super();
    this.callbackFunc = callback;
  }
  mapRow(data: HydratedDocument<IChatRoom>) {
    this.callbackFunc(data);
  }
}

export { ChatRoomRowMapper };
