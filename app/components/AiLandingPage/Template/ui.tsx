import { FC } from "react";

/** Anchor of the expert band; every "expert" CTA on the page scrolls here. */
export const EXPERT_BAND_ID = "expert-help";

/** Shared width and side padding of the content sections. */
export const SECTION_WIDTH = "mx-auto max-w-[1000px] px-4 md:px-6";

/**
 * Section title and subtitle: left-aligned on mobile with the subtitle
 * hidden, centred on desktop.
 */
export const SectionHeading: FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <>
    <h2 className="text-[22px] font-bold leading-[1.3] md:text-center md:text-[28px] md:leading-[1.25]">
      {title}
    </h2>
    {subtitle ? (
      <p className="hidden text-xs text-[#3B3486] md:block md:text-center">
        {subtitle}
      </p>
    ) : null}
  </>
);
