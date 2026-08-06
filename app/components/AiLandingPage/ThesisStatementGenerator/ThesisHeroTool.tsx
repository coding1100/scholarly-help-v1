"use client";

import { FC } from "react";
import ThesisGenerator from "@/app/components/AiTools/ThesisGenerator-tool";

/** Client wrapper embedding the real thesis statement tool as the hero card. */
const ThesisHeroTool: FC = () => {
  return <ThesisGenerator />;
};

export default ThesisHeroTool;
