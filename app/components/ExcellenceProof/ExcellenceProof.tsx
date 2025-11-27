"use client";

import { FC, useState } from "react";
import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Image from "next/image";
import Button from "../Button/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";

type Content = {
  img?: any;
};

interface ExcellenceProofProps {
  content: Content[];
  btnText?: string;
}
const ExcellenceProof: FC<ExcellenceProofProps> = ({ content, btnText }) => {
  // const { isMobile } = useBreakpoint();

  const [showMore, setShowMore] = useState(false);
  const currentPage = usePathname();

  const toggleImgs = () => {
    setShowMore(!showMore);
  };

  return (
    <div className="pt-8 pb-12 flex justify-center">
      <div className="container px-10">
        <div>
          <h2 className="md:text-5xl text-2xl font-bold text-primary-500 text-center md:leading-[72px]">
            Proof of Our Excellence:
            <br />
            Achieved A-Grades for Students!
          </h2>
        </div>
        <div className="md:hidden grid grid-cols-1 gap-5 pt-4">
          {content.slice(0, !showMore ? 3 : content.length).map((items, i) => (
            <div key={i} className="flex justify-center">
              <div className="flex justify-center">
                <Image src={items.img} alt="Icon" />
              </div>
            </div>
          ))}
        </div>
        <div className="md:grid grid-cols-2 gap-5 pt-4 hidden">
          {content.map((items, i) => (
            <div key={i}>
              <Image src={items.img} alt="Icon" />
            </div>
          ))}
        </div>
        <div
          className="flex justify-center mt-8 mb-6 md:hidden"
          onClick={toggleImgs}
        >
          <p className="w-64 text-primary-500 text-center font-bold">
            {showMore === true
              ? "Show Less ScreenShots"
              : "Show More ScreenShots"}
          </p>
        </div>
        <div className="flex justify-center mt-8">
          {currentPage === "/take-my-class/" ? (
            <Link href="#PhoneEmailMsgForm">
              <Button className="md:w-64 w-48 bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
                {/* Place an Order Now */}
                {btnText ? `${btnText}` : "Place an Order Now"}
              </Button>
            </Link>
          ) : (
            <a href="javascript:void(Tawk_API.toggle())">
              <Button className="md:w-64 w-48 bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
                {/* Place an Order Now */}
                {btnText ? `${btnText}` : "Place an Order Now"}
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcellenceProof;
