"use client";
import { FC, useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import Logo from "@/app/assets/Images/logo.png";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import AuthButtonSpinner from "./AuthButtonSpinner";
import SocialAuthButtons from "./SocialAuthButtons";
import { buildHrefWithSameQuery } from "@/app/utils/url";
import { validateEmail, validatePassword } from "@/app/lib/authValidation";

interface SignUpCardProps {
  switchAuthForm?: string;
  setSwitchAuthForm?: React.Dispatch<React.SetStateAction<"signin" | "signup">>;
  /** When set, the OTP step returns here after verifying (instead of the default tool). */
  returnUrl?: string;
}

const SignUpCard: FC<SignUpCardProps> = ({
  switchAuthForm = "",
  setSwitchAuthForm,
  returnUrl,
}) => {
  const route = useRouter();
  const currentPage = usePathname();
  const qs =
    typeof window !== "undefined" ? window.location.search.slice(1) : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // While typing, suppress the message for an empty field so the user isn't
  // warned before they've had a chance to type; full validation runs on submit.
  const liveError = (validate: (v: string) => string, value: string) => {
    if (!value) return "";
    return validate(value);
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
      return "We can't connect, check your internet connection and try again.";
    }

    return null;
  };

  // Button is enabled only when every field passes its validator.
  const isFormValid = !validateEmail(email) && !validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate all fields on submit; surface every error at once.
    const emailMsg = validateEmail(email);
    const passwordMsg = validatePassword(password);
    setEmailError(emailMsg || null);
    setPasswordError(passwordMsg || null);
    if (emailMsg || passwordMsg) return;

    const newEmail = email.trim().toLowerCase();
    // No name field on signup — derive a display name from the email's
    // local part instead of relying on the backend's generic "User" default.
    const derivedName = newEmail.split("@")[0];
    let payload: any = {
      email: newEmail,
      password,
      userData: {
        email: newEmail,
        name: derivedName,
      },
    };
    setLoading(true);
    try {
      // Sign up API only
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/signup`,
        payload,
      );
      // Only proceed if response is OK
      localStorage.setItem("user_email", newEmail);
      localStorage.setItem("user_password", password);
      // No name field on signup; derive a display name from the email's
      // local part (the OTP screen requires this key to be present).
      localStorage.setItem("user_name", newEmail.split("@")[0]);

      setEmail("");
      setPassword("");
      const otpParams = new URLSearchParams(qs);
      if (returnUrl) otpParams.set("returnUrl", returnUrl);
      route.push(buildHrefWithSameQuery("/otp", otpParams));
    } catch (err: any) {
      const networkMsg = getAuthNetworkErrorMessage(err);
      const message =
        networkMsg ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong.";
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
              className={`w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                emailError
                  ? "ring-2 ring-[#ff641a] focus:ring-[#ff641a]"
                  : "focus:ring-indigo-500"
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(liveError(validateEmail, e.target.value) || null);
              }}
              onBlur={() => setEmailError(validateEmail(email) || null)}
              aria-invalid={!!emailError}
              autoComplete="email"
              required
            />
          </div>
          {emailError && (
            <p className="text-[#ff641a] text-xs mt-1">{emailError}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium ">Password</label>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`w-full pl-4 pr-10 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                passwordError
                  ? "ring-2 ring-[#ff641a] focus:ring-[#ff641a]"
                  : "focus:ring-indigo-500"
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(
                  liveError(validatePassword, e.target.value) || null,
                );
              }}
              onBlur={() => setPasswordError(validatePassword(password) || null)}
              aria-invalid={!!passwordError}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 text-gray-500"
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {passwordError ? (
            <p className="text-[#ff641a] text-xs mt-1">{passwordError}</p>
          ) : (
            <div className="h-5"></div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`lg:w-[90%] bg-[#ff641a] text-white font-semibold min-h-[39px] px-4 py-2 rounded-lg hover:bg-[#ff641a]/80 transition duration-300 flex items-center justify-center gap-2 ${
            submitError ? "flex-col text-center gap-1" : ""
          } ${!isFormValid || loading ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-live="polite"
        >
          {loading ? (
            <AuthButtonSpinner />
          ) : (
            <>
              <span>Sign Up</span>
              {submitError && (
                <span className="text-xs font-normal leading-tight opacity-95">
                  {submitError}
                </span>
              )}
            </>
          )}
          {!submitError && <FaArrowRight />}
        </button>
        <SocialAuthButtons authAction="sign_up" returnUrl={returnUrl} />
      </form>
      <p className="text-center text-sm  mt-8 relative">
        If you have an account?
        {switchAuthForm === "" ? (
          <Link
            href={buildHrefWithSameQuery("/sign-in/", new URLSearchParams(qs))}
            className="hover:underline pl-1"
          >
            Sign in Here
          </Link>
        ) : (
          <span
            className="hover:underline pl-1 cursor-pointer"
            onClick={() => setSwitchAuthForm?.("signin") || undefined}
          >
            Sign in Here
          </span>
        )}
      </p>
    </div>
  );
};

export default SignUpCard;
