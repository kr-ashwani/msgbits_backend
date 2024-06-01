import { createOTPSchema } from "./../../schema/user/OTPSchema";
import signupController from "../../controllers/auth/signupController";
import verifyUserByOTPController from "../../controllers/auth/verifyUserByOTP";
import asyncWrapper from "../../middleware/asyncWrapper";
import validateResource from "../../middleware/validateResource";
import { createUserSchema } from "../../schema/user/userSchema";

const express = require("express");

const authRouter = express.Router();

authRouter
  .route("/signup")
  .post(validateResource(createUserSchema), asyncWrapper(signupController));

authRouter
  .route("/verifyaccount")
  .post(validateResource(createOTPSchema), asyncWrapper(verifyUserByOTPController));

export default authRouter;
