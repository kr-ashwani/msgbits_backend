import { Request, Response } from "express";
import { ClientResponse } from "../../utilityClasses/clientResponse";
import { authService } from "../../service/database/auth/authService";

async function verifyUserByOTPController(req: Request, res: Response) {
  const user = await authService.verifyOTPService(req.body);
  const clientRes = new ClientResponse(res);
  clientRes.sendJWTToken(user);
  clientRes.send("OK", clientRes.createSuccessObj("User successfully verified OTP.", user));
}

export default verifyUserByOTPController;
