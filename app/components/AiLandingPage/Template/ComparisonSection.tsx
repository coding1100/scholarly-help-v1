import { FC } from "react";
import { SECTION_WIDTH, SectionHeading } from "./ui";
import type { ComparisonSectionContent } from "./types";

const cell = "p-2.5 md:p-3";

/** This tool against two alternatives and the done-for-you option. */
const ComparisonSection: FC<{ content: ComparisonSectionContent }> = ({
  content: c,
}) => (
  <section className={`${SECTION_WIDTH} flex flex-col gap-2.5 pb-2 pt-7 md:pt-14`}>
    <SectionHeading title={c.title} subtitle={c.subtitle} />
    <p className="text-xs text-[#555555] md:hidden">Swipe to compare →</p>
    <div className="overflow-x-auto rounded-lg border border-[#E2E2EA] md:mt-3.5 md:rounded-none md:border-0">
      <table className="w-full min-w-[620px] border-collapse text-left text-[13px] md:min-w-[720px] md:text-xs">
        <thead>
          <tr className="bg-[#3B3A5C] text-white">
            <td className={cell} />
            {c.columns.map((column) => (
              <th key={column} scope="col" className={`${cell} font-semibold`}>
                {column}
              </th>
            ))}
            <th scope="col" className={`${cell} bg-[#5B4FE0] font-semibold`}>
              {c.highlight}
            </th>
          </tr>
        </thead>
        <tbody>
          {c.rows.map((row) => (
            <tr key={row.label} className="border-b border-[#E2E2EA] last:border-b-0">
              <th scope="row" className={`${cell} font-semibold`}>
                {row.label}
              </th>
              {row.values.map((value, index) => (
                <td key={c.columns[index]} className={cell}>
                  {value}
                </td>
              ))}
              <td className={`${cell} bg-[#F4F3FD]`}>{row.highlight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default ComparisonSection;
