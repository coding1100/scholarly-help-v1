"use client";

import Facebook from "@/app/assets/Icons/Facebook";
import Logo from "@/app/assets/Icons/Logo";
import Phone from "@/app/assets/Icons/Phone";
import AmericanExpress from "@/app/assets/Images/americanExpressIcon.webp";
import Instagram from "@/app/assets/Images/instagram.webp";
import Linkedin from "@/app/assets/Images/linkedIn.webp";
import MasterCard from "@/app/assets/Images/masterCardIcon.webp";
import Paypal from "@/app/assets/Images/payPal.webp";
import Tiktok from "@/app/assets/Images/tiktok.webp";
import Visa from "@/app/assets/Images/visaIcon.webp";
import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import CopyRight from "./CopyRight";
// import whatsappIconFooter from "@/app/assets/Images/whatsapp-icon.svg";
import cellPhone from "@/app/assets/Images/cellphone.png";
import whatsappIcon2 from "@/app/assets/Images/whatsappIcon2.png";
import whatsappIconFooter from "@/app/assets/Images/whatsapplogo.png";
import { usePathname } from "next/navigation";
import {
  hideFooterLinks,
  hideWhatsappModule,
  sms,
  smsHide,
} from "../HideLinks/HideLinks";
import "./footer.css";
// import ChatBubble from "@/app/assets/Icons/ChatBubble";
import chatBubble from "@/app/assets/Images/chatBubble.png";
import axios from "axios";
import { FaSnapchat } from "react-icons/fa";
import { SiYoutubemusic } from "react-icons/si";

