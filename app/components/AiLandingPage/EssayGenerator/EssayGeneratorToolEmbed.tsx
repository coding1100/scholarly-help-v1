"use client";

import { FC } from "react";
import EssayGeneratorTool from "@/app/components/AiTools/EssayGenerator/EssayGeneratorTool";

/** Embed the existing essay generator inside the landing page's hero card. */
const EssayGeneratorToolEmbed: FC = () => (
  <div className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_70px_-20px_rgba(43,28,80,0.35)]">
    <EssayGeneratorTool embedded />
  </div>
);

export default EssayGeneratorToolEmbed;
