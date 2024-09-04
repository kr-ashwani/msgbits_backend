import { HydratedDocument } from "mongoose";
import { RowMapper } from "./RowMapper";
import { IFile } from "../../model/file.model";

class FileRowMapper extends RowMapper<HydratedDocument<IFile>> {
  private callbackFunc: (user: HydratedDocument<IFile>) => void;

  constructor(callback: (user: HydratedDocument<IFile>) => void) {
    super();
    this.callbackFunc = callback;
  }
  mapRow(data: HydratedDocument<IFile>) {
    this.callbackFunc(data);
  }
}

export { FileRowMapper };
