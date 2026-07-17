"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import HumanizerTool from "@/app/components/AiTools/HumanizerTool/HumanizerTool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";

export default function HumanizerPage() {
  const [flag, setFlag] = useState<boolean>(false);

  return (
    <Suspense
      fallback={<ToolsSuspenseFallback />}
    >
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <HumanizerTool />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}

