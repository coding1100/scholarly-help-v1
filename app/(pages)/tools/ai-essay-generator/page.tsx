"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import EssayGeneratorTool from "@/app/components/AiTools/EssayGenerator/EssayGeneratorTool";
import ProductSchema from "@/app/components/ProductSchema";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";

export default function Page() {
  const [flag, setFlag] = useState(false);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="Free AI Essay Generator | Write High-Quality Essays Instantly"
        metaDescription="Create structured, high-quality essays in minutes with our intelligent AI essay builder. Perfect for academic practice, reflections, and coursework assignments."
        pageUrl={`${normalizedBaseUrl}/tools/ai-essay-generator`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <EssayGeneratorTool />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
