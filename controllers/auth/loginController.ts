import { Request, Response } from "express";
import { userService } from "../../service/database/user/userService";
import { ClientResponse } from "../../utils/clientResponse";

async function loginController(req: Request, res: Response) {
  const user = await userService.findAndValidateUser(req.body);
  const clientRes = new ClientResponse(res);
  clientRes.sendJWTToken(user);
  clientRes.send("OK", clientRes.createSuccessObj("User logged in successfully.", user));
}

export default loginController;
