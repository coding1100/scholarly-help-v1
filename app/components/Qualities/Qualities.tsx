"use client";

import { FC } from "react";
import Confidentiality from "@/app/assets/Icons/Confidentiality";
import SpamAlert from "@/app/assets/Icons/SpamAlert";
import Downloads from "@/app/assets/Icons/Downloads";
import Guarantee from "@/app/assets/Icons/Guarantee";
import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";

interface QualitiesProps {}
const Qualities: FC<QualitiesProps> = ({}) => {
  const {isMobile} = useBreakpoint();

  return (
    <div className="bg-primary-200 xl:flex justify-center py-8">
      {/* <div className="container px-36 flex justify-between"> */}
      <div className="2xl:container 2xl:px-36 xl:px-0 px-12 xl:flex xl:justify-between grid grid-cols-4 2xl:gap-3 xl:gap-7">
        <div className="flex items-center xl:justify-center sm:col-span-2 col-span-4">
          <div className={`md:w-10 w-6 mr-3`}>
            <Confidentiality />
          </div>
          <div>
            <p className={`${isMobile === true ? "text-base":"text-lg"}`}>100% confidential</p>
          </div>
        </div>

        <div className="sm:mt-0 mt-2 flex items-center xl:justify-center sm:col-span-2 col-span-4">
          <div className={`md:w-10 w-6 mr-3`}>
            <SpamAlert />
          </div>
          <div>
            <p className={`${isMobile === true ? "text-base":"text-lg"}`}>No spam</p>
          </div>
        </div>

        <div className="sm:mt-0 mt-2 flex items-center xl:justify-center sm:col-span-2 col-span-4">
          <div className={`md:w-10 w-6 mr-3`}>
            <Downloads />
          </div>
          <div>
            <p className={`${isMobile === true ? "text-base":"text-lg"}`}>Plagiarism Free Work</p>
          </div>
        </div>

        <div className="sm:mt-0 mt-2 flex items-center xl:justify-center sm:col-span-2 col-span-4">
          <div className={`md:w-10 w-6 mr-3`}>
            <Guarantee />
          </div>
          <div>
            <p className={`${isMobile === true ? "text-base":"text-lg"}`}>Money Back Guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Qualities;
