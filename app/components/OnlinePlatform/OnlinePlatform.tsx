"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CanvasImg from "@/app/assets/Images/canvas.png";
import MoodleImg from "@/app/assets/Images/moodle.png";
import BlackboardImg from "@/app/assets/Images/blackboard.png";
import CengageImg from "@/app/assets/Images/cengage.png";
import StudyImg from "@/app/assets/Images/studyImg.png";
import WguImg from "@/app/assets/Images/wguImg.png";
import { usePageData } from "@/app/components/LandingPage/usePageData";
import { usePathname } from "next/navigation";

// Pages that must keep their exact previous look (e.g. live ad campaigns).
// The shared "slider everywhere" behavior is skipped for these paths.
const FROZEN_PATHS = ["/take-my-class", "/take-my-class/"];

const DEFAULT_MAIN_HEADING =
  "Let's Take Your Online Chemistry Exam on All Online Platforms";
const DEFAULT_SUB_HEADING =
  "At The Online Class Help, our experts have mastery over multiple online exam platforms. We do our best to make online chemistry exams stress-free. Our qualified chemistry expert offers the top services when you hire us to do your online chemistry exam so that each student can be assured of his or her academic targets being accomplished with confidence, precision as well and assured outcomes.";

type Platform = {
  key: string;
  name: string;
  description: string;
  logo: import("next/image").StaticImageData;
  alt: string;
};

const DEFAULT_PLATFORMS: Platform[] = [
  {
    key: "canvas",
    name: "Canvas",
    logo: CanvasImg,
    alt: "Canvas logo",
    description:
      "Canvas is a leading LMS used to deliver and manage online courses. We help you navigate Canvas so your chemistry exams, quizzes, and modules stay organized and on track.",
  },
  {
    key: "moodle",
    name: "Moodle",
    logo: MoodleImg,
    alt: "Moodle logo",
    description:
      "Moodle powers countless online chemistry courses worldwide. We guide you through assignments, discussion boards, and timed exams so you can focus on understanding the material.",
  },
  {
    key: "blackboard",
    name: "Blackboard",
    logo: BlackboardImg,
    alt: "Blackboard logo",
    description:
      "Blackboard acts as a digital classroom hub. From tests and homework to announcements and gradebook, we ensure your Blackboard chemistry exams run smoothly.",
  },
  {
    key: "cengage",
    name: "Cengage",
    logo: CengageImg,
    alt: "Cengage logo",
    description:
      "Cengage and platforms like OWLv2/WebAssign make chemistry interactive—but also complex. We support you in mastering problem sets, practice quizzes, and graded assignments inside Cengage.",
  },
  {
    key: "wgu",
    name: "WGU",
    logo: WguImg,
    alt: "WGU logo",
    description:
      "Whether you are balancing work, family, or other commitments, we help you stay on top of competency-based chemistry assessments in WGU’s online environment.",
  },
  {
    key: "study",
    name: "Study.com",
    logo: StudyImg,
    alt: "Study.com logo",
    description:
      "Study.com offers rich video lessons and practice questions. We help you translate that content into strong performance on quizzes, tests, and final chemistry exams.",
  },
];

type AdminPlatform = {
  key: string;
  name?: string;
  description?: string;
  logoUrl?: string;
};

