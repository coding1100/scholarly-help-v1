"use client";

import { FC, useState } from "react";
import { usePathname } from "next/navigation";
import SampleSubjectCard from "./SampleSubjectCard";

interface SubjectAssignmentsProps {
  subjectContent: any;
  mainTitle: string;
}
const SubjectAssignments: FC<SubjectAssignmentsProps> = ({
  subjectContent,
  mainTitle,
}) => {
  const currentPage = usePathname();
  return (
    <div className="mt-10">
      <div className="md:text-5xl sm:text-3xl text-xl text-primary-500 font-bold text-center my-16">
        {mainTitle}
      </div>
      <div className="grid grid-cols-12 gap-4">
        {subjectContent.map((item: any, index: any) => (
          <div key={index} className="md:col-span-4 sm:col-span-6 col-span-12 border border-[#C7C8C9] rounded py-5 px-4">
            <SampleSubjectCard content={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectAssignments;
