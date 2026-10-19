import { FC } from "react";
import { EXPERT_BAND_ID, SECTION_WIDTH, SectionHeading } from "./ui";
import type { LandingContent } from "./types";

/** What the tool can't do, so readers use it the right way. */
const LimitsSection: FC<{ content: NonNullable<LandingContent["limits"]> }> = ({
  content: c,
}) => (
  <section className="bg-[#F3F3FA]">
    <div className={`${SECTION_WIDTH} flex flex-col gap-2.5 py-7 md:py-14`}>
      <SectionHeading title={c.title} subtitle={c.subtitle} />
      <div className="flex flex-col gap-2.5 md:grid md:grid-cols-4 md:gap-3.5 md:pt-3.5">
        {c.items.map((item) => (
          <div
            key={item.title}
            className="rounded-[10px] bg-white p-3 md:flex md:flex-col md:gap-1.5 md:p-4"
          >
            <h3 className="mb-1 flex items-center gap-1 text-sm font-bold md:mb-0 md:gap-2">
              <span
                aria-hidden="true"
                className="text-[#C2410C] md:flex md:h-[22px] md:w-[22px] md:shrink-0 md:items-center md:justify-center md:rounded-full md:bg-[#FDE7DA] md:text-xs"
              >
                ✕
              </span>
              {item.title}
            </h3>
            <p className="text-[13px] leading-normal text-[#3B3486] md:text-xs md:leading-[1.55]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
      {c.note ? (
        <p className="mt-1 text-sm leading-[1.55] md:mt-2 md:text-center md:text-[13px] md:text-[#333333]">
          {c.note.before}
          <a href={`#${EXPERT_BAND_ID}`} className="font-bold text-[#5B4FE0] hover:text-[#3F35B8]">
            {c.note.linkLabel}
          </a>
          {c.note.after}
        </p>
      ) : null}
    </div>
  </section>
);

export default LimitsSection;
