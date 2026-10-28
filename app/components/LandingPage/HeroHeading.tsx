import React from "react";
import { styleParentheticalText } from "./heroHeadingUtils";

/**
 * Server-only hero heading so the LCP text is in the initial HTML (no client render delay).
 */
const HEADING_CLASS =
  "font-semibold text-[30px] md:text-[48px] leading-[1.1] text-black";

export default function HeroHeading({
  mainHeading,
  spanClassName,
  className = HEADING_CLASS,
}: {
  mainHeading: string;
  /** Extra classes for the heading span (take-my-class needs "md:pt-5 block"). */
  spanClassName?: string;
  /** Classes for the h1, replacing the default size and weight. */
  className?: string;
}) {
  if (!mainHeading) {
    return (
      <h1 className={className}>
        Stop Sacrificing
        <br />
        Your Time, We&apos;ll
        <br />
        Handle Your
        <br />
        Classes
      </h1>
    );
  }
  const styled = mainHeading.includes("|")
    ? (() => {
        const [beforePipe, ...afterPipeParts] = mainHeading.split("|");
        const afterPipe = afterPipeParts.join("|");
        return `${styleParentheticalText(beforePipe)}|<span class="text-[#F56200]">${styleParentheticalText(afterPipe)}</span>`;
      })()
    : styleParentheticalText(mainHeading);
  return (
    <h1 className={className}>
      <span
        className={spanClassName}
        dangerouslySetInnerHTML={{ __html: styled }}
      />
    </h1>
  );
}
