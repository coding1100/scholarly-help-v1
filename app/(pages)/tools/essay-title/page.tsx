"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import EssayStudio from "@/app/components/AiTools/EssayStudio/EssayStudio";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";

export default function EssayTitlePage() {
  const [flag, setFlag] = useState<boolean>(false);
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="AI Essay Title Generator - Scholarly Help"
        metaDescription="Generate catchy, relevant essay titles instantly with the Essay Studio title and thesis builder."
        pageUrl={`${baseUrl}/tools/essay-title`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <EssayStudio initialStep="thesis" />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
