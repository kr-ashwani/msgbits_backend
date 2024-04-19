import BaseError from "../BaseError";

class DbCollectionParameterMissingError extends BaseError {
  constructor(errMsg: string) {
    super(errMsg, DbCollectionParameterMissingError.name, true);
  }
}
export default DbCollectionParameterMissingError;
