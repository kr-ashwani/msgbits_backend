import { Request, Response } from "express";

import { fileStreamingService } from "../../service/file/fileStreamingService";

async function fileStreamController(req: Request, res: Response) {
  await fileStreamingService.decryptAndStreamFile(req, res);
}

export default fileStreamController;
