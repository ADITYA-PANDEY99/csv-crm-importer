"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { DropZone } from "./drop-zone";
import { FilePreviewCard } from "./file-preview-card";
import type { UploadedFile } from "../types";
import type { FileRejection } from "react-dropzone";

interface UploadCardProps {
  selectedFile: UploadedFile | null;
  onAccepted: (files: File[]) => void;
  onRejected: (rejections: FileRejection[]) => void;
  onRemove: () => void;
}

/**
 * UploadCard — glass-morphism wrapper card.
 *
 * Renders either the DropZone (no file) or the FilePreviewCard (file selected).
 * The card itself is intentionally passive — state lives in the parent hook.
 *
 * The hidden file input referenced by `replaceInputRef` allows the "Replace"
 * button inside FilePreviewCard to trigger a fresh file picker without
 * re-mounting the whole DropZone.
 */
export function UploadCard({
  selectedFile,
  onAccepted,
  onRejected,
  onRemove,
}: UploadCardProps) {
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleReplace = () => {
    replaceInputRef.current?.click();
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      onAccepted(files);
    }
    // Reset so the same file can be re-selected if needed
    e.target.value = "";
  };

  return (
    <section
      aria-label="CSV file upload"
      className={cn(
        "relative overflow-hidden rounded-2xl",
        // Glass card
        "border border-border/50 bg-card/60 backdrop-blur-sm",
        "shadow-xl shadow-black/4 dark:shadow-black/25",
        // Subtle top gradient line — brand accent
        "before:absolute before:inset-x-0 before:top-0 before:h-px",
        "before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent",
        "transition-shadow duration-300"
      )}
    >
      <div className="p-6 sm:p-8 lg:p-10">
        {selectedFile ? (
          <FilePreviewCard
            file={selectedFile}
            onRemove={onRemove}
            onReplace={handleReplace}
          />
        ) : (
          <DropZone onAccepted={onAccepted} onRejected={onRejected} />
        )}
      </div>

      {/* Hidden input for the replace action */}
      <input
        ref={replaceInputRef}
        type="file"
        accept=".csv,text/csv,application/csv,text/plain,application/vnd.ms-excel"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleReplaceChange}
      />
    </section>
  );
}
