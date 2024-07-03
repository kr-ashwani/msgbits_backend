import express from "express";
import path from "path";

const adminSocketUIRoute = express.Router();

adminSocketUIRoute.use(
  "/socketui",
  express.static(path.join(__dirname, "../../views/socketio/dist"))
);

export default adminSocketUIRoute;
