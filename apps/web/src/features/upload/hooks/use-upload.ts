"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { FileRejection } from "react-dropzone";
import type { UploadedFile } from "../types";
import { MAX_FILE_SIZE_BYTES } from "../types";
import { formatFileSize } from "@/lib/utils";
import Papa from "papaparse";

export interface PreviewData {
  rows: Record<string, string>[];
  headers: string[];
  statistics: {
    totalRows: number;
    estimatedImportable: number;
    missingContactInfo: number;
    duplicateEmails: number;
    duplicatePhones: number;
    emptyColumnsCount: number;
    suspiciousDatesCount: number;
  };
  warnings: { rowNumber: number; field: string; message: string }[];
}

interface UseUploadReturn {
  selectedFile: UploadedFile | null;
  previewData: PreviewData | null;
  isParsing: boolean;
  handleAcceptedFiles: (files: File[]) => void;
  handleRejectedFiles: (rejections: FileRejection[]) => void;
  removeFile: () => void;
  handleCancel: () => void;
  confirmImportAction: (onSuccess: (jobId: string) => void) => Promise<void>;
  isImporting: boolean;
}

export function useUpload(): UseUploadReturn {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleAcceptedFiles = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv") {
      toast.error("Invalid file type", {
        description: "Only .csv files are accepted.",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File too large", {
        description: `Maximum size is 10 MB. Your file is ${formatFileSize(file.size)}.`,
      });
      return;
    }

    setSelectedFile({
      file,
      name: file.name,
      sizeBytes: file.size,
      lastModified: new Date(file.lastModified),
    });

    setIsParsing(true);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        setIsParsing(false);
        const rows = results.data;
        const headers = results.meta.fields || [];

        // Quality detection variables
        let missingContact = 0;
        const emailsSet = new Set<string>();
        const phonesSet = new Set<string>();
        let dupEmails = 0;
        let dupPhones = 0;
        let emptyCols = 0;
        let suspiciousDates = 0;
        const warnings: { rowNumber: number; field: string; message: string }[] = [];

        rows.forEach((row, idx) => {
          const rowNumber = idx + 1;
          let emailVal = "";
          let phoneVal = "";
          let dateVal = "";

          // Inspect values semantically
          Object.entries(row).forEach(([col, val]) => {
            const lowerCol = col.toLowerCase();
            const cleanVal = (val || "").trim();

            if (!cleanVal) {
              emptyCols++;
              return;
            }

            if (lowerCol.includes("email") || cleanVal.includes("@")) {
              emailVal = cleanVal;
            } else if (lowerCol.includes("phone") || lowerCol.includes("mobile") || lowerCol.includes("contact")) {
              phoneVal = cleanVal;
            } else if (lowerCol.includes("date") || lowerCol.includes("created") || lowerCol.includes("time")) {
              dateVal = cleanVal;
            }
          });

          if (!emailVal && !phoneVal) {
            missingContact++;
            warnings.push({
              rowNumber,
              field: "Contact Details",
              message: "Row lacks both email and phone information.",
            });
          }

          if (emailVal) {
            if (emailsSet.has(emailVal)) {
              dupEmails++;
              warnings.push({
                rowNumber,
                field: "email",
                message: `Duplicate email: ${emailVal}`,
              });
            } else {
              emailsSet.add(emailVal);
            }
          }

          if (phoneVal) {
            const numericPhone = phoneVal.replace(/\D/g, "");
            if (phonesSet.has(numericPhone)) {
              dupPhones++;
              warnings.push({
                rowNumber,
                field: "phone",
                message: `Duplicate phone number: ${phoneVal}`,
              });
            } else {
              phonesSet.add(numericPhone);
            }
          }

          if (dateVal) {
            const timestamp = Date.parse(dateVal);
            if (isNaN(timestamp)) {
              suspiciousDates++;
              warnings.push({
                rowNumber,
                field: "date",
                message: `Unparseable date context: "${dateVal}"`,
              });
            }
          }
        });

        const totalRows = rows.length;
        const estimatedImportable = totalRows - missingContact;

        setPreviewData({
          rows,
          headers,
          statistics: {
            totalRows,
            estimatedImportable,
            missingContactInfo: missingContact,
            duplicateEmails: dupEmails,
            duplicatePhones: dupPhones,
            emptyColumnsCount: emptyCols,
            suspiciousDatesCount: suspiciousDates,
          },
          warnings,
        });

        toast.success("CSV Preview Parsed", {
          description: `Loaded ${totalRows} rows and detected ${headers.length} column headers.`,
        });
      },
      error: (error) => {
        setIsParsing(false);
        toast.error("CSV Parsing Error", {
          description: error.message,
        });
      },
    });
  }, []);

  const handleRejectedFiles = useCallback((rejections: FileRejection[]) => {
    const rejection = rejections[0];
    if (!rejection) return;
    const errorCode = rejection.errors[0]?.code ?? "unknown";

    if (errorCode === "file-too-large") {
      toast.error("File too large", {
        description: `Maximum size is 10 MB.`,
      });
    } else {
      toast.error("Upload failed", {
        description: rejection.errors[0]?.message || "Invalid file selection.",
      });
    }
  }, []);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewData(null);
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setPreviewData(null);
  }, []);

  const confirmImportAction = async (onSuccess: (jobId: string) => void) => {
    if (!selectedFile || !previewData) return;

    setIsImporting(true);
    const loadingToastId = toast.loading("Processing extraction pipeline...", {
      description: "AI is mapping columns and parsing contact batch segments.",
    });

    try {
      // Connect directly to backend confirm endpoint
      const response = await fetch("http://localhost:3001/api/v1/uploads/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          fileSize: selectedFile.sizeBytes,
          rows: previewData.rows,
        }),
      });

      const body = await response.json();
      toast.dismiss(loadingToastId);

      if (body.success && body.data) {
        toast.success("Extraction normalized successfully!", {
          description: `Extracted ${body.data.recordsExtracted} records in ${body.data.processingTimeMs}ms.`,
        });
        onSuccess(body.data.id);
      } else {
        throw new Error(body.error?.message || "Server rejected extraction request");
      }
    } catch (err: any) {
      toast.dismiss(loadingToastId);
      toast.error("AI Normalization Failed", {
        description: err.message || "Failed to parse records through LLM.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return {
    selectedFile,
    previewData,
    isParsing,
    handleAcceptedFiles,
    handleRejectedFiles,
    removeFile,
    handleCancel,
    confirmImportAction,
    isImporting,
  };
}
