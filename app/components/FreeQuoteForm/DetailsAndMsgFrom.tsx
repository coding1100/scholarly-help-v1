"use client";
import ContactDiary from "@/app/assets/Icons/contactdiary.svg";
import axiosInstance from "@/app/axios";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { ColorRing } from "react-loader-spinner";

type PhoneEmailPayload = {
  FBCLID: string;
  GCLID: string;
  contact_details: string;
  page_url: string;
};

interface DetailsAndMsgFormProps {}

const DetailsAndMsgForm: FC<DetailsAndMsgFormProps> = ({}) => {
  const [GCLID, setGCLID] = useState("");
  const [FBCLID, setFBCLID] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [contactDetails, setContactDetails] = useState<string>("");
  const [withEmailLoading, setWithEmailLoading] = useState(false);
  const [withPhoneLoading, setWithPhoneLoading] = useState(false);
  const [wholeUrl, setWholeUrl] = useState<string>("");

  const currentPage = usePathname();
  // const wholeUrl = window.location.href;
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      setWholeUrl(url);
    }
    if (window?.location?.href?.includes("fbclid=")) {
      setFBCLID(window?.location?.href);
    }
    if (window?.location?.href?.includes("gclid=")) {
      setGCLID(window?.location?.href);
    }
  }, []);

  const handlePhoneEmailForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithEmailLoading(true);
    const regex = /^(.+@.+|\d{10}|\+\d{1,2}\(\d{3}\)\d{3}-\d{4})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (currentPage === "/take-my-class/") {
      if (!emailRegex.test(contactDetails)) {
        setPhoneErr("❌ Please enter a valid email.");
        setWithEmailLoading(false);
        return;
      }
      if (!contactDetails) {
        setPhoneErr("Please enter email.");
        setWithEmailLoading(false);
        return;
      }
    } else {
      if (!regex.test(contactDetails)) {
        setPhoneErr("❌ Please enter a valid email or phone number.");
        setWithEmailLoading(false);
        return;
      }
      if (!contactDetails) {
        setPhoneErr("Please enter email or phone number.");
        setWithEmailLoading(false);
        return;
      }
    }
    // const fd = new FormData();
    // if (FBCLID) {
    //   fd.append("fbclid", FBCLID);
    // }
    // if (GCLID) {
    //   fd.append("gclid", GCLID);
    // }
    // fd.append("contact_details", contactDetails);
    const payload: PhoneEmailPayload = {
      FBCLID: FBCLID,
      GCLID: GCLID,
      contact_details: contactDetails,
      page_url: wholeUrl,
    };
    const contact_details = contactDetails;
    try {
      await axiosInstance.post(`/order/do-my-exam/`, payload);
      setWithPhoneLoading(false);
      setWithEmailLoading(false);
      router.push("/thank-you-2");
    } catch (error) {
      // @ts-ignore
      setSubmissionErr(error?.response?.data?.message);
      //   setShow(true);
      setWithEmailLoading(false);
    }
  };
  return (
    <div className="w-full pt-10 pb-5">
      <p className="font-bold text-center md:text-4xl text-2xl text-primary-500">
        Get a Text Back in 5 Minutes!
      </p>
      <div className="py-5 px-5 rounded-md mt-3">
        <div className="flex justify-center">
          <div className="submission-container p-2 p-sm-0 2xl:w-[48%] xl:w-[55%] lg:w-[65%] md:w-[75%] w-full">
            <div className="flex flex-col items-start">
              <form
                onSubmit={handlePhoneEmailForm}
                className="flex gap-3 w-full p-1 items-center rounded-md border-2 border-[#c1c1c1] bg-white shadow-md"
              >
                <Image src={ContactDiary} alt="" />
                <input
                  type="text"
                  placeholder={
                    currentPage === "/take-my-class/"
                      ? "Email"
                      : "Phone / Email"
                  }
                  value={contactDetails}
                  onChange={(e) => {
                    setContactDetails(e.target.value);
                    setPhoneErr("");
                  }}
                  className="w-full focus:outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={withEmailLoading}
                  className={`min-w-[200px] min-h-[40px] rounded text-white ${
                    withEmailLoading ? "bg-gray-400" : "bg-[#fd7636]"
                  }`}
                >
                  {withEmailLoading ? (
                    <div className="flex justify-center">
                      <ColorRing
                        height="40"
                        width="40"
                        ariaLabel="color-ring-loading"
                        colors={["white", "white", "white", "white", "white"]}
                      />
                    </div>
                  ) : (
                    "Email Me Free Quote"
                  )}
                </button>
              </form>
              {phoneErr && <div className="text-red-500">{phoneErr}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsAndMsgForm;
