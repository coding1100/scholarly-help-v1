"use client";

import { FC, useRef } from "react";
import { useMobileCtaBar } from "@/app/components/AiTools/useMobileCtaBar";
import { ContentLink } from "./ui";
import type { LandingContent } from "./types";

/** Sticky bottom bar on phones: jump to the tool, or to the expert CTA. */
const MobileCtaBar: FC<{ content: LandingContent["mobileBar"] }> = ({
  content: c,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  useMobileCtaBar(barRef);

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-[#E2E2EA] bg-white px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-6px_18px_rgba(20,20,60,0.10)] md:hidden"
    >
      <ContentLink
        link={c.tool}
        className="flex min-h-[48px] flex-1 items-center justify-center rounded-md border-[1.5px] border-[#5B4FE0] text-sm font-bold text-[#5B4FE0] no-underline"
      />
      <ContentLink
        link={c.expert}
        className="flex min-h-[48px] flex-[1.3] items-center justify-center rounded-md bg-[#F26A1B] text-sm font-bold text-white no-underline"
      />
    </div>
  );
};

export default MobileCtaBar;
