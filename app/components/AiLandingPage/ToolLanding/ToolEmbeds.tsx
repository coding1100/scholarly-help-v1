"use client";

import { useState } from "react";
import AiDetectorTool from "@/app/components/AiTools/AiDetectorTool/AiDetectorTool";
import MathSolver from "@/app/components/AiTools/MathSolver/MathSolver";

const embedClassName =
  "overflow-hidden rounded-2xl bg-white shadow-[0_30px_70px_-20px_rgba(43,28,80,0.35)] [&>*]:!mx-0 [&>*]:!w-full [&>*]:!max-w-none [&>*]:!px-0 [&>*]:!py-0";

export const AiDetectorEmbed = () => (
  <div className={embedClassName}>
    <AiDetectorTool />
  </div>
);

export const MathSolverEmbed = () => {
  const [, setFlag] = useState(false);
  return (
    <div className={embedClassName}>
      <MathSolver setFlag={setFlag} />
    </div>
  );
};
