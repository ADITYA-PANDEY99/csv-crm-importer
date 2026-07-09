import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Dashboard route group layout.
 * Applies the shared header + footer shell to all (dashboard) routes.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-8">{children}</main>
      <Footer />
    </div>
  );
}

