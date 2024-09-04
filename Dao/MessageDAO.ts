import {
  QuerySelector,
  RootQuerySelector,
  HydratedDocument,
  CreateOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import MessageModel, { IMessage } from "../model/message.model";
import { DmlDAO } from "./DmlDAO";
import { RowMapper } from "./RowMapper/RowMapper";

type Condition<T> = T | QuerySelector<T | any>;
type FilterQuery<T> = {
  [P in keyof T]?: Condition<T[P]>;
} & RootQuerySelector<T>;

class MessageDAO extends DmlDAO<IMessage, IMessage> {
  async create(
    docs: IMessage[],
    rowMapper: RowMapper<HydratedDocument<IMessage>>,
    options?: CreateOptions
  ) {
    try {
      const messageDocs: IMessage[] = [];
      if (!Array.isArray(docs)) docs = [docs];

      docs.forEach((doc) => {
        messageDocs.push(doc);
      });

      const messageResultSet = await MessageModel.create(messageDocs, options);

      messageResultSet.map((row) => rowMapper.mapRow(row));
    } catch (err: any) {
      throw err;
    }
  }

  async find(
    filter: FilterQuery<IMessage>,
    rowMapper: RowMapper<HydratedDocument<IMessage>>,
    projection?: ProjectionType<IMessage> | null | undefined,
    options?: QueryOptions<IMessage> | null | undefined
  ) {
    try {
      const messageResultSet = await MessageModel.find(filter, projection, options);

      messageResultSet.map((row) => rowMapper.mapRow(row));
    } catch (err: any) {
      throw err;
    }
  }

  async update(
    filter: FilterQuery<IMessage>,
    update: UpdateQuery<IMessage>,
    rowMapper: RowMapper<HydratedDocument<IMessage>>,
    options?: QueryOptions<IMessage> | null | undefined
  ) {
    try {
      const messsageResultSet = await MessageModel.findOneAndUpdate(filter, update, options);
      if (messsageResultSet) rowMapper.mapRow(messsageResultSet);
    } catch (err: any) {
      throw err;
    }
  }
}

const messageDAO = new MessageDAO();
export { messageDAO };
