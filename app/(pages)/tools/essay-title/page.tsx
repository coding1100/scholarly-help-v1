"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import EssayTitle from "@/app/components/AiTools/EssayTitle/EssayTitle";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function EssayTitlePage() {
  const [flag, setFlag] = useState<boolean>(false);

  return (
    <Suspense
      fallback={
        <ToolsSuspenseFallback />
      }
    >
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <EssayTitle setFlag={setFlag} />
      </ToolsLayout>
    </Suspense>
  );
}
