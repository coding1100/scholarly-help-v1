"use client";

import { FC, useRef } from "react";
import { useMobileCtaBar } from "@/app/components/AiTools/useMobileCtaBar";
import { EXPERT_BAND_ID } from "./ui";
import type { LandingContent } from "./types";

/** Sticky bottom bar on phones: jump to the tool, or to the expert band. */
const MobileCtaBar: FC<{
  cta: LandingContent["cta"];
  toolAnchorId: string;
}> = ({ cta, toolAnchorId }) => {
  const barRef = useRef<HTMLDivElement>(null);
  useMobileCtaBar(barRef);

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-[#E2E2EA] bg-white px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-6px_18px_rgba(20,20,60,0.10)] md:hidden"
    >
      <a
        href={`#${toolAnchorId}`}
        className="flex min-h-[48px] flex-1 items-center justify-center rounded-md border-[1.5px] border-[#5B4FE0] text-sm font-bold text-[#5B4FE0] no-underline"
      >
        {cta.toolShort}
      </a>
      <a
        href={`#${EXPERT_BAND_ID}`}
        className="flex min-h-[48px] flex-[1.3] items-center justify-center rounded-md bg-[#F26A1B] text-sm font-bold text-white no-underline"
      >
        {cta.expert}
      </a>
    </div>
  );
};

export default MobileCtaBar;
