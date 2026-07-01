"use client";

import React, { useState } from "react";
import { Suspense } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import ThesisGenerator from "@/app/components/AiTools/ThesisGenerator-tool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

const Page = () => {
  const [flag, setFlag] = useState<boolean>(false);

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ThesisGenerator />
      </ToolsLayout>
    </Suspense>
  );
};

export default Page;
