"use client";
<<<<<<< HEAD
import { FC, useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
=======
import { FC, useEffect, useRef, useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import Logo from "@/app/assets/Images/logo.png";
import Link from "next/link";
<<<<<<< HEAD
import { usePathname, useRouter } from "next/navigation";
=======
import { usePathname } from "next/navigation";
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
import axios from "axios";
import toast from "react-hot-toast";
import AuthButtonSpinner from "./AuthButtonSpinner";
import SocialAuthButtons from "./SocialAuthButtons";
<<<<<<< HEAD
import { buildHrefWithSameQuery } from "@/app/utils/url";
import { validateEmail, validatePassword } from "@/app/lib/authValidation";
=======
import { validateEmail, validateSignInPassword } from "@/app/lib/authValidation";
import { completeAuthSession } from "@/app/lib/authSession";
import { buildHrefWithSameQuery } from "@/app/utils/url";
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8

interface SignUpCardProps {
  switchAuthForm?: string;
  setSwitchAuthForm?: React.Dispatch<React.SetStateAction<"signin" | "signup">>;
<<<<<<< HEAD
  /** When set, the OTP step returns here after verifying (instead of the default tool). */
  returnUrl?: string;
}

=======
  /** Where to send the user after they're signed in. */
  returnUrl?: string;
  /** Notified on every step change, so a caller (e.g. the guest auth gate
   *  modal) can hide its own "create an account" heading once this card
   *  switches to its own "check your email" header. */
  onStepChange?: (step: "request" | "check") => void;
  /**
   * Set by a caller that already collected an email elsewhere (SignInCard's
   * "Forgot? Email it to me") to jump straight to the "check your email" step
   * and send that email its password, skipping step 1.
   */
  startAtCheckWithEmail?: string;
  /**
   * Bumped by the caller on every request, even for a repeat of the same
   * email — the dedup guard below keys off this, not the email string, so a
   * genuine second click for the same address (e.g. sign-in → forgot → back
   * → forgot again) still triggers a fresh send instead of silently no-oping
   * because the email prop compared equal to last time.
   */
  startAtCheckNonce?: number;
}

const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Passwordless account creation: enter an email, we generate a password and
 * email it (no OTP, no self-chosen password). Step 2 asks the user to paste
 * that password back in, which is just a normal sign-in — so this reuses
 * POST /auth/signin rather than a separate verification endpoint.
 */
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
const SignUpCard: FC<SignUpCardProps> = ({
  switchAuthForm = "",
  setSwitchAuthForm,
  returnUrl,
<<<<<<< HEAD
}) => {
  const route = useRouter();
=======
  onStepChange,
  startAtCheckWithEmail,
  startAtCheckNonce,
}) => {
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
  const currentPage = usePathname();
  const qs =
    typeof window !== "undefined" ? window.location.search.slice(1) : "";

<<<<<<< HEAD
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
=======
  const [step, setStep] = useState<"request" | "check">("request");
  useEffect(() => onStepChange?.(step), [step, onStepChange]);

  // Step 1: request
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Step 2: check email / paste password
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
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
<<<<<<< HEAD

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
      toast.success("Sign up successful! Please check your email to verify your account.");
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
=======
    return null;
  };

  const getApiErrorMessage = (err: any, fallback: string) => {
    const message = err?.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    return fallback;
  };

  const sendPasswordEmail = async (targetEmail: string) => {
    await axios.post(
      `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/request-password-email`,
      { email: targetEmail },
    );
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);
    const emailMsg = validateEmail(email);
    setEmailError(emailMsg || null);
    if (emailMsg) return;

    const target = email.trim().toLowerCase();
    setRequesting(true);
    try {
      await sendPasswordEmail(target);
      setPassword("");
      setPasswordError(null);
      setSignInError(null);
      setStep("check");
      startCooldown();
      toast.success(`We emailed a password to ${target}.`);
    } catch (err: any) {
      const networkMsg = getAuthNetworkErrorMessage(err);
      setRequestError(
        networkMsg || getApiErrorMessage(err, "Couldn't send that email. Please try again."),
      );
    } finally {
      setRequesting(false);
    }
  };

  const handledExternalRequest = useRef<number | null>(null);
  useEffect(() => {
    if (!startAtCheckWithEmail || startAtCheckNonce === undefined) return;
    if (handledExternalRequest.current === startAtCheckNonce) return;
    handledExternalRequest.current = startAtCheckNonce;

    const target = startAtCheckWithEmail.trim().toLowerCase();
    setEmail(target);
    setRequesting(true);
    sendPasswordEmail(target)
      .then(() => {
        setPassword("");
        setPasswordError(null);
        setSignInError(null);
        setStep("check");
        startCooldown();
        toast.success(`We emailed a password to ${target}.`);
      })
      .catch((err: any) => {
        const networkMsg = getAuthNetworkErrorMessage(err);
        toast.error(
          networkMsg || getApiErrorMessage(err, "Couldn't send that email. Please try again."),
        );
      })
      .finally(() => setRequesting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAtCheckWithEmail, startAtCheckNonce]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await sendPasswordEmail(email.trim().toLowerCase());
      toast.success("Password re-sent.");
      startCooldown();
    } catch (err: any) {
      const networkMsg = getAuthNetworkErrorMessage(err);
      toast.error(
        networkMsg || getApiErrorMessage(err, "Couldn't resend that email. Please try again."),
      );
    } finally {
      setResending(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    const passwordMsg = validateSignInPassword(password);
    setPasswordError(passwordMsg || null);
    if (passwordMsg) return;

    setSigningIn(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/signin`,
        { email: email.trim().toLowerCase(), password },
        { withCredentials: true },
      );
      completeAuthSession(res.data?.data ?? res.data, email);
      const redirectPath = returnUrl || "/tools/dashboard/";
      sessionStorage.setItem("auth:success-toast", "Signed in successfully!");
      // Hard navigation so the just-set access_token cookie is sent with the
      // request — /tools/* is middleware-guarded and a client-side redirect
      // can race the cookie write and bounce back to sign-in.
      window.location.assign(redirectPath);
    } catch (err: any) {
      const networkMsg = getAuthNetworkErrorMessage(err);
      setSignInError(
        networkMsg || getApiErrorMessage(err, "That password didn't work. Try resending it."),
      );
    } finally {
      setSigningIn(false);
    }
  };

  const wrapperClassName =
    currentPage === "/tools/"
      ? "bg-white max-[768px]:bg-transparent max-[768px]:shadow-none max-[768px]:p-0 rounded-lg shadow-sm p-6 flex flex-col gap-4 -z-[999]"
      : " space-y-6 text-[#2B1C50]";

  if (step === "check") {
    return (
      <div className={wrapperClassName}>
        <button
          type="button"
          onClick={() => setStep("request")}
          aria-label="Back"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <FiArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-center">
          <Image src={Logo} alt="ScholarlyHelp" width={200} height={50} className="object-cover" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-[#2B1C50]">Check your email</h2>
          <p className="mt-2 text-sm text-gray-500">
            We sent your password to{" "}
            <span className="font-medium text-gray-700">{email}</span> ·{" "}
            <button
              type="button"
              onClick={() => setStep("request")}
              className="font-medium text-[#ff641a] hover:underline"
            >
              Change
            </button>
          </p>
        </div>

        <form className="flex flex-col gap-2 md:gap-5" onSubmit={handleSignInSubmit}>
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Paste the password from your email"
                className={`w-full pl-4 pr-10 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
                  passwordError
                    ? "ring-2 ring-[#ff641a] focus:ring-[#ff641a]"
                    : "focus:ring-indigo-500"
                }`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                onBlur={() => setPasswordError(validateSignInPassword(password) || null)}
                aria-invalid={!!passwordError}
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
            {passwordError ? (
              <p className="text-[#ff641a] text-xs mt-1">{passwordError}</p>
            ) : (
              <p className="text-gray-400 text-xs mt-1">
                Keep this email. You&apos;ll use the same password to sign in next time.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={signingIn || !password}
            className={`lg:w-[90%] bg-[#ff641a] text-white font-semibold min-h-[39px] px-4 py-2 rounded-lg hover:bg-[#ff641a]/80 transition duration-300 flex items-center justify-center gap-2 ${
              signingIn || !password ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-live="polite"
          >
            {signingIn ? <AuthButtonSpinner /> : <span>Sign in and continue</span>}
            {!signInError && !signingIn && <FaArrowRight />}
          </button>
          {signInError && (
            <p role="alert" className="lg:w-[90%] text-center text-xs font-normal leading-tight text-[#F73032]">
              {signInError}
            </p>
          )}
        </form>

        <p className="text-center text-sm text-gray-500">
          Didn&apos;t get it? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="font-medium text-[#ff641a] hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
          >
            {resending
              ? "Resending…"
              : cooldown > 0
                ? `Resend password (available in 0:${String(cooldown).padStart(2, "0")})`
                : "Resend password"}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
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

<<<<<<< HEAD
      <form className="flex flex-col gap-2 md:gap-5" onSubmit={handleSubmit}>
=======
      <form className="flex flex-col gap-2 md:gap-5" onSubmit={handleRequestSubmit}>
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
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
<<<<<<< HEAD
                setEmailError(liveError(validateEmail, e.target.value) || null);
=======
                setEmailError(null);
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
              }}
              onBlur={() => setEmailError(validateEmail(email) || null)}
              aria-invalid={!!emailError}
              autoComplete="email"
              required
            />
          </div>
<<<<<<< HEAD
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
          className={`lg:w-[90%] bg-[#ff641a] text-white font-semibold min-h-[39px] px-4 py-2 rounded-lg hover:bg-[#ff641a]/80 transition duration-300 flex items-center justify-center gap-2 ${!isFormValid || loading ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-live="polite"
        >
          {loading ? (
            <AuthButtonSpinner />
          ) : (
            <span>Sign Up</span>
          )}
          {!submitError && <FaArrowRight />}
        </button>
        {submitError && (
          <p role="alert" className="lg:w-[90%] text-center text-xs font-normal leading-tight text-[#F73032]">
            {submitError}
=======
          {emailError ? (
            <p className="text-[#ff641a] text-xs mt-1">{emailError}</p>
          ) : (
            <p className="text-gray-400 text-xs mt-1">
              We&apos;ll email you your password. No need to create one.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={requesting || !!validateEmail(email)}
          className={`lg:w-[90%] bg-[#ff641a] text-white font-semibold min-h-[39px] px-4 py-2 rounded-lg hover:bg-[#ff641a]/80 transition duration-300 flex items-center justify-center gap-2 ${
            requesting || !!validateEmail(email) ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-live="polite"
        >
          {requesting ? <AuthButtonSpinner /> : <span>Email me my password</span>}
          {!requestError && !requesting && <FaArrowRight />}
        </button>
        {requestError && (
          <p role="alert" className="lg:w-[90%] text-center text-xs font-normal leading-tight text-[#F73032]">
            {requestError}
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
          </p>
        )}
        <SocialAuthButtons authAction="sign_up" returnUrl={returnUrl} />
      </form>
      <p className="text-center text-sm  mt-8 relative">
        If you have an account?
        {switchAuthForm === "" ? (
          <Link
            href={buildHrefWithSameQuery("/sign-in/", new URLSearchParams(qs))}
            className="text-[#ff641a] hover:text-[#d94f0f] hover:underline pl-1"
          >
            Sign in Here
          </Link>
        ) : (
          <span
            className="text-[#ff641a] hover:text-[#d94f0f] hover:underline pl-1 cursor-pointer"
<<<<<<< HEAD
            onClick={() => setSwitchAuthForm?.("signin") || undefined}
=======
            onClick={() => setSwitchAuthForm?.("signin")}
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
          >
            Sign in Here
          </span>
        )}
      </p>
    </div>
  );
};

export default SignUpCard;
