import { IOManager } from "./socket/SocketIOManager/IOManager";
import "dotenv/config.js";
import "./utils/registerProcessUncaughtError";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "node:http";
import express from "express";
import config from "config";
import dbConnection from "./utils/dbConnection";
import logger from "./logger";
import registerErrorHandler from "./middleware/registerErrorHandler";
import morganMiddleware from "./logger/morgan";
import routes from "./routes";
import swaggerDocs from "./utils/swagger";
import "./service/mail/mailService";
import RedisPubSub from "./redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import RedisConnection from "./redis/redisConnection";
import {
  registerSocketHandlers,
  registerAdminSocketHandlers,
} from "./socket/EventHandlers/registerSocketHandlers";
import { instrument } from "@socket.io/admin-ui";
import os from "os";
import {
  SocketAuthData,
  validateSocketConnection,
} from "./socket/EventHandlers/validateSocketConnection";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import "./model/role.model";
import validateUserAndRefreshToken from "./middleware/validateUserAndRefreshToken";
import { SocketManager } from "./socket/SocketIOManager/SocketManager";
import { SocketService } from "./service/socket/SocketService";

class App {
  private readonly app;
  private readonly server;
  private readonly io;
  static readonly PORT = config.get<number>("PORT");

  private static readonly redisConfig = {
    port: config.get<number>("REDIS_PORT"),
    host: config.get<string>("REDIS_HOST"),
    lazyConnect: true,
  };
  private static readonly socketUIConfig = {
    username: config.get<string>("SOCKETUI_USERNAME"),
    password: config.get<string>("SOCKETUI_PASSWORD"),
  };
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    //socket io server with Redis Adapter
    const redisClient = new RedisConnection(App.redisConfig, `Redis Adapter`).getConnection();
    const clientURL = config.get<string>("CLIENT_URL");
    this.io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketAuthData>(
      this.server,
      {
        adapter: createAdapter(redisClient),
        cors: {
          origin: ["http://localhost:3000", clientURL],
          credentials: true,
        },
      }
    );
    //initialize Express App like redis adapter, middlewares, routes and error handler
    this.init();
  }
  private init() {
    this.initializeCORS();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSocketHandlers();

    //initialize error handler at End
    this.initializeErrorHandlerMidleware();
  }
  private initializeCORS() {
    const clientURL = config.get<string>("CLIENT_URL");
    this.app.use(
      cors({
        origin: ["http://localhost:3000", clientURL],
        credentials: true,
      })
    );
  }
  //Socket io Redis Adapter
  private initializeSocketHandlers() {
    // validate socket with default namepace /
    this.io.use(validateSocketConnection);
    // All business logic will be attached to default namepace /
    this.io.on("connection", (socket) => {
      registerSocketHandlers(new SocketService(socket, this.io));
    });
    //socket io ui for admin only
    this.initializeSocketIOadminUI();
  }
  private initializeSocketIOadminUI() {
    // admin namespace /admin
    const adminNamespace = this.io.of("/admin");
    // validate admin namespace first
    adminNamespace.use(validateSocketConnection);
    adminNamespace.on("connection", (socket) =>
      registerAdminSocketHandlers(new SocketService(socket, this.io))
    );
    instrument(this.io, {
      serverId: `${os.hostname()}#${process.pid}`,
      auth: {
        type: "basic",
        username: App.socketUIConfig.username,
        password: App.socketUIConfig.password,
      },
    });
  }
  //All middlewares except Error Handler middleware
  private initializeMiddlewares() {
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morganMiddleware);
    // auth middleware populates authUser in Request
    // authuser may be null or IUser depending upon response
    this.app.use(validateUserAndRefreshToken);
  }
  //Routes of the app
  private initializeRoutes() {
    routes(this.app);
  }
  // Error Handler middleware must be used at the end
  private initializeErrorHandlerMidleware() {
    registerErrorHandler(this.app);
  }

  // app handler will be called by public function run when express
  // app will bind port number
  private appHandler() {
    logger.info(`Server is running at http://localhost:${App.PORT}`);
    dbConnection();
    RedisPubSub.getInstance();

    swaggerDocs(this.app, App.PORT);
  }

  // public method to start Express App
  public run() {
    this.server.listen(App.PORT, () => this.appHandler());
  }
}

export default App;
