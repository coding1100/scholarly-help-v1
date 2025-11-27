import React from "react";
import heroBackgroundd from "@/app/assets/Images/Group30.png";

const Section2 = () => {
  return (
    <div
      className="h-[120vh] bg-contain bg-bottom sm:mr-[8rem]  sm:bg-contain sm:bg-left-bottom bg-no-repeat sm:py-[8rem] sm:h-[100vh] sm:flex "
      style={{ backgroundImage: `url(${heroBackgroundd.src})` }}
    >
      <div className="container flex mx-auto mt-4 sm:mt-0">
        <div className="hidden basis-full sm:block sm:basis-8/12"></div>
        <div className="mx-auto text-center sm:basis-4/12">
          <p className="text-lg font-semibold text-[#716A6A] text-left  container   w-[92%] sm:mt-[60px] ">
            Step{" "}
            <span className="text-[#FF3449] font-extrabold text-lg"> 01</span>
          </p>
          <p className="text-lg text-[#716A6A] text-left">
            <span className="text-[#FF3449] font-semibold text-lg">Solve </span>{" "}
            math exercises,
            <br /> Physics, etc thanks to <br /> artifical intelligence
          </p>
        </div>
      </div>
    </div>
  );
};

export default Section2;
