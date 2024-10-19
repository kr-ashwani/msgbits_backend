import config from "config";
import { Response } from "express";
import { jwtService, userJWTPayload } from "../../service/jwt/JwtService";
import { ErrorCode } from "./types";

//Client will receive ClientResponseSuccess schema on successfull response
interface ClientResponseSuccess<T> {
  success: true;
  message: string;
  data: T;
}
//Client will receive ClientResponseError schema on response failure
interface ClientResponseError {
  success: false;
  errCode: ErrorCode;
  message: string;
}
//HTTP status to code mapping
const HTTPStatusToCode = {
  OK: 200,
  Created: 201,
  Accepted: 202,
  "Bad Request": 400,
  Unauthorized: 401,
  "Payment Required": 402,
  Forbidden: 403,
  "Not Found": 404,
  "Request Timeout": 408,
  Conflict: 409,
  "Payload Too Large": 413,
  "URI Too Long": 414,
  "Unsupported Media Type": 415,
  "Too Many Requests": 429,
  "Internal Server Error": 500,
  "Bad Gateway": 502,
  "Service Unavailable": 503,
};
/**
 * A centralised Client Response Class
 * All response should pass through it
 * so, All response on client side will either have ClientResponseSuccess or ClientResponseError schema
 */
class ClientResponse {
  private succ_res: { success: true; message: string };
  private fail_res: { success: false; message: string };
  private res: Response;

  constructor(res: Response) {
    this.res = res;
    this.succ_res = {
      success: true,
      message: "No data to preview",
    };
    this.fail_res = {
      success: false,
      message: "Something went wrong",
    };
  }

  createSuccessObj<T>(message: string, data: T): ClientResponseSuccess<T> {
    return {
      ...this.succ_res,
      message,
      data,
    };
  }
  createErrorObj(errCode: ErrorCode, message: string): ClientResponseError {
    return {
      ...this.fail_res,
      errCode,
      message,
    };
  }
  /**
   *
   * @param res  A Express response Object
   * @param status Response status
   * @param message Message to client refarding the response
   * @param dataOrErr sending data or error
   */
  send<T>(
    status: keyof typeof HTTPStatusToCode,
    responseObj: ClientResponseSuccess<T> | ClientResponseError
  ) {
    let resObj: ClientResponseSuccess<T> | ClientResponseError;
    const httpCode = HTTPStatusToCode[status];
    if (responseObj.success && httpCode >= 200 && httpCode < 300)
      resObj = {
        success: true,
        message: responseObj.message,
        data: responseObj.data,
      };
    else
      resObj = {
        success: false,
        errCode: responseObj.success ? "Internal Server Error" : responseObj.errCode,
        message: responseObj.message,
      };

    this.res.status(httpCode).json(resObj);
  }
  sendJWTToken(payload: userJWTPayload) {
    // refresh_exp_time is in seconds but maxAge accepsts millisecods
    const refresh_exp_time = config.get<number>("REFRESH_TOKEN_EXP_TIME");
    const jwtToken = jwtService.createToken({
      name: payload.name,
      email: payload.email,
      createdAt: payload.createdAt,
    });
    this.res.cookie("_auth_token", jwtToken, {
      httpOnly: true,
      // secure: true,
      maxAge: refresh_exp_time * 1000,
      sameSite: "lax",
    });
  }
  clearAuthJWTToken() {
    this.res.clearCookie("_auth_token");
  }
  redirectToAuthURL(query: string) {
    const clientRedirectUrl = config.get<string>("REDIRECT_CLIENT_URL");
    this.res.redirect(`${clientRedirectUrl}?${query}`);
  }
}

export { ClientResponse };
