"use client";

import { FC, useState } from "react";
import AIParaphraser from "@/app/components/AiTools/AIParaphraser-tool";

/** Client wrapper embedding the real paraphraser in the landing hero. */
const ParaphraserToolEmbed: FC = () => {
  const [, setFlag] = useState(false);
  return <AIParaphraser setFlag={setFlag} variant="landing" />;
};

export default ParaphraserToolEmbed;
