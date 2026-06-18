"use client";

import { FC } from "react";
import { useAcademicResearchData } from "@/app/(pages)/academic-research/AcademicResearchDataProvider";
import { defaultAcademicResearchContent } from "@/app/components/MainToolLanding/MainToolContent";

function DashedCheckIcon() {
    return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-white bg-[#4043D6]">
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
            >
                <path
                    d="M4 12l5 5 11-11"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}

const MainToolWhyTool: FC = () => {
    const pageData = useAcademicResearchData();
    const why = pageData?.whySection ?? defaultAcademicResearchContent.whySection;

    return (
        <div className="bg-[#565ADD]">
            <div className="w-full max-w-7xl container pt-10 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-14 mx-auto">
                <p className="text-white text-[28px] sm:text-[34px] lg:text-[42px] font-bold text-center mb-8 sm:mb-12 leading-tight">
                    {why.heading}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-8 sm:gap-y-10">
                    {why.items.map((tool) => (
                        <div key={tool.heading} className="grid grid-cols-12 items-start gap-3 sm:gap-4">
                            <div className="col-span-2 sm:col-span-2 flex justify-start">
                                <DashedCheckIcon />
                            </div>
                            <div className="col-span-10">
                                <p className="text-white text-xl sm:text-2xl font-bold leading-tight">
                                    {tool.heading}
                                </p>
                                <p className="text-white text-sm sm:text-base leading-relaxed mt-2">
                                    {tool.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-12 sm:h-20 lg:h-32"></div>
        </div>
    );
};

export default MainToolWhyTool;