export default function OnlinePlatform() {
  const currentPath = usePathname();
  const sliderRef = useRef<Slider | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const pageData = usePageData() as {
    onlinePlatform?: {
      mainHeading?: string;
      subHeading?: string;
      platforms?: AdminPlatform[];
    };
  } | null;
  const adminSection = pageData?.onlinePlatform;
  // Render the carousel on every page (previously limited to home + proctored).
  // The static grid fallback would let long platform lists render as a tall wall
  // of cards; the slider keeps the section compact and consistent everywhere.
  // Frozen paths keep their original static-grid look (old behavior).
  const showSlider = !FROZEN_PATHS.includes(currentPath);
  const { mainHeading, subHeading, platforms, useAdminPlatforms } =
    useMemo(() => {
      const mainHeading =
        (adminSection?.mainHeading &&
          String(adminSection.mainHeading).trim()) ||
        DEFAULT_MAIN_HEADING;
      const subHeading =
        (adminSection?.subHeading && String(adminSection.subHeading).trim()) ||
        DEFAULT_SUB_HEADING;
      const adminPlatforms = Array.isArray(adminSection?.platforms)
        ? adminSection.platforms.filter((p: AdminPlatform) => {
            if (p?.key == null) return false;
            // Skip empty rows: an entry only counts as a real platform if it has
            // a name, a description, or a logo. This keeps blank/placeholder rows
            // in the admin data from producing extra empty slides and dots.
            const hasName = !!(p.name && String(p.name).trim());
            const hasDescription = !!(
              p.description && String(p.description).trim()
            );
            const hasLogo = !!(p.logoUrl && String(p.logoUrl).trim());
            return hasName || hasDescription || hasLogo;
          })
        : [];
      const useAdminPlatforms = adminPlatforms.length > 0;
      const platforms = useAdminPlatforms
        ? adminPlatforms.map((p: AdminPlatform, index: number) => ({
            // Suffix with the index so admin data with duplicate or empty keys
            // still yields unique React keys — duplicate keys break react-slick's
            // slide/dot tracking (extra dots, wrong active slide).
            key: `${String(p.key)}-${index}`,
            name: (p.name && String(p.name).trim()) || "",
            description: (p.description && String(p.description).trim()) || "",
            logoUrl: (p.logoUrl && String(p.logoUrl).trim()) || undefined,
          }))
        : DEFAULT_PLATFORMS.map((def) => {
            return {
              ...def,
              name: def.name,
              description: def.description,
            };
          });
      return { mainHeading, subHeading, platforms, useAdminPlatforms };
    }, [adminSection]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 500,
    arrows: false,
    lazyLoad: "ondemand" as const,
    slidesToShow: 3,
    slidesToScroll: 1,
    pauseOnHover: true,
    afterChange: (current: number) => {
      const safeLength = platforms.length || 1;
      setActiveSlide(current % safeLength);
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const goPrev = () => sliderRef.current?.slickPrev();
  const goNext = () => sliderRef.current?.slickNext();
  const goToSlide = (index: number) => sliderRef.current?.slickGoTo(index);

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto max-[1320px]:px-4 text-center">
        <div className="max-w-[1104px] mx-auto">
          <h2 className="max-w-[902px] mx-auto text-center text-3xl font-bold leading-tight text-black sm:text-4xl md:text-[36px]">
            {mainHeading}
          </h2>
          <p className="mx-auto mt-4 max-w-4xl text-center text-sm text-gray-600 sm:text-base">
            {subHeading}
          </p>
        </div>
        {showSlider ? (
          <div className="mt-10">
            <Slider ref={sliderRef} {...sliderSettings}>
              {platforms.map((platform) => (
                <div key={platform.key} className="px-3">
                  <div className="h-full min-h-[220px] rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-shadow duration-200 hover:shadow-md">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="relative h-10 w-28 flex-shrink-0">
                        {useAdminPlatforms &&
                        "logoUrl" in platform &&
                        platform.logoUrl ? (
                          <Image
                            src={platform.logoUrl}
                            alt={
                              (platform as AdminPlatform).name ||
                              "Platform logo"
                            }
                            fill
                            className="object-contain"
                            sizes="112px"
                          />
                        ) : !useAdminPlatforms && "logo" in platform ? (
                          <Image
                            src={platform.logo}
                            alt={platform.alt}
                            fill
                            className="object-contain"
                            sizes="112px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                            Logo
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700 sm:text-[15px] text-justify">
                      {platform.description}
                    </p>
                  </div>
                </div>
              ))}
            </Slider>
            <div className="mx-auto mt-6 flex w-fit min-w-[140px] max-w-full items-center justify-center gap-5 px-2">
              <ChevronLeft
                size={20}
                className="cursor-pointer text-[#222]"
                onClick={goPrev}
              />
              <div className="flex items-center gap-0">
                {platforms.map((platform, index) => (
                  <button
                    key={`platform-dot-${platform.key || index}`}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => goToSlide(index)}
                    className="h-10 w-6 -mx-1 inline-flex shrink-0 items-center justify-center"
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
                        index === activeSlide ? "bg-[#a8a8b8]" : "bg-[#d4d4de]"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <ChevronRight
                size={20}
                className="cursor-pointer text-[#222]"
                onClick={goNext}
              />
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform) => (
              <div
                key={platform.key}
                className="h-full rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="relative h-10 w-28 flex-shrink-0">
                    {useAdminPlatforms &&
                    "logoUrl" in platform &&
                    platform.logoUrl ? (
                      <Image
                        src={platform.logoUrl}
                        alt={
                          (platform as AdminPlatform).name || "Platform logo"
                        }
                        fill
                        className="object-contain"
                        sizes="112px"
                      />
                    ) : !useAdminPlatforms && "logo" in platform ? (
                      <Image
                        src={platform.logo}
                        alt={platform.alt}
                        fill
                        className="object-contain"
                        sizes="112px"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                        Logo
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 sm:text-[15px] text-justify">
                  {platform.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
