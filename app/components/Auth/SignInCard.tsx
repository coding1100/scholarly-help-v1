"use client";
import { useState, useEffect, useCallback, FC } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import Logo from "@/app/assets/Images/logo.png";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import axios from "axios";
import AuthButtonSpinner from "./AuthButtonSpinner";
import SocialAuthButtons from "./SocialAuthButtons";
import { buildHrefWithSameQuery } from "@/app/utils/url";
import {
  validateEmail,
  validateSignInPassword,
} from "@/app/lib/authValidation";
import { persistAccessToken } from "@/app/lib/authSession";

interface SignInCardProps {
  switchAuthForm?: string;
  setSwitchAuthForm?: React.Dispatch<React.SetStateAction<"signin" | "signup">>;
  /** Where to return after sign-in. Overrides the `returnUrl` query param
   *  (used when this card is rendered outside a routed page, e.g. in a modal). */
  returnUrl?: string;
}

const SignInCard: FC<SignInCardProps> = ({
  switchAuthForm = "",
  setSwitchAuthForm,
  returnUrl: returnUrlProp,
}) => {
  const searchParams = useSearchParams();
  const returnUrl = returnUrlProp ?? searchParams.get("returnUrl");
  const qs = searchParams?.toString() || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Inline field validation. Errors are only surfaced once a field is "touched"
  // (blurred or after a submit attempt), so the user isn't scolded mid-typing.
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>(
    {
      email: false,
      password: false,
    },
  );

  const emailError = validateEmail(email);
  const passwordError = validateSignInPassword(password);
  const isFormValid = !emailError && !passwordError;
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
      return "We can't connect, check your internet connection and try again.";
    }

    return null;
  };

  const persistSessionAndRedirect = useCallback(
    (data: any) => {
      persistAccessToken(data.access_token, data.expires_in);
      localStorage.setItem("user_id", data.user.user_id);
      localStorage.setItem("user_name", data.user.name);
      localStorage.setItem("package_type", data.user.package_type);
      // Always overwrite to avoid stale email from a previous login.
      const resolvedEmail = String(
        data?.user?.email || data?.user?.user_email || email,
      )
        .trim()
        .toLowerCase();
      if (resolvedEmail) localStorage.setItem("user_email", resolvedEmail);

      const redirectPath = returnUrl || "/tools/dashboard/";
      const qs = searchParams?.toString() || "";
      const redirectUrl = returnUrl
        ? redirectPath
        : buildHrefWithSameQuery(redirectPath, new URLSearchParams(qs));

      // Hard navigation so the just-set access_token cookie is sent with the
      // request — /tools/* is middleware-guarded and a client-side replace can
      // race the cookie write and bounce back to /sign-in.
      window.location.assign(redirectUrl);
    },
    [returnUrl, searchParams, email],
  );

  const currentPage = usePathname();
  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Set cookie for middleware if not already set
      persistAccessToken(token);

      if (returnUrl) {
        // Hard navigation so middleware sees the cookie (see persist above).
        window.location.assign(returnUrl);
      }
    }
  }, [returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    // Surface any field errors and block the request if invalid.
    setTouched({ email: true, password: true });
    if (emailError || passwordError) return;
    const newEmail = email.trim().toLowerCase();
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
        { withCredentials: true },
      );
      setEmail("");
      setPassword("");
      // Backend now wraps responses as { success, message, data }. Unwrap to the
      // session payload, falling back to the raw body for resilience.
      persistSessionAndRedirect(res.data?.data ?? res.data);
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
              className={`w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                touched.email && emailError
                  ? "ring-2 ring-[#F73032] focus:ring-[#F73032]"
                  : "focus:ring-indigo-500"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              aria-invalid={touched.email && !!emailError}
              autoComplete="email"
              required
            />
          </div>
          {touched.email && emailError && (
            <p className="text-[#F73032] text-xs mt-1">{emailError}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium ">Password</label>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`w-full pl-4 pr-10 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                touched.password && passwordError
                  ? "ring-2 ring-[#F73032] focus:ring-[#F73032]"
                  : "focus:ring-indigo-500"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              aria-invalid={touched.password && !!passwordError}
              autoComplete="current-password"
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
          {touched.password && passwordError && (
            <p className="text-[#F73032] text-xs mt-1">{passwordError}</p>
          )}
        </div>
        {submitError && (
          <span className="text-xs font-normal leading-tight text-[#F73032]">
            {submitError}
          </span>
        )}
        <Link
          href={buildHrefWithSameQuery(
            "/forgot-password/",
            new URLSearchParams(qs),
          )}
          className="text-sm hover:underline "
        >
          Forgot Password?
        </Link>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`w-[90%] bg-[#ff641a] text-white font-semibold min-h-[39px] px-4 py-2 rounded-lg hover:bg-[#ff641a]/80 transition duration-300 flex items-center justify-center gap-2 ${
            submitError ? "flex-col text-center gap-1" : ""
          } ${!isFormValid || loading ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-live="polite"
        >
          {loading ? <AuthButtonSpinner /> : <span>Sign In</span>}
          {!submitError && <FaArrowRight />}
        </button>

        <SocialAuthButtons returnUrl={returnUrl} authAction="sign_in" />
      </form>
      <p className="text-center text-sm  mt-8 relative">
        Do not have an account?
        {switchAuthForm === "" ? (
          <Link
            href={buildHrefWithSameQuery("/sign-up/", new URLSearchParams(qs))}
            className="hover:underline pl-1"
          >
            Sign up Here
          </Link>
        ) : (
          <span
            className="hover:underline pl-1 cursor-pointer"
            onClick={() => setSwitchAuthForm?.("signup") || undefined}
          >
            Sign up Here
          </span>
        )}
      </p>
    </div>
  );
};

export default SignInCard;
