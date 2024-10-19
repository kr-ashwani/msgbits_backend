import { Request, Response } from "express";
import { ClientResponse } from "../../utils/clientResponse";

async function authTokenVerifyController(req: Request, res: Response) {
  const clientRes = new ClientResponse(res);
  if (req.authUser)
    clientRes.send(
      "OK",
      clientRes.createSuccessObj("User Authenticated Successfully", req.authUser)
    );
  else
    clientRes.send(
      "Bad Request",
      clientRes.createErrorObj("Authentication Error", "Auth Token is missing")
    );
}

export default authTokenVerifyController;
