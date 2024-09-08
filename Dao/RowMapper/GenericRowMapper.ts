import { HydratedDocument } from "mongoose";
import { RowMapper } from "./RowMapper";

class GenericRowMapper<T> extends RowMapper<HydratedDocument<T>> {
  private callbackFunc: (user: HydratedDocument<T>) => void;

  constructor(callback: (user: HydratedDocument<T>) => void) {
    super();
    this.callbackFunc = callback;
  }
  mapRow(data: HydratedDocument<T>) {
    this.callbackFunc(data);
  }
}

export { GenericRowMapper };
