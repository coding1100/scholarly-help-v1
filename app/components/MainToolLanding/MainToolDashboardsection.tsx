"use client";

import { FC } from "react";
import Link from "next/link";
import { useAcademicResearchData } from "@/app/(pages)/academic-research/AcademicResearchDataProvider";
import { defaultAcademicResearchContent } from "@/app/components/MainToolLanding/MainToolContent";

function PurpleCheckIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
            aria-hidden
        >
            <circle cx="12" cy="12" r="12" fill="#7B61FF" />
            <path
                d="M7 12l3 3 7-7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

const MainToolDashboardsection: FC = () => {
    const pageData = useAcademicResearchData();
    const dashboard =
        pageData?.dashboardSection ?? defaultAcademicResearchContent.dashboardSection;

    return (
        <div className="w-full max-w-7xl container py-8 sm:py-9 px-4 sm:px-8 lg:px-14 rounded-lg mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-5">
                <div>
                    <div className="w-fit py-2 px-5 sm:px-7 mb-5 sm:mb-7 rounded-full border border-[#D6D6D6] bg-white text-[#000] text-center text-sm sm:text-base">
                        <p>{dashboard.badge}</p>
                    </div>
                    <div className="text-[28px] sm:text-[34px] lg:text-[42px] font-bold leading-tight sm:leading-[44px] lg:leading-[50px] mb-4">
                        <p>{dashboard.headingLine1}</p>
                        <p>{dashboard.headingLine2}</p>
                    </div>
                    <p className="text-base sm:text-lg mb-6 sm:mb-7 max-w-full lg:max-w-[452px]">
                        {dashboard.description}
                    </p>

                    <ul className="space-y-4 mb-6 sm:mb-7 max-w-full lg:max-w-[382px]">
                        {dashboard.features.map((feature) => (
                            <li
                                key={feature.title}
                                className="flex items-start gap-3 text-base text-gray-700 sm:text-lg"
                            >
                                <PurpleCheckIcon />
                                <span>
                                    <b>{feature.title}</b> — {feature.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                        <Link
                            href={dashboard.ctaButtonUrl || "#"}
                            className="inline-block w-full sm:w-fit bg-primary-400 text-white font-medium py-3 px-8 rounded-[4px] text-center"
                        >
                            {dashboard.ctaButton}
                        </Link>
                        <Link
                            href={dashboard.loginButtonUrl || "#"}
                            className="inline-block w-full sm:w-fit text-primary-400 font-medium py-3 px-8 rounded-[4px] text-center border border-primary-400"
                        >
                            {dashboard.loginButton}
                        </Link>
                    </div>
                </div>
                <div>
                    <div className="w-full h-full bg-[#ECECFC] rounded-2xl py-4 sm:py-5 px-4 sm:px-[30px]">
                        <div className="flex items-center justify-start gap-3 mb-5 sm:mb-7">
                            <div className="w-[17px] h-[17px] rounded-full bg-[#EF4444]"></div>
                            <div className="w-[17px] h-[17px] rounded-full bg-[#F59E0B]"></div>
                            <div className="w-[17px] h-[17px] rounded-full bg-[#22C55E]"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                            {dashboard.stats.map((stat, index) => (
                                <div
                                    key={stat.label}
                                    className={`px-3 sm:px-[26px] pt-4 sm:pt-6 pb-5 sm:pb-8 text-white rounded-lg ${
                                        index === 0 || index === 3
                                            ? "bg-primary-400"
                                            : "bg-[#9F92EC]"
                                    }`}
                                >
                                    <p className="text-[28px] sm:text-[45px] font-bold leading-none">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm sm:text-lg font-medium mt-1">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {dashboard.history.map((item) => (
                                <div
                                    key={item.title}
                                    className="w-full bg-white py-3 sm:py-4 px-4 sm:px-[26px] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm sm:text-base">{item.title}</p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                        <p className="text-sm sm:text-base text-[#6B7280]">
                                            {item.time}
                                        </p>
                                        <p className="text-[#565ADD] font-semibold text-sm sm:text-base">
                                            {item.action}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainToolDashboardsection;
