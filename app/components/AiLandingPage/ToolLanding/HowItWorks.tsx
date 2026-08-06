import { FC } from "react";
import Link from "next/link";

export interface HowItWorksContent {
  eyebrow: string;
  title: string;
  steps: { title: string; description: string }[];
  ctaTitleStart: string;
  ctaTitleBrand: string;
  ctaTitlePill: string;
  ctaTitleEnd: string;
  ctaBody: string;
  ctaButton: string;
  ctaHref: string;
  /** Optional outline button rendered beside the primary CTA. */
  ctaSecondaryButton?: string;
  ctaSecondaryHref?: string;
}

/**
 * Dark 4-step card that overlaps the purple "Want all ScholarlyHelp tools"
 * band beneath it, matching the Figma layering.
 */
const HowItWorks: FC<{ content: HowItWorksContent }> = ({ content: c }) => (
  <>
    <section className="relative bg-white pt-16 md:pt-20">
      {/* purple underlay behind the lower half of the dark card */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 top-[62%] bg-[#8375D9]"
      />
      <div className="relative mx-auto max-w-[1300px] px-4">
        <div className="rounded-[32px] bg-[#3C3D5D] px-6 py-12 md:px-12 md:py-16">
          <p className="text-center text-base font-medium text-white/90 md:text-lg">
            {c.eyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-4xl text-center text-3xl font-bold text-white md:text-5xl">
            {c.title}
          </h2>

          <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {c.steps.map((step, i) => (
              <div
                key={step.title}
                className={`px-2 text-center lg:px-6 ${
                  i > 0 ? "lg:border-l lg:border-white/15" : ""
                }`}
              >
                <div className="relative mx-auto h-28 w-28">
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-[35%] -translate-y-1/2 rounded-full bg-white/5"
                  />
                  <span className="relative flex h-full items-center justify-center text-[88px] font-bold leading-none text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-8 text-[26px] font-semibold leading-snug text-white">
                  {step.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-white/85">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* purple CTA band */}
    <section className="bg-[#8375D9] pb-20 pt-14 md:pb-24 md:pt-16">
      <div className="mx-auto max-w-[1240px] px-4 text-center">
        <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl">
          {c.ctaTitleStart} {c.ctaTitleBrand}
          <span className="mt-3 flex items-center justify-center gap-4">
            <span className="inline-block -rotate-3 rounded-full bg-primary-400 px-7 py-1.5 shadow-[0_14px_30px_-10px_rgba(23,23,43,0.5)]">
              {c.ctaTitlePill}
            </span>
            {c.ctaTitleEnd}
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/95 md:text-lg">
          {c.ctaBody}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
          <Link
            href={c.ctaHref}
            className="inline-block rounded-md bg-[#F56200] px-10 py-4 text-lg font-semibold text-white shadow-[0_20px_40px_-12px_rgba(23,23,43,0.55)] transition-colors hover:bg-[#ff7a24]"
          >
            {c.ctaButton}
          </Link>
          {c.ctaSecondaryButton && c.ctaSecondaryHref && (
            <Link
              href={c.ctaSecondaryHref}
              className="inline-block rounded-md border border-white/80 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-white/10"
            >
              {c.ctaSecondaryButton}
            </Link>
          )}
        </div>
      </div>
    </section>
  </>
);

export default HowItWorks;
