"use client";
import React, { useState } from "react";
// import OTPInput from "@/app/components/WritelyAi/OTPInput";
import Image from "next/image";
import Logo from "@/app/assets/Images/logo.png";
import toast from "react-hot-toast";
import axios from "axios";
import OTPInput from "./OTPInput";
import ProductSchema from "@/app/components/ProductSchema";
import { persistAccessToken } from "@/app/lib/authSession";

const OTPPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOTPChange = (val: string) => {
    setOtp(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = localStorage.getItem("user_name");
    const email = localStorage.getItem("user_email");
    const password = localStorage.getItem("user_password");

    if (!name || !email || !password || !otp) {
      toast.error("Missing required data!");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Verifying email...");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/verify-email`,
        {
          email,
          password,
          code: otp,
          userData: {
            name,
            email,
          },
        },
        { withCredentials: true },
      );
      localStorage.removeItem("user_password");
      // Backend wraps responses as { success, message, data }
      const userData = response.data?.data ?? response.data;
      persistAccessToken(userData.access_token, userData.expires_in);
      localStorage.setItem("user_id", userData.user.user_id);
      localStorage.setItem("user_email", userData.user.email);
      localStorage.setItem("user_name", userData.user.name);
      localStorage.setItem("package_type", userData.user.plan);
      localStorage.setItem("totalTokens", userData.user.total_tokens);
      // Middleware guards /tools/* by the access_token COOKIE (not localStorage),
      // so it must be set here or the redirect below bounces back to sign-in.

      toast.dismiss();
      toast.success(response?.data?.message || "Email verified successfully!");
      const returnUrl =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("returnUrl")
          : null;
      // Only honour same-origin internal paths to avoid open-redirects.
      const safeReturn =
        returnUrl && returnUrl.startsWith("/") ? returnUrl : null;
      // Hard navigation so the freshly-set cookie is sent with the request.
      window.location.assign(safeReturn || "/tools/paraphraser-tool/");
    } catch (error: any) {
      toast.dismiss();
      const errorMessage =
        error.response?.data?.message || "Failed to verify email.";
      toast.error(errorMessage);
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7fa] relative px-2">
      <ProductSchema
        productTitle="Verify Your Email - Scholarly Help"
        metaDescription="Enter the one-time password (OTP) sent to your email to verify your Scholarly Help account and complete your registration."
        pageUrl={`${baseUrl}/otp/`}
      />
      {/* Card shape layering */}
      <div className="absolute z-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-[430px] h-[320px] bg-[#a99cf5] rounded-2xl -rotate-[15deg]" />
      </div>
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl px-8 py-10 w-full flex flex-col items-center relative"
        >
          <Image
            src={Logo}
            alt="ScholarlyHelp"
            width={180}
            height={60}
            className="mb-6"
          />
          <h1 className="text-lg font-semibold mb-6 text-gray-800 text-center">
            Enter OTP
          </h1>
          <OTPInput length={6} onChange={handleOTPChange} />
          <button
            type="submit"
            className="mt-8 w-full bg-[#fe6e2b] hover:bg-[#ff641a] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={otp.length !== 6 || loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              "Verify"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPPage;
