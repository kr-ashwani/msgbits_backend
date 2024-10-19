import { Request, Response } from "express";
import { ClientResponse } from "../../utils/clientResponse";

async function heartbeatController(req: Request, res: Response) {
  const clientRes = new ClientResponse(res);
  const successRes = clientRes.createSuccessObj("ping is successful", {
    status: "server is alive 👻",
  });
  clientRes.send("OK", successRes);
}

export default heartbeatController;
