import type { Express } from "express";
import AdminProtectedRoutes from "../middleware/AdminProtectedRoutes";
import authRouter from "./authRoutes/authRoute";
import heartbeatRouter from "./heartbeatRoutes/heatbeatRoute";
import adminSocketUIRoute from "./adminSocketUIRoutes/adminSocketUIRoute";

function routes(app: Express) {
  app.use(heartbeatRouter);
  app.use(authRouter);

  // admin protected routes
  app.use("/admin", AdminProtectedRoutes);
  app.use(adminSocketUIRoute);
}

export default routes;
