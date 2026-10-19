"use client";

import { FC, useId, useState } from "react";
import { EXPERT_BAND_ID } from "./ui";
import type { LandingContent } from "./types";

const prose = "text-[15px] leading-[1.7] text-[#333333] md:text-sm md:leading-[1.75]";

/**
 * Long-form guide. On mobile only the intro shows until "Read the full
 * guide" is tapped; the rest stays in the markup (hidden with CSS) so the
 * full text is still in the page.
 */
const GuideSection: FC<{
  content: NonNullable<LandingContent["guide"]>;
  expertCta: string;
}> = ({ content: c, expertCta }) => {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  return (
    <section className="bg-[#F7F7FC]">
      <div className="mx-auto flex max-w-[760px] flex-col gap-3 px-4 py-7 md:gap-3.5 md:px-6 md:py-14">
        <h2 className="text-[22px] font-bold leading-[1.25] md:mt-2 md:text-[28px]">
          {c.title}
        </h2>
        <p className={prose}>{c.intro}</p>

        <div
          id={bodyId}
          className={`${open ? "flex" : "hidden"} flex-col gap-2.5 md:flex md:gap-3.5`}
        >
          {c.sections.map((section) => (
            <div key={section.heading} className="flex flex-col gap-2.5 md:gap-3.5">
              <h3 className="mt-1 text-[17px] font-bold md:mt-2.5 md:text-[19px]">
                {section.heading}
              </h3>
              {section.body ? <p className={prose}>{section.body}</p> : null}
              {section.steps ? (
                <ol className={`flex list-decimal flex-col gap-1.5 pl-5 ${prose}`}>
                  {section.steps.map((step) => (
                    <li key={step.lead}>
                      <strong>{step.lead}</strong> {step.text}
                    </li>
                  ))}
                </ol>
              ) : null}
              {section.callout ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#FBD3B8] bg-[#FFF4EC] p-4">
                  <p className="text-[13px] leading-normal">
                    <strong>{section.callout.lead}</strong> {section.callout.text}
                  </p>
                  <a
                    href={`#${EXPERT_BAND_ID}`}
                    className="rounded bg-[#F26A1B] px-4 py-2.5 text-xs font-bold text-white no-underline hover:bg-[#D85A10]"
                  >
                    {expertCta}
                  </a>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((value) => !value)}
          className="min-h-[44px] self-start text-sm font-bold text-[#5B4FE0] md:hidden"
        >
          {open ? "Show less ↑" : "Read the full guide ↓"}
        </button>
      </div>
    </section>
  );
};

export default GuideSection;
