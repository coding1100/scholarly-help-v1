import { FC } from "react";
import { ContentLink, SECTION_WIDTH, SectionHeading } from "./ui";
import type { PointCardsSectionContent } from "./types";

const TONES = {
  check: {
    glyph: "✓",
    icon: "text-[#15803D] md:bg-[#DCFCE7]",
  },
  cross: {
    glyph: "✕",
    icon: "text-[#C2410C] md:bg-[#FDE7DA]",
  },
} as const;

/** Four short cards on a tinted band, each marked with a check or a cross. */
const PointCardsSection: FC<{ content: PointCardsSectionContent }> = ({
  content: c,
}) => {
  const tone = TONES[c.tone];

  return (
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
                  className={`${tone.icon} md:flex md:h-[22px] md:w-[22px] md:shrink-0 md:items-center md:justify-center md:rounded-full md:text-xs`}
                >
                  {tone.glyph}
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
            <ContentLink
              link={c.note.link}
              className="font-bold text-[#5B4FE0] hover:text-[#3F35B8]"
            />
            {c.note.after}
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default PointCardsSection;
