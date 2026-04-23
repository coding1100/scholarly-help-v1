"use client";

import { useRouter } from "next/navigation";
import { appendQueryString } from "@/app/utils/url";

export const useAuthRedirect = () => {
  const router = useRouter();

  const handleAuthRedirect = (targetUrl: string) => {
    // Immediately redirect to sign-in without any delay
    const currentQs =
      typeof window !== "undefined" ? window.location.search : "";
    const signInBase = currentQs ? `/sign-in${currentQs}` : "/sign-in";
    const signInUrl = appendQueryString(
      signInBase,
      `returnUrl=${encodeURIComponent(targetUrl)}`,
    );
    router.replace(signInUrl);
  };

  return { handleAuthRedirect };
};