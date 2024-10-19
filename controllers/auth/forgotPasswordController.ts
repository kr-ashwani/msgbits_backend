import { Request, Response } from "express";
import { userService } from "../../service/database/user/userService";
import { ClientResponse } from "../../utils/clientResponse";

export const forgotPasswordController = async (req: Request, res: Response) => {
  const message = await userService.forgotPassword(req.body);
  const clientRes = new ClientResponse(res);

  clientRes.send(
    "OK",
    clientRes.createSuccessObj(`Password reset mail has been successfully sent`, message)
  );
};
