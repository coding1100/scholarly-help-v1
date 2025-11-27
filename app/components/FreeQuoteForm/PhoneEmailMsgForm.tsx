"use client";
import emailIcon from "@/app/assets/Images/email-quote.png";
import axiosInstance from "@/app/axios";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { ColorRing } from "react-loader-spinner";
import PhoneNumberInput from "../PhoneInput/PhoneInput";

type PayLoad = {
  email: string;
  phoneNumber: string;
  PageURL: string;
  FBCLID: string;
  GCLID: string;
};

interface PhoneEmailMsgFromProps {}

const PhoneEmailMsgFrom: FC<PhoneEmailMsgFromProps> = ({}) => {
  const [email, setEmail] = useState<any>("");
  const [emailErr, setEmailErr] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneErr, setPhoneErr] = useState<string>("");
  const [instructions, setInstructions] = useState("");
  const [GCLID, setGCLID] = useState("");
  const [FBCLID, setFBCLID] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [wholeUrl, setWholeUrl] = useState<string>("");
  const router = useRouter();
  // const wholeUrl = window.location.href;
  const currentPage = usePathname();
  useEffect(() => {
    // Ensure this code runs only on the client
    if (typeof window !== "undefined") {
      const url = window.location.href;
      setWholeUrl(url);

      if (url.includes("fbclid=")) {
        setFBCLID(url);
      }
      if (url.includes("gclid=")) {
        setGCLID(url);
      }
    }
  }, []);
  const submitBtnClass = "min-w-[200px] min-h-[40px] rounded text-white";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\+1[2-9]\d{2}[2-9](?!11)\d{6}$/;
    if (currentPage !== "/take-my-class/") {
      if (!phoneNumber) {
        setPhoneErr("Phone Number is required");
        setLoading(false);
        return;
      }
      if (!phoneRegex.test(phoneNumber)) {
        setPhoneErr("Invalid Phone Number");
        setLoading(false);
        return;
      }
    }
    if (email && !emailRegex.test(email)) {
      setEmailErr("Invalid Email");
      setLoading(false);
      return;
    }

    const payload: PayLoad = {
      phoneNumber: phoneNumber,
      PageURL: wholeUrl,
      email: email,
      FBCLID: FBCLID,
      GCLID: GCLID,
    };
    console.log(payload);
    try {
      await axiosInstance.post(`/order/take-my-class/`, payload);
      setLoading(false);
      router.push("/thank-you-2");
    } catch (error) {
      // @ts-ignore
      setSubmissionErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full" id="PhoneEmailMsgForm">
      <div className="bg-white py-5 px-5 rounded-md mt-3">
        <form className="flex flex-col gap-2" onSubmit={handleFormSubmit}>
          <div className="flex flex-col items-start">
            {currentPage !== "/take-my-class/" && (
              <div className="flex justify-between w-full p-1 items-center rounded-md border-2 border-[#c1c1c1]">
                <PhoneNumberInput
                  value={phoneNumber}
                  setValue={(val) => {
                    setPhoneErr("");
                    setPhoneNumber(val);
                  }}
                />
              </div>
            )}
            {phoneErr && <div className="text-red-500">{phoneErr}</div>}
          </div>
          <div className="flex flex-col w-full">
            <div className="min-h-[50px] flex justify-between w-full p-1 items-center rounded-md border-2 border-[#c1c1c1]">
              <div className="w-full flex items-center pl-1">
                <Image src={emailIcon} alt="email" className="w-6 h-4" />
                <input
                  className="w-full focus:outline-none pl-2"
                  placeholder="@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmailErr("");
                    setEmail(e.target.value);
                  }}
                />
              </div>
            </div>
            {emailErr && <div className="text-red-500">{emailErr}</div>}
          </div>
          <div className="flex flex-col items-start">
            <div className="min-h-[50px] flex justify-between w-full p-1 items-center rounded-md border-2 border-[#c1c1c1]">
              <div className="w-full flex items-center pl-1">
                {/* <Image src={emailIcon} alt="email" className="w-6 h-4" /> */}
                <textarea
                  rows={4}
                  className="w-full focus:outline-none pl-2"
                  placeholder="class details (optional)"
                  value={instructions}
                  onChange={(e) => {
                    setInstructions(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`min-w-[200px] min-h-[40px] rounded text-white ${
              loading ? "bg-gray-400" : "bg-[#fd7636]"
            }`}
          >
            {loading ? (
              <div className="flex justify-center">
                <ColorRing
                  height="40"
                  width="40"
                  ariaLabel="color-ring-loading"
                  colors={["white", "white", "white", "white", "white"]}
                />
              </div>
            ) : (
              "GET MY FREE QUOTE"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default PhoneEmailMsgFrom;
