import { AppError } from "../AppError";

class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, new.target.name, true);
    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AuthorizationError;
