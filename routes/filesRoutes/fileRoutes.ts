import fileMetaDataController from "../../controllers/files/fileMetaDataController";
import fileStreamController from "../../controllers/files/fileStreamController";
import fileUploadController from "../../controllers/files/fileUploadController";
import asyncWrapper from "../../middleware/asyncWrapper";
import validateResource from "../../middleware/validateResource";
import { FileDTOSchema } from "../../schema/chat/FileDTOSchema";
import { FileIdSchema } from "../../schema/chat/FileIdSchema";

import express from "express";

const fileRouter = express.Router();

fileRouter
  .route("/upload/:fileId")
  .post(validateResource(FileIdSchema, "params"), asyncWrapper(fileUploadController));

fileRouter
  .route("/filemetadata")
  .post(validateResource(FileDTOSchema), asyncWrapper(fileMetaDataController));

fileRouter
  .route("/file/:fileId")
  .get(validateResource(FileIdSchema, "params"), asyncWrapper(fileStreamController));

export default fileRouter;
