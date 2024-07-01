import { createOTPSchema } from "../../schema/user/OTPSchema";
import signupController from "../../controllers/auth/signupController";
import verifyUserByOTPController from "../../controllers/auth/verifyUserByOTPController";
import asyncWrapper from "../../middleware/asyncWrapper";
import validateResource from "../../middleware/validateResource";
import { createUserSchema } from "../../schema/user/userSchema";
import loginController from "../../controllers/auth/loginController";
import logoutController from "../../controllers/auth/logoutController";
import { validateUserSchema } from "../../schema/user/validateUserSchema";
import authTokenVerifyController from "../../controllers/auth/authTokenVerifyController";
import { forgotPasswordSchema } from "../../schema/user/forgotPasswordSchema";
import { resetPasswordSchema } from "../../schema/user/resetPasswordSchema";
import { forgotPasswordController } from "../../controllers/auth/forgotPasswordController";
import { resetPasswordController } from "../../controllers/auth/resetPasswordController";

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

authRouter
  .route("/forgotpassword")
  .post(validateResource(forgotPasswordSchema), asyncWrapper(forgotPasswordController));

authRouter
  .route("/resetpassword")
  .post(validateResource(resetPasswordSchema), asyncWrapper(resetPasswordController));

authRouter.route("/logout").get(asyncWrapper(logoutController));

export default authRouter;
