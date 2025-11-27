"use client";

import Image from "next/image";
import { FC } from "react";
import SiteJabber from "@/app/assets/Images/sidejabber.webp";
import GoogleIcon from "@/app/assets/Images/google.webp";
import Trustpilot from "@/app/assets/Images/Trustpilot.webp";
import ReviewIo from "@/app/assets/Images/review.webp";
import ReviewStar from "@/app/assets/Icons/ReviewStar";
import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";

interface SiteReviewsProps {}
const SiteReviews: FC<SiteReviewsProps> = ({}) => {
  const { isMobile } = useBreakpoint();

  return (
    <div className="xl:flex justify-center py-8">
      <div
        className={`xl:container xs:px-16 px-8 2xl:px-44 lg:flex justify-between grid grid-cols-2`}
      >
        <div
          className={`flex items-center ${
            isMobile ? "justify-start" : "justify-center"
          } col-span-1 `}
        >
          <div className="md:w-14 w-10 mr-3">
            <Image
              src={SiteJabber}
              alt="SiteJabber"
              width={56}
              height={56}
              placeholder="blur"
              quality={70}
              priority={false}
            />
          </div>
          <div>
            <div>
              <p className="md:text-lg text-sm">4.9</p>
            </div>
            <div className="flex">
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
            </div>
            <div>
              <p className="md:text-lg text-sm">Sitejabber</p>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center ${
            isMobile ? "justify-start" : "justify-center"
          } col-span-1 `}
        >
          <div className="md:w-14 w-10 mr-3">
            <Image src={GoogleIcon} alt="GoogleIcon" />
          </div>
          <div>
            <div>
              <p className="md:text-lg text-sm">4.8</p>
            </div>
            <div className="flex">
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
            </div>
            <div>
              <p className="md:text-lg text-sm">Google Reviews</p>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center ${
            isMobile ? "justify-start" : "justify-center"
          } col-span-1 `}
        >
          <div className="md:w-14 w-10 mr-3">
            <Image
              src={Trustpilot}
              alt="Trustpilot"
              width={56}
              height={56}
              placeholder="blur"
              quality={70}
              priority={false}
            />
          </div>
          <div>
            <div>
              <p className="md:text-lg text-sm">4.9</p>
            </div>
            <div className="flex">
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
            </div>
            <div>
              <p className="md:text-lg text-sm">Trustpilot</p>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center ${
            isMobile ? "justify-start" : "justify-center"
          } col-span-1 `}
        >
          <div className="md:w-14 w-10 mr-3">
            <Image
              src={ReviewIo}
              alt="ReviewIo"
              width={56}
              height={56}
              placeholder="blur"
              quality={70}
              priority={false}
            />
          </div>
          <div>
            <div>
              <p className="md:text-lg text-sm">4.9</p>
            </div>
            <div className="flex">
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
              <div className="md:w-5 w-3">
                <ReviewStar />
              </div>
            </div>
            <div>
              <p className="md:text-lg text-sm">Review.io</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteReviews;
