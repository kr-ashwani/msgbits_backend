import { Socket } from "socket.io";
import logger from "../../logger";
import { EmitterMapping, ListenerSchema } from "./types";
import { SocketAuthData } from "../EventHandlers/validateSocketConnection";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

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
    callback: (payload: Zod.infer<ListenerSchema[K]>) => void
  ) {
    const eventHandler = (payload: any) => {
      const result = ListenerSchema[event].safeParse(payload);
      if (result.success) callback(result.data);
      else logger.error(`ValidationError: server did not correctly send ${event} event data`);
    };
    this.socket.on(event as string, eventHandler);
    return { event, eventHandler };
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

  public getSocketId(): string | undefined {
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
}
