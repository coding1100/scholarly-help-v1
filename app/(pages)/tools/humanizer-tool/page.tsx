"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import HumanizerTool from "@/app/components/AiTools/HumanizerTool/HumanizerTool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";

export default function HumanizerPage() {
  const [flag, setFlag] = useState<boolean>(false);
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense
      fallback={<ToolsSuspenseFallback />}
    >
      <ProductSchema
        productTitle="AI Humanizer Tool - Scholarly Help"
        metaDescription="Transform AI-generated text into natural, human-sounding writing with a free AI humanizer that preserves your meaning while improving flow and tone."
        pageUrl={`${baseUrl}/tools/humanizer-tool`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <HumanizerTool />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}

