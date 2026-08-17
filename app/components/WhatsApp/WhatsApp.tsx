"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { hideWhatsappModule } from "../HideLinks/HideLinks";
import whatsappIconFooter from "@/app/assets/Images/whatsapplogo.png";
import whatsappIcon2 from "@/app/assets/Images/whatsappIcon2.png";
const WhatsApp = () => {
  const currentPage = usePathname();
  const hideWhatsapp = hideWhatsappModule.includes(currentPage);
  const [GCLID, setGCLID] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (window?.location?.href?.includes("gclid=")) {
      setGCLID(window?.location?.href);
    }
    setUrl(window?.location?.href);
  }, []);

  const postUrl = `${process.env.NEXT_PUBLIC_API_URL}/order/quote/whatsapp`;
  const postData = {
    gclid: GCLID,
    url: url,
  };

  const apiCall = async () => {
    try {
      const res = await axios.post(postUrl, postData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("WhatsApp API error:", error);
      }
      throw error;
    }
  };

  if (
    hideWhatsapp ||
    currentPage === "/order/" ||
    currentPage?.includes("take-my-class-2")
  ) {
    return null;
  }

  return (
    <>
      {/* Whatsapp module */}
      {currentPage !== "/take-my-class-3/" &&
        currentPage !== "/take-my-class/" &&
        !currentPage?.includes("take-my-class-2") && (
 
        <div>
          <button
            id="whatsapp-chat"
            className="fixed flex justify-between z-[98] left-0 bg-transparent border-none md:flex hidden"
            onClick={apiCall}
          >
            <a
              className="fixed flex font-normal justify-between z-[98] bottom-[60px] left-0 text-[15px] py-[10px] px-[20px] no-underline bg-[#128C7E] ml-[5px] rounded-[50px] items-center min-w-[44px] min-h-[44px]"
              href="https://wa.me/17167081869?text=Hi%20There!%20We are here for you!"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
            >
              <Image
                src={whatsappIconFooter}
                alt="whatsapp"
                className="w-[35px]"
              />
              <span className="pl-[10px] ml-[15px] font-bold text-white relative -left-[14px]">
                Free Quote On Whatsapp
              </span>
            </a>
          </button>

          <button
            id="whatsapp-chat-2"
            className="fixed flex justify-between z-[98] left-0 bg-transparent border-none md:hidden flex z-[99999]"
            onClick={apiCall}
          >
            <a
              className="fixed flex font-normal justify-between z-[98] bottom-[20px] left-0 text-[15px] py-0 px-[5px] no-underline ml-[5px] rounded-[50px] items-center min-w-[44px] min-h-[44px]"
              href="https://wa.me/17167081869?text=Hi%20There!%20We are here for you!"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
            >
              <Image
                src={whatsappIcon2}
                alt="whatsapp"
                className="w-[45px] max-[768px]:w-[37px]"
              />
            </a>
          </button>
        </div>
      )}
    </>
  );
};

export default WhatsApp;
