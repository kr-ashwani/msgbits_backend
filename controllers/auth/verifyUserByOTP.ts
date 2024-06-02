import { Request, Response } from "express";
import { clientRes } from "../../utilityClasses/clientResponse";
import { verifyOTPService } from "../../service/user/verifyOTPService";

async function verifyUserByOTPController(req: Request, res: Response) {
  const resObj = await verifyOTPService(req.body);
  if (resObj.success) {
    clientRes.sendJWTToken(res, resObj.data);
    clientRes.send(res, "OK", resObj);
  } else clientRes.send(res, "Bad Request", resObj);
}

export default verifyUserByOTPController;
