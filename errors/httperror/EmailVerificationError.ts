import { AppError } from "../AppError";

class EmailVerificationError extends AppError {
  constructor(message: string) {
    super(`Email Verification Error: ${message}`, new.target.name, true);
    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}

export default EmailVerificationError;
