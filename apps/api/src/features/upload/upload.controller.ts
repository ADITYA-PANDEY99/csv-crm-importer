import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { UploadService } from "./upload.service";
import { NotFoundError } from "../../lib/errors";
import type { ConfirmImportPayload } from "./upload.schema";

const uploadService = new UploadService();

/**
 * POST /api/v1/uploads
 *
 * Accepts a multipart CSV file, creates an import job, and responds with
 * the job in "pending" status. Processing happens asynchronously.
 */
export async function uploadCsv(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "No file was attached to the request.",
          requestId: req.id,
        },
      });
      return;
    }

    const jobId = uuidv4();
    const job = await uploadService.createJob(file, jobId);

    res.status(202).json({ success: true, data: job, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/uploads/:jobId
 *
 * Returns the current status of an import job.
 */
export async function getUploadStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { jobId } = req.params as { jobId: string };
    const job = await uploadService.getJobById(jobId);

    if (!job) {
      return next(new NotFoundError(`Import job "${jobId}" not found.`));
    }

    res.status(200).json({ success: true, data: job, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/uploads/confirm
 *
 * Accepts a parsed CSV file payload, triggers semantic LLM extraction, and processes
 * the records synchronously for robust response status handling.
 */
export async function confirmImport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { filename, fileSize, rows } = req.body as ConfirmImportPayload;
    const jobId = uuidv4();

    // Trigger full batching and AI normalization pipeline
    const job = await uploadService.processJob(jobId, filename, fileSize, rows);

    res.status(200).json({
      success: true,
      data: job,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}
