"use client";
import { Input } from "postcss";
import { FC, useState } from "react";
import DownChevron from "@/app/assets/Icons/DownChevron";

interface EducationProps {}
const Education: FC<EducationProps> = ({}) => {
  const [qualification, setQualification] = useState("Undergraduate");
  const [open, setOpen] = useState(false);

  

  return (
    <div className="relative">
      <div
        className="border border-transparent border-b-black pb-2 flex justify-between items-center cursor-pointer"
        onClick={()=>setOpen(!open)}
      >
        <div>
          <p>{qualification}</p>
        </div>
        <div className="w-4">
          <DownChevron />
        </div>
      </div>
      {open === true && (
        <div className="absolute bg-white rounded-md border border-[#BBC6C6] translate-y-1 w-full py-2 font-normal">
          <div
            className="hover:bg-[#F8F9FA] px-4 py-1 cursor-pointer"
            onClick={() => setQualification("Graduate")}
          >
            <p>Graduate</p>
          </div>
          <div
            className="hover:bg-[#F8F9FA] px-4 py-1 cursor-pointer"
            onClick={() => setQualification("Undergraduate")}
          >
            <p>Undergraduate</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Education;
