"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SamplePdfImg from "@/app/assets/Images/samplePdf.webp";
import FileViewer from "./FileViewer";

type Content = {
  title: string;
  fileName: string;
  pages: string;
  documentType: string;
  citation: string;
  academicLevel: string;
};

interface SampleSubjectCardProps {
  content: Content;
}
const SampleSubjectCard: FC<SampleSubjectCardProps> = ({ content }) => {
  const currentPage = usePathname();
  return (
      <div className="">
        <div className="grid grid-cols-12 items-center border-b border-[#C7C8C9] pb-4">
          <div className="col-span-8 flex items-center">
            <div className="max-w-[40px] mr-2">
              <Image src={SamplePdfImg} alt="" />
            </div>
            <div className="font-bold text-primary-500">{content.title}</div>
          </div>
          <div className="col-span-4">{content.pages}</div>
        </div>
        <div className="py-4 text-lg">
          <div className="grid grid-cols-12">
            <div className="col-span-6">Academic Level:</div>
            <div className="col-span-6"> {content.academicLevel}</div>
          </div>
          <div className="grid grid-cols-12 my-1">
            <div className="col-span-6">Document Type:</div>
            <div className="col-span-6"> {content.documentType}</div>
          </div>
          <div className="grid grid-cols-12">
            <div className="col-span-6">Citation Style:</div>
            <div className="col-span-6"> {content.citation}</div>
          </div>
        </div>

        <FileViewer fileName = {content.fileName}/>
      </div>
  );
};

export default SampleSubjectCard;
