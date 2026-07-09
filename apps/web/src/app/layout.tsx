import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/providers";
import "@/styles/globals.css";

// ── Font ──────────────────────────────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ── Metadata ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "CSVCRM — AI-Powered CSV to CRM Importer",
    template: "%s | CSVCRM",
  },
  description:
    "Upload any CSV file and let AI intelligently extract and normalize your contacts into standardized CRM records. Powered by OpenAI.",
  keywords: ["CRM", "CSV importer", "AI", "contacts", "data normalization"],
  authors: [{ name: "CSVCRM" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "CSVCRM — AI-Powered CSV to CRM Importer",
    description:
      "Upload any CSV file and let AI extract your CRM contacts automatically.",
    siteName: "CSVCRM",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
  width: "device-width",
  initialScale: 1,
};

// ── Root Layout ───────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

