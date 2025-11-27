import React from "react";
import heroBackgroundd from "@/app/assets/Images/Group31.png";

const Section3 = () => {
  return (
    <div
      className="h-[120vh] bg-contain bg-bottom  sm:mr-0  sm:bg-contain sm:bg-right-bottom bg-no-repeat sm:py-[8rem] sm:h-[100vh] sm:flex "
      style={{ backgroundImage: `url(${heroBackgroundd.src})` }}
    >
      <div className="container mx-auto mt-4 sm:flex sm:mt-0 ">
        <div className="basis-4/12 ml-[8rem]">
          <p className="text-lg font-semibold text-[#716A6A] text-left  container   w-[92%] ">
            Step{" "}
            <span className="text-[#FF3449] font-extrabold text-lg"> 02</span>
          </p>

          <p className="text-lg text-[#716A6A] text-left    ">
            <span className="text-[#FF3449] font-semibold text-lg">
              Import your exercise image{" "}
            </span>
            .<br /> Our AI takes care of its
            <br /> resolution
          </p>
        </div>
        <div className=" basis-8/12"></div>
      </div>
    </div>
  );
};

export default Section3;
