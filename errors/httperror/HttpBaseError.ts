import { AppError } from "../AppError";

class HttpBaseError extends AppError {
  public readonly httpCode: (typeof HttpStatusCode)[HttpStatus];

  constructor(httpCode: HttpStatus, message: string, name: string, isOperational: boolean) {
    super(message, name, isOperational);
    Object.setPrototypeOf(this, new.target.prototype);

    this.httpCode = HttpStatusCode[httpCode];
    Error.captureStackTrace(this, this.constructor);
  }
}

const HttpStatusCode = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
} as const;

export type HttpStatus = keyof typeof HttpStatusCode;

export default HttpBaseError;
