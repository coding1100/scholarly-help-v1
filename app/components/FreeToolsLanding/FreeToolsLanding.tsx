import type { CSSProperties } from "react";
import Image, { StaticImageData } from "next/image";
import { FiBriefcase } from "react-icons/fi";
import Canvas from "@/app/assets/Images/canvas.png";
import Blackboard from "@/app/assets/Images/blackboard.png";
import McGrawHill from "@/app/assets/Images/mcgrawhill.png";
import Pearson from "@/app/assets/Images/pearson.png";
import Cengage from "@/app/assets/Images/cengage.png";
import Moodle from "@/app/assets/Images/moodle.png";
import FreeToolsLeadForm from "./FreeToolsLeadForm";

const PLATFORMS: { src: StaticImageData; alt: string }[] = [
  { src: Canvas, alt: "Canvas" },
  { src: Blackboard, alt: "Blackboard" },
  { src: McGrawHill, alt: "McGraw Hill" },
  { src: Pearson, alt: "Pearson" },
  { src: Cengage, alt: "Cengage" },
  { src: Moodle, alt: "Moodle" },
];

/**
 * Single-screen free-tools squeeze page shared by /take-my-class-2, -3 and -4:
 * audience banner, headline, email + mobile form and the platform logo strip,
 * all inside the first viewport.
 */
export default function FreeToolsLanding() {
  return (
    <div className="flex min-h-[100svh] flex-col bg-white">
      <p className="flex items-center justify-center gap-1.5 bg-[#3B3486] px-4 py-2.5 text-center text-[13px] font-bold leading-[19px] text-white md:gap-2 md:py-3 md:text-[15px] md:leading-[23px]">
        <FiBriefcase aria-hidden className="h-[13px] w-[13px] shrink-0 md:h-4 md:w-4" />
        For working professionals taking online classes
      </p>

      <main className="flex flex-1 flex-col items-center bg-[linear-gradient(180deg,#EFF1FD_0%,#FFFFFF_100%)] bg-[length:100%_500px] bg-no-repeat px-5 pb-6 pt-7 text-center md:justify-center md:bg-[length:100%_580px] md:py-12">
        <h1 className="max-w-[860px] text-[min(36px,calc((100vw-40px)/9.2))] font-extrabold leading-[1.125] text-[#111111] md:text-[min(60px,calc((100vw-40px)/12.9))] md:leading-[1.1]">
          <span className="text-[#D45410]">Free Tools</span> That Can Save Your
          Next Online Exam
        </h1>
        <p className="mt-5 max-w-[640px] text-base leading-[25px] text-[#3D3D4E] md:mt-6 md:text-xl md:leading-8">
          Discover how to walk into your next exam ready, using free tools built
          for busy schedules, in 1 hour or less.
        </p>
        <div className="mt-[25px] flex w-full justify-center md:mt-[31px]">
          <FreeToolsLeadForm />
        </div>
      </main>

      <section
        aria-label="Platforms we cover"
        className="bg-white px-5 py-6 shadow-[0_-6px_18px_-8px_#DFE5FF] md:py-7"
      >
        <ul className="mx-auto grid grid-cols-3 place-items-center gap-x-6 gap-y-4 md:flex md:items-center md:justify-center lg:gap-[47px]">
          {PLATFORMS.map(({ src, alt }) => (
            // Mobile is a 3 x 2 grid. From md up it is one row: each logo's flex-basis is its
            // native width, so narrower screens shrink all six in proportion.
            <li
              key={alt}
              style={{ "--logo-w": `${src.width}px` } as CSSProperties}
              className="shrink-0 md:min-w-0 md:shrink md:basis-[var(--logo-w)]"
            >
              <Image
                src={src}
                alt={alt}
                className="h-auto w-[calc(var(--logo-w)*0.55)] max-w-full md:w-full"
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
