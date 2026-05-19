import { Suspense } from "react";
import DashboardPageContent from "./DashboardPageContent";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";

export default function DashboardPage() {
  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <DashboardPageContent />
    </Suspense>
  );
}
