import { Request, Response } from "express";
import { userService } from "../../service/database/user/userService";
import { ClientResponse } from "../../utils/clientResponse";

async function signupController(req: Request, res: Response) {
  const user = await userService.createUser(req.body);
  const clientRes = new ClientResponse(res);
  const successRes = clientRes.createSuccessObj(
    "User successfully created. Enter the OTP sent to your registered Email to verify account.",
    user
  );
  clientRes.send("OK", successRes);
}

export default signupController;
