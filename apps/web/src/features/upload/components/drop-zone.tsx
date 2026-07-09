"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_FILE_SIZE_BYTES } from "../types";
import { formatFileSize } from "@/lib/utils";

interface DropZoneProps {
  onAccepted: (files: File[]) => void;
  onRejected: (rejections: FileRejection[]) => void;
}

/**
 * DropZone — the primary drag-and-drop / click-to-browse area.
 *
 * Visual states:
 *   idle     → dashed border, muted background, upload icon
 *   hover    → primary-tinted border, subtle highlight
 *   dragging → glowing primary border, blue wash background, icon scales up,
 *              text changes to "Drop your CSV here"
 */
export function DropZone({ onAccepted, onRejected }: DropZoneProps) {
  const handleDropAccepted = useCallback(
    (files: File[]) => onAccepted(files),
    [onAccepted]
  );

  const handleDropRejected = useCallback(
    (rejections: FileRejection[]) => onRejected(rejections),
    [onRejected]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDropAccepted: handleDropAccepted,
    onDropRejected: handleDropRejected,
    accept: {
      "text/csv": [".csv"],
      "application/csv": [".csv"],
      "text/plain": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_BYTES,
    noClick: false,
    noKeyboard: false,
  });

  return (
    <div
      {...getRootProps()}
      aria-label="CSV file upload area. Drag and drop or press Enter to browse files."
      className={cn(
        // Base
        "group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center",
        "gap-5 rounded-2xl border-2 border-dashed p-10 text-center",
        "outline-none transition-all duration-200 ease-out",
        "sm:min-h-[320px] lg:min-h-[340px]",
        // Idle → hover
        "dropzone-idle-border",
        // Drag-active overrides
        isDragActive
          ? [
              "dropzone-drag-active",
              "border-primary bg-primary/5 dark:bg-primary/8",
            ]
          : "bg-muted/30 dark:bg-muted/20 hover:bg-muted/50 dark:hover:bg-muted/30"
      )}
    >
      <input {...getInputProps()} aria-label="File input" />

      {/* Icon container */}
      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300",
          isDragActive
            ? "scale-110 bg-primary/15 text-primary shadow-lg shadow-primary/20"
            : "bg-muted text-muted-foreground group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary"
        )}
      >
        {isDragActive ? (
          <FileText
            className="h-9 w-9 drop-shadow-sm"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ) : (
          <UploadCloud
            className="h-9 w-9 drop-shadow-sm"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Text content */}
      <div className="space-y-2">
        {isDragActive ? (
          <p className="text-xl font-semibold text-primary animate-scale-in">
            Drop your CSV here
          </p>
        ) : (
          <>
            <p className="text-xl font-semibold text-foreground">
              Drag & drop your CSV
            </p>
            <p className="text-sm text-muted-foreground">
              or{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className={cn(
                  "font-medium text-primary underline-offset-2",
                  "hover:underline focus-visible:underline",
                  "transition-colors"
                )}
              >
                browse files
              </button>{" "}
              on your device
            </p>
          </>
        )}
      </div>

      {/* Metadata row */}
      {!isDragActive && (
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            CSV only
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1">
            Max {formatFileSize(MAX_FILE_SIZE_BYTES)}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1">
            UTF-8 supported
          </span>
        </div>
      )}
    </div>
  );
}
