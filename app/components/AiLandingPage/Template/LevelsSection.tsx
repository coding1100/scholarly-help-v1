import { FC } from "react";
import { SECTION_WIDTH, SectionHeading } from "./ui";
import type { LandingContent } from "./types";

/** The tool's modes or levels, each with a short before/after sample. */
const LevelsSection: FC<{ content: NonNullable<LandingContent["levels"]> }> = ({
  content: c,
}) => (
  <section className={`${SECTION_WIDTH} flex flex-col gap-2.5 py-7 md:pb-14 md:pt-2`}>
    <SectionHeading title={c.title} subtitle={c.subtitle} />
    <div className="flex flex-col gap-2.5 md:grid md:grid-cols-3 md:gap-[18px] md:pt-3.5">
      {c.items.map((item) => (
        <div
          key={item.name}
          className={`flex flex-col gap-1.5 rounded-[10px] p-3.5 md:gap-2 md:p-[18px] ${
            item.recommended
              ? "border-[1.5px] border-[#5B4FE0]"
              : "border border-[#E2E2EA]"
          }`}
        >
          <h3 className="text-[15px] font-bold">
            {item.name}
            {item.recommended ? (
              <span className="ml-1 text-[11px] font-semibold text-[#5B4FE0] md:text-[10px]">
                Recommended
              </span>
            ) : null}
          </h3>
          <p className="text-[13px] leading-normal text-[#3B3486] md:text-[11px] md:leading-[1.55]">
            {item.description}
          </p>
          <p className="rounded-md bg-[#F7F7FC] p-2.5 text-[13px] leading-normal md:text-[11px] md:leading-[1.55]">
            <span className="text-[#666666] md:text-[#777777]">Before:</span>{" "}
            {item.before}
            <br />
            <span className="text-[#666666] md:text-[#777777]">After:</span>{" "}
            {item.after}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default LevelsSection;
