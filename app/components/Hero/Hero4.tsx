"use client";
import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import heroBg from "@/app/assets/Images/hero4Bg1.png";
import heroBg2 from "@/app/assets/Images/hero4bg2.png";
import yellowEnvalop from "@/app/assets/Images/yellowEnvalop.png";
import axiosInstance from "@/app/axios";
import { isEmailValid } from "@/app/utilities/utilities";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import ZohoForm2 from "./ZohoForm2";

interface Hero4Props {}

const Hero4: FC<Hero4Props> = () => {
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
      className="lg:px-[90px] px-[42px] lg:h-[675px] bg-primary-300 bg-no-repeat bg-center bg-cover lg:pt-0 pt-5"
      style={{
        backgroundImage: `${isMobile ? "none" : `url(${heroBg.src})`}`,
      }}
    >
      <div className="container mx-auto  flex flex-col justify-center h-full">
        <div className="lg:max-w-[550px]">
          <h1 className="sm:w-[442px]">
            <span className="sm:text-[41px] text-3xl font-bold text-primary-500 sm:leading-[52px]">
              Still thinking about Outsourcing Your
            </span>{" "}
            <span className="sm:text-[54px] text-3xl sm:leading-[70px] font-bold text-primary-500">
              Online Classes?
            </span>
          </h1>
          <p className="text-lg text-primary-500 mb-5 leading-8">
            500+ students trust us to handle their toughest classes.
            <br className="sm:block hidden" />
            Now, it’s your turn—with an exclusive{" "}
            <span className="font-semibold text-white py-1 px-4 bg-primary-500 rounded-full">
              20% discount!
            </span>
          </p>

          <div className="max-w-[470px] ">
            {/* <form
              onSubmit={handleEmailSubmission}
              className="w-full py-4 px-5 bg-white rounded-md shadow-md"
            >
              <div className="border-2 border-[#c1c1c1] rounded-md sm:flex p-2 overflow-hidden">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailErr("");
                  }}
                  placeholder="Enter your email"
                  className="focus:outline-none w-full px-2"
                />
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="bg-secondary-400 font-medium text-white uppercase rounded-[5px] min-w-[200px] h-10 flex justify-center items-center sm:mt-0 mt-2"
                >
                  {emailLoading ? (
                    <ColorRing
                      height="40"
                      width="40"
                      ariaLabel="color-ring-loading"
                      colors={["white", "white", "white", "white", "white"]}
                    />
                  ) : (
                    "Claim 20% OFF"
                  )}
                </button>
              </div>
              {emailErr && <p className="text-red-500 text-sm">{emailErr}</p>}
            </form> */}
            {/* <ZohoForm nameValue="Last Name" /> */}
            <ZohoForm2 />

            <div className="w-[80%] mx-auto bg-[#2B1C50] p-5 rounded-b-lg">
              <div className="flex justify-center items-center mx-auto gap-3">
                <Image src={yellowEnvalop} alt="" />
                <p className="text-sm font-semibold text-white">
                  Check Spam / Junk If You Don’t
                  <br />
                  See Our Email Within Minutes
                </p>
              </div>
            </div>
          </div>
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
export default Hero4;
