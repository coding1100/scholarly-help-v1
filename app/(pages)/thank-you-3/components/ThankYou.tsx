'use client';
import React, { FC, useEffect } from "react";
import thankYouImg from "@/app/assets/Images/thankyou.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

type ThankYouProps = {
  url: any;
};

const ThankYou: FC<ThankYouProps> = ({ url }) => {
  const pathname = usePathname();

  useEffect(() => {
    // Your script
    if (pathname === "/thank-you-3") {
      // @ts-ignore
      window.dataLayer = window.dataLayer || [];
      // @ts-ignore
      window.dataLayer.push({
        event: "page_view",
        order_price: localStorage.getItem("price_order"),
      });
    }
    // Clean up the script when the component is unmounted
    return () => {
      // Optionally, remove or undo anything done by the script
    };
  }, []);

  return (
    <div className="bg-[#d1d1f7] pt-10 min-h-screen">
      <div className="container mx-auto bg-[#d1d1f7]">
        <div>
          <h1 className="text-center text-4xl font-bold">Thank you</h1>
          <h1 className="text-4xl font-bold text-center">for contacting us</h1>
        </div>
        <div className="md:flex justify-between items-center pt-4 gap-6">
          <div className="imgBox w-1/2">
            {/* <img className="image" src={thankYouImg} alt="image" /> */}
            <Image src={thankYouImg} alt="thank-you" />
          </div>
          <div className="w-1/2">
            <div>
              <p className="leading-8">
                We have received your information and one of our customer
                service representatives will be reaching out right away. Please
                check your email and/or text messages and respond to get your
                affordable quote.
              </p>
            </div>
            <div className="hidden">
            <div className="flex md:justify-start justify-center items-center md:mt-5 mt-3">
              <Link href={url}>
                <button className="min-w-[200px] bg-[#ff641a] text-white min-h-[50px] rounded">
                  Get Another Quote
                </button>
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(ThankYou), { ssr: false });
