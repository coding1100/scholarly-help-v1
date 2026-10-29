import { FC, ReactNode } from "react";
import CardsSection from "./CardsSection";
import ComparisonSection from "./ComparisonSection";
import CtaBandSection from "./CtaBandSection";
import DetailCardsSection from "./DetailCardsSection";
import FaqSection from "./FaqSection";
import FinalCtaSection from "./FinalCtaSection";
import GuideSection from "./GuideSection";
import HeroSection from "./HeroSection";
import MobileCtaBar from "./MobileCtaBar";
import MoreToolsSection from "./MoreToolsSection";
import PointCardsSection from "./PointCardsSection";
import StepsSection from "./StepsSection";
import WhatIsSection from "./WhatIsSection";
import type { LandingContent, LandingSection } from "./types";

const Section: FC<{ section: LandingSection }> = ({ section: s }) => {
  switch (s.type) {
    case "whatIs":
      return <WhatIsSection content={s} />;
    case "steps":
      return <StepsSection content={s} />;
    case "cards":
      return <CardsSection content={s} />;
    case "detailCards":
      return <DetailCardsSection content={s} />;
    case "pointCards":
      return <PointCardsSection content={s} />;
    case "comparison":
      return <ComparisonSection content={s} />;
    case "ctaBand":
      return <CtaBandSection content={s} />;
    case "guide":
      return <GuideSection content={s} />;
    case "moreTools":
      return <MoreToolsSection content={s} />;
    case "faq":
      return <FaqSection content={s} />;
    case "finalCta":
      return <FinalCtaSection content={s} />;
  }
};

/**
 * The shared layout for tool landing pages: the hero with the live tool,
 * then the page's sections in the order its content lists them.
 */
const LandingTemplate: FC<{ content: LandingContent; tool: ReactNode }> = ({
  content: c,
  tool,
}) => (
  <div className="font-poppins text-[#111111]">
    <HeroSection content={c} tool={tool} />
    {c.sections.map((section, index) => (
      <Section key={`${section.type}-${index}`} section={section} />
    ))}
    <MobileCtaBar content={c.mobileBar} />
  </div>
);

export default LandingTemplate;
