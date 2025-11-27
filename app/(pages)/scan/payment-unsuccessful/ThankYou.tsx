"use client";
import React, { FC, useEffect } from "react";
import thankYouImg from "@/app/assets/Images/thankyou.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import BrokenCard from "@/app/assets/Images/brokencard.png"

type ThankYouProps = {};

const ThankYou: FC<ThankYouProps> = ({}) => {
  const pathname = usePathname();
  return (
    <div className="bg-[#d1d1f7] pt-10 min-h-screen">
      <div className="sm:container sm:mx-auto mx-5 bg-[#d1d1f7]">
        <div className="text-center pt-24 md:text-5xl sm:text-3xl text-xl font-bold text-primary-500">
          <div>Payment Unsuccessful!</div>
          <div className="mt-8 flex justify-center ">
            <Image src={BrokenCard} alt="img"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(ThankYou), { ssr: false });
