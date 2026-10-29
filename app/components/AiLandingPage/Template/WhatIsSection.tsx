import { FC, Fragment } from "react";
import type { WhatIsSectionContent } from "./types";

/** Definition copy beside an "At a glance" fact box. */
const WhatIsSection: FC<{ content: WhatIsSectionContent }> = ({
  content: c,
}) => (
  <section className="mx-auto flex max-w-[1000px] flex-col gap-2.5 px-4 pb-2 pt-8 md:flex-row md:flex-wrap md:items-center md:gap-10 md:px-6 md:pt-14">
    <div className="flex flex-col gap-2.5 md:flex-[1_1_520px] md:gap-3">
      <h2 className="text-[22px] font-bold leading-[1.3] md:text-[28px] md:leading-[1.25]">
        {c.title}
      </h2>
      {c.paragraphs.map((paragraph) => (
        <p
          key={paragraph}
          className="text-[15px] leading-[1.65] text-[#333333] md:text-sm md:leading-[1.7]"
        >
          {paragraph}
        </p>
      ))}
    </div>

    <div className="rounded-[10px] bg-[#EFEEFB] p-3.5 md:flex md:flex-[1_1_300px] md:flex-col md:gap-2.5 md:p-5">
      <h3 className="hidden text-sm font-bold md:block">At a glance</h3>
      <dl className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 text-[13px] leading-normal md:gap-x-3 md:gap-y-2 md:text-xs">
        {c.glance.map((row) => (
          <Fragment key={row.label}>
            <dt className="text-[#555555]">{row.label}</dt>
            <dd className="font-semibold">{row.value}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  </section>
);

export default WhatIsSection;
