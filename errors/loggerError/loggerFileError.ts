import BaseError from "../BaseError";

class loggerFileError extends BaseError {
  constructor(err: Error) {
    super(err.message, loggerFileError.name, true, err.stack);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export default loggerFileError;
