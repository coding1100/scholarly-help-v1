import { FC } from "react";
import QuoteBandForm from "./QuoteBandForm";
import type { CtaBandSectionContent } from "./types";

/** Dark gradient band with checks and an email + phone quote form. */
const CtaBandSection: FC<{ content: CtaBandSectionContent }> = ({ content: c }) => (
  <section className="bg-[#F4F3FD] px-4 py-7 md:px-6 md:py-14">
    <div className="mx-auto flex max-w-[1000px] flex-col gap-3 rounded-2xl border-t-[5px] border-[#F26A1B] bg-[linear-gradient(135deg,#161A33_0%,#262B5C_100%)] px-[18px] py-[22px] text-white shadow-[0_14px_32px_rgba(22,26,51,0.30)] md:gap-4 md:rounded-[18px] md:px-9 md:py-[34px] md:shadow-[0_18px_44px_rgba(22,26,51,0.30)]">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full bg-[#F26A1B] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.05em]">
          {c.tag}
        </span>
        {c.tagline ? (
          <span className="hidden text-[13px] text-[#C9CBE6] md:inline">{c.tagline}</span>
        ) : null}
      </div>
      <h2 className="text-2xl font-extrabold leading-[1.25] md:text-[32px] md:leading-[1.2]">
        {c.titleStart}
        {c.titleAccent ? (
          <>
            {" "}
            <span className="text-[#FF9A57]">{c.titleAccent}</span>
          </>
        ) : null}
      </h2>
      <ul className="flex flex-col gap-1.5 text-sm text-[#E4E6F7] md:flex-row md:flex-wrap md:gap-x-[26px] md:gap-y-2">
        {c.checks.map((check) => (
          <li key={check}>
            <span aria-hidden="true" className="text-[#4ADE80]">
              ✓
            </span>{" "}
            {check}
          </li>
        ))}
      </ul>
      <QuoteBandForm submitLabel={c.submitLabel} />
      <p className="text-xs leading-normal text-[#A9ACCB]">{c.note}</p>
    </div>
  </section>
);

export default CtaBandSection;
