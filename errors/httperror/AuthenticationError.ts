import { AppError } from "../AppError";

class AuthenticationError extends AppError {
  constructor(message: string) {
    super(`Authentication Error: ${message}`, new.target.name, true);
    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AuthenticationError;
