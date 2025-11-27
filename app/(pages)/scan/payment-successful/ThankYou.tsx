"use client";
import React, { FC, useEffect } from "react";
import thankYouImg from "@/app/assets/Images/thankyou.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

type ThankYouProps = {};

const ThankYou: FC<ThankYouProps> = ({}) => {
  const pathname = usePathname();
  console.log("ThankYou");
  return (
    <div className="bg-[#d1d1f7] pt-10 min-h-screen">
      <div className="container mx-auto bg-[#d1d1f7]">
        <div>
          <h1 className="text-center text-4xl font-bold">
            Thank you for subscribing!
          </h1>
        </div>
        <div className="md:flex justify-between items-center pt-4 gap-6">
          <div className="imgBox w-1/2">
            {/* <img className="image" src={thankYouImg} alt="image" /> */}
            <Image src={thankYouImg} alt="thank-you" />
          </div>
          <div className="w-1/2">
            <div>
              <p className="leading-8">
                Your subscription is confirmed, and you&apos;re all set to enjoy our
                services. We&apos;re thrilled to have you on board!
              </p>
              <p className="leading-8">
                Click below to return to using our services.{" "}
              </p>
            </div>
            <div className="flex md:justify-start justify-center items-center md:mt-5 mt-3">
              <Link href="/scan">
                <button className="min-w-[200px] bg-[#ff641a] text-white min-h-[50px] rounded">
                  Continue my scan
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(ThankYou), { ssr: false });
