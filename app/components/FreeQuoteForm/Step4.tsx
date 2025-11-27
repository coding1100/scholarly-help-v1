import ContactDiary from "@/app/assets/Icons/contactdiary.svg";
import DiscaimerImg from "@/app/assets/Icons/disclaimer.png";
import emailIcon from "@/app/assets/Images/email-quote.png";
import axiosInstance from "@/app/axios";
import PhoneNumberInput from "@/app/components/PhoneInput/PhoneInput";
import { isEmailValid, isPhoneValid } from "@/app/utilities/utilities";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { FC, useEffect, useState } from "react";
import { ColorRing } from "react-loader-spinner";
import { twMerge } from "tailwind-merge";
import {
  emailFormFreeQuote,
  phoneEmail,
  wholeFromFreeQuote,
} from "../HideLinks/HideLinks";

export type ApiPayload = {
  url: string;
};

const initialApiPayload: ApiPayload = {
  url: "",
};
type Step4Props = {
  text?: string;
};

type PhoneEmailPayload = {
  FBCLID: string;
  GCLID: string;
  contact_details: string;
  page_url: string;
};

const Step4: FC<Step4Props> = ({ text }) => {
  const router = useRouter();

  const [apiPayload, setApiPayload] = useState<ApiPayload>(initialApiPayload);
  // GOOGLE click id
  const [FBCLID, setFBCLID] = useState("");
  const [GCLID, setGCLID] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState<any>("");
  const [instructions, setInstructions] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [withPhoneLoading, setWithPhoneLoading] = useState(false);
  const [withEmailLoading, setWithEmailLoading] = useState(false);
  const [submissionErr, setSubmissionErr] = useState("");
  const [show, setShow] = useState(false);
  const [contactDetails, setContactDetails] = useState<string>("");
  const [isTooltip, setIsTooltip] = useState<boolean>(false);

  const currentPage = usePathname();
  const wholeUrl = window.location.href;
  // console.log("wholeUrl", wholeUrl);
  const wholeForm = wholeFromFreeQuote.includes(currentPage);
  const EmailPhone = phoneEmail.includes(currentPage);
  const emailQuoteForm = emailFormFreeQuote.includes(currentPage);
  useEffect(() => {
    setApiPayload({
      ...apiPayload,
      url: wholeUrl,
    });
  }, []);
  const submitBtnClass = "min-w-[200px] min-h-[40px] rounded text-white";

  useEffect(() => {
    if (window?.location?.href?.includes("fbclid=")) {
      setFBCLID(window?.location?.href);
    }
    if (window?.location?.href?.includes("gclid=")) {
      setGCLID(window?.location?.href);
    }
  }, []);

  const submitWithPhone = async () => {
    // let url = `/do-my-class`;

    // localStorage.setItem("redirectFromThankYouPage", url);

    const isValidPhoneNumber = isPhoneValid(phoneNumber);
    console.log("rere");
    if (!isValidPhoneNumber) {
      setPhoneErr("Invalid Phone Number");
      return;
    }

    const fd = new FormData();
    if (FBCLID) {
      fd.append("fbclid", FBCLID);
    }
    if (GCLID) {
      fd.append("gclid", GCLID);
    }

    fd.append("url", apiPayload.url);
    if (phoneNumber) {
      fd.append("phone_number", phoneNumber);
    }
    setWithPhoneLoading(true);
    try {
      await axiosInstance.post(`/order/quote`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setWithPhoneLoading(false);
      router.push("/thank-you-2");
    } catch (error) {
      // @ts-ignore
      setSubmissionErr(error?.response?.data?.message);
      setShow(true);
      setWithPhoneLoading(false);
    }
  };
  const submitWithEmail = async () => {
    setApiPayload(email);
    let url = `/do-my-class`;

    localStorage.setItem("redirectFromThankYouPage", url);

    const isValidEmail = isEmailValid(email);

    if (!isValidEmail) {
      setEmailErr("Invalid Email");
      return;
    }
    setWithEmailLoading(true);

    let payload = {
      // ...apiPayload,
      email: email,
    };
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
    fd.append("url", apiPayload.url);

    try {
      await axiosInstance.post(`/order/quote`, fd);
      setWithEmailLoading(false);
      router.push("/thank-you-2/");
    } catch (error) {
      // @ts-ignore
      alert(error?.response?.data?.message);
      setShow(true);
      setWithEmailLoading(false);
    }
  };
  const handleWholeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValidPhoneNumber = isPhoneValid(phoneNumber);
    if (!isValidPhoneNumber) {
      setPhoneErr("Invalid Phone Number");
      return;
    }
    const fd = new FormData();
    if (FBCLID) {
      fd.append("fbclid", FBCLID);
    }
    if (GCLID) {
      fd.append("gclid", GCLID);
    }
    if (phoneNumber) {
      fd.append("phone_number", phoneNumber);
    } else {
      alert("Add Phone Number");
      return;
    }
    fd.append("url", apiPayload.url);
    if (email) {
      fd.append("email", email);
    } else {
      alert("Add Email");
      return;
    }
    if (instructions) {
      fd.append("instructions", instructions);
    }
    setWithPhoneLoading(true);
    console.log("fd", fd);
    try {
      await axiosInstance.post(
        `/order/quote`,
        fd
        // , {
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //   },
        // }
      );
      setWithPhoneLoading(false);
      router.push("/thank-you-2");
    } catch (error) {
      // @ts-ignore
      setSubmissionErr(error?.response?.data?.message);
      setShow(true);
      setWithPhoneLoading(false);
    }
  };
  const handlePhoneEmailForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithEmailLoading(true);
    const regex = /^(.+@.+|\d{10}|\+\d{1,2}\(\d{3}\)\d{3}-\d{4})$/;
    if (!regex.test(contactDetails)) {
      setPhoneErr("❌ Please enter a valid email or phone number.");
      setWithEmailLoading(false);
      return;
    }
    if (!contactDetails) {
      setPhoneErr("Please enter a valid email or phone number.");
      setWithEmailLoading(false);
      return;
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
      setShow(true);
      setWithEmailLoading(false);
    }
  };
  if (wholeForm) {
    return (
      <div className="w-[80%]">
        {currentPage !== "/do-my-class/" && (
          <p className="font-bold">Get a Text Back in 5 Minutes!</p>
        )}
        <div className="bg-white p-5 rounded-md mt-3">
          <div className="submission-container p-2 p-sm-0">
            <form onSubmit={handleWholeForm}>
              <div className="flex flex-col items-start mb-3">
                <div className="flex justify-between w-full p-1 items-center rounded-md border-2 border-[#c1c1c1]">
                  <PhoneNumberInput
                    value={phoneNumber}
                    setValue={(val) => {
                      setPhoneErr("");
                      setPhoneNumber(val);
                    }}
                  />
                </div>
                {phoneErr && (
                  <div className="text-red-500">Invalid phone number</div>
                )}
              </div>
              <div className="flex flex-col items-start mb-3">
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
                {emailErr && <div className="text-red-500">Invalid Email</div>}
              </div>
              <div className="flex flex-col items-start mb-3">
                <div className="min-h-[50px] flex justify-between w-full p-1 items-center rounded-md border-2 border-[#c1c1c1]">
                  <div className="w-full flex items-center pl-1">
                    {/* <Image src={emailIcon} alt="email" className="w-6 h-4" /> */}
                    <textarea
                      rows={4}
                      className="w-full focus:outline-none pl-2"
                      placeholder="Instructions"
                      value={instructions}
                      onChange={(e) => {
                        setInstructions(e.target.value);
                      }}
                    />
                  </div>
                </div>
                {emailErr && <div className="text-red-500">Invalid Email</div>}
              </div>
              <button
                type="submit"
                className={twMerge(
                  `${submitBtnClass} bg-[#fd7636] `,
                  withPhoneLoading && "bg-gray-400"
                )}
              >
                {withPhoneLoading ? (
                  <div className="flex justify-center">
                    <ColorRing
                      height="40"
                      width="40"
                      ariaLabel="color-ring-loading"
                      colors={["white", "white", "white", "white", "white"]}
                    />
                  </div>
                ) : (
                  "Get my free quote "
                )}
              </button>
            </form>
          </div>
          {submissionErr && (
            <div>
              <div></div>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className={`${EmailPhone && "w-full"}`}>
        {currentPage !== "/take-my-class/" && (
          <p className="font-bold">Get a Text Back in 5 Minutes!</p>
        )}
        <div className="bg-white pb-5 pt-2 px-5 rounded-md mt-3 relative">
          <Image
            src={DiscaimerImg}
            alt=""
            className="ml-auto mr-3 cursor-pointer"
            onMouseEnter={() => setIsTooltip(!isTooltip)}
          />
          {isTooltip && (
            <p
              onMouseLeave={() => setIsTooltip(false)}
              className="text-xs text-gray-600 bg-white shadow-lg rounded-md p-3 max-w-[300px] absolute -right-[250px]"
            >
              By entering your number, you agree to receive mobile messages from
              ScholarlyHelp at the phone number provided. Message frequency
              varies. Message and data rates may apply. Carriers are not liable
              for any delays or undelivered messages. Reply STOP to opt-out.
              View our Privacy Policy.
            </p>
          )}
          {/* <h4 className="text-center font-semibold text-xl">
        Just tell us your phone number / Email and we will text you ASAP
        Enter Your Contact Details and We'll Contact You ASAP
      </h4> */}
          <div className={`${!EmailPhone && "flex justify-center"}`}>
            <div className="submission-container p-2 p-sm-0">
              {emailQuoteForm ? (
                <div className="flex flex-col items-start">
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
                    <button
                      // className={`flex items-center justify-center sm:block min-w-[200px] ${
                      //   withEmailLoading && "disabled"
                      // }`}
                      className={twMerge(
                        `${submitBtnClass} bg-[#fd7636] hidden md:block`,
                        withEmailLoading && "bg-gray-400"
                      )}
                      onClick={submitWithEmail}
                    >
                      {withEmailLoading ? (
                        <div className="flex justify-center">
                          <ColorRing
                            height="40"
                            width="40"
                            ariaLabel="color-ring-loading"
                            colors={[
                              "white",
                              "white",
                              "white",
                              "white",
                              "white",
                            ]}
                          />
                        </div>
                      ) : (
                        "Get A Free Quote"
                      )}
                    </button>
                  </div>
                  <button
                    className={twMerge(
                      `${submitBtnClass} bg-[#fd7636] block md:hidden mt-3`,
                      withEmailLoading && "bg-gray-400"
                    )}
                    onClick={submitWithEmail}
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
                  {emailErr && (
                    <div className="text-red-500">Invalid Email</div>
                  )}
                </div>
              ) : (
                <>
                  {EmailPhone ? (
                    <div className="flex flex-col items-start">
                      <form
                        onSubmit={handlePhoneEmailForm}
                        className="flex gap-3 w-full p-1 items-center rounded-md border-2 border-[#c1c1c1]"
                      >
                        <Image src={ContactDiary} alt="" />
                        <input
                          type="text"
                          placeholder="Phone / Email "
                          value={contactDetails}
                          onChange={(e) => setContactDetails(e.target.value)}
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
                                colors={[
                                  "white",
                                  "white",
                                  "white",
                                  "white",
                                  "white",
                                ]}
                              />
                            </div>
                          ) : (
                            "Text Me Free Quote"
                          )}
                        </button>
                      </form>
                      {phoneErr && (
                        <div className="text-red-500">{phoneErr}</div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-start">
                      <div className="flex justify-between w-full p-1 items-center rounded-md border-2 border-[#c1c1c1]">
                        <PhoneNumberInput
                          value={phoneNumber}
                          setValue={(val) => {
                            setPhoneErr("");
                            setPhoneNumber(val);
                          }}
                        />
                        <button
                          className={twMerge(
                            `${submitBtnClass} bg-[#fd7636] hidden md:block`,
                            withPhoneLoading && "bg-gray-400"
                          )}
                          onClick={submitWithPhone}
                        >
                          {withPhoneLoading ? (
                            <div className="flex justify-center">
                              <ColorRing
                                height="40"
                                width="40"
                                ariaLabel="color-ring-loading"
                                colors={[
                                  "white",
                                  "white",
                                  "white",
                                  "white",
                                  "white",
                                ]}
                              />
                            </div>
                          ) : (
                            "Text Me Free Quote"
                          )}
                        </button>
                      </div>
                      <button
                        className={twMerge(
                          `${submitBtnClass} bg-[#fd7636] block md:hidden mt-2`,
                          withPhoneLoading && "bg-gray-400"
                        )}
                        onClick={submitWithPhone}
                      >
                        {withPhoneLoading ? (
                          <div className="flex justify-center">
                            <ColorRing
                              height="40"
                              width="40"
                              ariaLabel="color-ring-loading"
                              colors={[
                                "white",
                                "white",
                                "white",
                                "white",
                                "white",
                              ]}
                            />
                          </div>
                        ) : (
                          "Text Me Free Quote"
                        )}
                      </button>
                      {phoneErr && (
                        <div className="text-red-500">Invalid phone number</div>
                      )}
                    </div>
                  )}
                </>
              )}
              {/* <div className="my-8 bg-[#c9c9c9] h-[3px] rounded flex items-center justify-center max-w-[300px] mx-auto">
            <span className="min-w-[100px] bg-white text-center">OR</span>
            </div> */}
            </div>
          </div>

          {submissionErr && (
            <div>
              <div>
                {/* <ToastContainer
              className="p-3"
              position={"bottom-end"}
              style={{ zIndex: 1 }}
            >
              <Toast
                onClose={() => setShow(false)}
                show={show}
                delay={3000}
                autohide
              >
                <Toast.Header>
                  <img
                    src="holder.js/20x20?text=%20"
                    className="rounded me-2"
                    alt=""
                  />
                  <strong className="me-auto">Error</strong>
                </Toast.Header>
                <Toast.Body>{submissionErr}</Toast.Body>
              </Toast>
            </ToastContainer> */}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default dynamic(() => Promise.resolve(Step4), { ssr: false });
