"use client";

import { FC, useState } from "react";
import type { FaqSectionContent } from "./types";

/** Accordion FAQ with outlined navy items; one answer open at a time. */
const FaqSection: FC<{ content: FaqSectionContent }> = ({ content: c }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto flex max-w-[640px] flex-col gap-2 px-4 pb-[30px] pt-5 md:gap-2.5 md:px-6 md:pb-14 md:pt-6">
      <h2 className="mb-1 text-[22px] font-bold md:mb-0 md:text-center md:text-[26px]">
        {c.title}
      </h2>
      {c.subtitle ? (
        <p className="hidden text-center text-[11px] text-[#555555] md:mb-2 md:block">
          {c.subtitle}
        </p>
      ) : null}
      {c.items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div
            key={item.question}
            className="rounded-md border-[1.5px] border-[#2A2266] md:rounded"
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex min-h-[52px] w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-semibold text-[#111111] md:min-h-[44px] md:py-2 md:text-[11px]"
            >
              {item.question}
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#2A2266] text-white md:h-[18px] md:w-[18px]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-3 w-3 transition-transform md:h-2.5 md:w-2.5 ${open ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>
            {open ? (
              <p className="px-3 pb-3 text-sm leading-[1.6] text-[#374151] md:text-[11px]">
                {item.answer}
              </p>
            ) : null}
          </div>
        );
      })}
    </section>
  );
};

export default FaqSection;
