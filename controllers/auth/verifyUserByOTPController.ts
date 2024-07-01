import { Request, Response } from "express";
import { ClientResponse } from "../../utilityClasses/clientResponse";
import { verifyOTPService } from "../../service/user/verifyOTPService";

async function verifyUserByOTPController(req: Request, res: Response) {
  const user = await verifyOTPService(req.body);
  const clientRes = new ClientResponse();
  clientRes.sendJWTToken(res, user);
  clientRes.send(res, "OK", clientRes.createSuccessObj("User successfully verified OTP.", user));
}

export default verifyUserByOTPController;
