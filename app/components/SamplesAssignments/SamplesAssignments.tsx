"use client";

import { FC, useState } from "react";
import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Image from "next/image";
import Button from "../Button/Button";
import { usePathname } from "next/navigation";
import SubjectAssignments from "./SubjectAssignments";
import { SubjectAssignment, SubjectAssignmentContent } from "./content";

type Content = {
  btnTitle: string;
};

interface SamplesAssignmentsProps {
  content: Content[];
}
const SamplesAssignments: FC<SamplesAssignmentsProps> = ({ content }) => {
  const currentPage = usePathname();
  const [selectedAssignment, setSelectedAssignment] = useState("all");
  const [filteredSubject, setFilteredSubject] = useState<SubjectAssignment>(
    SubjectAssignmentContent[0]
  );

  const handleClick = (btnName: string) => {
    if (!btnName) {
      setSelectedAssignment("all");
      return;
    }
    setSelectedAssignment(btnName.toLowerCase());

    // console.log(btnName)
    let filterSubject = SubjectAssignmentContent.find(
      (s) => s.mainTitle.split(" ")[0] === btnName
    );
    // @ts-ignore
    setFilteredSubject(filterSubject);
  };
  return (
    <div className="flex justify-center py-10">
      <div className="container px-10">
        <div>
          <p className="text-lg">
            <span className="font-bold">Disclaimer: </span>The works below have
            been completed for actual clients. We have secured personal
            permission from the customers to post these examples of our custom
            academic writing services. We will never post your assignment
            without your explicit written permission.
          </p>
        </div>
        <div className="mt-6 flex justify-center xl:flex-nowrap flex-wrap gap-3">
          {content.map((item, index) => (
            <div key={index}>
              <Button
                className={`md:text-base text-sm bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500 ${selectedAssignment === item.btnTitle.toLocaleLowerCase() && "bg-white text-secondary-500 border-secondary-500"}`}
                onClick={() => handleClick(item.btnTitle)}
              >
                {item.btnTitle}
              </Button>
            </div>
          ))}
        </div>

        <div>
          {selectedAssignment === "all" ? (
            SubjectAssignmentContent.map((item, i) => (
              <SubjectAssignments
                key={i}
                mainTitle={item.mainTitle}
                subjectContent={item.assignments}
              />
            ))
          ) : (
            <SubjectAssignments
              mainTitle={filteredSubject.mainTitle}
              subjectContent={filteredSubject.assignments}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SamplesAssignments;
