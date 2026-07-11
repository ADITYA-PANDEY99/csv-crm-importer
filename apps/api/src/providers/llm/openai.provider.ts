import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import type { CrmRecord, RawCsvRow } from "../../shared";
import { AiCrmResponseBatchSchema } from "../../shared";
import { env } from "../../config/env";
import { logger } from "../../lib/logger";
import { LLMProviderError } from "../../lib/errors";
import type { LLMProvider } from "./types";

/**
 * OpenAI implementation of the LLMProvider interface.
 * Uses strict structured JSON responses (response_format: json_object) to intelligently
 * map raw columns to standardized CRM fields, inferring context semantically.
 */
export class OpenAIProvider implements LLMProvider {
  public readonly name = "openai";

  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    if (!env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is required when LLM_PROVIDER=openai."
      );
    }
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    this.model = env.OPENAI_MODEL;
    logger.info({ provider: this.name, model: this.model }, "OpenAI Provider initialized");
  }

  async extractCrmRecords(
    rows: RawCsvRow[],
    jobId: string
  ): Promise<CrmRecord[]> {
    const startTime = Date.now();
    logger.info(
      { jobId, rowCount: rows.length, model: this.model },
      "OpenAI extractCrmRecords started"
    );

    const systemPrompt = `You are a data extraction assistant. Your task is to intelligently parse raw CSV rows and normalize them into structured CRM records.
You MUST map fields semantically. Headers vary wildly (e.g. "Buyer", "Client", "Customer", "Contact Name", "Prospect" -> "name"; "Mobile", "Contact No", "Cell" -> "mobile_without_country_code").
Never base mappings solely on header names. Evaluate field contents to infer the correct fields.

Return ONLY a strict JSON object with a single root key "records" containing an array of records matching the CRM schema rules.
Do NOT output markdown blocks, explain your logic, or write prose. Output only the pure JSON.

CRM SCHEMA FIELDS:
- created_at: Normalized ISO-8601 date-time string (or current timestamp if missing).
- name: Full name of the contact.
- email: Standardized primary email address.
- country_code: Country phone calling code (e.g., "1", "44", "91").
- mobile_without_country_code: Mobile number without country dialing code.
- company: Company name or Employer.
- city: City location.
- state: State/Region.
- country: Full country name.
- lead_owner: CRM sales representative or owner assigned.
- crm_status: Allowed values: "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE", or "" (empty string).
- crm_note: Any extra details or concatenated secondary info.
- data_source: Source of lead (e.g. "Facebook Lead Export", "Google Ads Export", etc., or empty string).
- possession_time: Timestamp or duration context.
- description: Bio, summary, or description details.

EXTRACTION RULES:
1. Skip records that have NEITHER email NOR mobile.
2. Normalize dates to ISO-8601 format. If parsing fails, fall back to empty string or current timestamp.
3. Extract the first email found as primary 'email'. If there are secondary emails, append them to 'crm_note'.
4. Extract the first phone number. Parse the country calling code out if present and populate 'country_code', placing the remainder in 'mobile_without_country_code'. Put secondary numbers in 'crm_note'.
5. Return empty strings for fields whose values cannot be found or resolved. Never hallucinate fake values.
6. Allowed values for crm_status are ONLY: "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE", or "" (empty string). Any invalid values must default to "".

Your response must strictly match this format:
{
  "records": [
    {
      "created_at": "...",
      "name": "...",
      "email": "...",
      "country_code": "...",
      "mobile_without_country_code": "...",
      "company": "...",
      "city": "...",
      "state": "...",
      "country": "...",
      "lead_owner": "...",
      "crm_status": "...",
      "crm_note": "...",
      "data_source": "...",
      "possession_time": "...",
      "description": "..."
    }
  ]
}`;

    const userPrompt = `Here is the batch of raw CSV rows to process (formatted as a JSON array of row objects):
${JSON.stringify(rows, null, 2)}`;

    let retries = 1;
    while (retries >= 0) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });

        const textResponse = response.choices[0]?.message?.content;
        if (!textResponse) {
          throw new Error("Empty response received from OpenAI");
        }

        const parsedJson = JSON.parse(textResponse);
        const validated = AiCrmResponseBatchSchema.safeParse(parsedJson);

        if (!validated.success) {
          logger.warn(
            { jobId, errors: validated.error.flatten(), retriesLeft: retries },
            "AI extraction batch failed validation"
          );
          if (retries === 0) {
            throw new Error(`AI response batch validation failed twice: ${validated.error.message}`);
          }
          retries--;
          continue;
        }

        const now = new Date().toISOString();
        const records: CrmRecord[] = validated.data.records.map((rec) => {
          return {
            id: uuidv4(),
            created_at: rec.created_at || now,
            name: rec.name || "",
            email: rec.email || "",
            country_code: rec.country_code || "",
            mobile_without_country_code: rec.mobile_without_country_code || "",
            company: rec.company || "",
            city: rec.city || "",
            state: rec.state || "",
            country: rec.country || "",
            lead_owner: rec.lead_owner || "",
            crm_status: rec.crm_status || "",
            crm_note: rec.crm_note || "",
            data_source: rec.data_source || "",
            possession_time: rec.possession_time || "",
            description: rec.description || "",
            // Populate backward compatible fields with appropriate conversions
            fullName: rec.name || "",
            firstName: rec.name ? rec.name.split(" ")[0] : "",
            lastName: rec.name ? rec.name.split(" ").slice(1).join(" ") : "",
            phone: (rec.country_code ? `+${rec.country_code}` : "") + (rec.mobile_without_country_code || ""),
            confidence: 0.95,
          };
        });

        logger.info(
          { jobId, recordsExtracted: records.length, latencyMs: Date.now() - startTime },
          "OpenAI batch processing completed successfully"
        );

        return records;
      } catch (error: any) {
        logger.error(
          { jobId, error: error.message || error, retriesLeft: retries },
          "OpenAI provider extraction failure"
        );
        if (retries === 0) {
          throw new LLMProviderError(
            `Failed to extract CRM records after retrying: ${error.message || error}`,
            error
          );
        }
        retries--;
      }
    }

    return [];
  }
}
