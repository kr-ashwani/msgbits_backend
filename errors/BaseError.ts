class BaseError extends Error {
  readonly message: string;
  readonly name: string;
  readonly isCritical: boolean;
  readonly stack?: string;

  constructor(message: string, name: string, isCritical: boolean, err?: Error) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.message = message;
    this.name = name;
    this.isCritical = isCritical;
    if (err) {
      this.message = err.message;
      this.name = err.name;
      this.stack = err.stack;
    } else Error.captureStackTrace(this, this.constructor);
  }
}
function errToBaseError(err: Error, isCritical: boolean) {
  return new BaseError("", "", isCritical, err);
}

export { errToBaseError };
export default BaseError;
