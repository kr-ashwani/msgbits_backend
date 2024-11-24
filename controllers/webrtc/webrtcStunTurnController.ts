import { Request, Response } from "express";
import { ClientResponse } from "../../utils/clientResponse";
import { webrtcService } from "../../service/webrtc/webrtcService";

async function webrtcStunTurnController(req: Request, res: Response) {
  const clientRes = new ClientResponse(res);
  const turnCredentials = await webrtcService.generateStunTurnCredentials(req.authUser);
  clientRes.send("OK", clientRes.createSuccessObj("Stun turn credentials", turnCredentials));
}

export default webrtcStunTurnController;
