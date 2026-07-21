"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import MathSolver from "@/app/components/AiTools/MathSolver/MathSolver";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function MathSolverPage() {
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
          <MathSolver setFlag={setFlag} />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
