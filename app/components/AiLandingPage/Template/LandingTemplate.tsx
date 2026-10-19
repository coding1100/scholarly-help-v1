import { FC, ReactNode } from "react";
import ComparisonSection from "./ComparisonSection";
import ExamplesSection from "./ExamplesSection";
import ExpertBandSection from "./ExpertBandSection";
import FaqSection from "./FaqSection";
import FinalCtaSection from "./FinalCtaSection";
import GuideSection from "./GuideSection";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import LevelsSection from "./LevelsSection";
import LimitsSection from "./LimitsSection";
import MobileCtaBar from "./MobileCtaBar";
import MoreToolsSection from "./MoreToolsSection";
import UseCasesSection from "./UseCasesSection";
import WhatIsSection from "./WhatIsSection";
import type { LandingContent } from "./types";

/**
 * The shared layout for every tool landing page. Pages pass their copy and
 * the live tool; sections whose content is missing are left out.
 */
const LandingTemplate: FC<{
  content: LandingContent;
  tool: ReactNode;
  /** Optional line under the hero subtitle. */
  heroExtra?: ReactNode;
  /**
   * Show the Done-for-you panel beside the tool. Off for tools whose embed
   * already renders it.
   */
  showCard?: boolean;
}> = ({ content: c, tool, heroExtra, showCard = true }) => (
  <div className="font-poppins text-[#111111]">
    <HeroSection content={c} tool={tool} extra={heroExtra} showCard={showCard} />
    {c.whatIs ? <WhatIsSection content={c.whatIs} /> : null}
    {c.levels ? <LevelsSection content={c.levels} /> : null}
    <UseCasesSection content={c.useCases} expertCta={c.cta.expert} />
    {c.examples ? <ExamplesSection content={c.examples} /> : null}
    <HowItWorksSection content={c.howItWorks} />
    {c.comparison ? <ComparisonSection content={c.comparison} /> : null}
    {c.limits ? <LimitsSection content={c.limits} /> : null}
    <ExpertBandSection
      content={c.expertBand}
      ctaLabel={c.cta.expert}
      placement={c.placement}
    />
    {c.guide ? <GuideSection content={c.guide} expertCta={c.cta.expert} /> : null}
    <MoreToolsSection related={c.related} />
    <FaqSection content={c.faq} />
    <FinalCtaSection content={c.finalCta} cta={c.cta} toolAnchorId={c.toolAnchorId} />
    <MobileCtaBar cta={c.cta} toolAnchorId={c.toolAnchorId} />
  </div>
);

export default LandingTemplate;
