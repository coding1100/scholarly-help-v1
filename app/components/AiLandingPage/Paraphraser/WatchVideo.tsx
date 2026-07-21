import { FC } from "react";
import SectionPill from "./SectionPill";
import { watchVideoContent as c } from "./content";

/** Full-bleed promo video under the "WATCH VIDEO" pill, as in the Figma frame. */
const WatchVideo: FC = () => (
  <section className="bg-white pt-16 md:pt-20">
    <SectionPill className="uppercase tracking-[0.08em]">{c.eyebrow}</SectionPill>
    <h2 className="mx-auto mt-6 max-w-5xl px-4 text-center text-3xl font-bold text-[#17172B] md:text-5xl">
      {c.title}
    </h2>
    <video
      className="mt-12 aspect-video max-h-[820px] w-full bg-black object-cover"
      src={c.videoSrc}
      controls
      preload="metadata"
      playsInline
    />
  </section>
);

export default WatchVideo;
