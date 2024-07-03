import { Request, Response } from "express";

import { ClientResponse } from "../../utilityClasses/clientResponse";
import { userService } from "../../service/database/user/userService";

async function loginController(req: Request, res: Response) {
  const user = await userService.findAndValidateUser(req.body);
  const clientRes = new ClientResponse(res);
  clientRes.sendJWTToken(user);
  clientRes.send("OK", clientRes.createSuccessObj("User logged in successfully.", user));
}

export default loginController;
