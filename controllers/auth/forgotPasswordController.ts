import { Request, Response } from "express";
import { userService } from "../../service/user/userService";
import { ClientResponse } from "../../utilityClasses/clientResponse";

export const forgotPasswordController = async (req: Request, res: Response) => {
  const message = await userService.forgotPassword(req.body);
  const clientRes = new ClientResponse();

  clientRes.send(
    res,
    "OK",
    clientRes.createSuccessObj(`Password reset mail has been successfully sent`, message)
  );
};
