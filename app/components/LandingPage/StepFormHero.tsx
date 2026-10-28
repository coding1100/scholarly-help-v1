import React, { ReactNode } from "react";
import { styleParentheticalText } from "./heroHeadingUtils";
import StepQuoteForm from "./StepQuoteForm";

const TRUST_POINTS: ReactNode[] = [
  <>
    Domestic Logins <strong>(No IP Bans)</strong>
  </>,
  <>
    <strong>Money-Back</strong> Grade Guarantee
  </>,
  <>
    Matched in <strong>[15 min]</strong>
  </>,
];

interface StepFormHeroProps {
  /** Server-rendered H1 (LCP element). */
  headingSlot: ReactNode;
  description?: string;
}

/**
 * Centred hero: heading and description over the "Check Your Tutoring Price"
 * card with the two-step quote form, then a row of trust points.
 */
export default function StepFormHero({ headingSlot, description }: StepFormHeroProps) {
  return (
    <section id="hero-section" className="w-full bg-[#F5F6FA] px-6 md:px-8">
      <div className="mx-auto max-w-5xl pb-10 pt-[30px] md:pb-14 md:pt-16 md:text-center">
        {headingSlot}
        {description && (
          <div
            className="mx-auto mt-3 max-w-2xl text-[16px] text-[#4B5563]"
            dangerouslySetInnerHTML={{ __html: styleParentheticalText(description) }}
          />
        )}

        <div className="mx-auto mt-6 max-w-[800px] overflow-hidden rounded-lg bg-white text-left shadow-[0_10px_30px_rgba(38,50,56,0.12)] md:mt-8">
          <p className="bg-[#263238] px-2 py-2 text-center text-lg font-semibold text-white sm:py-3 sm:text-xl md:text-2xl lg:text-[28px]">
            Check Your{" "}
            <span className="inline-block -rotate-3 rounded-full bg-[#F56200] px-4">
              Tutoring
            </span>{" "}
            Price
          </p>
          <div className="p-4 sm:px-6 sm:py-5">
            <StepQuoteForm variant="hero" stickyCta />
          </div>
        </div>

        <ul className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-[#4B5563] sm:gap-x-6 sm:text-sm">
          {TRUST_POINTS.map((point, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <span aria-hidden className="font-bold text-[#16A34A]">
                &#10003;
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