interface FooterProps {}
const Footer: FC<FooterProps> = ({}) => {
  const currentPage = usePathname();
  const hideWhatsapp = hideWhatsappModule.includes(currentPage);
  const hidelinksfooter = hideFooterLinks.includes(currentPage);
  const ShowSms = sms.includes(currentPage);
  const hideSMS = smsHide.includes(currentPage);
  const [GCLID, setGCLID] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (window?.location?.href?.includes("gclid=")) {
      setGCLID(window?.location?.href);
    }

    setUrl(window?.location?.href);
  }, []);

  const postUrl = `${process.env.NEXT_PUBLIC_API_URL}/order/quote/whatsapp`;

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

  if (currentPage === "/order/") {
    return;
  } else if (hidelinksfooter) {
    return (
      <div>
        <div className="bg-primary-200 md:flex justify-center py-14">
          <div className="md:container md:flex justify-between gap-6 px-10 text-primary-600">
            <div className="md:max-w-[372px]">
              <div className="mb-4">
                <Logo />
              </div>
              <div>
                <p className="leading-5 ">
                  Scholarly Help delivers academic writing services. Our team of
                  qualified subject experts can help you with your challenging
                  online classes, homework, assignments, quizzes, and exams
                </p>
              </div>
            </div>

            <div>
              <div className="mt-2 mb-3">
                <p className="font-semibold text-lg">Explore</p>
              </div>
              <div className="font-light">
                <div>
                  <p>Home</p>
                </div>
                <div>
                  <p>About Us</p>
                </div>
                <div>
                  <p>Contact Us</p>
                </div>
                <div>
                  <p>Blog</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mt-2 mb-3">
                <p className="font-semibold text-lg">Our Services</p>
              </div>
              <div className="font-light">
                <div>
                  <p>Online Class</p>
                </div>
                <div>
                  <p>Exam</p>
                </div>
                <div>
                  <p>Homework</p>
                </div>
                <div>
                  <p>Assignment</p>
                </div>
                <div>
                  <p>Essay Writing</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mt-2 mb-3">
                <p className="font-semibold text-lg">Legal Info</p>
              </div>
              <div className="font-light">
                <div>
                  <p>Terms & Conditions</p>
                </div>
                <div>
                  <p>Privacy Policy</p>
                </div>
                {/* <div>
                <Link className="hover:font-normal hover:underline " href="#">
                  <p>Disclaimer</p>
                </Link>
              </div> */}
              </div>
            </div>

            <div>
              <div className="mt-2 mb-3">
                <p className="font-semibold text-lg">Contact Info</p>
              </div>
              <div className="">
                <div>
                  <p
                    // href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`}
                    className="flex"
                  >
                    <span className="w-6 mr-1">
                      <Phone color="#2b1c51" />
                    </span>
                    1-716-708-1869
                  </p>
                </div>
                <div className="flex my-2">
                  <div className="w-5 mr-1">
                    <Facebook color="#2b1c51" />
                  </div>
                  <div className="w-5 mr-1">
                    <Image src={Instagram} alt="instagram" />
                  </div>
                  <div className="w-5 mr-1">
                    <Image src={Linkedin} alt="Linkedin" />
                  </div>
                  <div className="w-5 mr-1">
                    <Image src={Tiktok} alt="Tiktok" />
                  </div>
                </div>

                <div className="flex my-2">
                  <div className="w-5 mr-1">
                    <Image src={MasterCard} alt="MasterCard" />
                  </div>
                  <div className="w-5 mr-1">
                    <Image src={Visa} alt="Visa" />
                  </div>
                  <div className="w-5 mr-1">
                    <Image src={AmericanExpress} alt="AmericanExpress" />
                  </div>
                  <div className="w-5 mr-1">
                    <Image src={Paypal} alt="Paypal" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CopyRight />
        {!hideSMS && (
          <>
            {/* SMS module */}
            <div>
              <button id="sms-chat" className="sms-chat">
                <a
                  href={`sms:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`}
                  className="blantershow-sms"
                  target="_blank"
                >
                  <Image
                    src={chatBubble}
                    alt="whatsapp"
                    className="whatsapp-icon-footer"
                  />
                  <span className="sms-text">Send SMS</span>
                </a>
              </button>
              <button id="sms-chat2" className="sms-chat" onClick={apiCall}>
                <a
                  href={`sms:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`}
                  className="blantershow-sms2"
                  target="_blank"
                >
                  <Image
                    src={cellPhone}
                    alt="whatsapp"
                    className="sms-icon-footer"
                  />
                </a>
              </button>
            </div>
          </>
        )}
        {!hideWhatsapp && (
          <>
            {/* Whatsapp module */}
            <div>
              <button
                id="whatsapp-chat"
                className="whatsapp-chat"
                onClick={apiCall}
              >
                <a
                  className="blantershow-chat"
                  href="https://wa.me/17167081869?text=Hi%20There!%20We are here for you!"
                  target="_blank"
                >
                  <Image
                    src={whatsappIconFooter}
                    alt="whatsapp"
                    className="whatsapp-icon-footer"
                  />
                  <span className="chat-text">Free Quote On Whatsapp</span>{" "}
                </a>
              </button>
              <button
                id="whatsapp-chat-2"
                className="whatsapp-chat"
                onClick={apiCall}
              >
                <a
                  className="blantershow-chat2"
                  href="https://wa.me/17167081869?text=Hi%20There!%20We are here for you!"
                  target="_blank"
                >
                  <Image
                    src={whatsappIcon2}
                    alt="whatsapp"
                    className="whatsapp-icon-footer"
                  />
                </a>
              </button>
            </div>
          </>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <div className="bg-primary-200 md:flex justify-center py-14">
          <div className="md:container md:flex justify-between gap-6 px-10 text-primary-600">
            <div className="md:max-w-[372px]">
              <Link href="/">
                <div className="mb-4">
                  <Logo />
                </div>
              </Link>
              <div>
                <p className="leading-5 ">
                  Scholarly Help delivers academic writing services. Our team of
                  qualified subject experts can help you with your challenging
                  online classes
                  {currentPage !== "/do-my-class-2/" &&
                    ", homework, assignments, quizzes, and exams"}
                  .
                </p>
              </div>
            </div>
            {currentPage !== "/do-my-class-2/" && (
              <div className="md:flex justify-between gap-6 w-[40%]">
                <div>
                  <div className="mt-2 mb-3">
                    <p className="font-semibold text-lg">Explore</p>
                  </div>
                  <div className="font-light">
                    <div>
                      <Link
                        className="hover:font-normal hover:underline "
                        href="/"
                      >
                        <p>Home</p>
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="hover:font-normal hover:underline "
                        href="/about-us"
                      >
                        <p>About Us</p>
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="hover:font-normal hover:underline "
                        href="/contact-us"
                      >
                        <p>Contact Us</p>
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="hover:font-normal hover:underline "
                        href="https://scholarlyhelp.com/blog/"
                      >
                        <p>Blog</p>
                      </Link>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mt-2 mb-3">
                    <p className="font-semibold text-lg">Our Services</p>
                  </div>
                  <div className="font-light">
                    <div>
                      <Link
                        className="hover:font-normal hover:underline "
                        href="/online-class"
                      >
                        <p>Online Class</p>
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="hover:font-normal hover:underline "
                        href="/exams"
                      >
                        <p>Exam</p>
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="hover:font-normal hover:underline "
                        href="/homework"
                      >
                        <p>Homework</p>
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="hover:font-normal hover:underline "
                        href="/assignment"
                      >
                        <p>Assignment</p>
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="hover:font-normal hover:underline "
                        href="/essay-writing"
                      >
                        <p>Essay Writing</p>
                      </Link>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mt-2 mb-3">
                    <p className="font-semibold text-lg">Legal Info</p>
                  </div>
                  <div className="font-light">
                    <div>
                      <Link
                        className="hover:font-normal hover:underline "
                        href="/terms-and-conditions"
                      >
                        <p>Terms & Conditions</p>
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="hover:font-normal hover:underline "
                        href="/privacy"
                      >
                        <p>Privacy Policy</p>
                      </Link>
                    </div>
                    {/* <div>
                <Link className="hover:font-normal hover:underline " href="#">
                  <p>Disclaimer</p>
                </Link>
              </div> */}
                  </div>
                </div>
              </div>
            )}
            <div>
              <div className="mt-2 mb-3">
                <p className="font-semibold text-lg">Contact Info</p>
              </div>
              <div className="">
                <div>
                  <a
                    href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`}
                    className="flex"
                  >
                    <span className="w-6 mr-1">
                      <Phone color="#2b1c51" />
                    </span>
                    1-716-708-1869
                  </a>
                </div>
                <div className="flex my-2">
                  <div className="w-5 mr-1">
                    <a
                      target="_blank"
                      href="https://www.facebook.com/Scholarly.help"
                    >
                      <Facebook color="#2b1c51" />
                    </a>
                  </div>
                  <div className="w-5 mr-1">
                    <a
                      target="_blank"
                      href="https://www.instagram.com/scholarlyhelp/"
                    >
                      <Image src={Instagram} alt="instagram" />
                    </a>
                  </div>
                  <div className="w-5 mr-1">
                    <a
                      target="_blank"
                      href="https://www.linkedin.com/company/scholarlyhelp/"
                    >
                      <Image src={Linkedin} alt="Linkedin" />
                    </a>
                  </div>
                  <div className="w-5 mr-1">
                    <a
                      target="_blank"
                      href="https://www.tiktok.com/@scholarlyhelp.com"
                    >
                      <Image src={Tiktok} alt="Tiktok" />
                    </a>
                  </div>
                  <div className="w-5 h-5 text-[21px] text-primary-500 mr-1">
                    <a
                      target="_blank"
                      href="https://www.snapchat.com/add/helpscholarly"
                    >
                      <FaSnapchat />
                    </a>
                  </div>
                  <div className="w-5 h-5 text-[21px] text-primary-500">
                    <a
                      target="_blank"
                      href="https://www.youtube.com/@ScholarlyHelp/"
                    >
                      <SiYoutubemusic />
                    </a>
                  </div>
                  {/* <div className="w-5 h-5 mr-1 rounded-full bg-primary-500"></div> */}
                </div>

                <div className="flex my-2">
                  <div className="w-5 mr-1">
                    <Image src={MasterCard} alt="MasterCard" />
                  </div>
                  <div className="w-5 mr-1">
                    <Image src={Visa} alt="Visa" />
                  </div>
                  <div className="w-5 mr-1">
                    <Image src={AmericanExpress} alt="AmericanExpress" />
                  </div>
                  <div className="w-5 mr-1">
                    <Image src={Paypal} alt="Paypal" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CopyRight />
        {ShowSms ? (
          <></>
        ) : (
          <div>
            {/* sms module */}
            <button id="sms-chat" className="sms-chat">
              <a
                href={`sms:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`}
                className="blantershow-sms"
                target="_blank"
              >
                <Image
                  src={chatBubble}
                  alt="whatsapp"
                  className="whatsapp-icon-footer"
                />
                <span className="sms-text">Send SMS</span>
              </a>
            </button>

            <button id="sms-chat2" className="sms-chat">
              <a
                href={`sms:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`}
                className="blantershow-sms2"
                target="_blank"
              >
                <Image
                  src={cellPhone}
                  alt="whatsapp"
                  className="sms-icon-footer"
                />
              </a>
            </button>
          </div>
        )}

        {/* whatsapp module */}
        {!hideWhatsapp && (
          <div>
            {/* whatsapp module */}
            <button
              id="whatsapp-chat"
              className="whatsapp-chat"
              onClick={apiCall}
            >
              <a
                className="blantershow-chat"
                href="https://wa.me/17167081869?text=Hi%20There!%20We are here for you!"
                target="_blank"
              >
                <Image
                  src={whatsappIconFooter}
                  alt="whatsapp"
                  className="whatsapp-icon-footer"
                />
                <span className="chat-text">Free Quote On Whatsapp</span>{" "}
              </a>
            </button>
            {/* whatsapp module */}
            <button
              id="whatsapp-chat-2"
              className="whatsapp-chat"
              onClick={apiCall}
            >
              <a
                className="blantershow-chat2"
                href="https://wa.me/17167081869?text=Hi%20There!%20We are here for you!"
                target="_blank"
              >
                <Image
                  src={whatsappIcon2}
                  alt="whatsapp"
                  className="whatsapp-icon-footer"
                />
              </a>
            </button>
          </div>
        )}
      </div>
    );
  }
};

export default Footer;
