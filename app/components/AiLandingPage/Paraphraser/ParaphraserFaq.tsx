"use client";

import { FC, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { faqContent as c } from "./content";

/** Accordion FAQ with the outlined navy cards from the Figma frame. */
const ParaphraserFaq: FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[820px] px-4">
        <h2 className="text-center text-3xl font-bold text-[#17172B] md:text-5xl">
          {c.title}
        </h2>
        <p className="mt-5 text-center text-base text-gray-700 md:text-lg">
          {c.subtitle}
        </p>

        <div className="mt-12 space-y-5">
          {c.items.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={item.question}
                className="rounded-lg border border-primary-500 bg-white"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left"
                >
                  <span className="text-lg font-semibold text-primary-500">
                    {item.question}
                  </span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  >
                    <FaChevronDown className="h-4 w-4" />
                  </span>
                </button>
                {open && (
                  <p className="px-6 pb-6 text-base leading-7 text-gray-600">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ParaphraserFaq;
