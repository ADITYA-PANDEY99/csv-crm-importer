"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Rows,
  Columns,
  Sparkles,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PreviewData } from "../hooks/use-upload";
import { formatFileSize } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface CsvPreviewSectionProps {
  previewData: PreviewData;
  filename: string;
  fileSize: number;
  isImporting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export function CsvPreviewSection({
  previewData,
  filename,
  fileSize,
  isImporting,
  onBack,
  onConfirm,
}: CsvPreviewSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 200);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Search filtering using debounced value to ensure smooth keyboard typing on large sets
  const filteredRows = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return previewData.rows;
    }
    const term = debouncedSearchTerm.toLowerCase();
    return previewData.rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "").toLowerCase().includes(term)
      )
    );
  }, [previewData.rows, debouncedSearchTerm]);

  // Sort logic
  const sortedRows = useMemo(() => {
    if (!sortConfig) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aVal = String(a[sortConfig.key] || "");
      const bVal = String(b[sortConfig.key] || "");
      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal, undefined, { numeric: true })
        : bVal.localeCompare(aVal, undefined, { numeric: true });
    });
  }, [filteredRows, sortConfig]);

  // Pagination logic — limits UI rendering calculations to itemsPerPage
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRows.slice(start, start + itemsPerPage);
  }, [sortedRows, currentPage]);

  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const { statistics, warnings } = previewData;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to upload
        </Button>
        <div className="text-right leading-none">
          <span className="text-xs text-muted-foreground">Previewing file</span>
          <p className="text-sm font-semibold text-foreground">{filename} ({formatFileSize(fileSize)})</p>
        </div>
      </div>

      {/* CSV SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Rows */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Rows</CardTitle>
            <Rows className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalRows}</div>
            <p className="text-[11px] text-muted-foreground/75 mt-1">Detected records in file</p>
          </CardContent>
        </Card>

        {/* Columns Count */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Columns</CardTitle>
            <Columns className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{previewData.headers.length}</div>
            <p className="text-[11px] text-muted-foreground/75 mt-1">Mapped headers parsed</p>
          </CardContent>
        </Card>

        {/* Estimated Importable */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Importable Rows</CardTitle>
            <Check className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {statistics.estimatedImportable}
            </div>
            <p className="text-[11px] text-muted-foreground/75 mt-1">Rows with valid email/phone</p>
          </CardContent>
        </Card>

        {/* Quality Issues */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {statistics.missingContactInfo + statistics.duplicateEmails + statistics.duplicatePhones}
            </div>
            <p className="text-[11px] text-muted-foreground/75 mt-1">
              {statistics.duplicateEmails} dup emails · {statistics.duplicatePhones} dup phones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DATA QUALITY WARNINGS */}
      {warnings.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Data Quality Warnings ({warnings.length})
            </CardTitle>
            <CardDescription className="text-xs text-amber-700/80 dark:text-amber-400/80">
              We identified potential data issues below. These rows will be normalized or bypassed based on CRM extraction constraints.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[140px] overflow-y-auto scrollbar-thin text-xs text-amber-800/90 dark:text-amber-300/90 space-y-2">
            {warnings.slice(0, 15).map((w, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-amber-500/10 p-2 rounded-lg">
                <span className="font-semibold select-none">Row {w.rowNumber}:</span>
                <span className="font-medium text-amber-900 dark:text-amber-200">[{w.field}]</span>
                <span>{w.message}</span>
              </div>
            ))}
            {warnings.length > 15 && (
              <p className="text-[11px] text-muted-foreground pt-1">
                ...and {warnings.length - 15} other issues detected.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* TANSTACK PREVIEW TABLE */}
      <Card className="glass overflow-hidden border-border/40">
        <CardHeader className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">Local Raw Data Preview</CardTitle>
            <CardDescription className="text-xs">Interactive grid. Double-check layout mappings before sending to AI CRM parser.</CardDescription>
          </div>
          {/* Search tool */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search raw rows..."
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
          <div className="overflow-x-auto scrollbar-thin max-h-[360px] border-y border-border/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 sticky top-0 backdrop-blur z-10 border-b border-border/60">
                <tr>
                  <th className="p-3 font-semibold text-muted-foreground select-none w-14">#</th>
                  {previewData.headers.map((h) => (
                    <th
                      key={h}
                      onClick={() => handleSort(h)}
                      className="p-3 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        {h}
                        {sortConfig?.key === h ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-primary" />
                          )
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={previewData.headers.length + 1} className="p-8 text-center text-muted-foreground">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, idx) => {
                    const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                    return (
                      <tr key={idx} className="hover:bg-muted/15 even:bg-muted/5 transition-colors">
                        <td className="p-3 font-mono text-muted-foreground/60 w-14">{globalIdx}</td>
                        {previewData.headers.map((h) => (
                          <td key={h} className="p-3 text-foreground/80 truncate max-w-[200px]" title={row[h]}>
                            {row[h] || <span className="text-muted-foreground/30 italic">empty</span>}
                          </td>
                        ))}
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
                Showing {Math.min(filteredRows.length, (currentPage - 1) * itemsPerPage + 1)}-
                {Math.min(filteredRows.length, currentPage * itemsPerPage)} of {filteredRows.length} rows
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

      {/* CONFIRMATION CTAS */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onBack} disabled={isImporting}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={isImporting} className="gap-2 bg-primary">
          {isImporting ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse text-primary-foreground" />
              AI Mapping in Progress...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-primary-foreground" />
              Confirm Import
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
