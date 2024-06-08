import express from "express";
import heartbeatController from "../../controllers/heartbeat/heartbeatController";
import asyncWrapper from "../../middleware/asyncWrapper";
import validateUserAndRefreshToken from "../../middleware/validateUserAndRefreshToken";

const heartbeatRouter = express.Router();

heartbeatRouter
  .route("/heartbeat")
  .get(asyncWrapper(validateUserAndRefreshToken), heartbeatController);

export default heartbeatRouter;
