import { FC } from "react";
import Link from "next/link";
import { VISIBLE_TOOLS } from "@/app/components/AiTools/Dashboard/toolsData";
import { LANDING_PAGES, type LandingPageKey } from "./landingPages";
import { SECTION_WIDTH } from "./ui";

/** Links to related landing pages and the full tools hub. */
const MoreToolsSection: FC<{ related: LandingPageKey[] }> = ({ related }) => {
  const toolCount = VISIBLE_TOOLS.length;

  return (
    <section className={`${SECTION_WIDTH} flex flex-col gap-2.5 pb-3 pt-7 md:pb-6 md:pt-14`}>
      <h2 className="text-[22px] font-bold leading-[1.3] md:text-center md:text-[26px]">
        More free writing tools
      </h2>
      <p className="text-[13px] text-[#3B3486] md:text-center md:text-xs">
        All {toolCount} tools live in one free ScholarlyHelp dashboard.
      </p>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3.5 md:pt-3">
        {related.map((key) => {
          const page = LANDING_PAGES[key];
          return (
            <Link
              key={key}
              href={page.href}
              className="flex min-h-[44px] flex-col gap-1 rounded-lg border border-[#E2E2EA] p-3 text-[#111111] no-underline transition-colors hover:border-[#5B4FE0] md:p-4"
            >
              <span className="text-sm font-semibold md:text-[13px]">{page.name}</span>
              <span className="hidden text-[11px] text-[#3B3486] md:block">
                {page.description}
              </span>
            </Link>
          );
        })}
      </div>
      <Link
        href="/tools"
        className="rounded-md bg-[#F26A1B] p-[13px] text-center text-sm font-bold text-white no-underline hover:bg-[#D85A10] md:mt-2 md:self-center md:px-[22px] md:py-3 md:text-xs"
      >
        Explore all {toolCount} tools free →
      </Link>
    </section>
  );
};

export default MoreToolsSection;
