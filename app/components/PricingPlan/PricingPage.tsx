import { FC } from "react";
import PricingCard from "./PricingCard";
import { PricingContent } from "./content";
import PricingTable from "./PricingTable";

import EssayOutline from "@/app/assets/Icons/essayOutline.png";
import Paraphraser from "@/app/assets/Icons/paraphraser.png";
import Summarizer from "@/app/assets/Icons/summarizer.png";
import ThesisGenerator from "@/app/assets/Icons/thesisGenerator.png";
import Image from "next/image";

interface PricingPageProps {}

const PricingPage: FC<PricingPageProps> = ({}) => {
  return (
    <div className="px-32 my-24">
      <h1 className="text-4xl text-[#172b4d] text-center mb-2">
        Simple, transparent pricing{" "}
      </h1>
      <p className="text-center text-[#626f86] mb-5">
        No credit card required, cancel anytime
      </p>
      <div className="flex justify-center items-start gap-4 mb-6">
        <div className="flex flex-col justify-center items-center gap-2 text-xs text-[#626f86]">
          <div className="w-10 h-10 p-2 bg-primary-200 rounded-full">
            <Image src={EssayOutline} alt="" />
          </div>{" "}
          <p className="text-center">
            Essay
            <br />
            Outline
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-2 text-xs text-[#626f86]">
          <div className="w-10 h-10 p-2 bg-primary-200 rounded-full">
            <Image src={Paraphraser} alt="" />
          </div>{" "}
          <p className="text-center">
            Paraphraser
            <br />
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-2 text-xs text-[#626f86]">
          <div className="w-10 h-10 p-2 bg-primary-200 rounded-full">
            <Image src={Summarizer} alt="" />
          </div>{" "}
          <p className="text-center">
            Summarizer
            <br />
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-2 text-xs text-[#626f86]">
          <div className="w-10 h-10 p-2 bg-primary-200 rounded-full">
            <Image src={ThesisGenerator} alt="" />
          </div>{" "}
          <p className="text-center">
            Thesis
            <br />
            Generator
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-8 items-end mb-14">
        {PricingContent.map((item, index) => (
          <div key={index} className="col-span-1">
            <PricingCard item={item} index={index + 1} />
          </div>
        ))}
      </div>
      <PricingTable />
    </div>
  );
};

export default PricingPage;
