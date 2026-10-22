import { Suspense } from "react";
import type { Metadata } from "next";
import AccountPageContent from "./AccountPageContent";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";

export const metadata: Metadata = {
  title: "Account & billing | ScholarlyHelp",
  description: "Manage your plan, credits, payment methods and account settings.",
  // Account-scoped and authenticated: never index.
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <AccountPageContent />
    </Suspense>
  );
}
