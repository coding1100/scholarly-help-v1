import { FC } from "react";
import Link from "next/link";
import { expertBannerContent as c } from "./content";

/** Dark full-width banner: "Get a real expert to rewrite it for you". */
const ExpertBanner: FC = () => (
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
      </div>
      <div className="text-center">
        <Link
          href={c.buttonHref}
          className="inline-block w-full max-w-sm rounded-md bg-[#F56200] px-10 py-5 text-xl font-semibold text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] transition-colors hover:bg-[#ff7a24]"
        >
          {c.button}
        </Link>
        <p className="mt-6 text-lg text-white/90">{c.note}</p>
      </div>
    </div>
  </section>
);

export default ExpertBanner;
