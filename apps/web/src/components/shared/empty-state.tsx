import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Reusable empty-state illustration component.
 * Used when a list or table has no data to display.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

