import { FC } from "react";
import Link from "next/link";
import { ContentLink, ORANGE_BUTTON, SECTION_WIDTH } from "./ui";
import type { MoreToolsSectionContent } from "./types";

/** Links to related tools and the full tools hub. */
const MoreToolsSection: FC<{ content: MoreToolsSectionContent }> = ({ content: c }) => (
  <section className={`${SECTION_WIDTH} flex flex-col gap-2.5 pb-3 pt-7 md:pb-6 md:pt-14`}>
    <h2 className="text-[22px] font-bold leading-[1.3] md:text-center md:text-[26px]">
      {c.title}
    </h2>
    <p className="text-[13px] text-[#3B3486] md:text-center md:text-xs">{c.subtitle}</p>
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3.5 md:pt-3">
      {c.items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex min-h-[44px] flex-col gap-1 rounded-lg border border-[#E2E2EA] p-3 text-[#111111] no-underline transition-colors hover:border-[#5B4FE0] md:p-4"
        >
          <span className="text-sm font-semibold md:text-[13px]">{item.name}</span>
          <span className="hidden text-[11px] text-[#3B3486] md:block">
            {item.description}
          </span>
        </Link>
      ))}
    </div>
    <ContentLink
      link={c.button}
      className={`${ORANGE_BUTTON} rounded-md p-[13px] text-center text-sm md:mt-2 md:self-center md:px-[22px] md:py-3 md:text-xs`}
    />
  </section>
);

export default MoreToolsSection;
