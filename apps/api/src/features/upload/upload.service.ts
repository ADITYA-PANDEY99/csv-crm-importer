import type { ImportJob, CrmRecord, SkippedRecord, MappingInsight, RawCsvRow } from "../../shared";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../../lib/logger";
import { getCrmRecordsStore, setCrmRecordsStore } from "../crm-records/crm-records.service";
import { getLLMProvider } from "../../providers/llm/factory";

// Simple in-memory storage for active jobs
const activeJobs = new Map<string, ImportJob>();

export function getImportJobStore(jobId: string): ImportJob | null {
  return activeJobs.get(jobId) || null;
}

export function setImportJobStore(jobId: string, job: ImportJob): void {
  activeJobs.set(jobId, job);
}

export class UploadService {
  /**
   * Creates a new import job record and kicks off async processing.
   */
  async createJob(
    file: Express.Multer.File,
    jobId: string
  ): Promise<ImportJob> {
    const now = new Date().toISOString();
    const job: ImportJob = {
      id: jobId,
      filename: file.originalname,
      fileSize: file.size,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    activeJobs.set(jobId, job);
    return job;
  }

  /**
   * Performs the batch CSV LLM normalization, validating rows and capturing skipped records and mapping insights.
   */
  async processJob(
    jobId: string,
    filename: string,
    fileSize: number,
    rows: RawCsvRow[]
  ): Promise<ImportJob> {
    const startTime = Date.now();
    logger.info({ jobId, rowCount: rows.length }, "Processing import job started");

    const now = new Date().toISOString();
    const job: ImportJob = {
      id: jobId,
      filename,
      fileSize,
      rowCount: rows.length,
      status: "parsing",
      createdAt: now,
      updatedAt: now,
    };
    activeJobs.set(jobId, job);

    // Initialize job outputs
    const records: CrmRecord[] = [];
    const skippedRecords: SkippedRecord[] = [];
    const mappingInsights: MappingInsight[] = [];

    // Identify mapping insights from first row's columns with explicit confidence/reason rules
    if (rows.length > 0) {
      const sampleRow = rows[0];
      if (sampleRow) {
        Object.keys(sampleRow).forEach((col) => {
          const lower = col.toLowerCase();
          let crmField = "";
          let reason = "Evaluated column context semantics";
          let confidence = 0.50;

          if (lower.includes("name") || lower.includes("buyer") || lower.includes("client") || lower.includes("customer")) {
            crmField = "name";
            reason = "Contains person identity descriptors or standard customer entity labels.";
            confidence = 0.95;
          } else if (lower.includes("email") || lower.includes("mail")) {
            crmField = "email";
            reason = "Matches standard email address formats or contains mailing key suffixes.";
            confidence = 0.98;
          } else if (lower.includes("phone") || lower.includes("mobile") || lower.includes("contact")) {
            crmField = "mobile_without_country_code";
            reason = "Matches cellular telephone formats or standard contact numbering digits.";
            confidence = 0.92;
          } else if (lower.includes("company") || lower.includes("employer") || lower.includes("corp")) {
            crmField = "company";
            reason = "Matches corporate nomenclature, corp entities, or employer tags.";
            confidence = 0.88;
          } else if (lower.includes("status")) {
            crmField = "crm_status";
            reason = "Maps to system lead lifecycle or qualification status categories.";
            confidence = 0.85;
          } else if (lower.includes("note") || lower.includes("remark") || lower.includes("comment")) {
            crmField = "crm_note";
            reason = "Provides unstructured notes, observations, or additional context.";
            confidence = 0.80;
          } else if (lower.includes("city") || lower.includes("town")) {
            crmField = "city";
            reason = "Corresponds to city location details.";
            confidence = 0.85;
          } else if (lower.includes("state") || lower.includes("province")) {
            crmField = "state";
            reason = "Matches state or administrative region values.";
            confidence = 0.85;
          } else if (lower.includes("country") || lower.includes("nation")) {
            crmField = "country";
            reason = "Indicates country geographical details.";
            confidence = 0.85;
          } else if (lower.includes("desc") || lower.includes("bio") || lower.includes("summary")) {
            crmField = "description";
            reason = "Matches details, descriptions, or profile summaries.";
            confidence = 0.80;
          }

          if (crmField) {
            const sampleValues = rows.slice(0, 3).map((r) => r[col] || "").filter(Boolean);
            mappingInsights.push({
              sourceColumn: col,
              crmField,
              sampleValues,
              confidence,
              reason,
            });
          }
        });
      }
    }

    // Filters & divides records
    const validRowsToProcess: { originalRowIndex: number; row: RawCsvRow }[] = [];

    rows.forEach((row, idx) => {
      const rowNumber = idx + 1;

      // Extract details and search for contact details
      const hasEmail = Object.entries(row).some(
        ([k, v]) => k.toLowerCase().includes("email") && v && v.includes("@")
      );
      const hasPhone = Object.entries(row).some(
        ([k, v]) => (k.toLowerCase().includes("phone") || k.toLowerCase().includes("mobile") || k.toLowerCase().includes("contact")) && v && v.replace(/\D/g, "").length >= 7
      );

      if (!hasEmail && !hasPhone) {
        skippedRecords.push({
          rowNumber,
          reason: "Missing Contact Info",
          details: "Row does not contain any valid email or phone columns.",
          rawData: row,
        });
        return;
      }

      validRowsToProcess.push({ originalRowIndex: idx, row });
    });

    job.status = "extracting";
    activeJobs.set(jobId, job);

    const batchSize = 20;
    const llmProvider = getLLMProvider();

    // Divide into batches
    const batches: { originalRowIndex: number; row: RawCsvRow }[][] = [];
    for (let i = 0; i < validRowsToProcess.length; i += batchSize) {
      batches.push(validRowsToProcess.slice(i, i + batchSize));
    }

    job.batchCount = batches.length;
    activeJobs.set(jobId, job);

    // Concurrent batch processing (parallel up to 3 at a time)
    const maxConcurrency = 3;
    let batchIndex = 0;

    const processNextBatch = async (): Promise<void> => {
      while (batchIndex < batches.length) {
        const currentBatchIdx = batchIndex++;
        const currentBatch = batches[currentBatchIdx];
        if (!currentBatch) continue;

        const rawRows = currentBatch.map((item) => item.row);

        try {
          const batchRecords = await llmProvider.extractCrmRecords(rawRows, jobId);
          
          // Basic Zod validation and warning enrichment on each output record
          batchRecords.forEach((rec, index) => {
            const originalIndex = currentBatch[index]?.originalRowIndex;
            const originalRow = originalIndex !== undefined ? rows[originalIndex] : undefined;
            const rowNumber = originalIndex !== undefined ? originalIndex + 1 : 0;
            const warnings: string[] = [];

            if (!rec.email) {
              warnings.push("Missing email address");
            }
            if (!rec.mobile_without_country_code) {
              warnings.push("Missing mobile number");
            }

            // Identify duplicate context
            const duplicateEmail = rec.email && records.some((r) => r.email === rec.email);
            const duplicatePhone = rec.mobile_without_country_code && records.some((r) => r.mobile_without_country_code === rec.mobile_without_country_code);

            if (duplicateEmail) {
              warnings.push("Duplicate email address");
            }
            if (duplicatePhone) {
              warnings.push("Duplicate phone number");
            }

            rec.warnings = warnings;
            rec.mappings = {};

            // Record insights
            mappingInsights.forEach((insight) => {
              if (originalRow && originalRow[insight.sourceColumn]) {
                rec.mappings![insight.sourceColumn] = insight.crmField;
              }
            });

            // Enforce missing criteria skips
            if (!rec.email && !rec.mobile_without_country_code) {
              skippedRecords.push({
                rowNumber,
                reason: "Invalid Data",
                details: "AI normalized record contains neither an email nor mobile address.",
                rawData: originalRow || {},
              });
            } else {
              records.push(rec);
            }
          });
        } catch (error: any) {
          logger.error({ jobId, batchIdx: currentBatchIdx, error: error.message }, "Batch extraction error");
          currentBatch.forEach((item) => {
            skippedRecords.push({
              rowNumber: item.originalRowIndex + 1,
              reason: "AI Validation Failed",
              details: `Batch processing failed: ${error.message || "Unknown error"}`,
              rawData: item.row,
            });
          });
        }
      }
    };

    // Spawn concurrency pools
    const pools: Promise<void>[] = [];
    const activeThreads = Math.min(maxConcurrency, batches.length);
    for (let t = 0; t < activeThreads; t++) {
      pools.push(processNextBatch());
    }
    await Promise.all(pools);

    const latency = Date.now() - startTime;
    job.status = "done";
    job.recordsExtracted = records.length;
    job.recordsSkipped = skippedRecords.length;
    job.processingTimeMs = latency;
    job.updatedAt = new Date().toISOString();
    activeJobs.set(jobId, job);

    // Save final records
    setCrmRecordsStore(jobId, {
      jobId,
      total: records.length,
      records,
      skippedRecords,
      mappingInsights,
    });

    logger.info({ jobId, extracted: records.length, latency }, "Job normalization complete");
    return job;
  }

  async getJobById(jobId: string): Promise<ImportJob | null> {
    return activeJobs.get(jobId) || null;
  }
}
