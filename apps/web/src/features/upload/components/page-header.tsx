import { Sparkles } from "lucide-react";

/**
 * PageHeader — Server Component.
 * Static page title + subtitle. No client-side interactivity.
 */
export function PageHeader() {
  return (
    <header className="space-y-3 animate-fade-in">
      {/* Eyebrow label */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          AI-Powered Import
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        Import Leads
      </h1>

      {/* Subtitle */}
      <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Upload any CRM CSV.{" "}
        <span className="text-foreground/70">
          We intelligently identify lead information after confirmation.
        </span>
      </p>
    </header>
  );
}
