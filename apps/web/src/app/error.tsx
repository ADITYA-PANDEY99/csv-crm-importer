"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router error boundary page.
 *
 * Rendered when an unhandled error is thrown anywhere in this route segment.
 * The `reset` function re-renders the segment, giving users a recovery path.
 */
export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps): React.ReactElement {
  useEffect(() => {
    // Log to error tracking service (e.g., Sentry) in a real application
    console.error("[ErrorPage]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

