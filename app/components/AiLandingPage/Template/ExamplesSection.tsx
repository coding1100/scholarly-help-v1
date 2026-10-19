import { FC } from "react";
import { SECTION_WIDTH, SectionHeading } from "./ui";
import type { LandingContent } from "./types";

const sample = "rounded-lg p-2.5 text-[13px] leading-[1.55] md:p-3 md:text-xs md:leading-[1.6]";
const sampleLabel = "text-[10px] font-bold md:mb-1 md:tracking-[0.05em]";

/** Before/after examples for different kinds of writing. */
const ExamplesSection: FC<{ content: NonNullable<LandingContent["examples"]> }> = ({
  content: c,
}) => (
  <section className={`${SECTION_WIDTH} flex flex-col gap-2.5 py-7 md:py-14`}>
    <SectionHeading title={c.title} subtitle={c.subtitle} />
    <div className="flex flex-col gap-2.5 md:grid md:grid-cols-3 md:gap-[18px] md:pt-3.5">
      {c.items.map((item) => (
        <div
          key={item.title}
          className="flex flex-col gap-2 rounded-xl border border-[#E2E2EA] p-3.5 md:gap-2.5 md:p-[18px]"
        >
          <h3 className="text-[15px] font-bold">{item.title}</h3>
          <div className={`${sample} bg-[#F7F7FC]`}>
            <p className={`${sampleLabel} text-[#6B6B7B]`}>BEFORE</p>
            <p>{item.before}</p>
          </div>
          <div className={`${sample} bg-[#EFEEFB]`}>
            <p className={`${sampleLabel} text-[#3F35B8]`}>AFTER</p>
            <p>{item.after}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ExamplesSection;
