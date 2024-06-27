import { createOTPSchema } from "../../schema/user/OTPSchema";
import signupController from "../../controllers/auth/signupController";
import verifyUserByOTPController from "../../controllers/auth/verifyUserByOTP";
import asyncWrapper from "../../middleware/asyncWrapper";
import validateResource from "../../middleware/validateResource";
import { createUserSchema } from "../../schema/user/userSchema";
import loginController from "../../controllers/auth/loginController";
import logoutController from "../../controllers/auth/logoutController";
import { validateUserSchema } from "../../schema/user/validateUserSchema";
import authTokenVerifyController from "../../controllers/auth/authTokenVerifyController";

const express = require("express");

const authRouter = express.Router();

authRouter.route("/authtokenverify").get(authTokenVerifyController);

authRouter
  .route("/signup")
  .post(validateResource(createUserSchema), asyncWrapper(signupController));

authRouter
  .route("/verifyaccount")
  .post(validateResource(createOTPSchema), asyncWrapper(verifyUserByOTPController));

authRouter
  .route("/login")
  .post(validateResource(validateUserSchema), asyncWrapper(loginController));

authRouter.route("/logout").get(asyncWrapper(logoutController));

export default authRouter;
