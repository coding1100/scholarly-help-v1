"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Button from "../Button/Button";
import EyeIcon from "@/app/assets/Icons/EyeIcon";
import ReviewStar from "@/app/assets/Icons/ReviewStar";
import "./index.css";
import Link from "next/link";
type Content = {
  img?: any;
  title?: string;
  subject?: string;
  noOfPages?: number;
  level?: string;
  docType?: string;
  referenceStyle?: string;
};

interface SampleCardProps {
  content: Content;
}
const SampleCard: FC<SampleCardProps> = ({ content }) => {
  return (
    <div className="sampleCard py-8 px-8 relative bg-white rounded-md xl:w-[305px] lg:w-[280px] md:w-[305px] mt-8 mb-5 tranition-all ">
      <div className="flex items-center">
        <div className="mr-2">
          <Image src={content.img} alt="image" className="w-12 h-12" />
        </div>
        <div>
          <p className="sm:text-lg font-medium">{content.title}</p>
        </div>
      </div>
      <div className="h-0.5 w-full bg-primary-300 my-6"></div>
      <div className="mb-4">
        <p className="text-lg font-medium">
          Subject: <span className="font-normal">{content.subject}</span>
        </p>
      </div>
      <div className="mb-4">
        <p className="text-lg font-medium">
          Number of Pages:{" "}
          <span className="font-normal">{content.noOfPages}</span>
        </p>
      </div>
      <div className="mb-4">
        <p className="text-lg font-medium">
          Academic Level: <span className="font-normal">{content.level}</span>
        </p>
      </div>
      <div className="mb-4">
        <p className="text-lg font-medium">
          Document Type: <span className="font-normal">{content.docType}</span>
        </p>
      </div>
      <div className="mb-4">
        <p className="text-lg font-medium">
          Reference Style:{" "}
          <span className="font-normal">{content.referenceStyle}</span>
        </p>
      </div>
      <div className="flex justify-center">
        <Link href="/samples/">
          <Button className="w-64 bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
            <div className="w-6 mr-1">
              <EyeIcon />
            </div>
            View Full Sample
          </Button>
        </Link>
      </div>
      <div className="flex justify-center items-center mt-4 text-lg font-medium">
        Rating{" "}
        <div className="ml-1 flex justify-center items-center">
          <div className="w-4">
            <ReviewStar />
          </div>
          <div className="w-4">
            <ReviewStar />
          </div>
          <div className="w-4">
            <ReviewStar />
          </div>
          <div className="w-4">
            <ReviewStar />
          </div>
          <div className="w-4">
            <ReviewStar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleCard;
