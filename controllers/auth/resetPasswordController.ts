import { Request, Response } from "express";
import { userService } from "../../service/database/user/userService";
import { ClientResponse } from "../../utils/clientResponse";

export const resetPasswordController = async (req: Request, res: Response) => {
  const user = await userService.resetPassword(req.body);
  const clientRes = new ClientResponse(res);
  clientRes.send("OK", clientRes.createSuccessObj("Password has been reset successfully.", user));
};
