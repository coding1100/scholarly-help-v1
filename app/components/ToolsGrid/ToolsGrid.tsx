"use client";

import { FC, useState } from "react";
import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Image from "next/image";
import Button from "../Button/Button";
import { usePathname } from "next/navigation";
import Tool from "./Tool";
import Link from "next/link";

type Content = {
  url: string;
  icon: any;
  title: string;
};

interface ToolsGridProps {
  content: Content[];
  mainHeading: string;
}
const ToolsGrid: FC<ToolsGridProps> = ({ content, mainHeading }) => {
  const currentPage = usePathname();
  return (
    <div className="xl:flex justify-center mt-12 mb-6">
      <div className="xl:container px-10">
        <div>
          <h2
            className="md:text-5xl text-2xl font-bold text-primary-500"
            // style={{ lineHeight: "65px" }}
          >
            {mainHeading}
          </h2>
        </div>
        <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 pt-12">
          {content.map((item, index) => (
            <div key={index}>
              <Link href={item.url}>
                <Tool content={item} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsGrid;
