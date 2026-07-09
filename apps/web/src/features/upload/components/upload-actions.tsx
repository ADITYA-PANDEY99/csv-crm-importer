"use client";

import { X, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "../types";

interface UploadActionsProps {
  selectedFile: UploadedFile | null;
  onCancel: () => void;
  onContinue: () => void;
  /** True while Phase 3 async upload is in-flight (unused in Phase 2). */
  isLoading?: boolean;
}

/**
 * UploadActions — Cancel + Continue button row.
 *
 * Continue is disabled when no file is selected.
 * Both buttons have full keyboard support, focus rings, and hover transitions.
 *
 * Phase 3 note: wire `isLoading` to the React Query mutation's `isPending` state.
 */
export function UploadActions({
  selectedFile,
  onCancel,
  onContinue,
  isLoading = false,
}: UploadActionsProps) {
  const canContinue = selectedFile !== null && !isLoading;

  return (
    <div
      className={cn(
        "animate-slide-up animation-delay-300",
        "flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-end"
      )}
      role="group"
      aria-label="Upload actions"
    >
      {/* Cancel */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        aria-label="Cancel upload and clear selected file"
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 sm:w-auto",
          "rounded-xl border border-border/60 bg-transparent",
          "px-6 py-2.5 text-sm font-medium text-muted-foreground",
          "transition-all duration-150",
          "hover:border-border hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-40",
          "active:scale-[0.98]"
        )}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Cancel
      </button>

      {/* Continue */}
      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        aria-label={
          canContinue
            ? `Continue with ${selectedFile?.name}`
            : "Select a CSV file to continue"
        }
        aria-describedby={!canContinue ? "continue-hint" : undefined}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 sm:w-auto",
          "rounded-xl bg-primary px-6 py-2.5",
          "text-sm font-semibold text-primary-foreground",
          "shadow-md shadow-primary/25",
          "transition-all duration-150",
          "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-px",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
          "active:scale-[0.98] active:translate-y-0"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Uploading…
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </>
        )}
      </button>

      {/* Screen-reader hint when button is disabled */}
      {!canContinue && (
        <span id="continue-hint" className="sr-only">
          Please select a valid CSV file before continuing.
        </span>
      )}
    </div>
  );
}
