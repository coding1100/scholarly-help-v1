import { FC } from "react";
import SectionPill from "./SectionPill";
import { beforeAfterContent as c } from "./content";

/** "Before vs After" comparison — lavender paste card vs purple result card. */
const BeforeAfter: FC = () => (
  <section className="bg-white py-16 md:py-20">
    <div className="mx-auto max-w-[1240px] px-4">
      <SectionPill>{c.eyebrow}</SectionPill>
      <h2 className="mt-6 text-center text-3xl font-bold text-[#17172B] md:text-5xl">
        {c.title}
      </h2>
      <p className="mx-auto mt-5 max-w-4xl text-center text-base text-gray-700 md:text-lg">
        {c.subtitle}
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {/* What you paste */}
        <div className="flex flex-col rounded-2xl bg-primary-200 p-7 md:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-800">
            <span aria-hidden>📄</span> {c.pasteLabel}
          </p>
          <div className="mt-6 flex-1 rounded-xl border border-gray-200 bg-white p-6 md:p-8">
            <p
              className="text-base leading-7 text-gray-800 md:text-lg md:leading-8"
              dangerouslySetInnerHTML={{ __html: c.pasteHtml || c.pasteText }}
            />
          </div>
        </div>

        {/* What you get back */}
        <div className="flex flex-col rounded-2xl bg-primary-400 p-7 md:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
            <span aria-hidden>✨</span> {c.resultLabel}
          </p>
          <div className="mt-6 flex-1 rounded-xl bg-white p-6 md:p-8">
            <p
              className="text-base leading-7 text-gray-800 md:text-lg md:leading-8"
              dangerouslySetInnerHTML={{ __html: c.resultHtml || c.resultText }}
            />
            <div className="mt-6 flex flex-nowrap gap-2 md:gap-3">
              {c.tags.map((tag) => (
                <span
                  key={tag.label}
                  className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium md:px-3 md:text-sm ${tag.className}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default BeforeAfter;
