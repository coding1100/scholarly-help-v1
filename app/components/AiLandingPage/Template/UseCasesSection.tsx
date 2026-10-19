import { FC } from "react";
import { EXPERT_BAND_ID, SECTION_WIDTH, SectionHeading } from "./ui";
import type { LandingContent } from "./types";

const cardDescription =
  "text-xs leading-normal text-[#3B3486] md:text-[11px] md:leading-[1.55]";

/** Use-case cards, the last one a CTA to the expert band. */
const UseCasesSection: FC<{
  content: LandingContent["useCases"];
  expertCta: string;
}> = ({ content: c, expertCta }) => (
  <section className="bg-[#F3F3FA]">
    <div className={`${SECTION_WIDTH} flex flex-col gap-2.5 py-7 md:py-14 md:text-center`}>
      <span className="hidden self-center rounded-full bg-white px-3.5 py-1 text-[10px] md:inline-block">
        {c.eyebrow}
      </span>
      <SectionHeading title={c.title} subtitle={c.subtitle} />
      <div className="grid grid-cols-2 gap-2.5 text-left md:grid-cols-3 md:gap-[18px] md:pt-[18px]">
        {c.cards.map((card) => (
          <div key={card.title} className="rounded-lg bg-white p-3 md:p-[18px]">
            <h3 className="mb-1 text-sm font-semibold md:mb-1.5">{card.title}</h3>
            <p className={cardDescription}>{card.description}</p>
          </div>
        ))}
        <div className="rounded-lg border border-[#FBD3B8] bg-[#FFF4EC] p-3 md:p-[18px]">
          <h3 className="mb-1 text-sm font-semibold md:mb-1.5">{c.ctaCard.title}</h3>
          <p className={`hidden md:mb-2 md:block ${cardDescription}`}>
            {c.ctaCard.description}
          </p>
          <a
            href={`#${EXPERT_BAND_ID}`}
            className="text-xs font-bold text-[#C2410C] no-underline md:text-[11px]"
          >
            {expertCta}
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default UseCasesSection;
