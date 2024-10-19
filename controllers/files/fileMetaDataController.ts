import { Request, Response } from "express";
import { fileService } from "../../service/database/chat/file/fileService";
import { ClientResponse } from "../../utils/clientResponse";

async function fileMetaDataController(req: Request, res: Response) {
  const clientRes = new ClientResponse(res);
  const fileDTO = await fileService.createFile(req.body);

  if (fileDTO)
    clientRes.send(
      "OK",
      clientRes.createSuccessObj("File meta data uploaded successfully.", fileDTO)
    );
  else
    clientRes.send(
      "Internal Server Error",
      clientRes.createErrorObj("Internal Server Error", "Failed to upload file meta data")
    );
}

export default fileMetaDataController;
