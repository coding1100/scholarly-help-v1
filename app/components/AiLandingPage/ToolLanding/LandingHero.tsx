import { FC, ReactNode } from "react";

export interface LandingHeroContent {
  badge: string;
  titleTop: string;
  titleAccent: string;
  subtitle: string;
  steps: string[];
  /** Optional line rendered under the embedded tool card. */
  introLine?: string;
}

/**
 * Hero for tool landing pages: badge, headline, 3-step indicator, and the
 * real tool embedded as a card (passed as children). The background
 * approximates the Figma illustration with soft blue washes.
 */
const LandingHero: FC<{
  content: LandingHeroContent;
  /** Anchor id for the embedded tool card (used by "try it free" CTAs). */
  toolAnchorId: string;
  children: ReactNode;
}> = ({ content, toolAnchorId, children }) => (
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
        {content.badge}
      </span>

      <h1 className="mt-7 text-4xl font-bold leading-[1.15] text-[#17172B] sm:text-5xl md:text-[56px]">
        {content.titleTop}
        <span className="mt-1 block text-[#F56200]">{content.titleAccent}</span>
      </h1>

      <p className="mx-auto mt-5 max-w-3xl text-base text-gray-800 md:text-lg">
        {content.subtitle}
      </p>

      {/* step indicator */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
        {content.steps.map((step, i) => (
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

      {/* the real tool, styled as the hero card */}
      <div
        id={toolAnchorId}
        className="mx-auto mt-10 max-w-[1180px] scroll-mt-24 text-left"
      >
        {children}
      </div>

      {content.introLine && (
        <p className="mx-auto mt-8 max-w-4xl text-base leading-7 text-gray-700">
          {content.introLine}
        </p>
      )}
    </div>
  </section>
);

export default LandingHero;
