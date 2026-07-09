"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * React class-based Error Boundary.
 *
 * Use this component to wrap sections of the UI that might throw during render.
 * The optional `fallback` prop allows callers to supply a custom error UI.
 *
 * Note: Error boundaries cannot be written as function components — React
 * only supports the class-based getDerivedStateFromError / componentDidCatch
 * lifecycle for this use case.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  override render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30",
          "bg-destructive/5 p-10 text-center",
          this.props.className
        )}
        role="alert"
      >
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            {this.state.error?.message ??
              "An unexpected error occurred. Please refresh the page."}
          </p>
        </div>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          className="mt-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }
}

