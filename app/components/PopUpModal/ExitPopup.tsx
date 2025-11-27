import Logo from "@/app/assets/Icons/Logo";
import TextImg from "@/app/assets/Images/10percent.png";
import emailIcon from "@/app/assets/Images/email-quote.png";
import PopUpImg from "@/app/assets/Images/exitPopupImg.png";
import TrustPilot from "@/app/assets/Images/trustPilotExitPopup.png";
import axiosInstance from "@/app/axios";
import { isEmailValid } from "@/app/utilities/utilities";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { ColorRing } from "react-loader-spinner";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Button from "../Button/Button";
import { ApiPayload } from "../FreeQuoteForm/Step4";

const initialApiPayload: ApiPayload = {
  url: "",
};

type ExitPopUpProps = {
  open: boolean;
  handleClose: () => void;
};

const ExitPopUp: FC<ExitPopUpProps> = ({ open, handleClose }) => {
  const router = useRouter();

  const [apiPayload, setApiPayload] = useState<ApiPayload>(initialApiPayload);
  const [email, setEmail] = useState<any>("");
  const [emailErr, setEmailErr] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [FBCLID, setFBCLID] = useState("");
  const [GCLID, setGCLID] = useState("");

  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds

  useEffect(() => {
    if (window?.location?.href?.includes("fbclid=")) {
      setFBCLID(window?.location?.href);
    }
    if (window?.location?.href?.includes("gclid=")) {
      setGCLID(window?.location?.href);
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      secs < 10 ? "0" : ""
    }${secs}`;
  };
  const handleEmailSubmit = async () => {
    setApiPayload(email);
    let url = `/do-my-class`;

    localStorage.setItem("redirectFromThankYouPage", url);

    const isValidEmail = isEmailValid(email);

    if (!isValidEmail) {
      setEmailErr("Invalid Email");
      return;
    }
    setEmailLoading(true);

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
      setEmailLoading(false);
      router.push("/thank-you-2");
    } catch (error) {
      // @ts-ignore
      setSubmissionErr(error?.response?.data?.message);
      setEmailLoading(false);
    }
  };

  return (
    <Modal
      showCloseIcon={true}
      open={open}
      onClose={handleClose}
      closeOnOverlayClick={true}
      closeOnEsc={true}
      center
      classNames={{ modalContainer: "bg-[#ffffffcf]" }}
      styles={{
        modal: {
          backgroundColor: "#fff",
          minWidth: "400px",
          paddingRight: "50px",
          paddingLeft: "50px",
        },
      }}
      modalId="exitPopUp"
    >
      <div>
        <Image src={PopUpImg} alt="" className="w-[60%] mx-auto" />
        <p className="text-3xl font-bold text-[#6D6D6D] text-center">
          Act Fast !
        </p>
        <div className="flex justify-center items-center gap-2 text-2xl text-[#6D6D6D]">
          <p>Get</p>
          <Image src={TextImg} alt="" className="w-[100px]" />
          <p>Off Any Service</p>
        </div>
        <p className="text-center text-[#585858]">
          Enter your details to redeem your discount before time runs out!
          {/* <br />
          Hurry, time is running out! */}
        </p>
        <div className="px-16 pt-6 relative mt-2">
          <div className="absolute top-3 left-[112px] bg-white w-[60%] text-center">
            <p className="text-[#6D6D6D]">Hurry, time is running out!</p>
          </div>
          <div className="border-2 rounded-[10px] py-5">
            <p className="text-center text-secondary-500 text-5xl font-bold">
              {formatTime(timeLeft)}
            </p>
            <div className="w-[110px] text-[#6D6D6D] flex justify-between items-center mx-auto">
              <p>MIN</p>
              <p>SEC</p>
            </div>
          </div>

          <div className="flex flex-col items-start mt-3">
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
              {/* <button
                className="bg-[#565ADD] text-white min-w-fit px-4 py-2 rounded"
                onClick={handleEmailSubmit}
              >
                {emailLoading ? (
                  <div className="flex justify-center">
                    <ColorRing
                      height="40"
                      width="40"
                      ariaLabel="color-ring-loading"
                      colors={["white", "white", "white", "white", "white"]}
                    />
                  </div>
                ) : (
                  "Free Quote"
                )}
              </button> */}
            </div>

            {emailErr && <div className="text-red-500">{emailErr}</div>}
          </div>

          <Button
            onClick={handleEmailSubmit}
            className="mt-3 w-full bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500 text-xl font-bold h-[45px]"
          >
            {emailLoading ? (
              <div className="flex justify-center">
                <ColorRing
                  height="40"
                  width="40"
                  ariaLabel="color-ring-loading"
                  colors={["white", "white", "white", "white", "white"]}
                />
              </div>
            ) : (
              "CLAIM 10 OFF"
            )}
          </Button>
          <div className="flex justify-between items-center px-5 my-5">
            <Image src={TrustPilot} alt="" />
            <Logo />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExitPopUp;
