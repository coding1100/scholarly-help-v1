"use client";

import miot from "@/app/assets/Images/aitoollanding/maintooluni/miot.png";
import hu from "@/app/assets/Images/aitoollanding/maintooluni/hu.png";
import uom from "@/app/assets/Images/aitoollanding/maintooluni/uom.png";
import buoc from "@/app/assets/Images/aitoollanding/maintooluni/buoc.png";
import uoc from "@/app/assets/Images/aitoollanding/maintooluni/uoc.png";
import ou from "@/app/assets/Images/aitoollanding/maintooluni/ou.png";
import Image from "next/image";
import { useAcademicResearchData } from "@/app/(pages)/academic-research/AcademicResearchDataProvider";
import { defaultAcademicResearchContent } from "@/app/components/MainToolLanding/MainToolContent";

const Universities = [
    { src: miot, alt: "MIOT" },
    { src: hu, alt: "HU" },
    { src: uom, alt: "UOM" },
    { src: buoc, alt: "BUOC" },
    { src: uoc, alt: "UOC" },
    { src: ou, alt: "OU" },
];

export default function MainToolHelp() {
    const pageData = useAcademicResearchData();
    const help = pageData?.helpSection ?? defaultAcademicResearchContent.helpSection;

    return (
        <div className="xl:flex justify-center py-6 sm:py-8 mt-[-40px] sm:mt-[-60px] lg:mt-[-99px] z-10 relative px-4 sm:px-6 lg:px-0">
            <div
                className="w-full max-w-7xl container py-6 sm:py-9 px-4 sm:px-8 lg:px-14 rounded-lg bg-[#fff]"
                style={{ boxShadow: " 0px 11px 32px 0px #DFE5FF " }}
            >
                <p className="text-xl sm:text-[26px] font-medium text-center mb-5">
                    {help.title}
                </p>
                <div className="w-full flex flex-wrap justify-center sm:justify-between items-center gap-4 sm:gap-6 ">
                    {Universities.map((university) => (
                        <Image
                            key={university.alt}
                            src={university.src}
                            alt={university.alt}
                            loading="lazy"
                            // className="md:w-full md:max-w-full w-[20%]"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
