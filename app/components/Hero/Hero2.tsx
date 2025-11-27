"use client";

import BgHero from "@/app/assets/Images/takeMyClassBg.png";
import BgHero2 from "@/app/assets/Images/takeMyClassBg2.png";
import { FC, useEffect, useState } from "react";

import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

// import Step4 from "@/app/(pages)/do-my-class/component/Step4";
import yellowEnvalop from "@/app/assets/Images/yellowEnvalop.png";
import axiosInstance from "@/app/axios";
import { isPhoneValid } from "@/app/utilities/utilities";
import React from "react";
import ZohoForm2 from "./ZohoForm2";
type Content = {
  heading1?: string;
  mainHeading?: string;
  heading2?: string;
  description: string;
};

interface HeroProps {
  content: Content;
}
const Hero2: FC<HeroProps> = ({ content }) => {
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
    // if (!isValidPhoneNumber) {
    //   setPhoneErr("Invalid Phone Number");
    //   return;
    // }
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
      await axiosInstance.post(
        `/order/quote`,
        fd
        // , {
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //   },
        // }
      );
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
        className="xl:flex justify-center bg-contain bg-no-repeat bg-right-bottom px-10"
        style={{
          backgroundImage: `${isMobile ? "none" : `url(${BgHero.src})`}`,
        }}
      >
        <div className="xl:container xl:px-10 grid lg:grid-cols-2">
          <div
            className={`xl:py-12 lg:pt-20 lg:pb-4 ${
              currentPage === "/savemytime/" ? "lg:w-[90%]" : "lg:w-[63%]"
            } ${!isMobile && "w-[400px]"} mb-9`}
          >
            <div className="w-auto flex">
              <h1
                className={`text-primary-500 font-bold md:text-3xl text-xl mt-2 mr-2`}
              >
                {content.heading1}
              </h1>
            </div>
            <div>
              <h1 className="text-primary-500 md:font-bold font-extrabold text-3xl">
                {content.mainHeading}
              </h1>
              {content.heading2 && (
                <h1
                  className={`text-primary-500 font-bold ${
                    currentPage !== "/"
                      ? "md:text-5xl text-3xl mt-4"
                      : "md:text-3xl text-xl"
                  }`}
                >
                  {content.heading2}
                </h1>
              )}
              <div className={`${!isMobile && "max-w-[520px]"} py-5`}>
                <div
                  className="text-primary-500"
                  dangerouslySetInnerHTML={{ __html: content.description }}
                ></div>
              </div>
              {/* {currentPage === "/take-my-class/" && (
                <div className="mb-3">
                  <p className="font-bold md:text-lg">
                    100% Money-Back Guarantee:{" "}
                    <span className="font-normal">
                      Not satisfied with your grades?
                    </span>
                    <br />
                    Get a full refund—
                    <span className="font-normal">no questions asked.</span>
                  </p>
                </div>
              )} */}
              <div className="flex justify-center md:justify-start">
                <div className=" w-full">
                  <ZohoForm2 />
                  {/* <form
                    onSubmit={handleWholeForm}
                    className="bg-primary-500 rounded flex flex-col gap-[9px] py-5 px-[9px]"
                  >
                    <div>
                      <div className="flex items-center border border-[#49498B] divide-[#49498B] divide-x gap-3 rounded p-3">
                        <IoIosMail className="text-[#49498B] text-lg" />
                        <input
                          type="email"
                          placeholder="Email *"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value), setEmailErr("");
                          }}
                          className="focus:outline-none flex-grow bg-transparent pl-3 placeholder-white text-[13px] text-white"
                        />
                      </div>
                      {emailErr && (
                        <p className="text-white text-xs italic">{emailErr}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center border border-[#49498B] divide-[#49498B] divide-x gap-3 rounded p-3">
                        <MdPhoneInTalk className="text-[#49498B] text-lg" />
                        <input
                          type="phone"
                          placeholder="Phone # (Optional)"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setPhoneErr("");
                          }}
                          className="focus:outline-none flex-grow bg-transparent pl-3 placeholder-white text-[13px] text-white"
                        />
                      </div>
                      {phoneErr && (
                        <p className="text-white text-xs italic">{phoneErr}</p>
                      )}
                    </div>
                    <div className="flex items-start border border-[#49498B] gap-3 rounded p-3">
                      <IoChatbubbles className="text-[#49498B] text-lg" />
                      <div className=" border-r border-[#49498B] h-[20px]"></div>
                      <textarea
                        placeholder="What do you need help with (Optional)"
                        rows={4}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="focus:outline-none flex-grow bg-transparent placeholder-white text-[13px] text-white resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loader}
                      className="h-[46px] w-full bg-white rounded flex justify-center items-center"
                    >
                      {loader ? (
                        <BiLoaderAlt className="animate-spin text-lg" />
                      ) : (
                        "GET MY FREE QUOTE"
                      )}
                    </button>
                  </form> */}
                  {/* {freeQuotephoneEmailMsg ? (
                    <PhoneEmailMsgFrom />
                  ) : (
                    <>
                      {!freeQuoteForm ? (
                        <div>
                          <Step4 />
                        </div>
                      ) : (
                        <a href="javascript:void(Tawk_API.toggle())">
                          <Button
                            type="submit"
                            className="md:w-[240px] w-[180px] flex justify-evenly md:px-16 px-10"
                          >
                            <span className="w-5">
                              <ChatBubbles />
                            </span>
                            Live Chat
                          </Button>
                        </a>
                      )}
                    </>
                  )} */}
                  {/* <Button
                  className="md:w-[240px] w-[180px] flex justify-evenly md:px-16 px-10"
                  onClick={handleModel}
                >
                  <span className="w-5">
                    <ChatBubbles />
                  </span>
                  Live Chat
                </Button> */}
                  {/* {currentPage === "/take-my-class/" && ( */}
                  <div className="w-[80%] mx-auto p-5 rounded-b-lg border border-white">
                    <div className="flex justify-center items-center mx-auto gap-3">
                      <Image src={yellowEnvalop} alt="" />
                      <p className="text-[13px] font-semibold text-primary-500">
                        Check Spam / Junk If You Don’t
                        <br />
                        See Our Email Within Minutes
                      </p>
                    </div>
                  </div>
                  {/* )} */}
                </div>
              </div>
            </div>
          </div>

          <div className={!isMobile ? "hidden" : "flex justify-center"}>
            <Image src={BgHero2} alt="image" />
          </div>
        </div>
      </div>
      {/* <PopUpModal open={openModal} handleClose={() => setOpenModal(false)} /> */}
    </div>
  );
};

export default Hero2;
