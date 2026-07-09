import type { CrmRecord, SkippedRecord, MappingInsight } from "@csv-crm/shared";
import { logger } from "../../lib/logger";

export interface PaginatedCrmRecords {
  jobId: string;
  total: number;
  page: number;
  limit: number;
  records: CrmRecord[];
  skippedRecords: SkippedRecord[];
  mappingInsights: MappingInsight[];
}

export interface CrmRecordsStoreData {
  jobId: string;
  total: number;
  records: CrmRecord[];
  skippedRecords: SkippedRecord[];
  mappingInsights: MappingInsight[];
}

// In-memory data store for processed job records
const crmRecordsStore = new Map<string, CrmRecordsStoreData>();

export function getCrmRecordsStore(jobId: string): CrmRecordsStoreData | null {
  return crmRecordsStore.get(jobId) || null;
}

export function setCrmRecordsStore(jobId: string, data: CrmRecordsStoreData): void {
  crmRecordsStore.set(jobId, data);
}

export class CrmRecordsService {
  /**
   * Returns a paginated list of extracted CRM records for a given job.
   */
  async getRecordsByJobId(
    jobId: string,
    page: number,
    limit: number
  ): Promise<PaginatedCrmRecords | null> {
    logger.info({ jobId, page, limit }, "Retrieving CRM records");
    const data = crmRecordsStore.get(jobId);
    if (!data) return null;

    // Paginate records list
    const startIndex = (page - 1) * limit;
    const paginatedRecords = data.records.slice(startIndex, startIndex + limit);

    return {
      jobId: data.jobId,
      total: data.records.length,
      page,
      limit,
      records: paginatedRecords,
      skippedRecords: data.skippedRecords,
      mappingInsights: data.mappingInsights,
    };
  }
}
