import React from "react";
import facebookIcon from "@/app/assets/Images/facebook.png";
import linkedinIcon from "@/app/assets/Images/linkedin.png";
import instagramIcon from "@/app/assets/Images/instagram.png";
import whatsappIcon from "@/app/assets/Images/whatsapp.png";
import youtubeIcon from "@/app/assets/Images/youtube.png";
import twitterIcon from "@/app/assets/Images/twitter.png";
import Image from "next/image";

const Footer = () => {
  return (
    <div className="bg-[#FF3449]">
      <div className="container mx-auto">
        <div className="py-8">
          <h2 className="text-4xl font-semibold text-white ">ScanToSolve</h2>
        </div>
        <div>
          <p className="text-white ">
            Solve math exercises, Physics, etc thanks to artifical intelligence
          </p>
        </div>

        <div className="border-y my-2 border-[#FF717F] center">
          <div className="flex justify-center ">
            <div className="py-4 mx-4">
              <Image src={facebookIcon} alt="icon" />
            </div>
            <div className="py-4 mx-4">
              <Image src={linkedinIcon} alt="icon" />
            </div>
            <div className="py-4 mx-4">
              <Image src={instagramIcon} alt="icon" />
            </div>
            <div className="py-4 mx-4">
              <Image src={whatsappIcon} alt="icon" />
            </div>
            <div className="py-4 mx-4">
              <Image src={youtubeIcon} alt="icon" />
            </div>
            <div className="py-4 mx-4">
              <Image src={twitterIcon} alt="icon" />
            </div>
          </div>
        </div>

        <div>
          <p className="py-2 font-semibold text-white sm:text-lg">
            @Copyright @2023 ScanToSolve all rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};
export default Footer;
