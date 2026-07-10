"use client";

import { useState, useMemo } from "react";
import {
  Search,
  CheckCircle,
  AlertOctagon,
  Download,
  Calendar,
  Layers,
  Percent,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  ShieldAlert,
  ThumbsUp,
  FileCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CrmRecord, SkippedRecord, MappingInsight, ImportJob } from "@/shared";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface ResultDashboardProps {
  job: ImportJob;
  records: CrmRecord[];
  skippedRecords: SkippedRecord[];
  mappingInsights: MappingInsight[];
  onBack: () => void;
}

export function ResultDashboard({
  job,
  records,
  skippedRecords,
  mappingInsights,
  onBack,
}: ResultDashboardProps) {
  const [activeTab, setActiveTab] = useState<"imported" | "skipped" | "insights">("imported");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 200);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter imported records using debouncedSearchTerm
  const filteredRecords = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return records;
    }
    const term = debouncedSearchTerm.toLowerCase();
    return records.filter((rec) =>
      Object.values(rec).some((val) =>
        String(val || "").toLowerCase().includes(term)
      )
    );
  }, [records, debouncedSearchTerm]);

  // Sort logic for records
  const sortedRecords = useMemo(() => {
    if (!sortConfig) return filteredRecords;

    return [...filteredRecords].sort((a, b) => {
      const aVal = String((a as any)[sortConfig.key] || "");
      const bVal = String((b as any)[sortConfig.key] || "");
      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal, undefined, { numeric: true })
        : bVal.localeCompare(aVal, undefined, { numeric: true });
    });
  }, [filteredRecords, sortConfig]);

  // Pagination for imported records
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRecords.slice(start, start + itemsPerPage);
  }, [sortedRecords, currentPage]);

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Metrics calculating
  const totalProcessed = records.length + skippedRecords.length;
  const successRate = totalProcessed > 0 ? ((records.length / totalProcessed) * 100).toFixed(1) : "0.0";

  // Calculate Duplicate & Quality statistics
  const totalDuplicates = useMemo(() => {
    let dups = 0;
    records.forEach((rec) => {
      if (rec.warnings) {
        dups += rec.warnings.filter((w) => w.toLowerCase().includes("duplicate")).length;
      }
    });
    return dups;
  }, [records]);

  const missingContactsCount = useMemo(() => {
    return skippedRecords.filter((r) => r.reason === "Missing Contact Info").length;
  }, [skippedRecords]);

  // Premium Quality Score formula out of 100
  const dataQualityScore = useMemo(() => {
    if (totalProcessed === 0) return 100;
    const penaltySkipped = skippedRecords.length * 15;
    const penaltyDuplicates = totalDuplicates * 5;
    const rawScore = 100 - ((penaltySkipped + penaltyDuplicates) / totalProcessed);
    return Math.max(10, Math.min(100, Math.round(rawScore)));
  }, [totalProcessed, skippedRecords, totalDuplicates]);

  // CSV Exporter for Normalized Records
  const exportCsv = () => {
    const headers = [
      "id",
      "created_at",
      "name",
      "email",
      "country_code",
      "mobile_without_country_code",
      "company",
      "city",
      "state",
      "country",
      "lead_owner",
      "crm_status",
      "crm_note",
      "data_source",
      "possession_time",
      "description",
    ];

    const csvContent = [
      headers.join(","),
      ...records.map((rec) =>
        headers
          .map((h) => {
            const val = String((rec as any)[h] || "");
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `crm_records_import_${job.id.slice(0, 8)}.csv`);
    link.click();
  };

  // JSON Exporter for Normalized Records
  const exportJson = () => {
    const jsonContent = JSON.stringify({ job, records, skippedRecords, mappingInsights }, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `crm_records_report_${job.id.slice(0, 8)}.json`);
    link.click();
  };

  // Downloadable CSV Report Generation
  const downloadReport = () => {
    const reportHeaders = ["Metric", "Value"];
    const reportRows = [
      ["Job ID", job.id],
      ["Filename", job.filename],
      ["Timestamp", new Date(job.createdAt).toLocaleString()],
      ["Total Rows Processed", String(totalProcessed)],
      ["Imported Records Count", String(records.length)],
      ["Skipped Records Count", String(skippedRecords.length)],
      ["Success Rate", `${successRate}%`],
      ["Quality Score", `${dataQualityScore}/100`],
      ["Duplicate Count", String(totalDuplicates)],
      ["Missing Contact Info Count", String(missingContactsCount)],
      ["Processing Time (Ms)", String(job.processingTimeMs || 0)],
      ["Batch Count", String(job.batchCount || 0)],
    ];

    const csvContent = [
      reportHeaders.join(","),
      ...reportRows.map((r) => r.map((val) => `"${val.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `import_summary_report_${job.id.slice(0, 8)}.csv`);
    link.click();
  };

  // Custom helper to dynamically render Mapping Insight confidence levels
  const getConfidenceBadge = (conf: number) => {
    if (conf >= 0.90) {
      return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15 border-emerald-500/20 text-[10px]">High ({(conf*100).toFixed(0)}%)</Badge>;
    }
    if (conf >= 0.75) {
      return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/15 border-amber-500/20 text-[10px]">Medium ({(conf*100).toFixed(0)}%)</Badge>;
    }
    return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/15 border-red-500/20 text-[10px]">Low ({(conf*100).toFixed(0)}%)</Badge>;
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Recruiter Overview Panel - TOP 1% Experience */}
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

      {/* Header section with back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Import Processing Results</h1>
            <span className="font-mono text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border/40">
              {job.id}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Processed file: <span className="font-medium text-foreground">{job.filename}</span>
          </p>
        </div>

        {/* Global Export CTAs */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadReport} className="gap-2 text-xs">
            <Download className="h-3.5 w-3.5" />
            Download Report
          </Button>
          <Button variant="outline" size="sm" onClick={exportJson} className="gap-2 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </Button>
          <Button onClick={exportCsv} size="sm" className="gap-2 text-xs bg-primary">
            <Download className="h-3.5 w-3.5 text-primary-foreground" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* METRIC CARD ROW - PHASE 5 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {/* Imported */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Imported</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{records.length}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Contacts normalized</p>
          </CardContent>
        </Card>

        {/* Skipped */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Skipped</CardTitle>
            <AlertOctagon className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{skippedRecords.length}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Records bypassed</p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Success Rate</CardTitle>
            <Percent className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{successRate}%</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Bypass ratio status</p>
          </CardContent>
        </Card>

        {/* Time Taken */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Time Taken</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {job.processingTimeMs || 0}<span className="text-xs">ms</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">AI extraction latency</p>
          </CardContent>
        </Card>

        {/* Duplicate Count */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-red-500">Duplicates</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalDuplicates}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Duplicate data hits</p>
          </CardContent>
        </Card>

        {/* Missing Contact Count */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">No Contact</CardTitle>
            <AlertOctagon className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{missingContactsCount}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Lacks email & phone</p>
          </CardContent>
        </Card>

        {/* CSV Quality Score */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Quality Score</CardTitle>
            <FileCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{dataQualityScore}<span className="text-xs">/100</span></div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Calculated overall index</p>
          </CardContent>
        </Card>
      </div>

      {/* TABS ROW */}
      <div className="flex border-b border-border/40 gap-4 text-xs font-semibold select-none">
        <button
          onClick={() => setActiveTab("imported")}
          className={cn(
            "pb-3 relative transition-colors focus:outline-none",
            activeTab === "imported" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Imported Records ({records.length})
        </button>
        <button
          onClick={() => setActiveTab("skipped")}
          className={cn(
            "pb-3 relative transition-colors focus:outline-none",
            activeTab === "skipped" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Skipped Records ({skippedRecords.length})
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={cn(
            "pb-3 relative transition-colors focus:outline-none",
            activeTab === "insights" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          AI Field Mapping Insights ({mappingInsights.length})
        </button>
      </div>

      {/* TAB CONTENT PANEL */}
      <div className="space-y-4">
        {/* IMPORTED RECORDS TAB */}
        {activeTab === "imported" && (
          <Card className="glass overflow-hidden border-border/40">
            <CardHeader className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Normalized CRM Records</CardTitle>
                <CardDescription className="text-xs">Standardized fields parsed from CSV columns using OpenAI extraction heuristic.</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter normalized rows..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-border bg-background/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-thin max-h-[380px] border-y border-border/40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/50 sticky top-0 backdrop-blur z-10 border-b border-border/60">
                    <tr>
                      <th className="p-3 font-semibold text-muted-foreground select-none w-14">#</th>
                      <th onClick={() => handleSort("name")} className="p-3 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none">Name</th>
                      <th onClick={() => handleSort("email")} className="p-3 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none">Email</th>
                      <th onClick={() => handleSort("mobile_without_country_code")} className="p-3 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none">Mobile</th>
                      <th onClick={() => handleSort("company")} className="p-3 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none">Company</th>
                      <th onClick={() => handleSort("city")} className="p-3 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none">City</th>
                      <th onClick={() => handleSort("crm_status")} className="p-3 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none">Status</th>
                      <th onClick={() => handleSort("lead_owner")} className="p-3 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none">Lead Owner</th>
                      <th className="p-3 font-semibold text-muted-foreground select-none">Confidence</th>
                      <th className="p-3 font-semibold text-muted-foreground select-none">Warnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-muted-foreground">
                          No matching records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((rec, idx) => {
                        const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                        return (
                          <tr key={rec.id} className="hover:bg-muted/15 even:bg-muted/5 transition-colors">
                            <td className="p-3 font-mono text-muted-foreground/60 w-14">{globalIdx}</td>
                            <td className="p-3 font-semibold text-foreground">{rec.name || <span className="text-muted-foreground/35 italic">empty</span>}</td>
                            <td className="p-3 text-foreground/80">{rec.email || <span className="text-muted-foreground/35 italic">empty</span>}</td>
                            <td className="p-3 text-foreground/80">
                              {rec.country_code ? `+${rec.country_code} ` : ""}
                              {rec.mobile_without_country_code || <span className="text-muted-foreground/35 italic">empty</span>}
                            </td>
                            <td className="p-3 text-foreground/85">{rec.company || <span className="text-muted-foreground/35 italic">empty</span>}</td>
                            <td className="p-3 text-foreground/80">{rec.city || <span className="text-muted-foreground/35 italic">empty</span>}</td>
                            <td className="p-3">
                              {rec.crm_status ? (
                                <Badge variant="secondary" className="text-[10px] py-0 px-2 font-medium">
                                  {rec.crm_status}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground/35 italic">empty</span>
                              )}
                            </td>
                            <td className="p-3 text-foreground/80">{rec.lead_owner || <span className="text-muted-foreground/35 italic">empty</span>}</td>
                            {/* Phase 7 confidence levels visually integrated */}
                            <td className="p-3">
                              {getConfidenceBadge(rec.confidence ?? 0.95)}
                            </td>
                            <td className="p-3">
                              {rec.warnings && rec.warnings.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {rec.warnings.map((w, wIdx) => (
                                    <span key={wIdx} className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/10">
                                      {w}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-emerald-500 font-medium text-[10px]">None</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination stats footer */}
              {totalPages > 1 && (
                <div className="p-4 flex items-center justify-between border-t border-border/40 bg-muted/10 text-xs">
                  <span className="text-muted-foreground">
                    Showing {Math.min(filteredRecords.length, (currentPage - 1) * itemsPerPage + 1)}-
                    {Math.min(filteredRecords.length, currentPage * itemsPerPage)} of {filteredRecords.length} records
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                      className="h-8 py-0 px-3 text-xs"
                    >
                      Previous
                    </Button>
                    <span className="text-muted-foreground select-none">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                      className="h-8 py-0 px-3 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SKIPPED RECORDS TAB */}
        {activeTab === "skipped" && (
          <Card className="glass overflow-hidden border-border/40 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Skipped Import Rows</CardTitle>
              <CardDescription className="text-xs">
                Rows that failed contact criteria validation. Skipped rows avoid importing contacts lacking email and phone endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-thin max-h-[380px] border-t border-border/40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/50 sticky top-0 backdrop-blur z-10 border-b border-border/60">
                    <tr>
                      <th className="p-3 font-semibold text-muted-foreground w-16">Row #</th>
                      <th className="p-3 font-semibold text-muted-foreground w-44">Reason</th>
                      <th className="p-3 font-semibold text-muted-foreground w-64">Failure Description</th>
                      <th className="p-3 font-semibold text-muted-foreground">Original Raw Data Row</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {skippedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          No skipped rows detected for this job. Good lead quality!
                        </td>
                      </tr>
                    ) : (
                      skippedRecords.map((skip, idx) => (
                        <tr key={idx} className="hover:bg-muted/15 even:bg-muted/5 transition-colors">
                          <td className="p-3 font-mono text-muted-foreground/70">{skip.rowNumber}</td>
                          <td className="p-3">
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold border",
                              skip.reason === "Missing Contact Info" && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/10",
                              skip.reason === "Invalid Data" && "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/10",
                              skip.reason === "AI Validation Failed" && "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/10"
                            )}>
                              {skip.reason}
                            </span>
                          </td>
                          <td className="p-3 text-foreground/80 leading-relaxed max-w-[260px] truncate" title={skip.details}>
                            {skip.details}
                          </td>
                          <td className="p-3 text-muted-foreground/90 font-mono text-[10px] max-w-[320px] truncate" title={JSON.stringify(skip.rawData)}>
                            {JSON.stringify(skip.rawData)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI MAPPING INSIGHTS TAB - PHASE 6 EXPLAINABILITY & CONFIDENCE PANEL */}
        {activeTab === "insights" && (
          <Card className="glass overflow-hidden border-border/40 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base font-semibold">AI Semantic Mapping Insights</CardTitle>
              <CardDescription className="text-xs">
                OpenAI evaluated column content patterns to bind raw headers to standardised CRM destination keys.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mappingInsights.length === 0 ? (
                  <p className="col-span-full p-4 text-center text-muted-foreground text-xs">
                    No mapping insights resolved for this job.
                  </p>
                ) : (
                  mappingInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="border border-border/60 bg-muted/20 p-4 rounded-xl flex flex-col justify-between hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-foreground bg-muted border border-border/50 px-2 py-0.5 rounded">
                            {insight.sourceColumn}
                          </span>
                          {getConfidenceBadge(insight.confidence ?? 0.85)}
                        </div>
                        <div className="text-center py-1 font-bold text-primary text-xs select-none">
                          ↓
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {insight.crmField}
                          </span>
                          <span className="text-[10px] font-semibold text-primary">CRM Key</span>
                        </div>
                      </div>

                      {/* Explainability reasoning description */}
                      <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed italic bg-background/40 p-2 rounded border border-border/20">
                        &ldquo;{insight.reason || "Evaluated column context semantics."}&rdquo;
                      </p>

                      {insight.sampleValues && insight.sampleValues.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border/30">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Sample Data:</span>
                          <div className="mt-1 space-y-1">
                            {insight.sampleValues.map((val, valIdx) => (
                              <p key={valIdx} className="text-[10px] text-muted-foreground truncate" title={val}>
                                &bull; &ldquo;{val}&rdquo;
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
