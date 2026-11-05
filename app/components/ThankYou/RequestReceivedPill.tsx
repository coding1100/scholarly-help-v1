import { FC } from "react";

/** "✓ Request received · 1 step left" badge shown at the top of the thank-you pages. */
const RequestReceivedPill: FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white border border-[#ECEAF4] shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-xs sm:text-sm font-medium text-[#111827] whitespace-nowrap ${className}`}
  >
    <span>
      <span className="text-[#16A34A]">✓</span> Request received{" "}
      <span className="text-[#9CA3AF]">·</span>{" "}
      <span className="font-semibold text-[#FF5A00]">1 step left</span>
    </span>
  </div>
);

export default RequestReceivedPill;
