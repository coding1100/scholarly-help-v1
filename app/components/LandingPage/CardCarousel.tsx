"use client";

import { useRef, useState, useEffect } from "react";
import Slider, { Settings } from "react-slick";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import slid1 from "@/app/assets/Images/slide1.svg";
import slid2 from "@/app/assets/Images/slide2.svg";
import slid3 from "@/app/assets/Images/slide3.svg";
import slid4 from "@/app/assets/Images/slide4.svg";
import slid5 from "@/app/assets/Images/slide5.svg";
import slid6 from "@/app/assets/Images/slide6.svg";
// import slid7 from "@/app/assets/Images/per07.svg";

// Card data
const cardData = [
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

export default function CardCarousel() {
  const sliderRef = useRef<Slider | null>(null);
  const [slidesToShow, setSlidesToShow] = useState(5);
  const [centerIndex, setCenterIndex] = useState(0);

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

  const settings: Settings = {
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0px",
    dots: true,
    arrows: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    afterChange: (current) => setCenterIndex(current),
  };

  const goPrev = () => sliderRef.current?.slickPrev();
  const goNext = () => sliderRef.current?.slickNext();

  return (
    <section className="w-full pt-[15px] px-4 text-[#171717] bg-white">
      <div className="w-full overflow-hidden">
        {" "}
        {/* Header */}
        <div className="text-center mb-12 mx-auto max-w-[740px]">
          <h2 className="text-[42px] text-[#000] font-bold   mb-3">
            {" "}
            The Academic Pressure You&apos;re Facing Every Day{" "}
          </h2>
          <p className="sm:text-lg text-sm text-gray-600 max-w-3xl mx-auto">
            {" "}
            We understand the weight on your shoulders — and we&apos;re here to
            lighten the load.{" "}
          </p>
        </div>
      </div>
      <Slider ref={sliderRef} {...settings}>
        {cardData.map((card, index) => {
          const isCenter = index === centerIndex;
          return (
            <div key={card.id} className="px-2 cursor-pointer">
              <div
                className={`
                  carousel-card p-6 shadow-md rounded-[21px] cursor-pointer h-[510px] flex flex-col bg-white transition-all hover:!scale-100 duration-300 relative
                  ${isCenter ? "center-card" : "scale-90"}
                `}
              >
                <div className="">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={300}
                    height={330}
                    className="object-cover rounded-lg mx-auto relative top-[-80px]"
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

      {/* Navigation */}
      <div className="w-[225px] mx-auto flex justify-around mt-[5px] relative z-[9]">
        <ChevronLeft size={20} className="cursor-pointer" onClick={goPrev} />
        <ChevronRight size={20} className="cursor-pointer" onClick={goNext} />
      </div>

      {/* Styles */}
      <style jsx>{`
        .carousel-card.center-card {
          background: #4744c9;
          z-index: 20;
          border: 1px solid #e2e2e2;
        }
        .carousel-card:not(.center-card):hover {
          background: #4744c9;
          transform: scale(1.1);
          z-index: 15;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .slick-dots li {
          width: 20px !important;
        }
        .carousel-card:not(.center-card):hover h3,
        .carousel-card:not(.center-card):hover p {
          color: #fff;
        }
      `}</style>
    </section>
  );
}
