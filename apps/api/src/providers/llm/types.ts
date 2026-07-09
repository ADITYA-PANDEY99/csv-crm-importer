import type { RawCsvRow } from "@csv-crm/shared";
import type { CrmRecord } from "@csv-crm/shared";

/**
 * The contract every LLM provider must fulfill.
 *
 * Callers interact exclusively with this interface; the concrete provider
 * (OpenAI, Gemini, …) is wired up by the factory and never leaked into
 * business logic.
 */
export interface LLMProvider {
  /**
   * The human-readable name of the provider, e.g. "openai" or "gemini".
   * Used only for logging and diagnostics.
   */
  readonly name: string;

  /**
   * Given a batch of raw CSV rows (with arbitrary column headers), normalize
   * them into structured CRM records.
   *
   * @param rows - Array of raw CSV rows. Each row is a key/value map where
   *   keys are the original column headers.
   * @param jobId - The import job ID — used for correlation in logs.
   * @returns A promise that resolves to an array of partially-populated CRM
   *   records. Order is not guaranteed to match input order.
   */
  extractCrmRecords(rows: RawCsvRow[], jobId: string): Promise<CrmRecord[]>;
}
