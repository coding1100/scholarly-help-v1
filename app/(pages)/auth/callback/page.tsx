"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import ProductSchema from "@/app/components/ProductSchema";
import { persistAccessToken } from "@/app/lib/authSession";

const AuthCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, ""),
        );
        const queryParams = new URLSearchParams(window.location.search);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const errorDescription = hashParams.get("error_description");
        const next = queryParams.get("next") || "/tools/dashboard/";

        if (errorDescription) {
          toast.error(decodeURIComponent(errorDescription));
          router.replace("/sign-in/");
          return;
        }

        if (!accessToken || !refreshToken) {
          toast.error("OAuth callback did not return a complete session.");
          router.replace("/sign-in/");
          return;
        }

        // Exchange the callback refresh token once. The backend rotates it into
        // an HttpOnly cookie so JavaScript never persists the long-lived token.
        const sessionResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/session`,
          { refresh_token: refreshToken },
          { withCredentials: true },
        );

        const session = sessionResponse?.data?.data ?? sessionResponse?.data;
        const user = session?.user;
        if (!user?.user_id) {
          toast.error("Unable to verify authenticated user.");
          router.replace("/sign-in/");
          return;
        }

        persistAccessToken(session.access_token, session.expires_in);
        localStorage.setItem("user_id", user.user_id);
        localStorage.setItem("user_name", user.name || "User");
        const resolvedEmail = String(user?.email || user?.user_email || "")
          .trim()
          .toLowerCase();
        if (resolvedEmail) localStorage.setItem("user_email", resolvedEmail);
        localStorage.setItem("package_type", user.package_type || "none");
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );

        toast.success("Signed in successfully!");
        router.replace(next);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          "OAuth sign-in failed. Please try again.";
        toast.error(Array.isArray(message) ? message.join(", ") : message);
        router.replace("/sign-in/");
      }
    };

    handleCallback();
  }, [router]);

  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <ProductSchema
        productTitle="Signing You In - Scholarly Help"
        metaDescription="Completing your sign-in to Scholarly Help. Please wait while we verify your account and redirect you to your dashboard."
        pageUrl={`${baseUrl}/auth/callback/`}
      />
      <p className="text-sm text-gray-600">Completing sign-in...</p>
    </div>
  );
};

export default AuthCallbackPage;
