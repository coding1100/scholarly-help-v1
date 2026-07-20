"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import AiDetectorTool from "@/app/components/AiTools/AiDetectorTool/AiDetectorTool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";

export default function AiDetectorPage() {
  const [flag, setFlag] = useState<boolean>(false);

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <AiDetectorTool />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
