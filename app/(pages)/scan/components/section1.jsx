import React from "react";
import heroBackgroundd from "../../../assets/Images/Group291.png";

const Section = () => {
  return (
    <div
      className="mx-4 my-4 sm:ml-8 sm:mr-[8rem] sm:my-8 sm:bg-contain sm:bg-right-bottom bg-no-repeat sm:py-[8rem]"
      style={{ backgroundImage: `url(${heroBackgroundd.src})` }}
    >
      <div className="container flex mx-auto ">
        <div className="basis-4/12 ">
          <p className="text-base text-[#716A6A] text-left sm:pl-20 container flex justify-between   w-[92%] ">
            Solve any Exercise in a second
          </p>
          <h1 className="text-6xl leading-tight font-extrabold  text-[#716A6A] text-left sm:pl-20 container flex justify-between   w-[92%]">
            SCAN.
            <br />
            SOLVE.
          </h1>
          <h1 className="text-6xl leading-tight font-extrabold mb-4 text-[#FF3449] text-left sm:pl-20 container flex justify-between   w-[92%]">
            SUCCEED.
          </h1>
          <p className="text-base text-[#716A6A] text-left sm:pl-20 container flex justify-between ">
            Solve math exercises, Physics, etc thanks to artifical intelligence
          </p>
          <button className="bg-[#FF3449] hover:bg-red-700 text-white font-bold py-2 px-8 rounded-full text-left flex sm:mx-20 my-4">
            Use the web version
          </button>
        </div>
        <div className="basis-8/12"></div>
      </div>
    </div>
  );
};

export default Section;
