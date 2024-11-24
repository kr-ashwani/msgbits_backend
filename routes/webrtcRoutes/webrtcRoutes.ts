import express from "express";
import webrtcTurnController from "../../controllers/webrtc/webrtcStunTurnController";
import asyncWrapper from "../../middleware/asyncWrapper";

const webrtcRouter = express.Router();

webrtcRouter.route("/stunturncredentials").get(asyncWrapper(webrtcTurnController));

export default webrtcRouter;
