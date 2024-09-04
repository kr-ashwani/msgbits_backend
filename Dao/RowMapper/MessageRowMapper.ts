import { HydratedDocument } from "mongoose";
import { RowMapper } from "./RowMapper";
import { IMessage } from "../../model/message.model";

class MessageRowMapper extends RowMapper<HydratedDocument<IMessage>> {
  private callbackFunc: (user: HydratedDocument<IMessage>) => void;

  constructor(callback: (user: HydratedDocument<IMessage>) => void) {
    super();
    this.callbackFunc = callback;
  }
  mapRow(data: HydratedDocument<IMessage>) {
    this.callbackFunc(data);
  }
}

export { MessageRowMapper };
