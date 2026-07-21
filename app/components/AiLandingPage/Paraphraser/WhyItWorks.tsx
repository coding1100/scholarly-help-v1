import { FC } from "react";
import SectionPill from "./SectionPill";
import { whyItWorksContent as c } from "./content";

/** Three feature cards ("Not a word swapper, a proper re-writer"). */
const WhyItWorks: FC = () => (
  <section className="bg-[#F3F4F9] py-16 md:py-20">
    <div className="mx-auto max-w-[1240px] px-4">
      <SectionPill>{c.eyebrow}</SectionPill>
      <h2 className="mt-6 text-center text-3xl font-bold text-[#17172B] md:text-5xl">
        {c.title}
      </h2>
      <p className="mt-5 text-center text-base text-gray-700 md:text-lg">
        {c.subtitle}
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {c.features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl bg-white p-7 shadow-[0_10px_25px_-15px_rgba(43,28,80,0.2)] md:p-8"
          >
            <span aria-hidden className="text-5xl leading-none">
              {feature.icon}
            </span>
            <h3 className="mt-6 text-xl font-semibold text-[#17172B] md:text-2xl">
              {feature.title}
            </h3>
            <p className="mt-3 text-base leading-7 text-gray-500">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyItWorks;
