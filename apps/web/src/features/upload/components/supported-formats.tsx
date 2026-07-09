import {
  FileText,
  Table2,
  Facebook,
  BarChart2,
  Home,
  Megaphone,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_FORMATS } from "../types";
import type { LucideIcon } from "lucide-react";

/** Map format id → Lucide icon */
const FORMAT_ICONS: Record<string, LucideIcon> = {
  csv:        FileText,
  utf8:       FileText,
  excel:      FileSpreadsheet,
  facebook:   Facebook,
  "google-ads": BarChart2,
  realestate: Home,
  marketing:  Megaphone,
};

/**
 * SupportedFormats — Server Component.
 * Renders a horizontally scrollable row of format badges.
 */
export function SupportedFormats() {
  return (
    <section
      aria-label="Supported file formats"
      className="animate-slide-up animation-delay-200 space-y-4"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
        Supported formats
      </p>

      {/* Scrollable badge row */}
      <div
        role="list"
        className={cn(
          "flex gap-2 overflow-x-auto pb-2",
          "scrollbar-thin",
          "snap-x snap-mandatory"
        )}
      >
        {SUPPORTED_FORMATS.map((fmt) => {
          const Icon = FORMAT_ICONS[fmt.id] ?? Table2;
          return (
            <div
              key={fmt.id}
              role="listitem"
              className={cn(
                "format-badge",
                "flex shrink-0 snap-start items-center gap-2.5",
                "rounded-xl border border-border/60",
                "bg-card/60 px-4 py-3",
                "cursor-default select-none"
              )}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary"
                aria-hidden="true"
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <div className="leading-none">
                <p className="whitespace-nowrap text-xs font-semibold text-foreground">
                  {fmt.label}
                </p>
                <p className="mt-0.5 whitespace-nowrap text-[10px] text-muted-foreground">
                  {fmt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
