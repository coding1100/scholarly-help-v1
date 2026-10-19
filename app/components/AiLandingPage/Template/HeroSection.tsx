import { FC, ReactNode, Suspense } from "react";
import Link from "next/link";
import DoneForYouCard from "@/app/components/AiTools/DoneForYouCard";
import type { LandingContent } from "./types";

const crumbLink = "text-[#555555] no-underline hover:text-[#111111]";

/**
 * Breadcrumb, H1, subtitle and the live tool. From lg up the tool and the
 * Done-for-you panel join into one block; below that they stack as two cards.
 */
const HeroSection: FC<{
  content: LandingContent;
  tool: ReactNode;
  /** Optional line under the subtitle (e.g. a "try a sample" link). */
  extra?: ReactNode;
  showCard: boolean;
}> = ({ content: c, tool, extra, showCard }) => (
  <section className="bg-[linear-gradient(180deg,#EEF0FD_0%,#FFFFFF_100%)]">
    <div className="mx-auto flex max-w-[1100px] flex-col gap-2.5 px-4 pb-7 pt-5 md:px-6 md:pb-14 md:pt-11">
      <nav aria-label="Breadcrumb" className="text-[11px] text-[#555555] md:text-center">
        <Link href="/" className={crumbLink}>
          Home
        </Link>
        {" › "}
        <Link href="/tools" className={crumbLink}>
          Free Tools
        </Link>
        {" › "}
        <span aria-current="page" className="text-[#111111]">
          {c.toolName}
        </span>
      </nav>

      <h1 className="text-[28px] font-extrabold leading-[1.2] text-[#111111] md:text-center md:text-[40px] md:leading-[1.15]">
        {c.hero.titleLead}{" "}
        <span className="text-[#F26A1B]">{c.hero.titleAccent}</span>
      </h1>
      <p className="mb-1.5 text-sm leading-normal text-[#3B3486] md:mb-[18px] md:text-center">
        {c.hero.subtitle}
      </p>
      {extra}

      <div className="flex flex-col gap-4 text-left lg:flex-row lg:items-stretch lg:gap-0">
        {/* The embedded tools bring their own card chrome; drop their shadow
            and match this panel's corners so the tool sits inside it. */}
        <div
          id={c.toolAnchorId}
          className={`min-w-0 scroll-mt-24 rounded-[10px] bg-white shadow-[0_8px_24px_rgba(40,30,120,0.10)] [&>*]:![border-radius:inherit] [&>*]:!shadow-none lg:flex-1 lg:shadow-[0_10px_30px_rgba(40,30,120,0.10)] ${
            showCard ? "lg:rounded-l-lg lg:rounded-r-none" : "lg:rounded-lg"
          }`}
        >
          <Suspense
            fallback={<div className="h-[360px] animate-pulse rounded-[10px] bg-white/70" />}
          >
            {tool}
          </Suspense>
        </div>
        {showCard ? (
          <DoneForYouCard
            placement={c.placement}
            variant="landing"
            className="lg:w-[260px] lg:shrink-0"
          />
        ) : null}
      </div>
    </div>
  </section>
);

export default HeroSection;
