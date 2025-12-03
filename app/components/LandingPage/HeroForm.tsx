"use client";

import axiosInstance from "@/app/axios";
import { usePathname, useRouter } from "next/navigation";
import React, { FC, useEffect, useState, useRef } from "react";
import { IoIosMail } from "react-icons/io";
import { IoChatbubbles } from "react-icons/io5";
import { MdPhoneInTalk } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import Image from "next/image";
import FormBackImg from "@/app/assets/Images/Hero-Group-195.png";

interface ZohoForm2Props {
  nameValue?: string;
  textAreaRows?: number;
}

const HeroForm: FC<ZohoForm2Props> = ({ nameValue, textAreaRows = 4 }) => {
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
  const currentPage = usePathname();
  const router = useRouter();

  useEffect(() => {
    setWholeUrl(window.location?.href ?? currentPage);
  }, [currentPage]);

  useEffect(() => {
    const href = window?.location?.href ?? "";
    if (href.includes("fbclid=")) setFBCLID(href);
    if (href.includes("gclid=")) setGCLID(href);
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

    const checkVisibility = () => {
      if (!formRef.current) return;
      const rect = formRef.current.getBoundingClientRect();
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight;
      // Form is visible if any part of it is in the viewport
      const visible = rect.top < windowHeight && rect.bottom > 0;
      setIsFormVisible(visible);
    };

    // Check initial visibility
    checkVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFormVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px", // Account for button space at bottom
      }
    );

    observer.observe(formRef.current);

    // Also check on scroll for more reliable detection
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = () => {
    const email = formData.Email.trim();
    if (!email) return true;
    const at = email.indexOf("@");
    const dot = email.lastIndexOf(".");
    if (at < 1 || dot < at + 2 || dot + 2 >= email.length) {
      alert("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const checkMandatory = () => {
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

    const fd = new FormData();
    if (FBCLID) fd.append("fbclid", FBCLID);
    if (GCLID) fd.append("gclid", GCLID);
    fd.append("url", wholeUrl);
    fd.append("email", formData.Email);
    if (formData.Phone) fd.append("phone_number", formData.Phone);
    if (formData.Description) fd.append("instructions", formData.Description);

    try {
      await axiosInstance.post(`/order/quote`, fd);
      // Clear form fields on successful submission
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
      <Image
        src={FormBackImg}
        alt="bg1"
        className="cus-img absolute min-[1200px]:right-[-258px] -z-[1] max-[1025px]:hidden min-[1100px]:right-[-208px] min-[1150px]:right-[-150px]"
      />
      <div className="max-w-[600px] mx-auto cus-div">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4 -z-[999]"
        >
          {/* Email Field */}
          <div className="flex items-center sm:h-18 h-[65px] border rounded-md bg-[#EDEFFE] border-[#E3E5F3] px-4">
            <input
              type="email"
              id="Email"
              name="Email"
              placeholder="Email *"
              value={formData.Email}
              onChange={handleChange}
              required
              className="flex-1 bg-transparent outline-none text-sm placeholder-[#9CA3AF] pr-3 "
            />
            <IoIosMail className="text-[#6B7280] text-xl" />
          </div>

          {/* Phone Field */}
          <div className="flex items-center sm:h-18 h-[65px] border rounded-md bg-[#EDEFFE] border-[#E3E5F3] px-4">
            <input
              type="text"
              id="Phone"
              name="Phone"
              placeholder="Phone # *"
              value={formData.Phone}
              onChange={handleChange}
              maxLength={30}
              required
              className="flex-1 bg-transparent outline-none text-sm placeholder-[#9CA3AF] pr-3 "
            />
            <MdPhoneInTalk className="text-[#6B7280] text-xl" />
          </div>

          {/* Instructions Field */}
          <div className="flex items-start border rounded-md bg-[#EDEFFE] border-[#E3E5F3] px-4 pt-3 pb-2 min-h-[150px">
            <textarea
              id="Description"
              name="Description"
              placeholder="What do you need help with? *"
              rows={textAreaRows}
              value={formData.Description}
              onChange={handleChange}
              required
              className="flex-1 bg-transparent text-black outline-none resize-none text-sm placeholder-[#9CA3AF] pr-3 bg-[#EDEFFE] min-h-[150px]"
            />
            <IoChatbubbles className="text-[#6B7280] text-xl mt-1 flex-shrink-0" />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md px-3 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px] w-full"
          >
            {loading ? (
              <ClipLoader color="#fff" size={22} />
            ) : (
              "Get My Free, Confidential Quote"
            )}
          </button>
        </form>
      </div>

      {/* Sticky Button for Mobile - Only visible when form is NOT visible */}
      {isMobile && !isFormVisible ? (
        <button
          type="button"
          onClick={scrollToForm}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[75%] h-12 rounded-md font-medium text-sm text-white uppercase tracking-wider bg-[#ff641a] hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] border border-transparent shadow-lg transition-all duration-300 z-50 cursor-pointer"
        >
          Get My Free, Confidential Quote
        </button>
      ) : null}
    </div>
  );
};

export default HeroForm;
