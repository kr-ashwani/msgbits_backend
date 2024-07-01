import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import cookie from "cookie";
import { AppError, errToAppError } from "../errors/AppError";
import handleError from "../errorhandler/ErrorHandler";
import { validateAuthTokenService } from "../service/user/validateAuthTokenService";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import AuthorizationError from "../errors/httperror/AuthorizationError";

export interface SocketAuthData {
  auth: {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    createdAt: Date;
  };
}

export async function validateSocketConnection(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketAuthData>,
  next: (err?: ExtendedError) => void
) {
  try {
    const authCookie = cookie.parse(socket.handshake.headers.cookie || "");

    const { user } = await validateAuthTokenService(authCookie);
    // set auth detail to socket
    socket.data.auth = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
    return next();
  } catch (err: any) {
    if (err instanceof AppError) {
      const errMsg = err.message.split(":")[1] || err.message;
      handleError(
        new AuthorizationError(
          `Authorization Error: Unable to establish socket connection for socketid - ${socket.id} because ${errMsg}`
        )
      );
    } else if (err instanceof Error) handleError(errToAppError(err));
    next(err);
  }
}
