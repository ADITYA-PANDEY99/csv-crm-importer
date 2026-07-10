"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ResultDashboard } from "@/features/upload/components/result-dashboard";
import { toast } from "sonner";
import type { ImportJob, CrmRecord, SkippedRecord, MappingInsight } from "@/shared";

interface ImportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ImportDetailPage({ params }: ImportDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<ImportJob | null>(null);
  const [records, setRecords] = useState<CrmRecord[]>([]);
  const [skippedRecords, setSkippedRecords] = useState<SkippedRecord[]>([]);
  const [mappingInsights, setMappingInsights] = useState<MappingInsight[]>([]);

  useEffect(() => {
    let active = true;

    async function fetchDetails() {
      try {
        const [jobRes, recordsRes] = await Promise.all([
          fetch(`http://localhost:3001/api/v1/uploads/${id}`),
          fetch(`http://localhost:3001/api/v1/crm-records/${id}?page=1&limit=500`),
        ]);

        if (!jobRes.ok || !recordsRes.ok) {
          throw new Error("Import job details or records could not be retrieved");
        }

        const jobBody = await jobRes.json();
        const recordsBody = await recordsRes.json();

        if (active) {
          setJob(jobBody.data);
          setRecords(recordsBody.data.records);
          setSkippedRecords(recordsBody.data.skippedRecords || []);
          setMappingInsights(recordsBody.data.mappingInsights || []);
          setLoading(false);
        }
      } catch (err: any) {
        loggerWarnFallback(err.message);
        if (active) {
          toast.error("Failed to fetch import job", {
            description: "Please check if your backend server is currently running.",
          });
          router.push("/imports");
        }
      }
    }

    fetchDetails();
    return () => {
      active = false;
    };
  }, [id, router]);

  function loggerWarnFallback(msg: string) {
    console.warn("[Dashboard Loader]", msg);
  }

  if (loading || !job) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-muted-foreground animate-pulse">Loading result metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <ResultDashboard
      job={job}
      records={records}
      skippedRecords={skippedRecords}
      mappingInsights={mappingInsights}
      onBack={() => router.push("/imports")}
    />
  );
}
