import { FC } from "react";
import { useCasesContent as c } from "./content";

/** Six use-case cards on the light gray band ("Every student has a reason..."). */
const UseCases: FC = () => (
  <section className="bg-[#F3F4F9] py-16 md:py-20">
    <div className="mx-auto max-w-[1240px] px-4">
      <h2 className="text-center text-3xl font-bold text-[#17172B] md:text-5xl">
        {c.title}
      </h2>
      <p className="mt-5 text-center text-base text-gray-700 md:text-lg">
        {c.subtitle}
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {c.cards.map((card) => (
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
);

export default UseCases;
