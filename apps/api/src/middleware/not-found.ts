import type { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../lib/errors";

/**
 * Catch-all 404 handler — registered after all routes.
 * Throws a NotFoundError so the central error-handler formats the response.
 */
export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
}
