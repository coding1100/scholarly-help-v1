import { FC } from "react";
import { EXPERT_BAND_ID } from "./ui";
import type { LandingContent } from "./types";

/** Closing band: heading with a rotated pill and the page's two CTAs. */
const FinalCtaSection: FC<{
  content: LandingContent["finalCta"];
  cta: LandingContent["cta"];
  toolAnchorId: string;
}> = ({ content: c, cta, toolAnchorId }) => (
  <section className="bg-[#3B3A5C] text-white">
    <div className="mx-auto flex max-w-[900px] flex-col gap-3 px-4 py-9 text-center md:items-center md:gap-3.5 md:px-6 md:py-14">
      <h2 className="text-[26px] font-extrabold leading-[1.35] md:text-[34px] md:leading-[1.3]">
        {c.titleStart}{" "}
        <span className="inline-block -rotate-3 rounded-full bg-[#5B4FE0] px-3 md:px-4">
          {c.titlePill}
        </span>
        {c.titleEnd ? ` ${c.titleEnd}` : null}
      </h2>
      <p className="text-sm leading-[1.6] text-[#E4E3F2] md:max-w-[520px] md:text-xs">
        {c.body}
      </p>
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:justify-center md:pt-1.5">
        <a
          href={`#${EXPERT_BAND_ID}`}
          className="rounded-md bg-[#F26A1B] p-3.5 text-[15px] font-bold text-white no-underline hover:bg-[#D85A10] md:rounded md:px-5 md:py-3 md:text-xs"
        >
          {cta.expert}
        </a>
        <a
          href={`#${toolAnchorId}`}
          className="rounded-md border-[1.5px] border-white p-[13px] text-[15px] font-semibold text-white no-underline hover:bg-white/10 md:rounded md:px-5 md:py-[11px] md:text-xs"
        >
          {cta.tool}
        </a>
      </div>
    </div>
  </section>
);

export default FinalCtaSection;
