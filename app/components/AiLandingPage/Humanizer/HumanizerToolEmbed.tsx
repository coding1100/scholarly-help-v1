"use client";

import { FC } from "react";
import HumanizerTool from "@/app/components/AiTools/HumanizerTool/HumanizerTool";

/**
 * The live AI Humanizer embedded in the landing hero.
 *
 * The shared tool renders inside its own dashboard container
 * (`container mx-auto max-w-[840px] px-3 py-4 …`), which is right for the
 * /tools/humanizer-tool page but wrong here: inside the hero's full-width card
 * it capped the tool at 840px within a ~1019px card, leaving dead white gutters
 * either side and clipping the "AI Humanizer" heading against the card edge.
 *
 * Rather than add a landing-only `variant` prop to the shared component (this
 * landing work is meant to stay self-contained), the wrapper neutralises that
 * container for its direct child only: full width, no max-width, no padding.
 * The scoped `[&>*]:` selectors target the tool's outermost element and nothing
 * deeper, so the tool's internal layout is untouched.
 *
 * Split out of HumanizerHero so only this client subtree sits inside the hero's
 * Suspense boundary; the hero's marketing copy stays server-rendered for SEO.
 */
const HumanizerToolEmbed: FC = () => (
  <div
    className={
      "overflow-hidden rounded-2xl bg-white shadow-[0_30px_70px_-20px_rgba(43,28,80,0.35)] " +
      // Neutralise the tool's dashboard container so it fills the card.
      "[&>*]:!mx-0 [&>*]:!max-w-none [&>*]:!w-full [&>*]:!px-0 [&>*]:!py-0"
    }
  >
    <HumanizerTool />
  </div>
);

export default HumanizerToolEmbed;
