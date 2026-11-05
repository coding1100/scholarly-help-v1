import Link from "next/link";
import { normalizePathname } from "@/app/lib/takeMyClassLandingRoutes";
import { STUDY_GUIDES } from "./studyGuidesContent";

/** Three blog guides for this page, above the FAQ. Renders nothing for pages without content. */
export default function StudyGuides({ path }: { path: string }) {
  const content = STUDY_GUIDES[normalizePathname(path)];
  if (!content) return null;

  return (
    <section className="w-full bg-white px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-[1010px] text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5A5BE0]">
          Free Study Guides
        </p>
        <h2 className="mt-3 text-[28px] font-bold leading-tight text-[#000] md:text-[36px]">
          {content.heading}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-[#333]">
          {content.description}
        </p>

        <div className="mt-9 grid grid-cols-1 gap-5 text-left md:grid-cols-3">
          {content.cards.map((card) => (
            <article
              key={card.href + card.title}
              className="flex flex-col rounded-xl border border-[#E7E7F3] bg-white p-6"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#E8590C]">
                {card.category}
              </p>
              <h3 className="mt-2 text-[17px] font-bold leading-snug text-[#111]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#444]">
                {card.description}
              </p>
              <Link
                href={card.href}
                className="mt-auto pt-4 text-sm font-bold text-[#5A5BE0] hover:underline"
              >
                Read the guide &rarr;
              </Link>
            </article>
          ))}
        </div>

        <Link
          href={content.button.href}
          className="mt-8 inline-flex items-center justify-center rounded-md border border-[#2B2B2B] px-6 py-3 text-[15px] font-semibold text-[#111] transition hover:bg-[#F5F6FA]"
        >
          {content.button.label}
        </Link>
      </div>
    </section>
  );
}
