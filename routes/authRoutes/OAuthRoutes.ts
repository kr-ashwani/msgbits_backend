import { facebookOAuthController } from "../../controllers/auth/OAuth/facebookOAuthController";
import { githubOAuthController } from "../../controllers/auth/OAuth/githubOAuthController";
import { googleOAuthController } from "../../controllers/auth/OAuth/googleOAuthController";
import asyncWrapper from "../../middleware/asyncWrapper";
import validateResource from "../../middleware/validateResource";
import { facebookOAuthSchema, googleOAuthSchema } from "../../schema/user/OAuthUserSchema";

const express = require("express");

const OAuthRouter = express.Router();

OAuthRouter.route("/google").post(
  validateResource(googleOAuthSchema),
  asyncWrapper(googleOAuthController)
);
OAuthRouter.route("/facebook").post(
  validateResource(facebookOAuthSchema),
  asyncWrapper(facebookOAuthController)
);
OAuthRouter.route("/github").get(asyncWrapper(githubOAuthController));

export default OAuthRouter;
