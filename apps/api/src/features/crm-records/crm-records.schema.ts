import { z } from "zod";

/**
 * Path params schema for GET /crm-records/:jobId
 */
export const GetCrmRecordsParamsSchema = z.object({
  jobId: z.string().uuid("jobId must be a valid UUID"),
});

export type GetCrmRecordsParams = z.infer<typeof GetCrmRecordsParamsSchema>;

/**
 * Query params schema for GET /crm-records/:jobId
 * Supports pagination for large record sets.
 */
export const GetCrmRecordsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export type GetCrmRecordsQuery = z.infer<typeof GetCrmRecordsQuerySchema>;
