"use client";

import { FC, useState } from "react";
import ResearchQuestion from "@/app/components/AiTools/ResearchQuestion/ResearchQuestion";

/** Client wrapper embedding the real research question tool as the hero card. */
const ResearchQuestionHeroTool: FC = () => {
  const [, setFlag] = useState(false);
  return <ResearchQuestion setFlag={setFlag} variant="landing" />;
};

export default ResearchQuestionHeroTool;
