import { z } from "zod";

/**
 * Query-parameter schema for the upload status polling endpoint.
 * GET /upload/:jobId
 */
export const GetUploadParamsSchema = z.object({
  jobId: z.string().uuid("jobId must be a valid UUID"),
});

export type GetUploadParams = z.infer<typeof GetUploadParamsSchema>;

/**
 * Payload schema for confirming an import with specific rows.
 * POST /api/v1/uploads/confirm
 */
export const ConfirmImportSchema = z.object({
  filename: z.string(),
  fileSize: z.number().int().positive(),
  rows: z.array(z.record(z.string(), z.string())),
});

export type ConfirmImportPayload = z.infer<typeof ConfirmImportSchema>;
