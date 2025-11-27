import axiosInstance from "@/app/axios";
import PhoneNumberInput from "@/app/components/PhoneInput/PhoneInput";
import { isEmailValid, isPhoneValid } from "@/app/utilities/utilities";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { ColorRing } from "react-loader-spinner";
import { twMerge } from "tailwind-merge";

export type ApiPayload = {
  url: string;
};

const initialApiPayload: ApiPayload = {
  url: "",
};
type Step4Props = {};

const Step4: FC<Step4Props> = ({}) => {
  const router = useRouter();

  const [apiPayload, setApiPayload] = useState<ApiPayload>(initialApiPayload);
  // GOOGLE click id
  const [FBCLID, setFBCLID] = useState("");
  const [GCLID, setGCLID] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [withPhoneLoading, setWithPhoneLoading] = useState(false);
  const [withEmailLoading, setWithEmailLoading] = useState(false);
  const [submissionErr, setSubmissionErr] = useState("");
  const [show, setShow] = useState(false);
  const currentPage = usePathname();
  const wholeUrl = window?.location?.href;
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
    let url = `/do-my-class`;

    localStorage.setItem("redirectFromThankYouPage", url);

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
    // setApiPayload(email)
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
      router.push("/thank-you-2");
    } catch (error) {
      // @ts-ignore
      setSubmissionErr(error?.response?.data?.message);
      setShow(true);
      setWithEmailLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-md mt-3">
      {/* <h4 className="text-center font-semibold text-xl">
        Just tell us your phone number / Email and we will text you ASAP
        Enter Your Contact Details and We'll Contact You ASAP
      </h4> */}
      <div className="flex justify-center">
        <div className="submission-container mt-4 p-2 p-sm-0">
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
                      colors={["white", "white", "white", "white", "white"]}
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
                    colors={["white", "white", "white", "white", "white"]}
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
          {/* <div className="my-8 bg-[#c9c9c9] h-[3px] rounded flex items-center justify-center max-w-[300px] mx-auto">
            <span className="min-w-[100px] bg-white text-center">OR</span>
          </div>
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
                  `${submitBtnClass} bg-[#177ee6] hidden md:block`,
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
            </div>
            <button
              className={twMerge(
                `${submitBtnClass} bg-[#177ee6] block md:hidden mt-3`,
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
            {emailErr && <div className="text-red-500">Invalid Email</div>}
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
  );
};

export default dynamic(() => Promise.resolve(Step4), { ssr: false });
