"use client";

import { FC, useState } from "react";
import CitationTool from "@/app/components/AiTools/CitationTool/CitationTool";

/** Client wrapper embedding the real citation tool as the hero card. */
const CitationHeroTool: FC = () => {
  const [, setFlag] = useState(false);
  return <CitationTool setFlag={setFlag} variant="landing" />;
};

export default CitationHeroTool;
