import Link from "next/link";
import { UploadCloud, Github } from "lucide-react";

/**
 * Application top navigation bar.
 * Server Component — no client-side state needed.
 */
export function Header(): React.ReactElement {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <UploadCloud className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            CSV<span className="text-primary">CRM</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          <Link
            href="/imports"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Imports
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="ml-2 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Github className="h-4 w-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}

