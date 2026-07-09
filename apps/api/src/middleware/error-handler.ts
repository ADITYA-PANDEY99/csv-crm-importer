import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";
import { env } from "../config/env";

/**
 * Central Express error-handler middleware.
 *
 * Must be registered LAST (after all routes) with four parameters so Express
 * recognises it as an error handler.
 *
 * Behaviour:
 * - AppError subclasses → use their embedded httpStatus and code.
 * - Unknown errors → 500 INTERNAL_ERROR; stack trace hidden in production.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // `next` must be declared even if unused — Express requires all 4 params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(
      { requestId: req.id, code: err.code, status: err.httpStatus, err },
      err.message
    );

    res.status(err.httpStatus).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        requestId: req.id,
      },
    });
    return;
  }

  // Unknown / unhandled error
  logger.error({ requestId: req.id, err }, "Unhandled error");

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        env.NODE_ENV === "production"
          ? "An unexpected error occurred."
          : err instanceof Error
            ? err.message
            : String(err),
      requestId: req.id,
    },
  });
}
