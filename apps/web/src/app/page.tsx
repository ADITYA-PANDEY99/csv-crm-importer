import { redirect } from "next/navigation";

/**
 * Root page — immediately redirects to the dashboard.
 * The marketing/landing page can be added here in a future milestone.
 */
export default function RootPage(): never {
  redirect("/imports");
}

