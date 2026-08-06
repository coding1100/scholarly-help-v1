import { FC } from "react";
import Link from "next/link";

export interface ExpertBannerContent {
  tag: string;
  title: string;
  body: string;
  /** Optional short perk bullets shown under the body. */
  perks?: string[];
  button: string;
  buttonHref: string;
  /** Optional line under the button (e.g. "Free quote in 2 min"). */
  note?: string;
}

/** Dark full-width banner pitching the expert service. */
const ExpertBanner: FC<{ content: ExpertBannerContent }> = ({ content: c }) => (
  <section className="bg-[#3D3D5E] py-16 md:py-24">
    <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <p className="text-base text-white/85 md:text-lg">{c.tag}</p>
        <h2 className="mt-3 text-3xl font-bold leading-tight text-white md:text-5xl">
          {c.title}
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
          {c.body}
        </p>
        {c.perks && c.perks.length > 0 && (
          <ul className="mt-6 flex max-w-2xl flex-wrap gap-x-6 gap-y-3">
            {c.perks.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-2 text-base text-white/90"
              >
                <span aria-hidden className="font-bold text-[#8BC34A]">
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="text-center">
        <Link
          href={c.buttonHref}
          className="inline-block w-full max-w-sm rounded-md bg-[#F56200] px-10 py-5 text-xl font-semibold text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] transition-colors hover:bg-[#ff7a24]"
        >
          {c.button}
        </Link>
        {c.note && <p className="mt-6 text-lg text-white/90">{c.note}</p>}
      </div>
    </div>
  </section>
);

export default ExpertBanner;
