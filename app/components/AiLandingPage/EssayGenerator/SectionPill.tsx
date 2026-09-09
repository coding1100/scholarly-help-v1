import { FC, ReactNode } from "react";

/** Floating white pill used as the section eyebrow across the landing page. */
const SectionPill: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className="flex justify-center">
    <span
      className={`inline-block rounded-full bg-white px-8 py-3 text-sm md:text-base font-medium text-gray-900 shadow-[0_18px_35px_-12px_rgba(43,28,80,0.25)] ${className}`}
    >
      {children}
    </span>
  </div>
);

export default SectionPill;
