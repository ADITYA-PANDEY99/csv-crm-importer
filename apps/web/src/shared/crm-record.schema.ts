import { z } from "zod";

/**
 * Zod validation schema for the AI Output JSON response.
 * Maps directly to the fields requested in the AI extraction phase.
 */
export const AiCrmRecordSchema = z.object({
  created_at: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  country_code: z.string().optional(),
  mobile_without_country_code: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  lead_owner: z.string().optional(),
  crm_status: z
    .enum(["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"])
    .or(z.literal(""))
    .optional(),
  crm_note: z.string().optional(),
  data_source: z.string().optional(),
  possession_time: z.string().optional(),
  description: z.string().optional(),
});

export type AiCrmRecord = z.infer<typeof AiCrmRecordSchema>;

export const AiCrmResponseBatchSchema = z.object({
  records: z.array(AiCrmRecordSchema),
});

export type AiCrmResponseBatch = z.infer<typeof AiCrmResponseBatchSchema>;

/**
 * Represents a single normalized CRM record output by the backend.
 */
export const CrmRecordSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(), // Normalized datetime string
  name: z.string(),
  email: z.string(),
  country_code: z.string(),
  mobile_without_country_code: z.string(),
  company: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  lead_owner: z.string(),
  crm_status: z.string(), // "GOOD_LEAD_FOLLOW_UP" | "DID_NOT_CONNECT" | "BAD_LEAD" | "SALE_DONE" | ""
  crm_note: z.string(),
  data_source: z.string(),
  possession_time: z.string(),
  description: z.string(),
  
  // Quality warnings detected by the backend
  warnings: z.array(z.string()).optional(),
  // Original column mapping insights detected by LLM
  mappings: z.record(z.string(), z.string()).optional(),
  
  // Custom properties from phase 1 metadata (kept for architectural backwards compatibility)
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  confidence: z.number().optional(),
});

export type CrmRecord = z.infer<typeof CrmRecordSchema>;

/**
 * Raw CSV row — a flat key/value map where keys are the original CSV headers.
 */
export const RawCsvRowSchema = z.record(z.string(), z.string());
export type RawCsvRow = z.infer<typeof RawCsvRowSchema>;
