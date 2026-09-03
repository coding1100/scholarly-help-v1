"use client";

import React, { useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import { CoursePlannerTool } from "@/app/components/AiTools/CoursePlanner/CoursePlannerTool";

export default function CoursePlannerPageContent() {
  const [flag, setFlag] = useState(false);

  return (
    <ToolsLayout flag={flag} setFlag={setFlag}>
      <ToolWithExplore>
        <div className="w-full bg-slate-50">
          <CoursePlannerTool />
        </div>
      </ToolWithExplore>
    </ToolsLayout>
  );
}
