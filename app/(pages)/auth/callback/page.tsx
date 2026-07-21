"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import ProductSchema from "@/app/components/ProductSchema";

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
        const errorDescription = hashParams.get("error_description");
        const next = queryParams.get("next") || "/tools/dashboard/";

        if (errorDescription) {
          toast.error(decodeURIComponent(errorDescription));
          router.replace("/sign-in/");
          return;
        }

        if (!accessToken) {
          toast.error("OAuth callback did not return an access token.");
          router.replace("/sign-in/");
          return;
        }

        const verifyResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/verify-token`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              provider: "SUPABASE",
            },
          },
        );

        // Response is wrapped as { success, message, data: { user } } (fallback to raw).
        const user =
          verifyResponse?.data?.data?.user ?? verifyResponse?.data?.user;
        if (!user?.user_id) {
          toast.error("Unable to verify authenticated user.");
          router.replace("/sign-in/");
          return;
        }

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("user_id", user.user_id);
        localStorage.setItem("user_name", user.name || "User");
        const resolvedEmail = String(user?.email || user?.user_email || "")
          .trim()
          .toLowerCase();
        if (resolvedEmail) localStorage.setItem("user_email", resolvedEmail);
        localStorage.setItem("package_type", user.package_type || "none");
        document.cookie = `access_token=${accessToken}; path=/; max-age=86400`;

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
