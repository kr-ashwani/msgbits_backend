import { Express } from "express";
import authRouter from "./authRoutes/authRoutes";
import heartbeatRouter from "./heartbeatRoutes/heatbeatRoutes";

function routes(app: Express) {
  app.use(heartbeatRouter);
  app.use(authRouter);
}

export default routes;
