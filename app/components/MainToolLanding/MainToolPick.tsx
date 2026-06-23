"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAcademicResearchData } from "@/app/(pages)/academic-research/AcademicResearchDataProvider";
import { defaultAcademicResearchContent } from "@/app/components/MainToolLanding/MainToolContent";
import { resolvePickIcon } from "@/app/components/MainToolLanding/mainToolIconMaps";
import { getPickToolsForTab, PickToolItem } from "@/app/components/MainToolLanding/pickTabUtils";

function ToolCard({ tool }: { tool: PickToolItem }) {
    return (
        <div className="flex flex-col border border-[#ECECFC] py-5 px-6 bg-white rounded-[15px]">
            <div className="flex justify-between items-start gap-2 mb-4">
                <Image src={resolvePickIcon(tool.iconKey)} alt={tool.heading} />
                <div className="bg-[#f0fdf4] border border-[#86EFAC] rounded uppercase text-[10px] font-bold text-center px-2 py-1.5 text-[#059669]">
                    <p>{tool.tag}</p>
                </div>
            </div>
            <p className="text-[#1A1A1A] text-lg sm:text-xl font-semibold mb-2">
                {tool.heading}
            </p>
            <p className="text-[#7A7A7A] text-sm sm:text-[16px] mb-6 flex-1">
                {tool.description}
            </p>
            <Link
                href={tool.link}
                className="bg-[#565ADD] text-white text-center px-6 py-2 rounded-[4px] hover:opacity-90 transition-opacity"
            >
                {tool.buttonText} →
            </Link>
        </div>
    );
}

const ALL_TOOLS_PREVIEW_COUNT = 8;

const MainToolPick: FC = () => {
    const pageData = useAcademicResearchData();
    const pick = pageData?.pickSection ?? defaultAcademicResearchContent.pickSection;
    const [activeTab, setActiveTab] = useState(pick.tabs[0] || "All tools");
    const [showAllTools, setShowAllTools] = useState(false);
    const activeTools = getPickToolsForTab(pick, activeTab);
    const isAllToolsTab = activeTab === "All tools";
    const displayedTools =
        isAllToolsTab && !showAllTools
            ? activeTools.slice(0, ALL_TOOLS_PREVIEW_COUNT)
            : activeTools;
    const canToggleAllTools =
        isAllToolsTab && activeTools.length > ALL_TOOLS_PREVIEW_COUNT;

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setShowAllTools(false);
    };

    return (
        <div id="pick-tools" className="w-full max-w-7xl container py-6 sm:py-9 px-4 sm:px-8 lg:px-14 rounded-lg mx-auto">
            <p className="text-[28px] sm:text-[34px] lg:text-[42px] font-bold text-center leading-tight">
                {pick.heading}
            </p>
            <p className="text-center text-[#263238] text-sm sm:text-[17px] mt-2 sm:mt-0 px-2 sm:px-0">
                {pick.description}
            </p>

            <div className="flex flex-wrap justify-center items-center gap-2 my-5 sm:my-6">
                {pick.tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => handleTabChange(tab)}
                        className={`rounded-full py-2 px-4 sm:px-6 lg:px-9 text-sm sm:text-base ${
                            activeTab === tab
                                ? "bg-[#534AB7] text-white"
                                : "bg-white text-[#263238] border border-[#E5E7EB]"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="py-6 sm:py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {displayedTools.map((tool) => (
                        <ToolCard key={`${activeTab}-${tool.heading}`} tool={tool} />
                    ))}
                </div>
            </div>
            {canToggleAllTools && (
                <div className="w-full flex justify-center items-center">
                    <button
                        type="button"
                        onClick={() => setShowAllTools((prev) => !prev)}
                        className="w-full sm:w-fit bg-transparent border border-[#8E8E8E] text-black px-8 sm:px-11 py-3 text-base sm:text-[17px] mx-auto"
                    >
                        {showAllTools
                            ? (pick.showLessButtonText ?? "Show less")
                            : pick.showAllButtonText}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MainToolPick;
