import { AppError } from "../AppError";

class InsufficientRoleError extends AppError {
  constructor(message: string) {
    super(`Insufficient Role Error: ${message}`, new.target.name, true);
    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}

export default InsufficientRoleError;
