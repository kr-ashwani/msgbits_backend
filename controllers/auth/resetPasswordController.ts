import { Request, Response } from "express";
import { userService } from "../../service/user/userService";
import { ClientResponse } from "../../utilityClasses/clientResponse";

export const resetPasswordController = async (req: Request, res: Response) => {
  const user = await userService.resetPassword(req.body);
  const clientRes = new ClientResponse();
  clientRes.send(
    res,
    "OK",
    clientRes.createSuccessObj("Password has been reset successfully.", user)
  );
};
