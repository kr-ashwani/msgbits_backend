import type { Express } from "express";
import AdminProtectedRoutes from "../middleware/AdminProtectedRoutes";
import authRouter from "./authRoutes/authRoute";
import heartbeatRouter from "./heartbeatRoutes/heatbeatRoute";
import adminSocketUIRoute from "./adminSocketUIRoutes/adminSocketUIRoute";
import OAuthRouter from "./authRoutes/OAuthRoutes";
import fileRouter from "./filesRoutes/fileRoutes";
import webrtcRouter from "./webrtcRoutes/webrtcRoutes";

function routes(app: Express) {
  app.use(heartbeatRouter);
  app.use(authRouter);
  app.use("/oauth", OAuthRouter);
  app.use(fileRouter);
  app.use(webrtcRouter);

  // admin protected routes
  app.use("/admin", AdminProtectedRoutes);
  app.use("/admin", adminSocketUIRoute);
}

export default routes;
