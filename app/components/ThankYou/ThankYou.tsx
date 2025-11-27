"use client";
import React, { FC, useEffect, useRef, useState } from "react";
import DownArrow from "@/app/assets/Images/faqDropdown.webp";
import QuestionMark from "@/app/assets/Images/questionMark.png";
import Image from "next/image";
import Button from "../Button/Button";
import Phone from "@/app/assets/Icons/Phone";
import DumyImg from "@/app/assets/Images/dumyImg.jpg";
import LocationIcon from "@/app/assets/Images/location.png";
import BoxStar from "@/app/assets/Images/boxStar.png";
import { content } from "./content";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./style.css";
import TrustPilotLogo from "@/app/assets/Images/trustpilotlogo.png";
import axios from "axios";
import BgThankYou from "@/app/assets/Images/thankYouBg.png";
import CustomerReviews from "../CustomerReviews/CustomerReviews";

type ThankYouProps = {};

const ThankYou: FC<ThankYouProps> = ({}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.muted = isMuted;
      videoElement.play().catch((error) => {
        console.error("Autoplay was prevented:", error);
      });
    }
  }, [isMuted]);

  const handleUnmute = () => {
    setIsMuted(false);
  };

  const [GCLID, setGCLID] = useState("");
  const [url, setUrl] = useState("");

  const postUrl = `${process.env.NEXT_PUBLIC_API_URL}/order/quote/whatsapp`;
  useEffect(() => {
    if (window?.location?.href?.includes("gclid=")) {
      setGCLID(window?.location?.href);
    }

    setUrl(window?.location?.href);
  }, []);
  const postData = {
    gclid: GCLID,
    url: url,
  };
  const apiCall = async () => {
    try {
      const res = await axios.post(postUrl, postData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response:", res.data);

      return res.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    dots: false,
    arrows: true,
    responsive: [
      // {
      //   breakpoint: 1100,
      //   settings: {
      //     slidesToShow: 2,
      //     slidesToScroll: 2,
      //     infinite: true,
      //     dots: true,
      //   },
      // },
      {
        breakpoint: 992,
        settings: {
          infinite: true,
          dots: false,
          arrows: true,
        },
      },

      {
        breakpoint: 650,
        settings: {
          initialSlide: 1,
          dots: false,
          arrows: false,
        },
      },
    ],
  };
  return (
    <div>
      <div className="container mx-auto h-[350px] text-center flex flex-col items-center justify-end">
        <div>
          <p className="lg:text-5xl md:text-3xl text-2xl font-semibold mb-4">
            Thank You for Choosing Scholarly Help!
          </p>
          <p className="lg:text-[33px] md:text-[23px] text-[19px]">
            A Smart and Wise Decision, Indeed!
          </p>
        </div>
        <div className="py-11">
          <p className="lg:text-xl ">
            At Scholarly Help, we specialize in easing the academic burdens of
            students like you.
            <br />
            Our mission is simple: to get you top grades without the stress and
            overwhelm.
          </p>
        </div>
      </div>

      <div
        className="bg-norepeat bg-center lg:pb-0 sm:pb-5"
        style={{
          backgroundImage: `url(${BgThankYou.src})`,
        }}
      >
        <div className="container mx-auto flex flex-wrap sm:justify-between justify-center">
          <div className="md:max-w-[300px] max-w-[260px] pt-9 lg:order-1">
            <div className="mb-8 flex justify-center">
              <Image
                src={DownArrow}
                alt="icon"
                className="md:max-w-[70px] max-w-[50px] -rotate-90"
              />
            </div>
            <p className="md:text-3xl text-2xl mb-11 text-center">
              What’s Next?
            </p>
            <div className="flex flex-col md:gap-7 gap-5">
              <div className="flex gap-4">
                <div className="md:h-[32px] h-[22px] md:min-w-[32px] min-w-[22px] bg-primary-500 rounded-full flex justify-center items-center md:text-xl text-lg font-bold text-white">
                  <p>1</p>
                </div>
                <p className="md:text-xl text-lg">
                  We&apos;ll review your information{" "}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="md:h-[32px] h-[22px] md:min-w-[32px] min-w-[22px] bg-primary-500 rounded-full flex justify-center items-center md:text-xl text-lg font-bold text-white">
                  <p>2</p>
                </div>
                <p className="md:text-xl text-lg">
                  Our support team will contact you soon to get requirements &
                  confirm your order.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="md:h-[32px] h-[22px] md:min-w-[32px] min-w-[22px] bg-primary-500 rounded-full flex justify-center items-center md:text-xl text-lg font-bold text-white">
                  <p>3</p>
                </div>
                <p className="md:text-xl text-lg">
                  Begin work, ensuring timely delivery.
                </p>
              </div>
            </div>
          </div>
          <div className="sm:flex hidden justify-between items-end pb-14 order-2">
            <div className="border-x-[1px] border-[#DCDCDC] h-[330px]"></div>
          </div>
          <div className="md:w-[300px] w-[300px] pt-[42px] lg:order-3 sm:order-5 order-3">
            <div className="mb-9 flex justify-center">
              <Image
                src={QuestionMark}
                alt="icon"
                className="md:max-w-[58px] max-w-[37px]"
              />
            </div>
            <p className="md:text-3xl text-2xl mb-11 text-center">
              Need Urgent Help?
            </p>
            <div className="flex flex-col gap-6 mb-8">
              <a href="javascript:void(Tawk_API.toggle())">
                <Button className="bg-primary-500 w-full text-xl">
                  Live Chat Now
                </Button>
              </a>

              <div onClick={apiCall}>
                <a
                  href="https://wa.me/17167081869?text=Hi%20There!%20We are here for you!"
                  target="_blank"
                >
                  <Button className="bg-[#118C7E] w-full text-xl">
                    Connect on Whatsapp
                  </Button>
                </a>
              </div>
            </div>
            <div className="flex justify-center items-center gap-2">
              <p className="text-xl font-semibold">Call at</p>

              <a
                href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`}
                className="flex justify-center items-center"
              >
                <div className="w-[28px]">
                  <Phone color="#2B1C50" />
                </div>

                <p className="text-xl font-semibold">+1-716-708-1869</p>
              </a>
            </div>
          </div>
          <div className="lg:flex justify-between items-end pb-14 hidden order-4">
            <div className="border-x-[1px] border-[#DCDCDC] h-[330px]"></div>
          </div>
          <div className="md:w-[300px] w-[300px] lg:order-5 sm:order-3 order-5">
            {/* <video ref={videoRef} width="640" height="900" autoPlay loop muted>
              <source src="/videos/thankYou.mp4" type="video/mp4" />
              Your browser does not support the video.
            </video> */}
            {/* <video width="640" height="900" autoPlay loop>
              <source src="/videos/thankYou.mp4" type="video/mp4" />
              Your browser does not support the video.
            </video> */}
            <div className="relative">
              <video
                ref={videoRef}
                width="640"
                height="900"
                muted={isMuted}
                autoPlay
                // controls
                loop
              >
                <source src="/videos/thankYou.mp4" type="video/mp4" />
                Your browser does not support the video.
              </video>
              {isMuted && (
                <button
                  className="absolute top-4 right-4 bg-white p-2 rounded-md"
                  onClick={handleUnmute}
                >
                  Unmute
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto md:pt-[100px] sm:pt-[70px] pt-[50px] pb-6 flex flex-col md:gap-6 gap-3">
        <p className="md:text-3xl text-xl text-center">
          Learn More About Us While You Wait…
        </p>
        <p className="md:text-3xl text-xl text-center font-bold">
          Proof of A+ Grades, Achieved By Us for Students Like You
        </p>
        <Slider {...settings}>
          {content.proofs.map((item, index) => (
            <div key={index} className="flex justify-center items-center">
              <div className=" flex justify-center md:h-[400px] sm:h-[300px] h-[200px] overflow-hidden">
                <Image src={item} alt="" className="w-[80%] " />
              </div>
            </div>
          ))}
        </Slider>
      </div>
      {/* <div className="container mx-auto py-6">
        <p className="text-center md:text-3xl text-xl">
          Students Rate us High on Trustpilot
        </p>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5 mt-10">
          {content.reviews.map((item, index) => (
            <div
              key={index}
              className="col-span-1 border border-[#BEBEBE] px-6 py-7 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full bg-no-repeat bg-center bg-cover"
                    style={{
                      backgroundImage: `url(${item.picture.src})`,
                    }}
                  ></div>
                  <div className="flex flex-col justify-between text-sm gap-1">
                    <p className="font-bold">{item.name}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-[#6C6A6A] font-medium">1 review</p>
                      <div className="flex items-center gap-1">
                        <Image src={LocationIcon} alt="" className="w-4" />
                        <p>{item.userLocation}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border w-full my-4"></div>
                <div className="lg:flex justify-between items-center mb-4">
                  <div className="flex gap-[1px]">
                    <Image src={BoxStar} alt="" />
                    <Image src={BoxStar} alt="" />
                    <Image src={BoxStar} alt="" />
                    <Image src={BoxStar} alt="" />
                    <Image src={BoxStar} alt="" />
                  </div>
                  <p className="text-[#6C6A6A] font-medium text-sm">
                    {item.reviewDate}
                  </p>
                </div>
                <p className="font-bold lg:text-xl lg:leading-[28px] leading-[18px] mb-1">
                  {item.reviewHeading}
                </p>
                <p className="font-medium text-[#362F28] md:text-base text-sm md:leading-[20px]">
                  {item.reviewDescription}
                </p>
              </div>
              <div className="pt-5">
                <p className="font-bold text-sm">
                  Date of experience:{" "}
                  <span className="font-normal">{item.experienceDate}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="sm:flex justify-center items-center pb-6">
        <p className="md:text-xl text-base">
          Rated 4.7 out of 5 based on 103 Reviews on
        </p>
        <a
          href="https://www.trustpilot.com/review/scholarlyhelp.com"
          target="_blank"
        >
          <Image
            src={TrustPilotLogo}
            alt=""
            className="md:max-w-[150px] max-w-[100px]"
          />
        </a>
      </div> */}
      <CustomerReviews />
    </div>
  );
};

export default ThankYou;
