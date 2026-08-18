"use client";
import { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import Logo from "@/app/assets/Images/logo.png";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ColorRing } from "react-loader-spinner";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { buildHrefWithSameQuery } from "@/app/utils/url";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const ChangePassword = () => {
  const router = useRouter();
  const qs =
    typeof window !== "undefined" ? window.location.search.slice(1) : "";

  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Show/hide password states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let extractedToken: string | null = null;
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      extractedToken = hashParams.get("access_token") || hashParams.get("token");
    }
    if (!extractedToken && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      extractedToken =
        searchParams.get("access_token") ||
        searchParams.get("code") ||
        searchParams.get("token");
    }

    if (extractedToken) {
      setToken(extractedToken);
      setTokenError(null);
    } else {
      setTokenError("Missing or invalid password reset link. Please request a new link.");
    }
  }, []);

  const validatePassword = (password: string) => passwordRegex.test(password);

  // Live validation messages
  const getPasswordValidationMsg = (password: string) => {
    if (!password) return "";
    if (password.length < 8) return "At least 8 characters required.";
    if (!/[A-Z]/.test(password))
      return "At least one uppercase letter required.";
    if (!/[a-z]/.test(password))
      return "At least one lowercase letter required.";
    if (!/\d/.test(password)) return "At least one number required.";
    return "Password looks good!";
  };

  const getConfirmValidationMsg = () => {
    if (!confirmPassword) return "";
    if (confirmPassword !== newPassword) return "Passwords do not match.";
    return "Passwords match!";
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!token) {
      toast.error("Access denied. Please reset password again.");
      router.push(
        buildHrefWithSameQuery("/forgot-password/", new URLSearchParams(qs)),
      );
      return;
    }
    if (!validatePassword(newPassword)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, and numbers.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const rawBaseUrl = (process.env.NEXT_PUBLIC_NGROX_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const apiBase = rawBaseUrl.endsWith("/v1") ? rawBaseUrl : `${rawBaseUrl}/v1`;
      const res = await axios.post(
        `${apiBase}/auth/update-password`,
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res?.data?.message || "Password changed successfully.");

      setSuccess("Password changed successfully.");
      router.push(buildHrefWithSameQuery("/sign-in", new URLSearchParams(qs)));
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const serverError =
        err?.response?.data?.message || "Failed to change password. Please try again.";
      setError(serverError);
      toast.error(serverError);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="z-10 space-y-6 text-[#2B1C50] w-full">
      <div className="flex items-center justify-center">
        <Image
          src={Logo}
          alt="logo is here"
          width={225}
          height={56}
          className="object-cover"
        />
      </div>
      <h1 className="font-semibold text-2xl flex justify-center">
        Reset Password
      </h1>

      {tokenError ? (
        <div className="space-y-4 text-center">
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {tokenError}
          </div>
          <button
            type="button"
            className="w-full bg-[#ff641a] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#ff641a]/80 transition duration-300 flex items-center justify-center gap-2"
            onClick={() => {
              router.push(
                buildHrefWithSameQuery(
                  "/forgot-password/",
                  new URLSearchParams(qs),
                ),
              );
            }}
          >
            Request New Reset Link
          </button>
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleChangePassword}>
          <div>
            <label className="text-sm font-medium">New Password</label>
            <div className="relative mt-2">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                tabIndex={-1}
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={
                  showNewPassword ? "Hide password" : "Show password"
                }
              >
                {showNewPassword ? (
                  <FiEyeOff size={20} />
                ) : (
                  <FiEye size={20} />
                )}
              </button>
            </div>
            <div
              className={`text-xs mt-1 ${
                getPasswordValidationMsg(newPassword) ===
                "Password looks good!"
                  ? "text-green-600"
                  : "text-[#fb2c36]"
              }`}
            >
              {getPasswordValidationMsg(newPassword)}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">
              Confirm New Password
            </label>
            <div className="relative mt-2">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={20} />
                ) : (
                  <FiEye size={20} />
                )}
              </button>
            </div>
            <div
              className={`text-xs mt-1 ${
                getConfirmValidationMsg() === "Passwords match!"
                  ? "text-green-600"
                  : "text-[#fb2c36]"
              }`}
            >
              {getConfirmValidationMsg()}
            </div>
          </div>
          {error && <div className="text-[#fb2c36] text-sm">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm">{success}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff641a] text-white font-semibold h-[42px] px-4 rounded-lg hover:bg-[#ff641a]/80 transition duration-300 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <ColorRing
                height="24"
                width="24"
                ariaLabel="color-ring-loading"
                colors={["white", "white", "white", "white", "white"]}
              />
            ) : (
              "Change Password"
            )}
            <FaArrowRight />
          </button>
        </form>
      )}
    </div>
  );
};

export default ChangePassword;
