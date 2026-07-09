/**
 * CRM Records feature — local TypeScript types.
 * Extends shared CrmRecord with display-only concerns.
 */
import type { CrmRecord } from "@csv-crm/shared";

/** Column IDs used with TanStack Table — kept in sync with CrmRecord keys */
export type CrmColumnId = keyof Pick<
  CrmRecord,
  | "name"
  | "email"
  | "company"
  | "city"
  | "country"
  | "mobile_without_country_code"
  | "crm_status"
  | "lead_owner"
  | "created_at"
>;
