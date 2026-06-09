"use client";

import React, { useState } from "react";
import { Suspense } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import EssayOutlinetool from "@/app/components/AiTools/EssayOutline-tool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

const Page = () => {
  const [flag, setFlag] = useState(false);

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <EssayOutlinetool />
      </ToolsLayout>
    </Suspense>
  );
};

export default Page;
