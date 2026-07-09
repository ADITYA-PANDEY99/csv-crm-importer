import { z } from "zod";
import { CrmRecordSchema } from "./crm-record.schema";

// ─── API Error ────────────────────────────────────────────────────────────────

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
  requestId: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// ─── Generic API Response ─────────────────────────────────────────────────────

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    requestId: z.string().optional(),
  });

export const ApiFailureSchema = z.object({
  success: z.literal(false),
  error: ApiErrorSchema,
});

// ─── Upload ───────────────────────────────────────────────────────────────────

export const UploadStatusSchema = z.enum([
  "pending",
  "parsing",
  "extracting",
  "done",
  "error",
]);
export type UploadStatus = z.infer<typeof UploadStatusSchema>;

export const ImportJobSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  fileSize: z.number().int().positive(),
  rowCount: z.number().int().nonnegative().optional(),
  status: UploadStatusSchema,
  recordsExtracted: z.number().int().nonnegative().optional(),
  recordsSkipped: z.number().int().nonnegative().optional(),
  processingTimeMs: z.number().int().nonnegative().optional(),
  batchCount: z.number().int().nonnegative().optional(),
  errorMessage: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ImportJob = z.infer<typeof ImportJobSchema>;

// ─── Skipped Record Detail ─────────────────────────────────────────────────────

export const SkippedRecordSchema = z.object({
  rowNumber: z.number().int().positive(),
  reason: z.enum(["Missing Contact Info", "Invalid Data", "AI Validation Failed"]),
  details: z.string(),
  rawData: z.record(z.string(), z.string()),
});

export type SkippedRecord = z.infer<typeof SkippedRecordSchema>;

// ─── Mapping Insight ──────────────────────────────────────────────────────────

export const MappingInsightSchema = z.object({
  sourceColumn: z.string(),
  crmField: z.string(),
  sampleValues: z.array(z.string()),
  confidence: z.number(), // 0 to 1 confidence metric
  reason: z.string(), // AI mapping rationale description
});

export type MappingInsight = z.infer<typeof MappingInsightSchema>;

// ─── Upload response ──────────────────────────────────────────────────────────

export const UploadResponseSchema = ApiSuccessSchema(ImportJobSchema);
export type UploadResponse = z.infer<typeof UploadResponseSchema>;

// ─── CRM Records response ─────────────────────────────────────────────────────

export const CrmRecordsResponseSchema = ApiSuccessSchema(
  z.object({
    jobId: z.string().uuid(),
    total: z.number().int().nonnegative(),
    records: z.array(CrmRecordSchema),
    skippedRecords: z.array(SkippedRecordSchema),
    mappingInsights: z.array(MappingInsightSchema),
  })
);

export type CrmRecordsResponse = z.infer<typeof CrmRecordsResponseSchema>;

// ─── Health check ─────────────────────────────────────────────────────────────

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  version: z.string(),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
