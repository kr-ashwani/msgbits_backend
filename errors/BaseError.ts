class BaseError extends Error {
  readonly message: string;
  readonly name: string;
  readonly isOperational: boolean;
  readonly stack?: string;

  constructor(message: string, name: string, isOperational: boolean, stack?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.message = message;
    this.name = name;
    this.isOperational = isOperational;
    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}

export default BaseError;
