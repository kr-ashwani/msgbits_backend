import BaseError from "../BaseError";

class loggerDBError extends BaseError {
  constructor(err: Error) {
    super(err.message, loggerDBError.name, true, err.stack);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export default loggerDBError;
