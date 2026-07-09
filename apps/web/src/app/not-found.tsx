import Link from "next/link";
import { FileQuestion } from "lucide-react";

/**
 * Next.js App Router 404 page.
 */
export default function NotFoundPage(): React.ReactElement {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Link
        href="/imports"
        className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

