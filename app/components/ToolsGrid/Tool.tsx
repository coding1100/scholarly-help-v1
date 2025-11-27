"use client";

import { FC, useState } from "react";
import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Image from "next/image";
import Button from "../Button/Button";
import { usePathname } from "next/navigation";
import Link from "next/link";

type Content = {
  url: string;
  icon: any;
  title: string;
};

interface ToolProps {
  content: Content;
}
const Tool: FC<ToolProps> = ({ content }) => {
  const currentPage = usePathname();
  return (
    // <Link href={content.url}>
      <div className="bg-primary-200 hover:bg-primary-300 flex rounded-md min-h-28 px-5 items-center">
        <div className="w-8">
          <Image src={content.icon} alt="img" />
        </div>
        <div>
          <p className="text-lg text-primary-500 ms-3 mt-3">{content.title}</p>
        </div>
      </div>
    // </Link>
  );
};

export default Tool;
