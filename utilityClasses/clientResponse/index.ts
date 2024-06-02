import config from "config";
import { Response } from "express";
import { jwtService, userJWTPayload } from "../../service/jwt/JwtService";

//Client will receive ClientResponseSuccess schema on successfull response
interface ClientResponseSuccess {
  success: true;
  message: string;
  data: any;
}
//Client will receive ClientResponseError schema on response failure
interface ClientResponseError {
  success: false;
  message: string;
  error: any;
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
  /**
   *
   * @param res  A Express response Object
   * @param status Response status
   * @param message Message to client refarding the response
   * @param dataOrErr sending data or error
   */
  send(res: Response, status: keyof typeof HTTPStatusToCode, message: string, dataOrErr: any) {
    let resObj: ClientResponseSuccess | ClientResponseError;
    const httpCode = HTTPStatusToCode[status];
    if (httpCode >= 200 && httpCode < 300) {
      resObj = {
        success: true,
        message: message,
        data: dataOrErr,
      };
    } else {
      resObj = {
        success: false,
        message: message,
        error: dataOrErr,
      };
    }

    res.status(httpCode).json(resObj);
  }
  sendJWTToken(res: Response, payload: userJWTPayload) {
    // refresh_exp_time is in seconds but maxAge accepsts millisecods
    const refresh_exp_time = config.get<number>("REFRESH_TOKEN_EXP_TIME");
    const jwtToken = jwtService.createToken(payload);
    res.cookie("_auth_token", jwtToken, {
      httpOnly: true,
      // secure: true,
      maxAge: refresh_exp_time * 1000,
      sameSite: "lax",
    });
  }
}

export const clientRes = new ClientResponse();
