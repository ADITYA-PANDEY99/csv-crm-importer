/**
 * Application footer.
 * Server Component — static content only.
 */
export function Footer(): React.ReactElement {
  return (
    <footer className="border-t border-border/60 py-6">
      <div className="container flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} CSVCRM. Built for production.
        </p>
        <p className="text-xs text-muted-foreground">
          Powered by OpenAI · Next.js 15 · TypeScript
        </p>
      </div>
    </footer>
  );
}

