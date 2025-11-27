"use client";

import axiosInstance from "@/app/axios";
import { usePathname } from "next/navigation";
import React, { FC, useEffect, useState } from "react";

interface ZohoFormProps {
  nameValue: string;
}
const ZohoForm: FC<ZohoFormProps> = ({ nameValue }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [FBCLID, setFBCLID] = useState("");
  const [GCLID, setGCLID] = useState("");
  const [wholeUrl, setWholeUrl] = useState<string>("");
  const currentPage = usePathname();

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!email) {
      alert("Please enter an email address.");
      return;
    }
    const form = event.currentTarget;
    const fd = new FormData();
    if (FBCLID) {
      fd.append("fbclid", FBCLID);
    }
    if (GCLID) {
      fd.append("gclid", GCLID);
    }
    fd.append("url", wholeUrl);
    fd.append("email", email);
    console.log("fd: ", fd);
    try {
      const res = await axiosInstance.post(`/order/quote`, fd);
      form.submit();
      setIsSubmitting(true);
    } catch (error) {
      alert("Failed to send request try again later");
    }
  };

  return (
    <div className="bg-white text-black px-5 pb-4 pt-2 rounded-lg shadow-md w-full">
      {currentPage === "/savemytime/" && (
        <p className="font-bold text-sm py-1">Download your free guide</p>
      )}
      <form
        id="webform5887452000002483064"
        action="https://crm.zoho.com/crm/WebToLeadForm"
        method="POST"
        onSubmit={handleSubmit}
        className="flex flex-col items-start gap-4 sm:w-full pt-2"
      >
        {/* Hidden Inputs */}
        <input
          type="hidden"
          name="xnQsjsdp"
          value="955d12b2d220569ab6018a3f0681d057b1ed2ec99175afbec3de526f9762389f"
        />
        <input type="hidden" name="zc_gad" id="zc_gad" value="" />
        <input
          type="hidden"
          name="xmIwtLD"
          value="cc693b8eccc0bf450c221ef415fb486cd73cc04713a33ac8c002e46d690ecfeba6564f97ec05313b58e48874312275fa"
        />
        <input type="hidden" name="actionType" value="TGVhZHM=" />
        <input
          type="hidden"
          name="returnURL"
          value="https://scholarlyhelp.com/thank-you-2/"
        />
        <input type="hidden" name={nameValue} value="DefaultLastName" />

        {/* Email Field */}
        <div className="sm:w-full sm:flex items-center border-2 border-[#c1c1c1] rounded-lg p-2 bg-white">
          <input
            type="email"
            id="Email"
            name="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border-none outline-none text-gray-800 pl-2"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-orange-500 text-white rounded cursor-pointer min-w-[200px] min-h-[40px] "
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Get A Free Quote"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ZohoForm;
