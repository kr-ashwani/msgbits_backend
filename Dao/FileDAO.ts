import {
  QuerySelector,
  RootQuerySelector,
  HydratedDocument,
  CreateOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";

import { DmlDAO } from "./DmlDAO";
import { RowMapper } from "./RowMapper/RowMapper";
import FileModel, { IFile } from "../model/file.model";

type Condition<T> = T | QuerySelector<T | any>;
type FilterQuery<T> = {
  [P in keyof T]?: Condition<T[P]>;
} & RootQuerySelector<T>;

class FileDAO extends DmlDAO<IFile, IFile> {
  async create(
    docs: IFile[],
    rowMapper: RowMapper<HydratedDocument<IFile>>,
    options?: CreateOptions
  ) {
    try {
      const fileDocs: IFile[] = [];
      if (!Array.isArray(docs)) docs = [docs];

      docs.forEach((doc) => {
        fileDocs.push(doc);
      });

      const fileResultSet = await FileModel.create(fileDocs, options);

      fileResultSet.map((row) => rowMapper.mapRow(row));
    } catch (err: any) {
      throw err;
    }
  }

  async find(
    filter: FilterQuery<IFile>,
    rowMapper: RowMapper<HydratedDocument<IFile>>,
    projection?: ProjectionType<IFile> | null | undefined,
    options?: QueryOptions<IFile> | null | undefined
  ) {
    try {
      const fileResultSet = await FileModel.find(filter, projection, options);

      fileResultSet.map((row) => rowMapper.mapRow(row));
    } catch (err: any) {
      throw err;
    }
  }

  async update(
    filter: FilterQuery<IFile>,
    update: UpdateQuery<IFile>,
    rowMapper: RowMapper<HydratedDocument<IFile>>,
    options?: QueryOptions<IFile> | null | undefined
  ) {
    try {
      const messsageResultSet = await FileModel.findOneAndUpdate(filter, update, options);
      if (messsageResultSet) rowMapper.mapRow(messsageResultSet);
    } catch (err: any) {
      throw err;
    }
  }
}

const fileDAO = new FileDAO();
export { fileDAO };
