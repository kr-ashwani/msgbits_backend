import { Server } from "socket.io";
import logger from "../../logger";
import { EmitterMapping, ListenerSchema } from "./types";
import { SocketManager } from "./SocketManager";
import { AppError, errToAppError } from "../../errors/AppError";
import config from "config";
import handleError from "../../errors/errorhandler/ErrorHandler";

export class IOManager {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public emit<K extends keyof EmitterMapping>(
    event: K,
    data: EmitterMapping[K],
    callback?: (err: any, ack: { success: boolean }) => void
  ) {
    this.io.emit(event, data, callback);
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
    this.io.on(event as string, eventHandler);
    return { event, eventHandler };
  }

  handleAckMessage(ack: any, err?: any) {
    const NODE_ENV = config.get("NODE_ENV");
    if (typeof ack !== "function") return;
    if (!err) return ack({ success: true });

    if (!(err instanceof Error) || NODE_ENV !== "development") {
      ack({ success: false, error: "Something went wrong" });
      handleError(new AppError("Failure in socket listener"));
    } else {
      ack({ success: false, error: err.message });
      handleError(errToAppError(err));
    }
  }

  public off<K extends keyof ListenerSchema>(
    event: K,
    callback?: (payload: Zod.infer<ListenerSchema[K]>) => void
  ): void {
    if (callback) {
      this.io.off(event as string, callback);
    } else {
      this.io.removeAllListeners(event as string);
    }
  }

  public timeout(timeout: number) {
    this.io.timeout(timeout);
    return this;
  }

  public once<K extends keyof ListenerSchema>(
    event: K,
    callback: (payload: Zod.infer<ListenerSchema[K]>) => void
  ) {
    const eventHandler = (payload: any, ack: any) => {
      const result = ListenerSchema[event].safeParse(payload);
      if (result.success) callback(result.data);
      else {
        const error = `ValidationError: client did not correctly send ${event} event data`;
        ack({ success: false, error });
        logger.error(error);
      }
    };
    this.io.once(event as string, callback);
    return { event, eventHandler };
  }

  public removeAllListeners(event?: string): void {
    if (event) {
      this.io.removeAllListeners(event);
    } else {
      this.io.removeAllListeners();
    }
  }

  public send(data: any, callback?: (error: any) => void): void {
    this.io.send(data, callback);
  }

  public ioInst(): Server {
    return this.io;
  }
  public in(room: string | string[]) {
    return this.io.in(room);
  }
  public to(room: string | string[]) {
    return new SocketManager(this.io.to(room) as any);
  }
}
