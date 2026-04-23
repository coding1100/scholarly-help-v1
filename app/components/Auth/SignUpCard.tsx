"use client";
import { FC, useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import Logo from "@/app/assets/Images/logo.png";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CgRename } from "react-icons/cg";
import axios from "axios";
import { ColorRing } from "react-loader-spinner";
import SocialAuthButtons from "./SocialAuthButtons";
import { appendQueryString } from "@/app/utils/url";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

interface SignUpCardProps {
  switchAuthForm?: string;
  setSwitchAuthForm?: React.Dispatch<React.SetStateAction<"signin" | "signup">>;
}

const SignUpCard: FC<SignUpCardProps> = ({
  switchAuthForm = "",
  setSwitchAuthForm,
}) => {
  const route = useRouter();
  const currentPage = usePathname();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Password validation function
  const getPasswordValidationMsg = (password: string) => {
    if (!password) return "";
    if (password.length < 8) return "At least 8 characters required.";
    if (!/[A-Z]/.test(password))
      return "At least one uppercase letter required.";
    if (!/[a-z]/.test(password))
      return "At least one lowercase letter required.";
    if (!/\d/.test(password)) return "At least one number required.";
    if (!passwordRegex.test(password))
      return "Only letters and numbers allowed.";
    return "";
  };

  const getNameValidationMsg = (name: string) => {
    if (!name.trim()) return "Name is required.";
    if (name.trim().length < 3)
      return "Name must be at least 3 characters long.";
    return "";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const newEmail = email.toLowerCase();
    // Validate password and name on submit
    const validationMsg = getPasswordValidationMsg(password);
    if (validationMsg !== "") {
      setPasswordError(validationMsg);
      return;
    } else {
      setPasswordError(null);
    }
    const nameValidationMsg = getNameValidationMsg(name);
    if (nameValidationMsg !== "") {
      setNameError(nameValidationMsg);
      return;
    } else {
      setNameError(null);
    }

    let payload: any = {
      email: newEmail,
      password,
      userData: {
        email: newEmail,
        name,
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
      localStorage.setItem("user_name", name);
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_password", password);

      setName("");
      setEmail("");
      setPassword("");
      route.push(appendQueryString("/otp", searchParams?.toString() || ""));
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
          <label className="text-sm font-medium t">Name</label>
          <div className="relative mt-2">
            <CgRename className="absolute left-3 top-1/2 -translate-y-1/2 " />
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(getNameValidationMsg(e.target.value));
              }}
              required
            />
          </div>
          {nameError && (
            <p className="text-[#ff641a] text-xs mt-1">{nameError}</p>
          )}
        </div>
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
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(getPasswordValidationMsg(e.target.value));
              }}
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
          {passwordError ? (
            <p className="text-[#ff641a] text-xs mt-1">{passwordError}</p>
          ) : (
            <div className="h-5"></div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`lg:w-[90%] bg-[#ff641a] text-white font-semibold min-h-[39px] px-4 py-2 rounded-lg hover:bg-[#ff641a]/80 transition duration-300 flex items-center justify-center gap-2 ${
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
        <SocialAuthButtons />
      </form>
      <p className="text-center text-sm  mt-8 relative">
        If you have an account?
        {switchAuthForm === "" ? (
          <Link href="/sign-in/" className="hover:underline pl-1">
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
