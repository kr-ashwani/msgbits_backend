import { Request, Response } from "express";
import { ClientResponse } from "../../utilityClasses/clientResponse";

async function authTokenVerifyController(req: Request, res: Response) {
  const clientRes = new ClientResponse();
  if (req.authUser)
    clientRes.send(
      res,
      "OK",
      clientRes.createSuccessObj("User Authenticated Successfully", req.authUser)
    );
  else
    clientRes.send(
      res,
      "Bad Request",
      clientRes.createErrorObj("Authentication Error", "Auth Token is missing")
    );
}

export default authTokenVerifyController;
