"use client";

import axiosInstance from "@/app/axios";
import { isTakeMyClassEmailOnlyHeroFormPage } from "@/app/lib/takeMyClassLandingRoutes";
import { usePathname, useRouter } from "next/navigation";
import React, { FC, useEffect, useState, useRef } from "react";
import { IoIosMail } from "react-icons/io";
import { IoChatbubbles } from "react-icons/io5";
import { MdPhoneInTalk } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import Image, { StaticImageData } from "next/image";
import FormBackImg from "@/app/assets/Images/Hero-Group-195.webp";
import { usePageData } from "./usePageData";

interface ZohoForm2Props {
  nameValue?: string;
  textAreaRows?: number;
  formBackImg2?: StaticImageData;
  showStickyOnMobile?: boolean;
}

const HeroForm2: FC<ZohoForm2Props> = ({
  nameValue,
  textAreaRows = 4,
  formBackImg2,
  showStickyOnMobile = true,
}) => {
  const data = usePageData();
  const getQuote = data?.getQuote;
  const pathname = usePathname();
  const router = useRouter();
  const isEmailOnlyFormPage = isTakeMyClassEmailOnlyHeroFormPage(pathname);
  const ctaButtonText = isEmailOnlyFormPage
    ? "Get My Academic Plan Now"
    : getQuote?.ctaButton?.text || "SECURE MY 'A' OR 'B' GRADES";

  const [formData, setFormData] = useState({
    Email: "",
    Last_Name: "DefaultLastName",
    Phone: "",
    Description: "",
  });
  const [FBCLID, setFBCLID] = useState("");
  const [GCLID, setGCLID] = useState("");
  const [wholeUrl, setWholeUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setWholeUrl(window.location?.href ?? "");
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const fbclid = searchParams.get("fbclid");
    const gclid = searchParams.get("gclid");

    if (fbclid) {
      setFBCLID(fbclid);
    }
    if (gclid) {
      setGCLID(gclid);
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!formRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFormVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      },
    );

    observer.observe(formRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (required = false) => {
    const email = formData.Email.trim();
    if (!email) {
      if (required) {
        alert("Please enter your email address.");
        return false;
      }
      return true;
    }
    const at = email.indexOf("@");
    const dot = email.lastIndexOf(".");
    if (at < 1 || dot < at + 2 || dot + 2 >= email.length) {
      alert("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const checkMandatory = () => {
    if (isEmailOnlyFormPage) {
      return validateEmail(true);
    }
    if (!formData.Last_Name.trim()) {
      alert("Last Name cannot be empty.");
      return false;
    }
    return validateEmail();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!checkMandatory()) {
      setLoading(false);
      return;
    }

    try {
      if (isEmailOnlyFormPage) {
        const email = formData.Email.trim();
        const landingPage = pathname || "";

        void fetch("/api/tmc-lp-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            fbc: FBCLID,
            landingPage,
          }),
        }).catch(() => {});

        void fetch("/api/tmc-lp-landing-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            formType: "email-only",
            fbclid: FBCLID,
            gclid: GCLID,
            landingPage,
          }),
        }).catch(() => {});

        await axiosInstance.post(`/order/take-my-class/`, {
          phoneNumber: "",
          PageURL: wholeUrl,
          email,
          FBCLID,
          GCLID,
        });
        setFormData({
          Email: "",
          Last_Name: "DefaultLastName",
          Phone: "",
          Description: "",
        });
        setLoading(false);
        router.push("/thank-you-2");
        return;
      }

      const fd = new FormData();
      if (FBCLID) fd.append("fbclid", FBCLID);
      if (GCLID) fd.append("gclid", GCLID);
      fd.append("url", wholeUrl);
      if (formData.Email) fd.append("email", formData.Email);
      if (formData.Phone) fd.append("phone_number", formData.Phone);
      if (formData.Description) fd.append("instructions", formData.Description);

      void fetch("/api/tmc-lp-landing-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.Email,
          phone: formData.Phone,
          instructions: formData.Description,
          formType: "full-form",
          fbclid: FBCLID,
          gclid: GCLID,
          landingPage: pathname || "",
        }),
      }).catch(() => {});

      await axiosInstance.post(`/order/quote`, fd);
      setFormData({
        Email: "",
        Last_Name: "DefaultLastName",
        Phone: "",
        Description: "",
      });
      setLoading(false);
      router.push("/thank-you");
    } catch {
      alert("Failed to send request – try again later");
      setLoading(false);
      return;
    }
  };

  const scrollToForm = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isFormVisible && formRef.current) {
      const top =
        formRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      {formBackImg2 ? (
        <Image
          src={formBackImg2}
          alt="Academic success illustration"
          width={526}
          height={551}
          priority
          sizes="(max-width: 1025px) 1px, 450px"
          className="h-auto min-[1200px]:max-w-[450px] max-w-[450px] cus-img absolute min-[1200px]:right-[-280px] min-[1200px]:top-[-83px] -z-[1] max-[1025px]:hidden min-[1000px]:right-[-272px] min-[1000px]:top-[-120px]"
        />
      ) : (
        <Image
          src={FormBackImg}
          alt="Academic success illustration"
          width={400}
          priority
          sizes="(max-width: 1025px) 1px, 400px"
          className={`h-auto cus-img absolute -z-[1] max-[1025px]:hidden ${isEmailOnlyFormPage ? "w-[300px] min-[1100px]:right-[-208px] min-[1150px]:right-[-150px] min-[1200px]:right-[-225px] top-[-46px]" : "w-[400px] min-[1100px]:right-[-208px] min-[1150px]:right-[-150px] min-[1200px]:right-[-258px]"}`}
        />
      )}
      <div className="w-full mx-auto cus-div">
        <div className="w-full bg-[#263238] rounded-t-lg px-2 sm:py-3 py-2">
          {isEmailOnlyFormPage ? (<p className="text-white text-center lg:text-[28px] md:text-2xl sm:text-xl text-lg font-semibold">
            Before You{" "}
            <span className="bg-[#F56200] rounded-full px-4 -rotate-3 inline-block">
              Lose
            </span>{" "}
            Another Grade
          </p>) : (<p className="text-white text-center lg:text-[28px] md:text-2xl sm:text-xl text-lg font-semibold">
            Check Your{" "}
            <span className="bg-[#F56200] rounded-full px-4 -rotate-3 inline-block">
              Class
            </span>{" "}
            Price
          </p>)}

        </div>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white max-[768px]:bg-transparent max-[768px]:shadow-none max-[768px]:p-0 rounded-lg shadow-sm p-6 flex flex-col sm:gap-4 gap-2 -z-[999]"
          id="quote-form"
        >
          {!isEmailOnlyFormPage && (
            <div className="flex items-start border rounded-md bg-[#EDEFFE] border-[#E3E5F3] h-[65px] max-[768px]:bg-[#F5F6FA] px-4 pt-3 pb-2 min-[768px]:min-h-[150px] max-[768px]:relative">
              <textarea
                id="Description"
                name="Description"
                placeholder="What do you need help with? *"
                rows={textAreaRows}
                value={formData.Description}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent text-black outline-none resize-none text-sm pr-3 bg-[#EDEFFE] outline-none min-[768px]:min-h-[130px] max-[768px]:h-[50px]"
              />
              <div className="absolute top-[15px] right-[50px] w-[2px] h-[20px] bg-gray-200 min-[768px]:hidden"></div>
              <IoChatbubbles className="text-[#9ea9bf] text-xl mt-1 flex-shrink-0" />
            </div>
          )}


          {/* Email */}
          <div className={`flex items-center sm:h-18 h-[65px] max-[768px]:h-[50px] border rounded-md bg-[#EDEFFE] max-[768px]:bg-[#F5F6FA] border-[#E3E5F3] px-4 max-[768px]:relative ${isEmailOnlyFormPage && "md:my-5"}`}>
            <input
              type="email"
              id="Email"
              name="Email"
              placeholder="Email *"
              value={formData.Email}
              onChange={handleChange}
              required
              className="flex-1 text-black bg-transparent outline-none text-sm placeholder-[#9CA3AF] pr-3"
            />
            <div className="absolute top-[15px] right-[50px] w-[2px] h-[20px] bg-gray-200  min-[768px]:hidden"></div>
            <IoIosMail className="text-[#9ea9bf] text-xl flex-shrink-0 max-[768px]:absolute max-[768px]:right-4" />
          </div>

          {!isEmailOnlyFormPage && (
            <div className="flex text-black items-center sm:h-18 h-[65px] max-[768px]:h-[50px] border rounded-md bg-[#EDEFFE] max-[768px]:bg-[#F5F6FA] border-[#E3E5F3] px-4 max-[768px]:relative">
              <input
                type="text"
                id="Phone"
                name="Phone"
                placeholder="Mobile No to Text Your Quote *"
                value={formData.Phone}
                onChange={handleChange}
                maxLength={30}
                required
                className="flex-1 bg-transparent outline-none text-sm placeholder-[#9CA3AF] pr-3 "
              />
              <div className="absolute top-[15px] right-[50px] w-[2px] h-[20px] bg-gray-200 min-[768px]:hidden"></div>
              <MdPhoneInTalk className="text-[#9ea9bf] text-xl flex-shrink-0 max-[768px]:absolute max-[768px]:right-4" />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md px-3 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px] w-full"
          >
            {loading ? (
              <ClipLoader color="#fff" size={22} />
            ) : (
              ctaButtonText
            )}
          </button>
        </form>
      </div>

      {/* Sticky Button for Mobile - Only visible when form is NOT visible */}
      {/* {showStickyOnMobile && (!isMobile ? !isFormVisible : true) ? ( */}
      {showStickyOnMobile && !isFormVisible ? (
        <button
          type="button"
          onClick={scrollToForm}
          className="fixed bottom-2 left-1/2 -translate-x-1/2 px-4 sm:w-fit w-[75%] h-12 rounded-md font-medium text-sm text-white uppercase tracking-wider bg-[#ff641a] hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] border border-transparent shadow-lg transition-all duration-300 z-50 cursor-pointer"
        >
          {ctaButtonText}
        </button>
      ) : null}
    </div>
  );
};

export default HeroForm2;
