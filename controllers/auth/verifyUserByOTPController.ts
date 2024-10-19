import { Request, Response } from "express";
import { authService } from "../../service/database/auth/authService";
import { userService } from "../../service/database/user/userService";
import { ClientResponse } from "../../utils/clientResponse";

async function verifyUserByOTPController(req: Request, res: Response) {
  const user = await authService.verifyOTPService(req.body);
  userService.emitNewVerifiedUserCreated(user);
  const clientRes = new ClientResponse(res);
  clientRes.sendJWTToken(user);
  clientRes.send("OK", clientRes.createSuccessObj("User successfully verified OTP.", user));
}

export default verifyUserByOTPController;
