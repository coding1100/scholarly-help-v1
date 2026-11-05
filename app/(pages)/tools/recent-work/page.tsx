import { Suspense } from "react";
import type { Metadata } from "next";
import RecentWorkPageContent from "./RecentWorkPageContent";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";

export const metadata: Metadata = {
  title: "Recent work | ScholarlyHelp",
  description: "Everything you have run across the ScholarlyHelp study tools.",
  // Account-scoped activity: never index it, and never follow out of it.
  robots: { index: false, follow: false },
};

export default function RecentWorkPage() {
  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <RecentWorkPageContent />
    </Suspense>
  );
}
