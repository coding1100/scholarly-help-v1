"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import MicroLearningFlow from "@/app/components/AiTools/MicroLearning/MicroLearningFlow";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function TutorPage() {
  const [flag, setFlag] = useState<boolean>(false);

  return (
    <Suspense
      fallback={
        <ToolsSuspenseFallback />
      }
    >
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <MicroLearningFlow />
      </ToolsLayout>
    </Suspense>
  );
}
