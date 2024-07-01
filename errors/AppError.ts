class AppError extends Error {
  readonly message: string;
  readonly name: string;
  readonly isCritical: boolean;
  readonly stack?: string;

  constructor(message: string, name?: string, isCritical: boolean = false, err?: Error) {
    super(message);

    this.message = message;
    this.name = name || new.target.name;
    this.isCritical = isCritical;
    if (err) {
      this.message = err.message;
      this.name = err.name;
      this.stack = err.stack;
    } else Error.captureStackTrace(this, this.constructor);

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
function errToAppError(err: Error, isCritical: boolean = false) {
  return new AppError("", "", isCritical, err);
}

export { errToAppError };
export { AppError };
