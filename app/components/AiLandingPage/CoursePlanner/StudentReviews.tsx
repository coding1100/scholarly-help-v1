import { FC } from "react";
import Image from "next/image";
import SectionPill from "./SectionPill";
import { reviewsContent as c } from "./content";

/** Trustpilot-style green star row. */
const Stars: FC = () => (
  <span className="flex gap-1" aria-label="5 out of 5 stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className="flex h-8 w-8 items-center justify-center bg-[#00B67A] text-lg leading-none text-white"
        aria-hidden
      >
        ★
      </span>
    ))}
  </span>
);

/** Student review cards with the Trustpilot rating strip. */
const StudentReviews: FC = () => (
  <section className="bg-white py-16 md:py-20">
    <div className="mx-auto max-w-[1240px] px-4">
      <SectionPill>{c.eyebrow}</SectionPill>
      <h2 className="mt-6 text-center text-3xl font-bold text-[#17172B] md:text-5xl">
        {c.title}
      </h2>

      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <Image
            src="/images/trustpilotlogo.png"
            alt="Trustpilot"
            width={196}
            height={41}
          />
          <Stars />
        </div>
        <p className="text-base text-gray-600 md:text-lg">{c.ratingLine}</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {c.reviews.map((review) => (
          <div
            key={review.author}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-[0_10px_25px_-18px_rgba(43,28,80,0.35)]"
          >
            <div className="flex items-center gap-3">
              <Stars />
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <span aria-hidden>✓</span> Verified
              </span>
            </div>
            <p className="mt-5 flex-1 text-base leading-7 text-gray-700">
              &ldquo;{review.quote}&rdquo;
            </p>
            <div className="mt-6">
              <p className="font-semibold text-[#17172B]">{review.author}</p>
              <p className="text-sm text-gray-500">{review.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StudentReviews;
