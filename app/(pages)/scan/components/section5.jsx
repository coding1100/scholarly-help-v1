import React from "react";
import heroBackgroundd from "@/app/assets/Images/Group33.png";

const Section5 = () => {
  return (
    <div
      className="sm:ml-8 sm:mr-[8rem] sm:my-8 sm:bg-contain sm:bg-right-bottom bg-no-repeat sm:py-[8rem]"
      style={{ backgroundImage: `url(${heroBackgroundd.src})` }}
    >
      <div className="container mx-auto sm:flex ">
        <div className="sm:basis-4/12 ">
          <p className="text-base text-[#716A6A] text-left pl-20 container flex justify-between   w-[92%] ">
            ScantoSolve
          </p>
          <h1 className="text-6xl leading-tight font-extrabold  text-[#716A6A] text-left pl-20 container flex justify-between   w-[92%]">
            TRY OUR
          </h1>
          <h1 className="text-6xl leading-tight font-extrabold mb-4 text-[#FF3449] text-left pl-20 container flex justify-between   w-[92%]">
            WEB APP
          </h1>
          <h1 className="text-6xl leading-tight font-extrabold  text-[#716A6A] text-left pl-20 container flex justify-between   w-[92%]">
            NOW!
          </h1>
          <p className="text-base text-[#716A6A] text-left pl-20 container flex justify-between ">
            Solve math exercises, Physics, etc thanks to artifical intelligence
          </p>
          <button className="bg-[#FF3449] hover:bg-red-700 text-white font-bold py-2 px-8 rounded-full text-left flex mx-20 my-4">
            Use the web version
          </button>
        </div>
        <div className="basis-8/12"></div>
      </div>
    </div>
  );
};

export default Section5;
