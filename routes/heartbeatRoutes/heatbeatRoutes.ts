import express from "express";
import heartbeatController from "../../controllers/heartbeat/heartbeatController";

const heartbeatRouter = express.Router();

heartbeatRouter.route("/heartbeat").get(heartbeatController);

export default heartbeatRouter;
