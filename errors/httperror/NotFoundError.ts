import HttpBaseError, { HttpStatus } from "./HttpBaseError";

class NotFoundError extends HttpBaseError {
  private static status: HttpStatus = "NOT_FOUND";

  constructor(message: string) {
    super(NotFoundError.status, message, NotFoundError.name, true);
    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}

export default NotFoundError;
