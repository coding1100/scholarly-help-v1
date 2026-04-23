"use client";
import { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import Logo from "@/app/assets/Images/logo.png";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { ColorRing } from "react-loader-spinner";
import toast from "react-hot-toast";
import { appendQueryString } from "@/app/utils/url";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newEmail = email.toLowerCase();
    try {
      // Replace with your forgot password API endpoint
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/forgot-password`,
        { email: newEmail }
      );
      toast.success(res?.data?.message || "Reset link sent to your email.");
      setEmail("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="z-10 space-y-6 text-[#2B1C50]">
      <div className="flex items-center justify-center">
        <Image
          src={Logo}
          alt="logo is here"
          width={225}
          height={56}
          className="object-cover"
        />
      </div>
      <h1 className="font-semibold text-2xl flex justify-center ">
        Forgot Password
      </h1>
      <form className="flex flex-col gap-5" onSubmit={handleRecover}>
        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="relative mt-2">
            <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2" />
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
        <button
          type="submit"
          disabled={loading}
          className="lg:w-[90%] bg-[#ff641a] text-white font-semibold h-[39px] px-4 rounded-lg hover:bg-[#ff641a]/80 transition duration-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <ColorRing
              height="24"
              width="24"
              ariaLabel="color-ring-loading"
              colors={["white", "white", "white", "white", "white"]}
            />
          ) : (
            "Reset Password"
          )}
          <FaArrowRight />
        </button>
      </form>
      <button
        type="button"
        className="w-[90%] font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-300 flex items-center justify-center gap-2"
        onClick={() =>
          router.push(appendQueryString("/sign-in", searchParams?.toString() || ""))
        }
      >
        Or Sign In Instead
      </button>
    </div>
  );
};

export default ForgotPassword;
