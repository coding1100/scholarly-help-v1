"use client";

import TutorFlow from "@/app/components/AiTools/Tutor/TutorFlow";
import { ChatProvider } from "@/app/context/ChatContext";
import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import AIParaphraser from "@/app/components/AiTools/AIParaphraser-tool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function TutorPage() {
  const [flag, setFlag] = useState<boolean>(false);

  return ( 
    <Suspense
      fallback={
        <ToolsSuspenseFallback />
      }
    >
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ChatProvider>
          <ToolWithExplore>
            <div className="">
              <TutorFlow />
            </div>
          </ToolWithExplore>
        </ChatProvider>
      </ToolsLayout>
    </Suspense>
  );
}
