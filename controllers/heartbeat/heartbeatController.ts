import { Request, Response } from "express";
import { clientRes } from "../../utilityClasses/clientResponse";

async function heartbeatController(req: Request, res: Response) {
  clientRes.send(res, "OK", "ping is successful", {
    status: "server is alive 👻",
  });
}

export default heartbeatController;
