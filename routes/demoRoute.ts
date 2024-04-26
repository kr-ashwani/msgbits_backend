import { Express, Request, Response } from "express";

function demoRoutes(app: Express) {
  app.get("/heartbeat", (req: Request, res: Response) => {
    res.status(200).json({ status: true, data: "I am alive" });
    throw new Error("omg");
  });
}

export default demoRoutes;
