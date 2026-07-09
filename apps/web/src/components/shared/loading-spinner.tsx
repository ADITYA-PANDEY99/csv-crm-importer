import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

/**
 * Accessible loading spinner using CSS border animation.
 * Includes an ARIA live region so screen readers announce it.
 */
export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps): React.ReactElement {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent",
        "text-primary opacity-80",
        sizeClasses[size],
        className
      )}
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
}

