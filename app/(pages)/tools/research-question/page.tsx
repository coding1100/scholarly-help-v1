"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import ResearchQuestion from "@/app/components/AiTools/ResearchQuestion/ResearchQuestion";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function ResearchQuestionPage() {
  const [flag, setFlag] = useState<boolean>(false);

  return (
    <Suspense
      fallback={
        <ToolsSuspenseFallback />
      }
    >
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ResearchQuestion setFlag={setFlag} />
      </ToolsLayout>
    </Suspense>
  );
}
