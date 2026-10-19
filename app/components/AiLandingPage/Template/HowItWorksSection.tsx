import { FC } from "react";
import { SECTION_WIDTH } from "./ui";
import type { LandingContent } from "./types";

/** Dark panel with numbered steps: a column each on desktop, a list on mobile. */
const HowItWorksSection: FC<{ content: LandingContent["howItWorks"] }> = ({
  content: c,
}) => (
  <section className={`${SECTION_WIDTH} py-7 md:py-12`}>
    <div className="flex flex-col gap-4 rounded-xl bg-[#3B3A5C] px-[18px] py-[22px] text-white md:block md:rounded-[14px] md:px-[30px] md:pb-9 md:pt-8 md:text-center">
      <p className="hidden text-[10px] text-[#C9C8DE] md:block">{c.eyebrow}</p>
      <h2 className="text-[22px] font-bold leading-[1.25] md:mx-auto md:mb-[22px] md:mt-1 md:max-w-[480px] md:text-[26px]">
        {c.title}
      </h2>
      <ol className="flex flex-col gap-4 md:grid md:grid-cols-4 md:gap-0">
        {c.steps.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-3.5 md:block md:border-r md:border-[#54537A] md:px-3.5 md:last:border-r-0"
          >
            <span className="min-w-[22px] text-[28px] font-bold leading-none md:text-[44px] md:leading-normal">
              {index + 1}
            </span>
            <div>
              <h3 className="text-[15px] font-semibold md:my-1.5 md:text-sm">
                {step.title}
              </h3>
              <p className="text-[13px] leading-normal text-[#E4E3F2] md:text-[10px] md:leading-[1.55]">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default HowItWorksSection;
