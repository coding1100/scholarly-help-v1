import React from "react";

import heroBackgroundd from "@/app/assets/Images/Group32.png";

const Section4 = () => {
  return (
    <div
      className="h-[100vh] bg-contain bg-bottom sm:mr-[8rem]  sm:bg-contain sm:bg-left-bottom bg-no-repeat sm:py-[8rem] sm:h-[100vh] sm:flex  "
      style={{ backgroundImage: `url(${heroBackgroundd.src})` }}
    >
      <div className="container mx-auto sm:flex ">
        <div className=" basis-8/12"></div>
        <div className="mx-auto text-center sm:basis-4/12">
          <p className="text-lg font-semibold text-[#716A6A] sm:text-left  container   w-[92%] ">
            Step{" "}
            <span className="text-[#FF3449] font-extrabold text-lg"> 03</span>
          </p>

          <p className="text-lg text-[#716A6A] sm:text-left    ">
            Ask yor question to our AI chatbot{" "}
            <span className="text-[#FF3449] font-semibold text-lg">
              <br />
              and get answer immediately
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Section4;
