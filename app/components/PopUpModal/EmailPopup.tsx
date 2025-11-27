import emailIcon from "@/app/assets/Images/email-quote.png";
import axiosInstance from "@/app/axios";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { ColorRing } from "react-loader-spinner";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";

type EmailPopupProps = {
  open: boolean;
  handleClose: () => void;
};

const EmailPopup: FC<EmailPopupProps> = ({ open, handleClose }) => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [localUserId, setLocalUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let userId = localStorage.getItem("localUserId");
    if (userId) {
      setLocalUserId(userId);
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setEmailError("Enter email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post(
        `/scan-to-solve/submit-email/local/${localUserId}`,
        { email } // Pass the email as an object
      );
      setLoading(false);
      handleClose();
    } catch (error) {
      console.log("Message failed:", error);
      setLoading(false);
    }
  };

  return (
    <Modal
      showCloseIcon={false}
      open={open}
      onClose={handleClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      center
      classNames={{ modalContainer: "bg-[#ffffffcf]" }}
      styles={{
        modal: {
          backgroundColor: "#fff",
          minWidth: "400px",
          paddingRight: "20px",
          paddingLeft: "20px",
        },
      }}
    >
      <div className="sm:min-w-[450px] min-w-[280px] py-5">
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <p className="font-medium">Unlock all answers with your email</p>
          <div className="flex items-center border-b p-2">
            <Image src={emailIcon} className=" w-6 h-4 mt-1 ml-1" alt="icon" />
            <input
              type="email"
              className="focus:outline-none w-full px-2"
              placeholder="Enter your email address"
              value={email.trim()}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
            />
          </div>
          {emailError && <p className="text-red-600 text-sm">{emailError}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`bg-primary-400 text-white w-full rounded-full py-2 ${
              loading && "cursor-wait flex justify-center"
            } `}
          >
            {loading ? (
              <ColorRing
                height="40"
                width="40"
                ariaLabel="color-ring-loading"
                colors={["white", "white", "white", "white", "white"]}
              />
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default EmailPopup;
