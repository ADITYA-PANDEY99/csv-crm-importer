import type { Metadata } from "next";
import { PageHeader } from "@/features/upload/components/page-header";
import { UploadPage } from "@/features/upload/components/upload-page";

export const metadata: Metadata = {
  title: "Import Leads",
  description:
    "Upload any CRM CSV. We intelligently identify lead information after confirmation.",
};

/**
 * /imports — Primary CSV upload screen.
 *
 * This is intentionally a Server Component: metadata, PageHeader, and the
 * document structure are static. All interactivity is delegated to
 * <UploadPage /> which is marked "use client" internally.
 */
export default function ImportsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-0 py-4 sm:py-8 animate-fade-in">
      <PageHeader />
      <UploadPage />
    </div>
  );
}
