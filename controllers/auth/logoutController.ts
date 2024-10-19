import { Request, Response } from "express";
import { ClientResponse } from "../../utils/clientResponse";

async function logoutController(req: Request, res: Response) {
  // clear auth cookie
  const clientRes = new ClientResponse(res);
  clientRes.clearAuthJWTToken();
  const successRes = clientRes.createSuccessObj(
    "User logged out successfully",
    "User logged out successfully"
  );

  successRes.data = successRes.message;
  clientRes.send("OK", successRes);
}

export default logoutController;
