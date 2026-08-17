"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Slider from "react-slick";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePageData } from "./usePageData";
import styles from "./CardCarousel.module.css";

import slid1 from "@/app/assets/Images/slide1.webp";
import slid2 from "@/app/assets/Images/slide2.webp";
import slid3 from "@/app/assets/Images/slide3.webp";
import slid4 from "@/app/assets/Images/slide4.webp";
import slid5 from "@/app/assets/Images/slide5.webp";
import slid6 from "@/app/assets/Images/slide6.webp";

// Card data
const fallbackCardData = [
  {
    id: 1,
    image: slid1,
    title: "Tight Deadlines",
    description:
      "Midnight submissions, 8 AM presentations, and sleep negotiated in 20-minute naps. Your calendar is a color-codedpanic zone—every ding is a countdown to disaster.",
  },
  {
    id: 2,
    image: slid2,
    title: "Nonstop Quizzes",
    description:
      "Pop-up ambushes demanding instant recall of half-absorbed facts. Energy vampires that leave you fried before the real exams even start.",
  },
  {
    id: 3,
    image: slid3,
    title: "Perfectionism Pressure",
    description:
      "One B- feels like failure in a world of straight-A expectations. Endless revisions for elusive perfection steal your joy and time.",
  },
  {
    id: 4,
    image: slid4,
    title: "Syllabus Shock",
    description:
      "Week 1: “This seems manageable.” Week 3: 5 exams, 3 papers, 1 presentation all due in the same 48 hours. The syllabus lied.",
  },
  {
    id: 5,
    image: slid5,
    title: "High-Stakes Exams",
    description:
      "Finals loom like storm clouds, with cramming sessions that blur into all-nighters and a single grade that feels like it defines your future. The fear of failure hits hard.",
  },
  {
    id: 6,
    image: slid6,
    title: "Overwhelming Coursework",
    description:
      "Essays pile up, readings never end, and group projects become solo marathons. The volume is crushing—every hour feels like a drop in an endless bucket..",
  },
  // {
  //   id: 7,
  //   image: slid7,
  //   title: "Perfectionism",
  //   description:
  //     "Striving for flawless work leads to procrastination and anxiety.",
  // },
];

interface CardCarouselProps {
  hideHeader?: boolean;
}

export default function CardCarousel({ hideHeader }: CardCarouselProps = {}) {
  const data = usePageData();
  const cardCarousel = data?.cardCarousel;
  const sliderRef = useRef<Slider | null>(null);
  const carouselRootRef = useRef<HTMLDivElement | null>(null);
  const [slidesToShow, setSlidesToShow] = useState(5);
  const [centerIndex, setCenterIndex] = useState(0);

  type CardType = {
    id: number | string;
    image: any;
    title: string;
    description: string;
  };

  // Use MongoDB data if available, otherwise use default
  // Use index-based IDs to prevent hydration mismatch (Date.now() differs server/client)
  const cards = useMemo(() => {
    // Static images we cycle through when admin doesn't provide explicit images
    const images = [slid1, slid2, slid3, slid4, slid5, slid6];

    if (
      cardCarousel?.cards &&
      Array.isArray(cardCarousel.cards) &&
      cardCarousel.cards.length > 0
    ) {
      return cardCarousel.cards.map((card: any, index: number) => ({
        id: card.id || `card-${index}`,
        // Use admin image if present, otherwise rotate through static images
        image: card.image || images[index % images.length],
        title: card.title || "",
        description: card.description || "",
      }));
    }

    return fallbackCardData;
  }, [cardCarousel]);

  // Responsive slides
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setSlidesToShow(1);
      else if (width < 1280) setSlidesToShow(3);
      else setSlidesToShow(5);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply .slick-list padding via inline style (Slick renders that element after mount)
  useEffect(() => {
    const applySlickListStyle = () => {
      const root = carouselRootRef.current;
      if (!root) return;
      const list = root.querySelector(".slick-list") as HTMLElement | null;
      if (list) {
        list.style.padding = "60px 0px 30px 0px";
        list.style.overflowY = "visible";
      }
    };
    applySlickListStyle();
    const t = setTimeout(applySlickListStyle, 0);
    return () => clearTimeout(t);
  }, [cards.length]);

  const settings = {
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    centerMode: true,
    lazyLoad: "ondemand" as const,
    centerPadding: "0px",
    dots: true,
    arrows: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    // Use CSS transform instead of layout properties to avoid reflows
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    useCSS: true,
    useTransform: true,
    afterChange: (current: number) => setCenterIndex(current),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          infinite: false,
          centerMode: false,
        },
      },
    ],
  };

  const goPrev = () => sliderRef.current?.slickPrev();
  const goNext = () => sliderRef.current?.slickNext();
  const goToSlide = (index: number) => {
    sliderRef.current?.slickGoTo(index);
  };

  return (
    <section className="w-full pt-[15px] px-4 text-[#171717] bg-white">
      <div ref={carouselRootRef} className={styles.carouselRoot}>
        {/* Header */}
        {!hideHeader && (
          <div className="text-center mb-12 mx-auto max-w-[740px]">
            <h2 className="text-[42px] max-[768px]:text-[28px] text-[#000] font-bold   mb-3">
              {cardCarousel?.mainHeading ||
                "The Academic Pressure You're Facing Every Day"}
            </h2>
            <p className="sm:text-lg text-sm text-gray-600 max-w-3xl mx-auto">
              {cardCarousel?.description ||
                "We understand the weight on your shoulders — and we're here to lighten the load."}
            </p>
          </div>
        )}

        <Slider ref={sliderRef} {...settings}>
          {cards.map((card: CardType, index: number) => {
            const isCenter = index === centerIndex;
            return (
              <div key={card.id} className="px-2 cursor-pointer">
                <div
                  onClick={() => goToSlide(index)}
                  className={[
                    "p-6 shadow-md rounded-[21px] cursor-pointer h-[510px] flex flex-col bg-white transition-all hover:!scale-100 duration-300 relative",
                    isCenter
                      ? styles.centerCard
                      : `scale-90 ${styles.nonCenterCard}`,
                  ].join(" ")}
                >
                  <div className="">
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={290}
                      height={299}
                      className=" max-w-[100%] rounded-lg mx-auto relative top-[-80px]"
                    />
                  </div>
                  <div className="flex flex-col h-full justify-center relative top-[-35px]">
                    <h3
                      className={`font-semibold text-[19px] leading-[1.5] ${
                        isCenter ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {card.title}
                    </h3>
                    <p
                      className={`text-[16px] leading-[1.5] mt-2 ${
                        isCenter ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>

      {/* Navigation */}
      <div className="w-[225px] mx-auto flex justify-around mt-[5px] relative z-[9]">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={goPrev}
          className=" inline-flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={goNext}
          className=" inline-flex items-center justify-center cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* CTA Button (text comes from admin if available) */}
      {/* <div className="flex justify-center mt-[30px] mb-[10px]">
        <button
          type="button"
          className="rounded-md px-6 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] max-[768px]:w-full font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px]"
          onClick={() => {
            const form = document.getElementById("quote-form");
            if (form) {
              form.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          {cardCarousel?.ctaButton?.text || "Take my online class"}
        </button>
      </div> */}
    </section>
  );
}
