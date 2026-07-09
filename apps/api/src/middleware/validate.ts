import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ValidationError } from "../lib/errors";

type RequestPart = "body" | "query" | "params";

/**
 * Middleware factory that validates a specific part of the Express request
 * against a Zod schema.
 *
 * On success, `req[part]` is replaced with the parsed (and type-coerced)
 * data so downstream handlers receive the typed payload.
 *
 * On failure, a ValidationError is forwarded to the error-handler middleware.
 *
 * @example
 * router.post("/upload", validate("body", UploadBodySchema), controller.upload);
 */
export function validate<T>(
  part: RequestPart,
  schema: ZodSchema<T>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const details = formatZodError(result.error);
      return next(
        new ValidationError(
          `Validation failed on request ${part}`,
          details
        )
      );
    }

    // Replace with parsed/coerced data
    (req as unknown as Record<string, unknown>)[part] = result.data;
    return next();
  };
}

function formatZodError(
  error: ZodError
): Array<{ field: string; message: string }> {
  return error.errors.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
