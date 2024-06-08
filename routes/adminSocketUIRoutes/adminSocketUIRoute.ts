import express from "express";
import path from "path";

const adminSocketUIRoute = express.Router();

adminSocketUIRoute.use(
  "/admin/socketui",
  express.static(path.join(__dirname, "../../views/socketio/dist"))
);

export default adminSocketUIRoute;
