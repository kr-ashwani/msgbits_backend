import { Request, Response } from "express";
import { createUser } from "../../service/user/userService";
import { clientRes } from "../../utilityClasses/clientResponse";

async function signupController(req: Request, res: Response) {
  const user = await createUser(req.body);
  clientRes.setRes(res).setStatus(200).setMessage("User successfully created").setData(user).send();
}

export default signupController;
