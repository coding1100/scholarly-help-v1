"use client";

import Facebook from "@/public/assets/Icon/Facebook.svg";
import Logo from "@/public/assets/Icon/Logo.svg";
import Phone from "@/public/assets/Icon/Phone.svg";
import AmericanExpress from "@/public/assets/Icon/americanExpressIcon.webp";
import Instagram from "@/public/assets/Icon/instagram.webp";
import Linkedin from "@/public/assets/Icon/linkedIn.webp";
import MasterCard from "@/public/assets/Icon/masterCardIcon.webp";
import Paypal from "@/public/assets/Icon/payPal.webp";
import Tiktok from "@/public/assets/Icon/tiktok.webp";
import Visa from "@/public/assets/Icon/visaIcon.webp";
import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
// import CopyRight from "./CopyRight";
import cellPhone from "@/public/assets/Icon/cellphone.png";
import whatsappIcon2 from "@/public/assets/Icon/whatsappIcon2.png";
import whatsappIconFooter from "@/public/assets/Icon/whatsapplogo.png";
import { usePathname } from "next/navigation";

import chatBubble from "@/public/assets/Icon/chatBubble.png";
import axios from "axios";
import { FaSnapchat } from "react-icons/fa";
import { SiYoutubemusic } from "react-icons/si";

// Academic Content Data
export const academicContent = [
  {
    icon: require("@/public/assets/Icon/schedule-icon.webp").default,
    title: "Online Class Help",
    description:
      "Stuck with extensive daily tasks of your online classes, Fret Not, we are here for you to complete your online classes with perfect Grades!",
  },
  {
    icon: require("@/public/assets/Icon/grades.webp").default,
    title: "Online Exam Help",
    description:
      "Want to Ace your online exams without taking any stress, Scholarly Help tutors are at your service with Guaranteed best results in your online exams.",
  },
  {
    icon: require("@/public/assets/Icon/write.webp").default,
    title: "Online Homework Assistance",
    description:
      "Online homeworks can be very tricky and mind-exhausting at all times, but with Scholarly Help Reliable & Affordable service of online homework assistance everything becomes smooth and easy.",
  },
  {
    icon: require("@/public/assets/Icon/notes.webp").default,
    title: "Essay Writing Services",
    description:
      "Wanting to write a compelling & plagiarism free essay, trust our credible tutors with excellent essay writing services with in due date delivery.",
  },
  {
    icon: require("@/public/assets/Icon/homework.webp").default,
    title: "Assignment Help",
    description:
      "Are you finding it difficult to complete your assignment questions correctly and on time? Worry not, Scholarly Help offers 24/7 homework aid with reliable client support at your service.",
  },
  {
    isLast: true,
    icon: require("@/public/assets/Icon/girlsWithPaperBoard.webp").default,
  },
];

interface FooterProps { }

