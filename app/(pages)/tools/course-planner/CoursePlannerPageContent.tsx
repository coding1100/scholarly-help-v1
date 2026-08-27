"use client";

import React, { useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import { CoursePlannerTool } from "@/app/components/AiTools/CoursePlanner/CoursePlannerTool";

export default function CoursePlannerPageContent() {
  const [flag, setFlag] = useState(false);

  return (
    <ToolsLayout flag={flag} setFlag={setFlag}>
      <div className="h-full w-full overflow-y-auto bg-slate-50">
        <CoursePlannerTool />
      </div>
    </ToolsLayout>
  );
}
