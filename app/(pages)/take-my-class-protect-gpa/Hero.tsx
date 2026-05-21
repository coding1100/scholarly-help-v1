"use client";

import BgHero from "@/app/assets/Images/heroTakeMyClass.png";
import BgHero2 from "@/app/assets/Images/heroTakeMyClass2.png";
import { FC, useEffect, useState } from "react";

import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import yellowEnvalop from "@/app/assets/Images/yellowEnvalop.png";
import axiosInstance from "@/app/axios";
import { isPhoneValid } from "@/app/utilities/utilities";
import React from "react";
import ZohoForm2 from "@/app/components/Hero/ZohoForm2";

type Content = {
  heading1?: string;
  mainHeading?: string;
  heading2?: string;
  description: string;
};

interface HeroProps {
  content: Content;
}
const Hero: FC<HeroProps> = ({ content }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [FBCLID, setFBCLID] = useState("");
  const [GCLID, setGCLID] = useState("");
  const [email, setEmail] = useState<any>("");
  const [emailErr, setEmailErr] = useState("");
  const [instructions, setInstructions] = useState("");
  const [wholeUrl, setWholeUrl] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);

  const { isMobile } = useBreakpoint();
  const currentPage = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (window.location) {
      setWholeUrl(window.location.href);
    } else {
      setWholeUrl(currentPage);
    }
  }, []);
  useEffect(() => {
    if (window?.location?.href?.includes("fbclid=")) {
      setFBCLID(window?.location?.href);
    }
    if (window?.location?.href?.includes("gclid=")) {
      setGCLID(window?.location?.href);
    }
  }, []);

  const handleWholeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoader(true);
    const isValidPhoneNumber = isPhoneValid(phoneNumber);

    if (!email) {
      setEmailErr("Please enter a valid email address");
      setLoader(false);
      return;
    }
    const fd = new FormData();
    if (FBCLID) {
      fd.append("fbclid", FBCLID);
    }
    if (GCLID) {
      fd.append("gclid", GCLID);
    }
    if (phoneNumber) {
      fd.append("phone_number", phoneNumber);
    }
    fd.append("url", wholeUrl);
    if (email) {
      fd.append("email", email);
    } else {
      setEmailErr("Add Email");
      setLoader(false);
      return;
    }
    if (instructions) {
      fd.append("instructions", instructions);
    }
    console.log("fd", fd);
    try {
      await axiosInstance.post(`/order/quote`, fd);
      setLoader(false);
      router.push("/thank-you-2");
    } catch (error) {
      // @ts-ignore
      setSubmissionErr(error?.response?.data?.message);
      setLoader(false);
    }
  };
  return (
    <div className="bg-primary-300">
      <div
        className="xl:flex justify-center bg-contain bg-no-repeat bg-left-bottom md:px-10 px-5 md:pt-[82px] pt-7 md:pb-[60px]"
        style={{
          backgroundImage: `${isMobile ? "none" : `url(${BgHero.src})`}`,
        }}
      >
        <div className="xl:container xl:px-10">
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="col-span-1">
              <div className="lg:max-w-[590px] max-w-[325px]">
                <h1 className="text-[#000] md:font-bold font-extrabold lg:text-3xl text-2xl">
                  {content.mainHeading}
                </h1>
                <div>
                  <div
                    className="text-[#000] md:pt-4"
                    dangerouslySetInnerHTML={{ __html: content.description }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="col-span-1 md:pt-5 flex justify-center">
              <div className="lg:w-[435px] sm:w-auto w-[300px] flex justify-center md:justify-start">
                <div className="w-full">
                  <div className="bg-primary-500 px-4 py-3 rounded-[14px]">
                    <ZohoForm2 textAreaRows={11} />
                  </div>
                  <div className="w-[80%] mx-auto md:p-5 p-3 rounded-b-lg border border-white">
                    <div className="flex justify-center items-center mx-auto md:gap-3 gap-2">
                      <Image
                        src={yellowEnvalop}
                        alt=""
                        className="lg:w-auto w-[39px]"
                      />
                      <p className="md:text-[13px] text-[10px] font-semibold text-[#000]">
                        Check Spam / Junk If You Don’t
                        <br className="md:block hidden" />
                        See Our Email Within Minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={!isMobile ? "hidden" : "flex justify-center mt-5"}>
            <Image src={BgHero2} alt="image" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
