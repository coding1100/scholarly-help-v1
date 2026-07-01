"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import HumanizerTool from "@/app/components/AiTools/HumanizerTool/HumanizerTool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";

export default function HumanizerPage() {
  const [flag, setFlag] = useState<boolean>(false);

  return (
    <Suspense
      fallback={<ToolsSuspenseFallback />}
    >
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <HumanizerTool />
      </ToolsLayout>
    </Suspense>
  );
}

