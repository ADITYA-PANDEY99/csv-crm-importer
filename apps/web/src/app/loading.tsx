import { LoadingSpinner } from "@/components/shared/loading-spinner";

/**
 * Next.js App Router loading UI.
 * Shown as a React Suspense fallback during segment navigation.
 */
export default function LoadingPage(): React.ReactElement {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

