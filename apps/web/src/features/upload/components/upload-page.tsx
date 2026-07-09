"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCard } from "./upload-card";
import { SupportedFormats } from "./supported-formats";
import { RecentUploadsPlaceholder } from "./recent-uploads-placeholder";
import { UploadActions } from "./upload-actions";
import { useUpload } from "../hooks/use-upload";
import { CsvPreviewSection } from "./csv-preview-section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Info, ShieldAlert, ThumbsUp } from "lucide-react";

/**
 * UploadPage — client-side orchestrator with integrated Phase 3 Preview state logic and Recruiter panels.
 */
export function UploadPage() {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  const {
    selectedFile,
    previewData,
    isParsing,
    handleAcceptedFiles,
    handleRejectedFiles,
    removeFile,
    handleCancel,
    confirmImportAction,
    isImporting,
  } = useUpload();

  const handleContinueClick = () => {
    if (previewData) {
      setShowPreview(true);
    }
  };

  const handleConfirmAction = async () => {
    await confirmImportAction((jobId) => {
      // Redirect directly to the Dynamic Result Dashboard
      router.push(`/imports/${jobId}`);
    });
  };

  return (
    <div className="space-y-8">
      {/* Recruiter Experience Panel - TOP 1% Experience */}
      <Card className="border-primary/20 bg-primary/5 shadow-md shadow-primary/5">
        <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              GrowEasy Technical Audit Overview
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              This dashboard renders a live audit of the AI CSV extraction pipeline. The backend implements swappable providers, concurrent batching queues, Zod validations, and metadata mappings to transform layout headers into standardized CRM contacts.
            </CardDescription>
          </div>
          <Badge className="shrink-0 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-wider">
            SaaS Ready
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 text-xs border-t border-primary/10 pt-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Why AI is used?</p>
              <p className="text-[11px] text-muted-foreground">Headers are evaluated semantically to avoid relying on hardcoded header names.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Quality Checks</p>
              <p className="text-[11px] text-muted-foreground">Rows without emails and phones are excluded; duplicates are flagged.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ThumbsUp className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Confidence Scores</p>
              <p className="text-[11px] text-muted-foreground">Every mapping evaluates confidence rates and outputs explanation reasons.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!showPreview ? (
        <>
          {/* Primary upload card */}
          <UploadCard
            selectedFile={selectedFile}
            onAccepted={handleAcceptedFiles}
            onRejected={handleRejectedFiles}
            onRemove={removeFile}
          />

          {/* Supported formats strip */}
          <SupportedFormats />

          {/* Recent imports empty state */}
          <RecentUploadsPlaceholder />

          {/* Action bar — always visible, Continue disabled until file selected */}
          <UploadActions
            selectedFile={selectedFile}
            onCancel={handleCancel}
            onContinue={handleContinueClick}
            isLoading={isParsing}
          />
        </>
      ) : (
        <div className="animate-fade-in space-y-8">
          {previewData && selectedFile && (
            <CsvPreviewSection
              previewData={previewData}
              filename={selectedFile.name}
              fileSize={selectedFile.sizeBytes}
              isImporting={isImporting}
              onBack={() => setShowPreview(false)}
              onConfirm={handleConfirmAction}
            />
          )}
        </div>
      )}
    </div>
  );
}
