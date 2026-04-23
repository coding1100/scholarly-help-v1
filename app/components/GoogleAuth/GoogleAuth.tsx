"use client";
import React, { Dispatch, FC, SetStateAction, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import axios from "axios";
import { useAuthContext } from "@/app/context/auth/AuthContext";
import { useRouter } from "next/navigation";
// import useGetReturnUrl from "../../hooks/useGetReturnUrl";

interface GoogleAuthProps {
  context?: string;
  setActiveStep: Dispatch<SetStateAction<number>>;
}

const GoogleAuth: FC<GoogleAuthProps> = ({ context, setActiveStep }) => {
  const { state, dispatch } = useAuthContext();
  // const { return_url } = useGetReturnUrl();
  const navigate = useRouter();
  const handleCallbackResponse = async (res: any) => {
    const user = jwtDecode(res.credential);
    let payload = {
      // @ts-ignore
      name: user?.given_name + " " + user?.family_name,
      // @ts-ignore
      email: user?.email,
    };

    dispatch({ type: "SET_USER", payload });
    if (context === "signin") {
      setActiveStep(3);
    }
    return;
    // try {
    //   let res = await axios.post(
    //     "https://mind.scholarlyhelps.com/v1/api/google/auth",
    //     payload
    //   );

    //   dispatch({ type: "SET_USER", payload });

    //   //   if (context === "signup" && res?.data?.data?.is_new_registeration) {
    //   //     window.dataLayer = window.dataLayer || [];
    //   //     window.dataLayer.push({
    //   //       event: "registrationComplete",
    //   //     });
    //   //   } else {
    //   //     window.dataLayer = window.dataLayer || [];
    //   //     window.dataLayer.push({
    //   //       event: "userLogsIn",
    //   //     });
    //   //   }

    //   // if (return_url) return navigate(`/${return_url}`);
    //   navigate.push("/checkout");
    // } catch (error) {
    //   // console.log("error");
    // }
  };

  useEffect(() => {
    /* global google*/
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCallbackResponse,
      context: context,
      ux_mode: "popup",
    });

    // @ts-ignore
    google.accounts.id.renderButton(document.getElementById("googleAuth"), {
      theme: "outline",
      size: "large",
      // type: "icon",
      width: "100%",
      minWidth: "100%",
      shape: "rectangular",
    });
  }, []);

  return <div id="googleAuth"></div>;
};

export default GoogleAuth;
