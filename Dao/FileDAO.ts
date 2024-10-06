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
import { getFileLinkFromLink } from "../utils/getFileLinkFromLink";

type Condition<T> = T | QuerySelector<T | any>;
type FilterQuery<T> = {
  [P in keyof T]?: Condition<T[P]>;
} & RootQuerySelector<T>;

class FileDAO extends DmlDAO<IFile, IFile> {
  /**
   *
   * @param docs
   * @param rowMapper
   * @param options
   */
  async create(
    docs: IFile | IFile[],
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

      fileResultSet.map((row) => {
        if (row?.url) row.url = getFileLinkFromLink(row.url);
        rowMapper.mapRow(row);
      });
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
    filter: FilterQuery<IFile>,
    rowMapper: RowMapper<HydratedDocument<IFile>>,
    options?: QueryOptions<IFile> | null | undefined,
    projection?: ProjectionType<IFile> | null | undefined
  ) {
    try {
      const fileResultSet = await FileModel.find(filter, projection, options);

      fileResultSet.map((row) => {
        if (row?.url) row.url = getFileLinkFromLink(row.url);
        rowMapper.mapRow(row);
      });
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
    filter: FilterQuery<IFile>,
    update: UpdateQuery<IFile>,
    rowMapper: RowMapper<HydratedDocument<IFile>>,
    options?: QueryOptions<IFile> | null | undefined
  ) {
    try {
      const fileResultSet = await FileModel.findOneAndUpdate(filter, update, options);
      if (fileResultSet) {
        if (fileResultSet?.url) fileResultSet.url = getFileLinkFromLink(fileResultSet.url);
        rowMapper.mapRow(fileResultSet);
      }
    } catch (err: any) {
      throw err;
    }
  }
}

const fileDAO = new FileDAO();
export { fileDAO };
