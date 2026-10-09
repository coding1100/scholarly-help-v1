"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import AiDetectorTool from "@/app/components/AiTools/AiDetectorTool/AiDetectorTool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import DoneForYouCard from "@/app/components/AiTools/DoneForYouCard";
import ProductSchema from "@/app/components/ProductSchema";

export default function AiDetectorPage() {
  const [flag, setFlag] = useState<boolean>(false);
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="AI Detector Tool - Scholarly Help"
        metaDescription="Check your writing with a free AI content detector that analyzes text and shows how likely it is to be AI-generated, with a detailed score breakdown."
        pageUrl={`${baseUrl}/tools/ai-detector-tool`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore rail={<DoneForYouCard placement="ai_detector_done_for_you" />}>
          <AiDetectorTool />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