const Footer: FC<FooterProps> = () => {
  const currentPage = usePathname();


  const [GCLID, setGCLID] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    const href = window?.location?.href || "";
    if (href.includes("gclid=")) setGCLID(href);
    setUrl(href);
  }, []);

  const postUrl = `${process.env.NEXT_PUBLIC_API_URL}/order/quote/whatsapp`;
  const postData = { gclid: GCLID, url };

  const apiCall = async () => {
    try {
      await axios.post(postUrl, postData, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("WhatsApp API Error:", error);
    }
  };

  // Hide footer on /order/
  if (currentPage === "/order/") return null;

  const isDoMyClassPage = currentPage === "/do-my-class-2/";

  return (
    <div>
      {/* Main Footer */}
      <div className="bg-[#ececfb] md:flex justify-center py-14">
        <div className="max-w-screen-7xl xl:container md:flex justify-between gap-6 px-10 text-primary-600 max-[992px]:flex-col max-[992px]:w-[90%] ">
          {/* Logo & Description */}
          <div className="md:max-w-[372px]">
            <Link href="/" className="">
              <div className="mb-4">
                <Image src={Logo} alt="Logo" />
              </div>
            </Link>
            <p className="leading-5">
              Scholarly Help delivers academic writing services. Our team of qualified subject experts can help you with your challenging online classes
              {!isDoMyClassPage && ", homework, assignments, quizzes, and exams"}.
            </p>
          </div>

          {/* Navigation Links - Hidden on specific pages */}
          <div className="md:flex justify-between gap-6 w-[40%] max-[992px]:w-[100%]">
            {/* Explore */}
            <div>
              <p className="font-semibold text-lg mt-2 mb-3">Explore</p>
              <div className="font-light space-y-1">
                {["/", "/about-us", "/contact-us", "https://scholarlyhelp.com/blog/"].map((href, i) => (
                  <Link key={i} href={href} className="block hover:font-normal hover:underline">
                    <p>{["Home", "About Us", "Contact Us", "Blog"][i]}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="font-semibold text-lg mt-2 mb-3">Our Services</p>
              <div className="font-light space-y-1">
                {[
                  "/online-class",
                  "/exams",
                  "/homework",
                  "/assignment",
                  "/essay-writing",
                ].map((href, i) => (
                  <Link key={i} href={href} className="block hover:font-normal hover:underline">
                    <p>{["Online Class", "Exam", "Homework", "Assignment", "Essay Writing"][i]}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <p className="font-semibold text-lg mt-2 mb-3">Legal Info</p>
              <div className="font-light space-y-1">
                <Link href="/terms-and-conditions" className="block hover:font-normal hover:underline">
                  <p>Terms & Conditions</p>
                </Link>
                <Link href="/privacy" className="block hover:font-normal hover:underline">
                  <p>Privacy Policy</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <p className="font-semibold text-lg mt-2 mb-3">Contact Info</p>
            <div>
              <a href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`} className="flex items-center">
                <span className="w-6 mr-1">
                  <Image src={Phone} alt="Phone" />
                </span>
                1-716-708-1869
              </a>

              {/* Social Icons */}
              <div className="flex my-2 space-x-1">
                {[
                  { href: "https://www.facebook.com/Scholarly.help", icon: <Image src={Facebook} alt="Facebook" /> },
                  { href: "https://www.instagram.com/scholarlyhelp/", icon: <Image src={Instagram} alt="Instagram" /> },
                  { href: "https://www.linkedin.com/company/scholarlyhelp/", icon: <Image src={Linkedin} alt="LinkedIn" /> },
                  { href: "https://www.tiktok.com/@scholarlyhelp.com", icon: <Image src={Tiktok} alt="TikTok" /> },
                  { href: "https://www.snapchat.com/add/helpscholarly", icon: <FaSnapchat className="text-[21px] text-[#000]" /> },
                  { href: "https://www.youtube.com/@ScholarlyHelp/", icon: <SiYoutubemusic className="text-[21px] text-[#000]" /> },
                ].map((social, i) => (
                  <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-5 h-5">
                    {social.icon}
                  </a>
                ))}
              </div>

              {/* Payment Icons */}
              <div className="flex my-2 space-x-1">
                {[MasterCard, Visa, AmericanExpress, Paypal].map((src, i) => (
                  <div key={i} className="w-5">
                    <Image src={src} alt={["MasterCard", "Visa", "American Express", "PayPal"][i]} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* <div>
          <button id="sms-chat" className="sms-chat">
            <a href={`sms:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`} className="blantershow-sms" target="_blank" rel="noopener">
              <Image src={chatBubble} alt="SMS" className="whatsapp-icon-footer" />
              <span className="sms-text">Send SMS</span>
            </a>
          </button>
          <button id="sms-chat2" className="sms-chat">
            <a href={`sms:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`} className="blantershow-sms2" target="_blank" rel="noopener">
              <Image src={cellPhone} alt="SMS" className="sms-icon-footer" />
            </a>
          </button>
        </div> */}

      {/* WhatsApp Module */}
      {/* <div>
          <button id="whatsapp-chat" className="whatsapp-chat" onClick={apiCall}>
            <a
              className="blantershow-chat"
              href="https://wa.me/17167081869?text=Hi%20There!%20We are here for you!"
              target="_blank"
              rel="noopener"
            >
              <Image src={whatsappIconFooter} alt="WhatsApp" className="whatsapp-icon-footer" />
              <span className="chat-text">Free Quote On Whatsapp</span>
            </a>
          </button>
          <button id="whatsapp-chat-2" className="whatsapp-chat" onClick={apiCall}>
            <a
              className="blantershow-chat2"
              href="https://wa.me/17167081869?text=Hi%20There!%20We are here for you!"
              target="_blank"
              rel="noopener"
            >
              <Image src={whatsappIcon2} alt="WhatsApp" className="whatsapp-icon-footer" />
            </a>
          </button>
      </div> */}

      <div className="bg-[#2b1c50] py-6">
        <div className="container mx-auto px-10 text-white text-center text-sm flex flex-col gap-3">
          <p>Copyrights © 2025 All Rights Reserved by Scholarly Help</p>
          <p>Website owned and operated by Eliya Enterprises.</p>
        </div>
      </div>

    </div>
  );
};

export default Footer;