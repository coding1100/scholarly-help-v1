"use client";

import { FC } from "react";
import SummarizerTool from "@/app/components/AiTools/summarizer-tool";

/** Client wrapper embedding the real summarizer tool as the hero card. */
const SummarizerHeroTool: FC = () => {
  return <SummarizerTool variant="landing" />;
};

export default SummarizerHeroTool;
