"use client";

import { useRouter } from "next/navigation";

export const useAuthRedirect = () => {
  const router = useRouter();

  const handleAuthRedirect = (targetUrl: string) => {
    // Preserve current query params (fbclid/utm_*) on both sign-in and returnUrl.
    if (typeof window === "undefined") return;
    const current = new URL(window.location.href);
    const signIn = new URL("/sign-in", current.origin);
    current.searchParams.forEach((value, key) => {
      if (key === "returnUrl") return;
      signIn.searchParams.set(key, value);
    });

    const targetHasQuery = targetUrl.includes("?");
    const returnUrl = targetHasQuery ? targetUrl : `${targetUrl}${current.search}`;
    signIn.searchParams.set("returnUrl", returnUrl);
    router.replace(`${signIn.pathname}${signIn.search}`);
  };

  return { handleAuthRedirect };
};