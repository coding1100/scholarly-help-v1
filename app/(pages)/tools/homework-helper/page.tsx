"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import HomeworkHelperTool from "@/app/components/AiTools/HomeworkHelperTool/HomeworkHelperTool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";

export default function HomeworkHelperPage() {
  const [flag, setFlag] = useState<boolean>(false);
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="Homework Helper - Scholarly Help"
        metaDescription="Get step-by-step, Socratic, or fully explained help on any homework question — any subject, with practice problems and instant feedback on your own work."
        pageUrl={`${baseUrl}/tools/homework-helper`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <HomeworkHelperTool />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
