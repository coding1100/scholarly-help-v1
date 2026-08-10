"use client";

import { Suspense, useState } from "react";
import PlagiarismCheckerTool from "@/app/components/AiTools/PlagiarismCheckerTool/PlagiarismCheckerTool";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ProductSchema from "@/app/components/ProductSchema";

export default function PlagiarismCheckerPage() {
  const [flag, setFlag] = useState(false);
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com").replace(/\/$/, "");
  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="Plagiarism Checker - ScholarlyHelp"
        metaDescription="Check essays and research papers for matching text across web and academic sources, review highlighted passages, and download a similarity report."
        pageUrl={`${base}/tools/plagiarism-checker`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore><PlagiarismCheckerTool /></ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
