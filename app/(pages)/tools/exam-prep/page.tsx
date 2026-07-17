"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import ExamPrepFlow from "@/app/components/AiTools/ExamPrep/ExamPrepFlow";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function ExamPrepPage() {
  const [flag, setFlag] = useState<boolean>(false);

  return (
    <Suspense
      fallback={
        <ToolsSuspenseFallback />
      }
    >
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <ExamPrepFlow />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
