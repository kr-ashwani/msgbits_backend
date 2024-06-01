import { Request, Response } from "express";
import { clientRes } from "../../utilityClasses/clientResponse";
import { verifyOTPService } from "../../service/user/verifyOTPService";

async function verifyUserByOTPController(req: Request, res: Response) {
  const userVerify = await verifyOTPService(req.body);
  if (userVerify.success) clientRes.send(res, "OK", userVerify.message, userVerify.data);
  else clientRes.send(res, "Bad Request", userVerify.message, userVerify.error);
}

export default verifyUserByOTPController;
