"use client";

import axiosInstance from "@/app/axios";
import { usePathname, useRouter } from "next/navigation";
import React, { FC, useEffect, useState, useRef } from "react";
import { IoIosMail } from "react-icons/io";
import { IoChatbubbles } from "react-icons/io5";
import { MdPhoneInTalk } from "react-icons/md";
import { ClipLoader } from "react-spinners";

interface ZohoForm2Props {
  nameValue?: string;
  textAreaRows?: number;
}

const ZohoForm2: FC<ZohoForm2Props> = ({ nameValue, textAreaRows = 4 }) => {
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
  const [isFormVisible, setIsFormVisible] = useState<boolean>(true); // Track form visibility
  const formRef = useRef<HTMLFormElement>(null); // Reference to the form
  const route = useRouter();
  const currentPage = usePathname();

  useEffect(() => {
    if (window.location) {
      setWholeUrl(window.location.href);
    } else {
      setWholeUrl(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    if (window?.location?.href?.includes("fbclid=")) {
      setFBCLID(window?.location?.href);
    }
    if (window?.location?.href?.includes("gclid=")) {
      setGCLID(window?.location?.href);
    }
  }, []);

  // IntersectionObserver to detect form visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFormVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when 10% of the form is visible
    );

    if (formRef.current) {
      observer.observe(formRef.current);
    }

    return () => {
      if (formRef.current) {
        observer.unobserve(formRef.current);
      }
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = () => {
    const emailVal = formData.Email.trim();
    if (emailVal.length === 0) return true;

    const atpos = emailVal.indexOf("@");
    const dotpos = emailVal.lastIndexOf(".");
    if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= emailVal.length) {
      alert("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const checkMandatory = () => {
    if (formData.Last_Name.trim().length === 0) {
      alert("Last Name cannot be empty.");
      return false;
    }
    return validateEmail();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (checkMandatory()) {
      const form = e.target as HTMLFormElement;
      const submitButton = form.querySelector(".formsubmit");
      const fd = new FormData();
      if (FBCLID) {
        fd.append("fbclid", FBCLID);
      }
      if (GCLID) {
        fd.append("gclid", GCLID);
      }
      fd.append("url", wholeUrl);
      fd.append("email", formData.Email);
      if (formData.Phone) {
        fd.append("phone_number", formData.Phone);
      }
      if (formData.Description) {
        fd.append("instructions", formData.Description);
      }

      try {
        const res = await axiosInstance.post(`/order/quote`, fd);
        form.submit();
      } catch (error) {
        alert("Failed to send request try again later");
        setLoading(false);
      }
      if (submitButton) {
        submitButton.setAttribute("disabled", "true");
      }
      form.submit();
    }
  };

  const handleButtonClick = () => {
    if (!isFormVisible && formRef.current) {
      setTimeout(() => {
        if (formRef.current) {
          const formTop = formRef.current.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: formTop - 80, 
            behavior: "smooth",
          });
        }
      }, 10); 
    }
  };

  return (
    <div className="max-w-[600px]">
      <form
        ref={formRef}
        id="webform5887452000005238025"
        action="https://crm.zoho.com/crm/WebToLeadForm"
        name="WebToLeads5887452000005238025"
        method="POST"
        onSubmit={handleSubmit}
        acceptCharset="UTF-8"
        className="bg-primary-500 rounded flex flex-col gap-[9px] py-5 px-[9px]"
      >
        {/* Hidden Inputs */}
        <input
          type="hidden"
          name="xnQsjsdp"
          value="729204db6fddcde9b0550fb47b456290290e71c17e6a7a23954d135d1246a9c3"
        />
        <input type="hidden" name="zc_gad" id="zc_gad" value="" />
        <input
          type="hidden"
          name="xmIwtLD"
          value="8f2e717009b206c4097a345636ca5e02d6328b7cd18d700cdf46989793752f2f28933351a4d39c0423957df0a8e2a3ec"
        />
        <input type="hidden" name="actionType" value="TGVhZHM=" />
        <input
          type="hidden"
          name="returnURL"
          value="https://scholarlyhelp.com/thank-you-2/"
        />

        {/* Email Field */}
        <div className="flex items-center border border-[#49498B] divide-[#49498B] divide-x gap-3 rounded p-3">
          <IoIosMail className="text-[#49498B] text-lg" />
          <input
            type="email"
            id="Email"
            name="Email"
            placeholder="Email *"
            value={formData.Email}
            onChange={handleChange}
            required
            className="focus:outline-none sm:flex-grow sm:w-full w-[90%] bg-primary-500 pl-3 placeholder-white text-[13px] text-white"
          />
        </div>

        {/* Last Name Field */}
        <div className="hidden items-center border border-[#49498B] divide-[#49498B] divide-x gap-3 rounded p-3">
          <input
            type="text"
            id="Last Name"
            name="Last Name"
            value="DefaultLastName"
            readOnly
            className="focus:outline-none flex-grow bg-transparent pl-3 placeholder-white text-[13px] text-white"
          />
        </div>

        {/* Phone Field */}
        <div className="flex items-center border border-[#49498B] divide-[#49498B] divide-x gap-3 rounded p-3">
          <MdPhoneInTalk className="text-[#49498B] text-lg" />
          <input
            type="text"
            id="Phone"
            name="Phone"
            placeholder="Phone # *"
            value={formData.Phone}
            onChange={handleChange}
            maxLength={30}
            required
            className="focus:outline-none sm:flex-grow sm:w-full w-[90%] bg-primary-500 pl-3 placeholder-white text-[13px] text-white"
          />
        </div>

        {/* Description Field */}
        <div className="flex items-start border border-[#49498B] gap-3 rounded p-3">
          <IoChatbubbles className="text-[#49498B] text-lg" />
          <div className="border-r border-[#49498B] h-[20px]"></div>
          <textarea
            id="Description"
            name="Description"
            placeholder="Instructions *"
            rows={textAreaRows}
            value={formData.Description}
            onChange={handleChange}
            required
            className="focus:outline-none flex-grow bg-primary-500 placeholder-white text-[13px] text-white resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end w-full mt-4">
          <button
            type="submit"
            disabled={loading}
            onClick={handleButtonClick}
            className={`flex h-[46px] rounded justify-center items-center uppercase z-[99999999999] ${
              isFormVisible
                ? "static w-full bg-white"
                : "fixed z-[9999] bottom-[20px] font-bold left-1/2 -translate-x-1/2 w-[260px] bg-[#ececfb] border-2 border-solid border-black"
            } sm:static sm:w-full sm:transform-none sm:z-auto sm:bg-white`}
          >
            {loading ? (
              <ClipLoader color="#D1D2F8" size={20} />
            ) : (
              "Get My Free Quote"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ZohoForm2;