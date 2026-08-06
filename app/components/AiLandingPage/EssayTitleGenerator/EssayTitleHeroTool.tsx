"use client";

import { FC, useState } from "react";
import EssayTitle from "@/app/components/AiTools/EssayTitle/EssayTitle";

/** Client wrapper embedding the real essay title tool as the hero card. */
const EssayTitleHeroTool: FC = () => {
  const [, setFlag] = useState(false);
  return <EssayTitle setFlag={setFlag} variant="landing" />;
};

export default EssayTitleHeroTool;
