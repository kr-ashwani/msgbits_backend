import {
  QuerySelector,
  RootQuerySelector,
  HydratedDocument,
  CreateOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import ChatRoomModel, { IChatRoom } from "../model/chatRoom.model";
import { DmlDAO } from "./DmlDAO";
import { RowMapper } from "./RowMapper/RowMapper";

type Condition<T> = T | QuerySelector<T | any>;
type FilterQuery<T> = {
  [P in keyof T]?: Condition<T[P]>;
} & RootQuerySelector<T>;

class ChatRoomDAO extends DmlDAO<IChatRoom, IChatRoom> {
  /**
   *
   * @param docs
   * @param rowMapper
   * @param options
   */
  async create(
    docs: IChatRoom[],
    rowMapper: RowMapper<HydratedDocument<IChatRoom>>,
    options?: CreateOptions
  ) {
    try {
      const chatRoomDocs: IChatRoom[] = [];
      if (!Array.isArray(docs)) docs = [docs];

      docs.forEach((doc) => {
        chatRoomDocs.push(doc);
      });

      const chatRoomResultSet = await ChatRoomModel.create(chatRoomDocs, options);

      chatRoomResultSet.map((row) => rowMapper.mapRow(row));
    } catch (err: any) {
      throw err;
    }
  }

  /**
   *
   * @param filter
   * @param rowMapper
   * @param options
   * @param projection
   */
  async find(
    filter: FilterQuery<IChatRoom>,
    rowMapper: RowMapper<HydratedDocument<IChatRoom>>,
    options?: QueryOptions<IChatRoom> | null | undefined,
    projection?: ProjectionType<IChatRoom> | null | undefined
  ) {
    try {
      const chatRoomResultSet = await ChatRoomModel.find(filter, projection, options);

      chatRoomResultSet.map((row) => rowMapper.mapRow(row));
    } catch (err: any) {
      throw err;
    }
  }

  /**
   *
   * @param filter
   * @param update
   * @param rowMapper
   * @param options
   */
  async update(
    filter: FilterQuery<IChatRoom>,
    update: UpdateQuery<IChatRoom>,
    rowMapper: RowMapper<HydratedDocument<IChatRoom>>,
    options?: QueryOptions<IChatRoom> | null | undefined
  ) {
    try {
      const messsageResultSet = await ChatRoomModel.findOneAndUpdate(filter, update, options);
      if (messsageResultSet) rowMapper.mapRow(messsageResultSet);
    } catch (err: any) {
      throw err;
    }
  }
}

const chatRoomDAO = new ChatRoomDAO();
export { chatRoomDAO };
