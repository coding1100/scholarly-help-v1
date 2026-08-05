import Link from "next/link";
import { Suspense } from "react";
import SectionPill from "@/app/components/AiLandingPage/Humanizer/SectionPill";
import LandingFaq from "./LandingFaq";
import WatchVideo from "./WatchVideo";
import type { LandingStep, ToolLandingProps } from "./types";

const NUMBER_COLORS = ["#8BC34A", "#26A69A", "#00BCD4", "#2196F3"];

const StepList = ({ steps }: { steps: LandingStep[] }) => (
  <div className="relative flex-1 rounded-2xl bg-white p-6 md:p-8">
    <span
      aria-hidden
      className="absolute bottom-16 left-[52px] top-16 border-l-2 border-dashed border-gray-300 md:left-[64px]"
    />
    <div className="relative space-y-9">
      {steps.map((step, index) => (
        <div key={step.title} className="flex items-start gap-5">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white text-2xl font-bold"
            style={{ color: NUMBER_COLORS[index % NUMBER_COLORS.length] }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h4 className="text-xl font-semibold text-[#17172B] md:text-2xl">
              {step.title}
            </h4>
            <p className="mt-2 text-base leading-7 text-gray-600">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ToolLanding = ({ content: c, tool }: ToolLandingProps) => (
  <div className="font-poppins">
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#EAF3FF_0%,#F2F9FF_55%,#F7FBFF_100%)]">
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
      <div className="relative mx-auto max-w-[1240px] px-4 pb-16 pt-10 text-center md:pb-20 md:pt-14">
        <span className="inline-block rounded-full bg-white px-7 py-3 text-sm font-medium text-gray-900 shadow-[0_18px_35px_-12px_rgba(43,28,80,0.2)] md:text-base">
          {c.hero.badge}
        </span>
        <h1 className="mt-7 text-4xl font-bold leading-[1.15] text-[#17172B] sm:text-5xl md:text-[56px]">
          {c.hero.titleTop}
          <span className="mt-1 block text-[#F56200]">
            {c.hero.titleAccent}
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-base text-gray-800 md:text-lg">
          {c.hero.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          {c.hero.steps.map((step, index) => (
            <div key={step} className="flex items-center gap-x-4">
              {index > 0 ? (
                <span
                  aria-hidden
                  className="hidden w-14 border-t-2 border-dotted border-gray-400 sm:block"
                />
              ) : null}
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    index === 0
                      ? "bg-primary-400 text-white"
                      : "border border-gray-400 bg-white text-gray-900"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-base font-medium text-gray-900 md:text-lg">
                  {step}
                </span>
              </span>
            </div>
          ))}
        </div>
        <div
          id={c.hero.toolId}
          className="mx-auto mt-10 max-w-[1180px] scroll-mt-24 text-left"
        >
          <Suspense
            fallback={
              <div className="h-[360px] animate-pulse rounded-2xl bg-white/70" />
            }
          >
            {tool}
          </Suspense>
        </div>
      </div>
    </section>

    {c.beforeAfter ? (
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1240px] px-4">
          <SectionPill>{c.beforeAfter.eyebrow}</SectionPill>
          <h2 className="mt-6 text-center text-3xl font-bold text-[#17172B] md:text-5xl">
            {c.beforeAfter.title}
          </h2>
          <p className="mx-auto mt-5 max-w-4xl text-center text-base text-gray-700 md:text-lg">
            {c.beforeAfter.subtitle}
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* What you paste */}
            <div className="flex flex-col rounded-2xl bg-primary-200 p-7 md:p-8">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-800">
                <span aria-hidden>📄</span> {c.beforeAfter.pasteLabel}
              </p>
              <div className="mt-6 flex-1 rounded-xl border border-gray-200 bg-white p-6 md:p-8">
                <p
                  className="text-base leading-7 text-gray-800 md:text-lg md:leading-8"
                  dangerouslySetInnerHTML={{
                    __html: c.beforeAfter.pasteHtml || c.beforeAfter.pasteText,
                  }}
                />
              </div>
            </div>

            {/* What you get back */}
            <div className="flex flex-col rounded-2xl bg-primary-400 p-7 md:p-8">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
                <span aria-hidden>✨</span> {c.beforeAfter.resultLabel}
              </p>
              <div className="mt-6 flex-1 rounded-xl bg-white p-6 md:p-8">
                <div
                  className="text-base leading-7 text-gray-800 md:text-lg md:leading-8 space-y-2"
                  dangerouslySetInnerHTML={{
                    __html: c.beforeAfter.resultHtml || c.beforeAfter.resultText,
                  }}
                />
                {c.beforeAfter.tags && c.beforeAfter.tags.length > 0 && (
                  <div className="mt-6 flex flex-nowrap gap-2 md:gap-3">
                    {c.beforeAfter.tags.map((tag) => (
                      <span
                        key={tag.label}
                        className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium md:px-3 md:text-sm ${tag.className}`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    ) : null}

    <section className="bg-[#F3F4F9] py-16 md:py-20">
      <div className="mx-auto max-w-[1240px] px-4">
        <SectionPill>{c.useCases.eyebrow}</SectionPill>
        <h2 className="mt-6 text-center text-3xl font-bold text-[#17172B] md:text-5xl">
          {c.useCases.title}
        </h2>
        <p className="mt-5 text-center text-base text-gray-700 md:text-lg">
          {c.useCases.subtitle}
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {c.useCases.cards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl bg-white p-6 shadow-[0_10px_25px_-15px_rgba(43,28,80,0.2)] md:p-7"
            >
              <span aria-hidden className="block text-4xl leading-none">
                {card.icon}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-[#17172B] md:text-2xl">
                {card.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-gray-500">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="relative bg-white pt-16 md:pt-20">
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 top-[62%] bg-[#8375D9]"
      />
      <div className="relative mx-auto max-w-[1300px] px-4">
        <div className="rounded-[32px] bg-[#3C3D5D] px-6 py-12 md:px-12 md:py-16">
          <p className="text-center text-base font-medium text-white/90 md:text-lg">
            {c.howItWorks.eyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-4xl text-center text-3xl font-bold text-white md:text-5xl">
            {c.howItWorks.title}
          </h2>
          <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {c.howItWorks.steps.map((step, index) => (
              <div
                key={step.title}
                className={`px-2 text-center lg:px-6 ${
                  index > 0 ? "lg:border-l lg:border-white/15" : ""
                }`}
              >
                <div className="relative mx-auto h-28 w-28">
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-[35%] -translate-y-1/2 rounded-full bg-white/5"
                  />
                  <span className="relative flex h-full items-center justify-center text-[88px] font-bold leading-none text-white">
                    {index + 1}
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
    <section className="bg-[#8375D9] pb-20 pt-14 md:pb-24 md:pt-16">
      <div className="mx-auto max-w-[1240px] px-4 text-center">
        <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl">
          {c.howItWorks.ctaTitle}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/95 md:text-lg">
          {c.howItWorks.ctaBody}
        </p>
        <Link
          href={c.howItWorks.ctaHref}
          className="mt-9 inline-block rounded-md bg-[#F56200] px-10 py-4 text-lg font-semibold text-white shadow-[0_20px_40px_-12px_rgba(23,23,43,0.55)] transition-colors hover:bg-[#ff7a24]"
        >
          {c.howItWorks.ctaButton}
        </Link>
      </div>
    </section>

    <section className="bg-[#F3F4F9] py-16 md:py-20">
      <div className="mx-auto max-w-[1240px] px-4">
        <SectionPill>{c.whyItWorks.eyebrow}</SectionPill>
        <h2 className="mt-6 text-center text-3xl font-bold text-[#17172B] md:text-5xl">
          {c.whyItWorks.title}
        </h2>
        <p className="mt-5 text-center text-base text-gray-700 md:text-lg">
          {c.whyItWorks.subtitle}
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {c.whyItWorks.features.map((feature) => (
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

    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[1300px] px-4">
        <SectionPill>{c.twoWays.eyebrow}</SectionPill>
        <h2 className="mt-6 text-center text-3xl font-bold text-[#17172B] md:text-5xl">
          {c.twoWays.title}
        </h2>
        <p className="mt-5 text-center text-base text-gray-700 md:text-lg">
          {c.twoWays.subtitle}
        </p>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {[
            { column: c.twoWays.freeColumn, color: "bg-[#9F92EC]" },
            { column: c.twoWays.expertColumn, color: "bg-primary-400" },
          ].map(({ column, color }) => (
            <div
              key={column.heading}
              className={`flex flex-col rounded-3xl p-5 md:p-6 ${color}`}
            >
              <div className="px-2 py-4">
                <h3 className="text-2xl font-semibold text-white md:text-3xl">
                  {column.heading}
                </h3>
                <p className="mt-2 text-base text-white/85 md:text-lg">
                  {column.subheading}
                </p>
              </div>
              <StepList steps={column.steps} />
            </div>
          ))}
        </div>
      </div>
    </section>

    {c.watchVideo ? <WatchVideo content={c.watchVideo} /> : null}

    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[1240px] px-4">
        <SectionPill>{c.reviews.eyebrow}</SectionPill>
        <h2 className="mt-6 text-center text-3xl font-bold text-[#17172B] md:text-5xl">
          {c.reviews.title}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {c.reviews.reviews.map((review) => (
            <article
              key={review.author}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-[0_10px_25px_-18px_rgba(43,28,80,0.35)]"
            >
              <div className="flex gap-1" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    aria-hidden
                    className="flex h-8 w-8 items-center justify-center bg-[#00B67A] text-lg text-white"
                  >
                    ★
                  </span>
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-base leading-7 text-gray-700">
                “{review.quote}”
              </blockquote>
              <div className="mt-6">
                <p className="font-semibold text-[#17172B]">{review.author}</p>
                <p className="text-sm text-gray-500">{review.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <LandingFaq content={c.faq} />

    <section
      className="bg-[#3D3D5E] py-20 md:py-24"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)",
        backgroundSize: "26px 26px",
      }}
    >
      <div className="mx-auto max-w-[1240px] px-4 text-center">
        <h2 className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-4xl font-bold text-white md:text-[56px]">
          {c.footer.titleStart}
          <span className="inline-block -rotate-6 rounded-full bg-primary-400 px-8 py-2 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.5)]">
            {c.footer.titlePill}
          </span>
        </h2>
        <p className="mx-auto mt-7 max-w-3xl text-base text-white/90 md:text-lg">
          {c.footer.body}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <Link
            href={c.footer.primaryHref}
            className="rounded-md bg-[#F56200] px-8 py-4 text-lg font-semibold text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] transition-colors hover:bg-[#ff7a24]"
          >
            {c.footer.primaryButton}
          </Link>
          <Link
            href={c.footer.secondaryHref}
            className="rounded-md border border-white/70 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-white/10"
          >
            {c.footer.secondaryButton}
          </Link>
        </div>
        {c.footer.footnote ? (
          <p className="mt-6 text-sm text-white/75">{c.footer.footnote}</p>
        ) : null}
      </div>
    </section>
  </div>
);

export default ToolLanding;
