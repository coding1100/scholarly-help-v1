import { FC } from "react";
import Link from "next/link";
import { heroContent } from "./content";

/**
 * Hero for the /tools/ai-course-planner landing page: badge, headline,
 * 3-step indicator, CTA into the real planner. Course Planner is a full
 * multi-step dashboard (not a single text-in/text-out tool), so the hero
 * links out to it rather than embedding the whole wizard inline — mirrors
 * GrammarCheckerHero / HumanizerHero in every other respect.
 */
const CoursePlannerHero: FC = () => (
  <section className="relative overflow-hidden bg-[linear-gradient(180deg,#EAF3FF_0%,#F2F9FF_55%,#F7FBFF_100%)]">
    {/* soft decorative washes matching the other landing heroes */}
    <div
      aria-hidden
      className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,#c7defb_0%,transparent_70%)] opacity-80"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,#c9d6fb_0%,transparent_70%)] opacity-80"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute -bottom-52 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,#dbeafe_0%,transparent_70%)] opacity-70"
    />

    <div className="relative mx-auto max-w-[1240px] px-4 pb-20 pt-10 text-center md:pb-28 md:pt-14">
      <span className="inline-block rounded-full bg-white px-7 py-3 text-sm font-medium text-gray-900 shadow-[0_18px_35px_-12px_rgba(43,28,80,0.2)] md:text-base">
        {heroContent.badge}
      </span>

      <h1 className="mt-7 text-4xl font-bold leading-[1.15] text-[#17172B] sm:text-5xl md:text-[56px]">
        {heroContent.titleTop}{" "}
        <span className="mt-1 block text-[#F56200]">
          {heroContent.titleAccent}
        </span>
      </h1>

      <p className="mx-auto mt-5 max-w-3xl text-base text-gray-800 md:text-lg">
        {heroContent.subtitle}
      </p>

      {/* step indicator */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
        {heroContent.steps.map((step, i) => (
          <div key={step} className="flex items-center gap-x-4">
            {i > 0 && (
              <span
                aria-hidden
                className="hidden w-14 border-t-2 border-dotted border-gray-400 sm:block"
              />
            )}
            <span className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  i === 0
                    ? "bg-primary-400 text-white"
                    : "border border-gray-400 bg-white text-gray-900"
                }`}
              >
                {i + 1}
              </span>
              <span className="text-base font-medium text-gray-900 md:text-lg">
                {step}
              </span>
            </span>
          </div>
        ))}
      </div>

      <Link
        href={heroContent.ctaHref}
        className="mt-10 inline-block rounded-md bg-[#F56200] px-10 py-4 text-lg font-semibold text-white shadow-[0_20px_40px_-12px_rgba(23,23,43,0.35)] transition-colors hover:bg-[#ff7a24]"
      >
        {heroContent.ctaButton}
      </Link>
    </div>
  </section>
);

export default CoursePlannerHero;
