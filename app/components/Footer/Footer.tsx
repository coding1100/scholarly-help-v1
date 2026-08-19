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
import { FC, useEffect, useState, useRef } from "react";
import CopyRight from "./CopyRight";
import LogoNormal from "@/app/assets/Images/logo.svg";
import cellPhone from "@/app/assets/Images/cellphone.png";
import { usePathname } from "next/navigation";
import { hideFooterLinks, smsHide, showSmsModule } from "../HideLinks/HideLinks";
// import "./footer.css";
// import ChatBubble from "@/app/assets/Icons/ChatBubble";
import chatBubble from "@/app/assets/Images/chatBubble.png";
import axios from "axios";
import { FaSnapchat } from "react-icons/fa";
import { SiYoutubemusic } from "react-icons/si";

interface FooterProps {}
const Footer: FC<FooterProps> = ({}) => {
  const currentPage = usePathname();
  const hidelinksfooter = hideFooterLinks.includes(currentPage);
  const hideSMS = smsHide.includes(currentPage);
  // The "Text Us" SMS button is shown ONLY on the thank-you pages.
  const showTextUsSms = showSmsModule.includes(currentPage);
  const [GCLID, setGCLID] = useState("");
  const [url, setUrl] = useState("");
  const [isFooterInView, setIsFooterInView] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window?.location?.href?.includes("gclid=")) {
      setGCLID(window?.location?.href);
    }

    setUrl(window?.location?.href);
  }, []);

  useEffect(() => {
    if (!footerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        // Start treating footer as "in view" a bit earlier (offset from bottom)
        // so z-[999] drops before it fully reaches the viewport
        rootMargin: "0px 0px 100px 0px",
      },
    );

    observer.observe(footerRef.current);

    return () => {
      observer.disconnect();
    };
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
          <div className=" w-full max-w-7xl mx-auto md:flex justify-between gap-6 max-[768px]:px-10 text-primary-600">
            <div className="md:max-w-[372px]">
              <Link href="/">
                <Image
                  src={LogoNormal}
                  alt="Scholarly Help"
                  className="max-w-[142px] min-w-[142px]"
                  width={138}
                  height={36}
                  priority
                />
              </Link>
              <div className="mt-3">
                <p className="leading-5 w-full">
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
                    +1 646 480 6092
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
                    <Image
                      width={30}
                      height={30}
                      src={MasterCard}
                      alt="MasterCard"
                    />
                  </div>
                  <div className="w-5 mr-1">
                    <Image width={30} height={30} src={Visa} alt="Visa" />
                  </div>
                  <div className="w-5 mr-1">
                    <Image
                      width={30}
                      height={30}
                      src={AmericanExpress}
                      alt="AmericanExpress"
                    />
                  </div>
                  <div className="w-5 mr-1">
                    <Image width={30} height={30} src={Paypal} alt="Paypal" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CopyRight />
        {!hideSMS && (
          <div>
            {/* sms module - desktop */}
            <button
              id="sms-chat"
              className="fixed flex justify-between z-[98] left-0 bg-transparent border-none hidden md:flex"
              onClick={apiCall}
            >
              <a
                href={`sms:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`}
                className="fixed flex font-normal justify-between z-[98] bottom-[80px] left-0 text-[15px] py-[10px] px-[20px] no-underline bg-[#36454F] ml-[5px] rounded-[50px] items-center min-w-[44px] min-h-[44px]"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Send us an SMS"
              >
                <Image src={chatBubble} alt="SMS" className="w-[35px]" />
                <span className="pl-[10px] ml-[15px] font-bold text-white relative -left-[14px]">
                  Send SMS
                </span>
              </a>
            </button>

            {/* sms module - mobile */}
            <button
              id="sms-chat2"
              className="fixed flex justify-between z-[98] left-0 bg-transparent border-none md:hidden flex z-[99999]"
              onClick={apiCall}
            >
              <a
                href={`sms:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`}
                className="fixed flex font-normal justify-between z-[98] bottom-[55px] left-0 text-[15px] py-0 px-[5px] no-underline ml-[5px] rounded-[50px] items-center min-w-[44px] min-h-[44px]"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Send us an SMS"
              >
                <Image
                  src={cellPhone}
                  alt="SMS"
                  className="w-[45px] max-[768px]:w-[37px]"
                />
              </a>
            </button>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <div className="bg-primary-200 md:flex justify-center py-14">
          <div className="w-full max-w-7xl mx-auto md:flex justify-between gap-6 max-[768px]:px-10 text-primary-600">
            <div className="md:max-w-[372px]">
              <Link href="/">
                <Image
                  src={LogoNormal}
                  alt="Scholarly Help"
                  className="w-[138px]"
                  width={138}
                  height={36}
                  priority
                />
              </Link>
              <div className="mt-3">
                <p className="leading-5 w-full">
                  Scholarly Help delivers academic writing services. Our team of
                  qualified subject experts can help you with your challenging
                  online classes
                  {currentPage !== "/do-my-class-2/" &&
                    ", homework, assignments, quizzes, and exams"}
                  .
                </p>
              </div>
            </div>
            <div
              className={
                currentPage !== "/do-my-class-2/"
                  ? "grid grid-cols-2 md:grid-cols-4 md:gap-x-6 gap-x-3 gap-y-4 w-full md:flex-1"
                  : ""
              }
            >
              {currentPage !== "/do-my-class-2/" && (
                <>
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
                          href="/samples/"
                        >
                          <p>Samples</p>
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
                </>
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
                      +1 646 480 6092
                    </a>
                  </div>
                  <div className="flex my-2">
                    <div className="w-5 mr-1">
                      <a
                        target="_blank"
                        href="https://www.facebook.com/Scholarly.help"
                        rel="noopener noreferrer"
                        aria-label="Follow us on Facebook"
                        className="inline-flex items-center justify-center w-5 h-5"
                      >
                        <Facebook color="#2b1c51" />
                      </a>
                    </div>
                    <div className="w-5 mr-1">
                      <a
                        target="_blank"
                        href="https://www.instagram.com/scholarlyhelp/"
                        rel="noopener noreferrer"
                        aria-label="Follow us on Instagram"
                        className="inline-flex items-center justify-center w-5 h-5"
                      >
                        <Image src={Instagram} alt="instagram" />
                      </a>
                    </div>
                    <div className="w-5 mr-1">
                      <a
                        target="_blank"
                        href="https://www.linkedin.com/company/scholarlyhelp/"
                        rel="noopener noreferrer"
                        aria-label="Follow us on LinkedIn"
                        className="inline-flex items-center justify-center w-5 h-5"
                      >
                        <Image src={Linkedin} alt="Linkedin" />
                      </a>
                    </div>
                    <div className="w-5 mr-1">
                      <a
                        target="_blank"
                        href="https://www.tiktok.com/@scholarlyhelp.com"
                        rel="noopener noreferrer"
                        aria-label="Follow us on TikTok"
                        className="inline-flex items-center justify-center w-5 h-5"
                      >
                        <Image src={Tiktok} alt="Tiktok" />
                      </a>
                    </div>
                    <div className="w-5 h-5 text-[21px] text-[#000] mr-1">
                      <a
                        target="_blank"
                        href="https://www.snapchat.com/add/helpscholarly"
                        rel="noopener noreferrer"
                        aria-label="Follow us on Snapchat"
                        className="inline-flex items-center justify-center w-5 h-5"
                      >
                        <FaSnapchat />
                      </a>
                    </div>
                    <div className="w-5 h-5 text-[21px] text-[#000]">
                      <a
                        target="_blank"
                        href="https://www.youtube.com/@ScholarlyHelp/"
                        rel="noopener noreferrer"
                        aria-label="Visit our YouTube channel"
                        className="inline-flex items-center justify-center w-5 h-5"
                      >
                        <SiYoutubemusic />
                      </a>
                    </div>
                    {/* <div className="w-5 h-5 mr-1 rounded-full bg-primary-500"></div> */}
                  </div>

                  <div className="flex my-2">
                    <div className="w-5 mr-1">
                      <Image
                        width={30}
                        height={30}
                        src={MasterCard}
                        alt="MasterCard"
                      />
                    </div>
                    <div className="w-5 mr-1">
                      <Image width={30} height={30} src={Visa} alt="Visa" />
                    </div>
                    <div className="w-5 mr-1">
                      <Image
                        width={30}
                        height={30}
                        src={AmericanExpress}
                        alt="AmericanExpress"
                      />
                    </div>
                    <div className="w-5 mr-1">
                      <Image width={30} height={30} src={Paypal} alt="Paypal" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CopyRight />
        {showTextUsSms && (
          <div>
            {/* sms module - desktop */}
            <button
              id="sms-chat"
              className="fixed flex justify-between z-[98] left-0 bg-transparent border-none hidden md:flex"
              onClick={apiCall}
            >
              <a
                href={`sms:${process.env.NEXT_PUBLIC_TEXT_US_PHONE_NUMBER || "14108445419"}`}
                className="fixed flex font-normal justify-between z-[98] bottom-[80px] left-0 text-[15px] py-[10px] px-[20px] no-underline bg-[#36454F] ml-[5px] rounded-[50px] items-center min-w-[44px] min-h-[44px]"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Send us an SMS"
              >
                <Image src={chatBubble} alt="SMS" className="w-[35px]" />
                <span className="pl-[10px] ml-[15px] font-bold text-white relative -left-[14px]">
                  Text Us
                </span>
              </a>
            </button>

            {/* sms module - mobile */}
            <button
              id="sms-chat2"
              className="fixed flex justify-between z-[98] left-0 bg-transparent border-none md:hidden flex z-[99999]"
              onClick={apiCall}
            >
              <a
                href={`sms:${process.env.NEXT_PUBLIC_TEXT_US_PHONE_NUMBER || "14108445419"}`}
                className="fixed flex font-normal justify-between z-[98] bottom-[55px] left-0 text-[15px] py-0 px-[5px] no-underline ml-[5px] rounded-[50px] items-center min-w-[44px] min-h-[44px]"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Send us an SMS"
              >
                <Image
                  src={cellPhone}
                  alt="SMS"
                  className="w-[45px] max-[768px]:w-[37px]"
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
