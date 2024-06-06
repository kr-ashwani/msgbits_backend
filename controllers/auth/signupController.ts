import { Request, Response } from "express";
import { createUser } from "../../service/user/userService";
import { ClientResponse } from "../../utilityClasses/clientResponse";

async function signupController(req: Request, res: Response) {
  const user = await createUser(req.body);
  const clientRes = new ClientResponse();
  const successRes = clientRes.createSuccessObj(
    "User successfully created. Enter the OTP sent to your registered Email to verify account.",
    user
  );
  clientRes.send(res, "OK", successRes);
}

export default signupController;
