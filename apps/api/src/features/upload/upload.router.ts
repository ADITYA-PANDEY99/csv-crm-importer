import { Router, type IRouter } from "express";
import multer from "multer";
import { env } from "../../config/env";
import { UnsupportedFileTypeError, FileTooLargeError } from "../../lib/errors";
import { validate } from "../../middleware/validate";
import { GetUploadParamsSchema, ConfirmImportSchema } from "./upload.schema";
import { uploadCsv, getUploadStatus, confirmImport } from "./upload.controller";
import type { Request } from "express";

const router: IRouter = Router();

// ─── Multer configuration ─────────────────────────────────────────────────────

const allowedMimes = new Set(
  env.ALLOWED_MIME_TYPES.split(",").map((t) => t.trim())
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_BYTES,
    files: 1,
  },
  fileFilter(_req: Request, file, callback) {
    if (!allowedMimes.has(file.mimetype)) {
      callback(new UnsupportedFileTypeError(file.mimetype));
      return;
    }
    callback(null, true);
  },
});

/**
 * Wrap multer in a promise so errors are forwarded to the Express
 * error-handler rather than crashing the process.
 */
function handleMulterError(
  req: Request,
  res: import("express").Response,
  next: import("express").NextFunction
): void {
  upload.single("file")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      next(new FileTooLargeError(env.MAX_UPLOAD_SIZE_BYTES));
      return;
    }

    next(err);
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/uploads
 * Body: multipart/form-data with a "file" field containing the CSV.
 */
router.post("/", handleMulterError, uploadCsv);

/**
 * POST /api/v1/uploads/confirm
 * Body: { filename, fileSize, rows }
 */
router.post("/confirm", validate("body", ConfirmImportSchema), confirmImport);

/**
 * GET /api/v1/uploads/:jobId
 */
router.get(
  "/:jobId",
  validate("params", GetUploadParamsSchema),
  getUploadStatus
);

export { router as uploadRouter };
