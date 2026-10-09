import Image from "next/image";
import Link from "next/link";
import type { BlogBlock, HelpBox, StatsStrip } from "@/app/lib/blog/types";
import { youtubeId } from "@/app/lib/blog/utils";
import { FeatureIconSvg, PlusIcon } from "./BlogIcons";

export function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const id = youtubeId(url);
  if (!id) return null;
  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${id}`}
      title={title}
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

function CtaButton({ label, url }: { label: string; url: string }) {
  if (!label || !url) return null;
  const external = /^https?:\/\//.test(url);
  return external ? (
    <a href={url} className="blog-btn-light" target="_blank" rel="noopener noreferrer">{label}</a>
  ) : (
    <Link href={url} className="blog-btn-light">{label}</Link>
  );
}

export { CtaButton };

export function StatsStripView({ stats }: { stats: StatsStrip }) {
  if (!stats.enabled || !stats.items.length) return null;
  return (
    <div className="blog-stats">
      {stats.items.map((item, i) => (
        <div key={i} className="blog-stat">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function HelpBoxView({ help }: { help: HelpBox }) {
  if (!help.enabled || !help.heading) return null;
  const button = (label: string, url: string, cls: string) =>
    label && url ? (
      /^https?:\/\//.test(url) ? (
        <a href={url} className={cls} target="_blank" rel="noopener noreferrer">{label}</a>
      ) : (
        // No prefetch: /order/ initialises Stripe on load, which only needs to happen on click.
        <Link href={url} className={cls} prefetch={false}>{label}</Link>
      )
    ) : null;
  return (
    <aside className="blog-help">
      <div className="blog-help-title">{help.heading}</div>
      {help.text && <p>{help.text}</p>}
      <div className="blog-help-actions">
        {button(help.primaryLabel, help.primaryUrl, "blog-pill blog-pill-solid")}
        {button(help.secondaryLabel, help.secondaryUrl, "blog-pill blog-pill-ghost")}
      </div>
    </aside>
  );
}

/** Renders stored post blocks. Rich-text HTML is sanitized on save, so it is safe to inject here. */
export function BlogBlocks({
  blocks,
  anchors,
  stats,
}: {
  blocks: BlogBlock[];
  anchors: Record<string, string>;
  stats: StatsStrip;
}) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case "richText":
            return <div key={block.id} className="blog-rich" dangerouslySetInnerHTML={{ __html: block.html }} />;
          case "image":
            return (
              <figure key={block.id} className="blog-figure">
                <div className="blog-figure-img">
                  <Image src={block.url} alt={block.alt} width={1200} height={675} sizes="(max-width: 1100px) 100vw, 760px" style={{ width: "100%", height: "auto" }} />
                </div>
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );
          case "featureGrid":
            return (
              <section key={block.id}>
                {block.title && <h2 className="blog-block-title" id={anchors[block.id]}>{block.title}</h2>}
                <div className="blog-features">
                  {block.items.map((item, i) => (
                    <div key={i} className="blog-feature">
                      <FeatureIconSvg icon={item.icon} />
                      <div className="blog-feature-title">{item.title}</div>
                      {item.text && <p>{item.text}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          case "cta":
            return (
              <aside key={block.id} className="blog-cta">
                <div>
                  <div className="blog-cta-title">{block.heading}</div>
                  {block.text && <p>{block.text}</p>}
                  {block.bullets && block.bullets.length > 0 && (
                    <ul className="blog-cta-list">
                      {block.bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  )}
                </div>
                <CtaButton label={block.buttonLabel} url={block.buttonUrl} />
              </aside>
            );
          case "linkCards":
            return (
              <div key={block.id} className="blog-link-cards">
                {block.items.map((item, i) => (
                  <Link key={i} href={item.url} className="blog-link-card">
                    {item.imageUrl && (
                      <span className="blog-link-card-img">
                        <Image src={item.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 240px" style={{ objectFit: "cover" }} />
                      </span>
                    )}
                    <h3 className="blog-link-card-title">{item.title}</h3>
                  </Link>
                ))}
              </div>
            );
          case "stats":
            return <StatsStripView key={block.id} stats={stats} />;
          case "video":
            return (
              <div key={block.id} className="blog-video">
                <YouTubeEmbed url={block.url} title="Video" />
              </div>
            );
          case "faq":
            return (
              <section key={block.id}>
                <h2 className="blog-block-title" id={anchors[block.id]}>{block.title || "Frequently Asked Questions"}</h2>
                <div className="blog-faq">
                  {block.items.map((item, i) => (
                    <details key={i} className="blog-faq-item" open={i === 0}>
                      <summary className="blog-faq-q">
                        {item.question}
                        <span className="blog-faq-toggle"><PlusIcon className="h-3.5 w-3.5" /></span>
                      </summary>
                      <div className="blog-faq-a">{item.answer}</div>
                    </details>
                  ))}
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
