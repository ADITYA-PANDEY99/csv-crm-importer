import { Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * RecentUploadsPlaceholder — Server Component.
 *
 * Shown below the upload card. Renders a styled empty state.
 *
 * Phase 3 replacement:
 *   Replace this entire component with a data-fetched list:
 *   const { data } = useQuery({ queryKey: ['jobs'], queryFn: () => apiClient.uploads.list() });
 *   Then render a table/card list of ImportJob items.
 */
export function RecentUploadsPlaceholder() {
  return (
    <section
      aria-label="Recent imports"
      className="animate-slide-up animation-delay-300 space-y-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          Recent Imports
        </p>

        {/* Phase 3: this will link to /imports */}
        <span
          className={cn(
            "inline-flex items-center gap-1",
            "text-xs text-muted-foreground/50",
            "cursor-default select-none"
          )}
          aria-hidden="true"
        >
          View all
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </span>
      </div>

      {/* Empty state card */}
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 py-12",
          "rounded-2xl border border-dashed border-border/40",
          "bg-muted/15 text-center"
        )}
        role="status"
        aria-label="No recent imports"
      >
        {/* Icon cluster */}
        <div className="relative flex items-center justify-center">
          {/* Background rings */}
          <div
            className="absolute h-16 w-16 rounded-full bg-primary/5 ring-1 ring-primary/10"
            aria-hidden="true"
          />
          <div
            className="absolute h-24 w-24 rounded-full bg-primary/3 ring-1 ring-primary/6"
            aria-hidden="true"
          />
          {/* Icon */}
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            <Clock className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">No recent imports</p>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Your uploaded CSVs will appear here after processing.
            Start by dropping a file above.
          </p>
        </div>
      </div>
    </section>
  );
}
