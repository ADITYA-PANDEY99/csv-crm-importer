"use client";

import { FileText, X, RefreshCcw, CheckCircle2, Calendar, HardDrive } from "lucide-react";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import type { UploadedFile } from "../types";

interface FilePreviewCardProps {
  file: UploadedFile;
  onRemove: () => void;
  onReplace: () => void;
}

/**
 * FilePreviewCard — shown after a valid CSV is selected.
 *
 * Displays: file icon, name, size, last modified, success badge.
 * Actions: remove (×) and replace (refresh icon).
 *
 * Enters with a scale-in animation so the transition feels snappy.
 */
export function FilePreviewCard({ file, onRemove, onReplace }: FilePreviewCardProps) {
  return (
    <div
      className={cn(
        "animate-scale-in",
        "rounded-2xl border border-border/60 bg-card p-6",
        "shadow-sm shadow-black/4 dark:shadow-black/20",
        "transition-shadow hover:shadow-md"
      )}
      role="region"
      aria-label={`Selected file: ${file.name}`}
    >
      {/* Top row: icon + info + actions */}
      <div className="flex items-start gap-4">
        {/* File icon */}
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center",
            "rounded-xl bg-primary/10 text-primary",
            "ring-1 ring-primary/20"
          )}
          aria-hidden="true"
        >
          <FileText className="h-7 w-7" strokeWidth={1.5} />
        </div>

        {/* File name + success badge */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="truncate text-sm font-semibold text-foreground"
              title={file.name}
            >
              {file.name}
            </p>
            {/* Success badge */}
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5",
                "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
                "border border-emerald-500/20",
                "text-[10px] font-semibold uppercase tracking-wide"
              )}
              aria-label="File is ready"
            >
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Ready
            </span>
          </div>

          {/* Metadata pills row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {/* File size */}
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" aria-hidden="true" />
              {formatFileSize(file.sizeBytes)}
            </span>

            {/* Last modified */}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <time dateTime={file.lastModified.toISOString()}>
                {formatDate(file.lastModified.toISOString())}
              </time>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Replace */}
          <button
            type="button"
            onClick={onReplace}
            aria-label="Replace file"
            title="Replace with a different file"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted transition-colors duration-150",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            )}
          >
            <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          {/* Remove */}
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove file"
            title="Remove selected file"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              "text-muted-foreground hover:text-destructive",
              "hover:bg-destructive/8 transition-colors duration-150",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            )}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Progress-style divider — visual flourish */}
      <div className="mt-5 overflow-hidden rounded-full bg-muted/60" aria-hidden="true">
        <div
          className="h-0.5 rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/60"
          style={{ width: "100%" }}
        />
      </div>

      {/* Footer hint */}
      <p className="mt-3 text-[11px] text-muted-foreground/70">
        Review and continue when ready, or select a different file using the replace button above.
      </p>
    </div>
  );
}
