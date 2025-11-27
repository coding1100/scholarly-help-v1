"use client";
import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import heroBg from "@/app/assets/Images/hero3Bg.png";
import heroBg2 from "@/app/assets/Images/hero3Bg2.png";
import axiosInstance from "@/app/axios";
import { isEmailValid } from "@/app/utilities/utilities";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
// import { ColorRing } from "react-loader-spinner";
import ZohoForm2 from "./ZohoForm2";

interface Hero3Props {}

const Hero3: FC<Hero3Props> = () => {
  const [email, setEmail] = useState<string>("");
  const [emailErr, setEmailErr] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [FBCLID, setFBCLID] = useState("");
  const [GCLID, setGCLID] = useState("");
  const [wholeUrl, setWholeUrl] = useState<string>("");

  const { isMobile } = useBreakpoint();
  const currentPage = usePathname();
  const router = useRouter();

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

  const handleEmailSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("redirectFromThankYouPage", wholeUrl);
    if (!email) {
      setEmailErr("Please enter a valid email address");
      return;
    }
    const isValidEmail = isEmailValid(email);

    if (!isValidEmail) {
      setEmailErr("Invalid Email");
      return;
    }
    setEmailLoading(true);

    const fd = new FormData();
    if (FBCLID) {
      fd.append("fbclid", FBCLID);
    }
    if (GCLID) {
      fd.append("gclid", GCLID);
    }
    if (email) {
      fd.append("email", email);
    }
    fd.append("url", wholeUrl);

    try {
      await axiosInstance.post(`/order/quote`, fd);
      setEmailLoading(false);
      router.push("/thank-you-2/");
    } catch (error) {
      // @ts-ignore
      alert(error?.response?.data?.message);
      setEmailLoading(false);
    }
  };

  return (
    <div
      className="lg:px-[90px] px-[42px] lg:h-[675px] bg-no-repeat bg-center bg-cover lg:pt-0 pt-5"
      style={{
        backgroundImage: `${isMobile ? "none" : `url(${heroBg.src})`}`,
      }}
    >
      <div className="container mx-auto  flex flex-col justify-center h-full">
        <div className="lg:max-w-[550px]">
          <h1 className="lg:text-[31px] sm:text-2xl text-xl font-medium text-primary-500 sm:mb-7 mb-4 lg:leading-[42px]">
            Reclaim{" "}
            <span className="lg:text-[38px] sm:text-3xl text-2xl font-semibold text-secondary-500">
              40+ Hours a Month!
            </span>{" "}
            We&#39;ll Handle Your{" "}
            <span className="text-primary-400 font-semibold">Classes</span>{" "}
            While You Start a Profitable Business
          </h1>
          <p className="lg:text-[31px] sm:text-2xl text-xl font-medium text-primary-500 mb-[30px] lg:leading-[42px]">
            Here&#39;s 5 Profitable Business Ideas You Can Launch By Saving Your{" "}
            <br className="lg:block sm:hidden" />
            <span className="bg-primary-400 pt-[5px] pb-[6px] px-2 rounded-[6px] text-white lg:text-[28px] sm:text-xl text-lg font-medium">
              40 Hours
            </span>{" "}
          </p>
          <ZohoForm2 />
          {/* <ZohoForm nameValue="Last Name" /> */}
          {/* <form
            onSubmit={handleEmailSubmission}
            className="w-full sm:flex items-center gap-2"
          >
            <div className="sm:w-[286px] h-[57px] border border-[#919191] rounded-[5px] flex items-center px-4">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailErr("");
                }}
                placeholder="Email Address"
                className="focus:outline-none w-full text-xs italic "
              />
            </div>
            <button
              type="submit"
              disabled={emailLoading}
              className="bg-secondary-500 text-[15px] sm:font-bold font-semibold text-white uppercase rounded-[5px] sm:w-[254px] w-[280px] h-[54px] flex justify-center items-center sm:mt-0 mt-2"
            >
              {emailLoading ? (
                <ColorRing
                  height="40"
                  width="40"
                  ariaLabel="color-ring-loading"
                  colors={["white", "white", "white", "white", "white"]}
                />
              ) : (
                "Download your free guide"
              )}
            </button>
          </form> */}
          {emailErr && <p className="text-red-500 text-sm">{emailErr}</p>}
        </div>
        <div className="lg:hidden w-full flex justify-center mt-5">
          <Image
            src={heroBg2}
            alt="savemytime"
            className="sm:max-w-[400px] max-w-[300px]"
          />
        </div>
      </div>
    </div>
  );
};
export default Hero3;
