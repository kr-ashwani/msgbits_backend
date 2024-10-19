import { Socket } from "socket.io";
import { EmitterMapping, ListenerSchema } from "./types";
import { SocketAuthData } from "../EventHandlers/validateSocketConnection";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { AppError, errToAppError } from "../../errors/AppError";
import DecoratorPermissionError from "../../errors/decoratorError.ts/DecoratorPermission";
import handleError from "../../errors/errorhandler/ErrorHandler";

export class SocketManager {
  private socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketAuthData>;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public emit<K extends keyof EmitterMapping>(
    event: K,
    data: EmitterMapping[K],
    callback?: (err: any, ack: { success: boolean }) => void
  ) {
    this.socket.emit(event, data, callback);
  }

  public on<K extends keyof ListenerSchema>(
    event: K,
    callback: (payload: Zod.infer<ListenerSchema[K]>) => Promise<void>
  ) {
    const eventHandler = async (payload: any, ack: any) => {
      const result = ListenerSchema[event].safeParse(payload);
      if (result.success) {
        // wait for the callback to execute
        try {
          await callback(result.data);
          this.handleAckMessage(ack);
        } catch (err) {
          this.handleAckMessage(ack, err);
        }
      } else {
        const err = new AppError(
          `ValidationError: client did not correctly send ${event} event data`
        );
        this.handleAckMessage(ack, err);
      }
    };
    this.socket.on(event as string, eventHandler);
    return { event, eventHandler };
  }

  handleAckMessage(ack: any, err?: any) {
    if (typeof ack !== "function") return;
    if (!err) return ack({ success: true });

    if (err instanceof Error) {
      ack({
        success: false,
        error: err instanceof DecoratorPermissionError ? "Permission denied" : err.message,
      });
      handleError(errToAppError(err));
    } else {
      ack({ success: false, error: "Something went wrong" });
      handleError(new AppError("Failure in socket listener"));
    }
  }

  public off<K extends keyof ListenerSchema>(
    event: K,
    callback?: (payload: Zod.infer<ListenerSchema[K]>) => void
  ): void {
    if (callback) {
      this.socket.off(event as string, callback);
    } else {
      this.socket.removeAllListeners(event as string);
    }
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public timeout(timeout: number) {
    this.socket.timeout(timeout);
    return this;
  }

  public disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  public onDisconnect(callback: () => void): void {
    this.socket.on("disconnect", callback);
  }

  public getSocketId(): string {
    return this.socket.id;
  }

  public once<K extends keyof ListenerSchema>(
    event: K,
    callback: (payload: Zod.infer<ListenerSchema[K]>) => void
  ): void {
    this.socket.once(event as string, callback);
  }

  public removeAllListeners(event?: string): void {
    if (event) {
      this.socket.removeAllListeners(event);
    } else {
      this.socket.removeAllListeners();
    }
  }

  public send(data: any, callback?: (error: any) => void): void {
    this.socket.send(data, callback);
  }

  public socketInst(): Socket {
    return this.socket;
  }

  public getAuthUser() {
    // this.Socket.data is already validated
    return this.socket.data.auth;
  }
  public get broadcast() {
    return new SocketManager(this.socket.broadcast as any);
  }
  public join(rooms: string | Array<string>) {
    return this.socket.join(rooms);
  }
  public leave(room: string) {
    return this.socket.leave(room);
  }
  public to(room: string | string[]) {
    return new SocketManager(this.socket.to(room) as any);
  }
}
