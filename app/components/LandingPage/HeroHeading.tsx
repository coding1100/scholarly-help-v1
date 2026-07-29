import React from "react";
import { styleParentheticalText } from "./heroHeadingUtils";

/**
 * Server-only hero heading so the LCP text is in the initial HTML (no client render delay).
 */
export default function HeroHeading({
  mainHeading,
  spanClassName,
}: {
  mainHeading: string;
  /** Extra classes for the heading span (take-my-class needs "md:pt-5 block"). */
  spanClassName?: string;
}) {
  if (!mainHeading) {
    return (
      <h1 className="font-semibold text-[30px] md:text-[48px] leading-[1.1] text-black">
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
    <h1 className="font-semibold text-[30px] md:text-[48px] leading-[1.1] text-black">
      <span
        className={spanClassName}
        dangerouslySetInnerHTML={{ __html: styled }}
      />
    </h1>
  );
}
