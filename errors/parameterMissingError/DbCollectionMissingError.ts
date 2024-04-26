import BaseError from "../BaseError";

class DbCollectionParameterMissingError extends BaseError {
  constructor(errMsg: string) {
    super(errMsg, DbCollectionParameterMissingError.name, true);
    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}
export default DbCollectionParameterMissingError;
