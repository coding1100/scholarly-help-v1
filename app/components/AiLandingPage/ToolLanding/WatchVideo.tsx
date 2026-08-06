import { FC } from "react";
import SectionPill from "./SectionPill";

export interface WatchVideoContent {
  eyebrow: string;
  title: string;
  /** YouTube embed URL; leave empty to hide the section until the video is ready. */
  youtubeEmbedUrl: string;
}

/** Promo video under the "WATCH VIDEO" pill — a centered rounded card. */
const WatchVideo: FC<{ content: WatchVideoContent }> = ({ content: c }) => {
  if (!c.youtubeEmbedUrl) return null;
  return (
    <section className="bg-white pt-16 md:pt-20">
      <SectionPill className="uppercase tracking-[0.08em]">
        {c.eyebrow}
      </SectionPill>
      <h2 className="mx-auto mt-6 max-w-5xl px-4 text-center text-3xl font-bold text-[#17172B] md:text-5xl">
        {c.title}
      </h2>
      <div className="mx-auto mt-12 max-w-[1240px] px-4 md:px-8">
        <div className="overflow-hidden rounded-2xl bg-black shadow-[0_24px_50px_-20px_rgba(43,28,80,0.35)] md:rounded-3xl">
          <iframe
            className="aspect-video w-full"
            src={c.youtubeEmbedUrl}
            title={c.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
};

export default WatchVideo;
