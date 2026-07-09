import { Router, type IRouter } from "express";
import type { Request, Response } from "express";
import { env } from "../../config/env";

const router: IRouter = Router();

/**
 * GET /health
 *
 * Liveness probe used by container orchestrators (Kubernetes, ECS, etc.).
 * Returns a JSON object confirming the server is up.
 */
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    version: process.env["npm_package_version"] ?? "0.0.1",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRouter };
