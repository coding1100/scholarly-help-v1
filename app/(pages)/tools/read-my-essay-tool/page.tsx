"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import ReadMyEssayTool from "@/app/components/AiTools/ReadMyEssay/ReadMyEssayTool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import DoneForYouCard from "@/app/components/AiTools/DoneForYouCard";
import ProductSchema from "@/app/components/ProductSchema";

export default function ReadMyEssayToolPage() {
  const [flag, setFlag] = useState<boolean>(false);
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="Read My Essay - Scholarly Help"
        metaDescription="Paste your essay and listen to it read aloud. Choose a voice and language, adjust speed and pitch, and follow each word as it is spoken."
        pageUrl={`${baseUrl}/tools/read-my-essay-tool`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore rail={<DoneForYouCard placement="read_my_essay_done_for_you" />}>
          <ReadMyEssayTool />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
