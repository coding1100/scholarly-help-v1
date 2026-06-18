"use client";

import { FC } from "react";
import Image from "next/image";
import { useAcademicResearchData } from "@/app/(pages)/academic-research/AcademicResearchDataProvider";
import { defaultAcademicResearchContent } from "@/app/components/MainToolLanding/MainToolContent";
import { resolveCardIcon } from "@/app/components/MainToolLanding/mainToolIconMaps";

const MainToolCards: FC = () => {
    const pageData = useAcademicResearchData();
    const cards =
        pageData?.cardsSection.cards ?? defaultAcademicResearchContent.cardsSection.cards;

    return (
        <div className="bg-[#F3F4F9] relative">
            <div className="w-full max-w-7xl container py-32 px-14 mx-auto relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 absolute -top-32 left-0 w-full z-10">
                    {cards.map((card) => (
                        <div
                            key={card.heading}
                            className="bg-white rounded-2xl py-10 px-6 flex flex-col items-center justify-start text-center gap-4"
                        >
                            <Image
                                src={resolveCardIcon(card.iconKey)}
                                alt={card.heading}
                                className="object-contain"
                            />
                            <p className="text-[22px] font-semibold text-black">{card.heading}</p>
                            <p className="text-black">{card.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainToolCards;
