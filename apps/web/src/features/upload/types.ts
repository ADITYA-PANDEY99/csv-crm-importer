/**
 * Upload feature — Phase 2 expanded types.
 * Extends the base UploadState with UI-specific file metadata.
 */

export type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "processing"; jobId: string }
  | { status: "done"; jobId: string }
  | { status: "error"; message: string };

/** Enriched file metadata stored in React state after selection. */
export interface UploadedFile {
  /** The native File object — passed to the API in Phase 3. */
  file: File;
  name: string;
  sizeBytes: number;
  lastModified: Date;
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/** Supported format display metadata shown in the SupportedFormats section. */
export interface SupportedFormat {
  id: string;
  label: string;
  description: string;
}

export const SUPPORTED_FORMATS: SupportedFormat[] = [
  { id: "csv",         label: "CSV",                description: "Standard comma-separated" },
  { id: "utf8",        label: "UTF-8 CSV",           description: "Unicode character support" },
  { id: "excel",       label: "Excel Export",        description: "xlsx → CSV exported" },
  { id: "facebook",    label: "Facebook Leads",      description: "Lead ads export" },
  { id: "google-ads",  label: "Google Ads",          description: "Leads & conversions" },
  { id: "realestate",  label: "Real Estate CRM",     description: "MLS & property data" },
  { id: "marketing",   label: "Marketing Agency",    description: "Campaign contact lists" },
];
