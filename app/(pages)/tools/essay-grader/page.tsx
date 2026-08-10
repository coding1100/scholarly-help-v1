"use client";

import { Suspense, useState } from "react";
import EssayGraderTool from "@/app/components/AiTools/EssayGrader/EssayGraderTool";
import ProductSchema from "@/app/components/ProductSchema";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";

export default function EssayGraderPage() {
  const [flag, setFlag] = useState(false);
  const base = String(process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com").replace(/\/$/, "");
  return <Suspense fallback={<ToolsSuspenseFallback />}>
    <ProductSchema productTitle="Essay Grader - Scholarly Help" metaDescription="Grade essays against academic, admissions, scholarship, or custom rubrics with exact-text feedback and guided revisions." pageUrl={`${base}/tools/essay-grader`} />
    <ToolsLayout setFlag={setFlag} flag={flag}><ToolWithExplore><EssayGraderTool /></ToolWithExplore></ToolsLayout>
  </Suspense>;
}
