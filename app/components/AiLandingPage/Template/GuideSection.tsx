"use client";

import { FC, useId, useState } from "react";
import { ContentLink, ORANGE_BUTTON } from "./ui";
import type { GuideBlock, GuideSectionContent } from "./types";

const prose = "text-[15px] leading-[1.7] text-[#333333] md:text-sm md:leading-[1.75]";

const Block: FC<{ block: GuideBlock }> = ({ block: b }) => {
  switch (b.type) {
    case "heading":
      return (
        <h2 className="text-[22px] font-bold leading-[1.25] md:mt-2 md:text-[28px]">
          {b.text}
        </h2>
      );
    case "subheading":
      return (
        <h3 className="mt-1 text-[17px] font-bold md:mt-2.5 md:text-[19px]">{b.text}</h3>
      );
    case "paragraph":
      return <p className={prose}>{b.text}</p>;
    case "list": {
      const List = b.ordered ? "ol" : "ul";
      return (
        <List
          className={`flex flex-col gap-1.5 pl-5 ${b.ordered ? "list-decimal" : "list-disc"} ${prose}`}
        >
          {b.items.map((item) => (
            <li key={item.lead ?? item.text}>
              {item.lead ? <strong>{item.lead}</strong> : null}
              {item.lead ? " " : null}
              {item.text}
            </li>
          ))}
        </List>
      );
    }
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-[#E2E2EA] bg-white">
          <table className="w-full min-w-[520px] border-collapse text-left text-[13px] md:text-xs">
            <thead>
              <tr className="bg-[#3B3A5C] text-white">
                {b.head.map((cell) => (
                  <th key={cell} scope="col" className="p-2.5 font-semibold md:p-3">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row) => (
                <tr key={row.join("|")} className="border-b border-[#E2E2EA] last:border-b-0">
                  {row.map((cell, index) => (
                    <td key={b.head[index]} className="p-2.5 align-top md:p-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout":
      return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#FBD3B8] bg-[#FFF4EC] p-4">
          <p className="text-[13px] leading-normal">
            {b.lead ? <strong>{b.lead}</strong> : null}
            {b.lead ? " " : null}
            {b.text}
          </p>
          {b.button ? (
            <ContentLink
              link={b.button}
              className={`${ORANGE_BUTTON} rounded px-4 py-2.5 text-xs`}
            />
          ) : null}
        </div>
      );
  }
};

/**
 * Long-form guide. On mobile the blocks up to the first paragraph show until
 * "Read the full guide" is tapped; the rest stays in the markup (hidden with
 * CSS) so the full text is still in the page.
 */
const GuideSection: FC<{ content: GuideSectionContent }> = ({ content: c }) => {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const previewEnd = c.blocks.findIndex((block) => block.type === "paragraph") + 1;
  const preview = c.blocks.slice(0, previewEnd);
  const rest = c.blocks.slice(previewEnd);

  return (
    <section className="bg-[#F7F7FC]">
      <div className="mx-auto flex max-w-[760px] flex-col gap-3 px-4 py-7 md:gap-3.5 md:px-6 md:py-14">
        {preview.map((block, index) => (
          <Block key={index} block={block} />
        ))}

        {rest.length > 0 ? (
          <>
            <div
              id={bodyId}
              className={`${open ? "flex" : "hidden"} flex-col gap-3 md:flex md:gap-3.5`}
            >
              {rest.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </div>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={bodyId}
              onClick={() => setOpen((value) => !value)}
              className="min-h-[44px] self-start text-sm font-bold text-[#5B4FE0] md:hidden"
            >
              {open ? "Show less ↑" : "Read the full guide ↓"}
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default GuideSection;
