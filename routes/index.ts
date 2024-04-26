import { Express } from "express";
import demoRoutes from "./demoRoute";

function routes(app: Express) {
  demoRoutes(app);
}

export default routes;
