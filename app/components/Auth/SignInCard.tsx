"use client";
import { useState, useEffect, useCallback } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import Logo from "@/app/assets/Images/logo.png";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ColorRing } from "react-loader-spinner";
import SocialAuthButtons from "./SocialAuthButtons";

const SignInCard = () => {
  const route = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const getApiErrorMessage = (err: any, fallback: string) => {
    const message = err?.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    return fallback;
  };

  const getAuthNetworkErrorMessage = (err: any) => {
    const msg = String(err?.message || "");
    const code = String(err?.code || "");
    const isLikelyDnsOrOffline =
      !err?.response &&
      (code === "ERR_NETWORK" ||
        /Network Error/i.test(msg) ||
        /Failed to fetch/i.test(msg) ||
        /ERR_NAME_NOT_RESOLVED/i.test(msg));

    if (isLikelyDnsOrOffline) {
      return "We can’t reach the server right now (network/DNS issue). Please check your connection and try again.";
    }

    return null;
  };

  const persistSessionAndRedirect = useCallback(
    (data: any) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_id", data.user.user_id);
      localStorage.setItem("user_name", data.user.name);
      localStorage.setItem("package_type", data.user.package_type);
      document.cookie = `access_token=${data.access_token}; path=/; max-age=86400`;

      setTimeout(() => {
        const redirectUrl = returnUrl || "/tools/dashboard/";
        route.replace(redirectUrl);
      }, 100);
    },
    [returnUrl, route],
  );

  const currentPage = usePathname();
  // Check if user is already authenticated
  useEffect(() => {
    console.log("SignInCard - returnUrl:", returnUrl);
    const token = localStorage.getItem("access_token");
    if (token) {
      // Set cookie for middleware if not already set
      document.cookie = `access_token=${token}; path=/; max-age=86400`;

      if (returnUrl) {
        console.log("Redirecting to:", returnUrl);
        // Small delay to ensure cookie is set before redirect
        setTimeout(() => {
          route.replace(returnUrl);
        }, 100);
      }
    }
  }, [returnUrl, route]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const newEmail = email.toLowerCase();
    let payload: any = {
      email: newEmail,
      password,
    };
    try {
      setLoading(true);
      // Sign in API only
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/signin`,
        payload,
      );
      setEmail("");
      setPassword("");
      persistSessionAndRedirect(res.data);
    } catch (err: any) {
      const networkMsg = getAuthNetworkErrorMessage(err);
      const message =
        networkMsg || getApiErrorMessage(err, "Something went wrong.");
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${currentPage === "/tools/" ? "bg-white max-[768px]:bg-transparent max-[768px]:shadow-none max-[768px]:p-0 rounded-lg shadow-sm p-6 flex flex-col gap-4 -z-[999]" : " space-y-6 text-[#2B1C50]"}`}
    >
      {currentPage !== "/tools/" && (
        <div className="flex items-center justify-center ">
          <Image
            src={Logo}
            alt="logo is here"
            width={225}
            height={56}
            className="object-cover"
          />
        </div>
      )}

      <form className="flex flex-col gap-2 md:gap-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium t">Email</label>
          <div className="relative mt-2">
            <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 " />
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium ">Password</label>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute left-3 top-1/2 cursor-pointer -translate-y-1/2 "
              tabIndex={0}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        {submitError && (
          <span className="text-xs font-normal leading-tight text-[#F73032]">
            {submitError}
          </span>
        )}
        <Link href="/forgot-password/" className="text-sm hover:underline ">
          Forgot Password?
        </Link>

        <button
          type="submit"
          disabled={loading}
          className={`w-[90%] bg-[#ff641a] text-white font-semibold min-h-[39px] px-4 py-2 rounded-lg hover:bg-[#ff641a]/80 transition duration-300 flex items-center justify-center gap-2 ${
            submitError ? "flex-col text-center gap-1" : ""
          }`}
          aria-live="polite"
        >
          {loading ? (
            <ColorRing
              height="24"
              width="24"
              ariaLabel="color-ring-loading"
              colors={["white", "white", "white", "white", "white"]}
            />
          ) : (
            <span>Sign In</span>
          )}
          {!submitError && <FaArrowRight />}
        </button>

        <SocialAuthButtons returnUrl={returnUrl} />
      </form>
      {/* here is tetx */}
      <p className="text-center text-sm  mt-8 relative">
        Do not have an account?
        <Link href="/sign-up/" className="hover:underline pl-1">
          Sign up Here
        </Link>
      </p>
    </div>
  );
};

export default SignInCard;
