import { v4 as uuidv4 } from "uuid";
import type { Request, Response, NextFunction } from "express";

declare global {
  // Augment Express Request to carry a request ID
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/**
 * Attaches a unique request ID to every incoming request.
 *
 * The ID is sourced (in order of precedence) from:
 *   1. X-Request-ID header (set by the client or a load balancer)
 *   2. A freshly generated UUID v4
 *
 * The resolved ID is echoed back in the X-Request-ID response header so
 * clients can correlate their requests with server logs.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const incoming = req.headers["x-request-id"];
  req.id =
    typeof incoming === "string" && incoming.length > 0
      ? incoming
      : uuidv4();

  res.setHeader("X-Request-ID", req.id);
  next();
}
