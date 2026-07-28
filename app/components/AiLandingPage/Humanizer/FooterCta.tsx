import { FC } from "react";
import Link from "next/link";
import { footerCtaContent as c } from "./content";

/** Dark patterned closer: "Your Deadline Won't Wait." with the two CTAs. */
const FooterCta: FC = () => (
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
        {c.titleStart}
        <span className="inline-block -rotate-6 rounded-full bg-primary-400 px-8 py-2 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.5)]">
          {c.titlePill}
        </span>
        {c.titleEnd}
      </h2>
      <p className="mx-auto mt-7 max-w-3xl text-base text-white/90 md:text-lg">
        {c.body}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
        <Link
          href={c.primaryHref}
          className="rounded-md bg-[#F56200] px-8 py-4 text-lg font-semibold text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] transition-colors hover:bg-[#ff7a24]"
        >
          {c.primaryButton}
        </Link>
        <Link
          href={c.secondaryHref}
          className="rounded-md border border-white/70 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-white/10"
        >
          {c.secondaryButton}
        </Link>
      </div>
    </div>
  </section>
);

export default FooterCta;
