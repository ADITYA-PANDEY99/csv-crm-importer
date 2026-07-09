import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Composed provider tree for the application root.
 *
 * Order matters:
 *   1. ThemeProvider — wraps everything so child components can read theme
 *   2. QueryProvider — React Query context available to all client components
 *   3. Toaster       — Sonner toast portal, placed last to render over content
 */
export function Providers({ children }: ProvidersProps): React.ReactElement {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={4000}
        />
      </QueryProvider>
    </ThemeProvider>
  );
}

