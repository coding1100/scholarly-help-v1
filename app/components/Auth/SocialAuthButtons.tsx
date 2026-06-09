"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaFacebookF } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { buildHrefWithSameQuery } from "@/app/utils/url";

declare global {
  interface Window {
    google?: any;
    dataLayer?: Array<Record<string, any>>;
  }
}

type SocialAuthButtonsProps = {
  returnUrl?: string | null;
  authAction: "sign_in" | "sign_up";
};

const SocialAuthButtons = ({
  returnUrl,
  authAction,
}: SocialAuthButtonsProps) => {
  const route = useRouter();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleIframeObserverRef = useRef<MutationObserver | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const getApiErrorMessage = (err: any, fallback: string) => {
    const message = err?.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    return fallback;
  };

  const pushGoogleAuthEvent = useCallback(
    (eventName: "signup_google_click" | "signup_success") => {
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: eventName,
          ...(eventName === "signup_success"
            ? { signup_method: "google" }
            : {}),
          auth_action: authAction,
          auth_provider: "google",
        });
      } catch {
        // Do not block auth if GTM is unavailable.
      }
    },
    [authAction],
  );

  const persistSessionAndRedirect = useCallback(
    (data: any) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_id", data.user.user_id);
      localStorage.setItem("user_name", data.user.name);
      const resolvedEmail =
        String(data?.user?.email || data?.user?.user_email || "")
          .trim()
          .toLowerCase() || "";
      if (resolvedEmail) localStorage.setItem("user_email", resolvedEmail);
      localStorage.setItem("package_type", data.user.package_type);
      // Always overwrite to avoid stale email from a previous login.
      const resolvedEmail = String(
        data?.user?.email || data?.user?.user_email || "",
      )
        .trim()
        .toLowerCase();
      if (resolvedEmail) localStorage.setItem("user_email", resolvedEmail);
      document.cookie = `access_token=${data.access_token}; path=/; max-age=86400`;

      setTimeout(() => {
        const redirectPath = returnUrl || "/tools/dashboard/";
        const currentQs =
          typeof window !== "undefined" ? window.location.search.slice(1) : "";
        const redirectUrl = returnUrl
          ? redirectPath
          : buildHrefWithSameQuery(
              redirectPath,
              new URLSearchParams(currentQs),
            );
        route.replace(redirectUrl);
      }, 100);
    },
    [returnUrl, route],
  );

  const handleGoogleCallback = useCallback(
    async (response: any) => {
      try {
        if (!response?.credential) {
          toast.error("Google sign-in failed. Missing ID token.");
          return;
        }

        setGoogleLoading(true);
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/google/signin`,
          { idToken: response.credential },
        );

        pushGoogleAuthEvent("signup_success");
        toast.success("Signed in with Google successfully!");
        persistSessionAndRedirect(res.data);
      } catch (err: any) {
        toast.error(
          getApiErrorMessage(err, "Google sign-in failed. Please try again."),
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    [persistSessionAndRedirect, pushGoogleAuthEvent],
  );

  useEffect(() => {
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;

    if (!clientId) return;

    let cancelled = false;
    const trackGoogleClick = () => {
      pushGoogleAuthEvent("signup_google_click");
    };

    const ensureGoogleIframeId = () => {
      const container = googleButtonRef.current;
      if (!container) return false;

      const iframe = container.querySelector("iframe");
      if (!iframe) return false;

      if (iframe.id !== "google-click") iframe.id = "google-click";
      iframe.classList.add("googleclick");
      return true;
    };

    const observeGoogleIframe = () => {
      const container = googleButtonRef.current;
      if (!container) return;

      // If it's already there (sometimes it renders synchronously), set and stop.
      if (ensureGoogleIframeId()) {
        googleIframeObserverRef.current?.disconnect();
        googleIframeObserverRef.current = null;
        return;
      }

      googleIframeObserverRef.current?.disconnect();
      const observer = new MutationObserver(() => {
        if (ensureGoogleIframeId()) {
          observer.disconnect();
          if (googleIframeObserverRef.current === observer) {
            googleIframeObserverRef.current = null;
          }
        }
      });
      observer.observe(container, { childList: true, subtree: true });
      googleIframeObserverRef.current = observer;
    };

    const initializeGoogleButton = () => {
      if (
        cancelled ||
        !window.google?.accounts?.id ||
        !googleButtonRef.current
      ) {
        return;
      }

      googleIframeObserverRef.current?.disconnect();
      googleIframeObserverRef.current = null;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
        ux_mode: "popup",
      });

      googleButtonRef.current.innerHTML = "";
      const buttonWidth = Math.min(
        360,
        Math.max(220, googleButtonRef.current.clientWidth || 320),
      );
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width: buttonWidth,
        // Google Identity Services supported hook: reliable click tracking
        // even though the button is rendered in an iframe.
        click_listener: trackGoogleClick,
      });

      observeGoogleIframe();
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
      return () => {
        cancelled = true;
        googleIframeObserverRef.current?.disconnect();
        googleIframeObserverRef.current = null;
      };
    }

    const scriptId = "google-identity-services";
    const existingScript = document.getElementById(
      scriptId,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", initializeGoogleButton);
      return () => {
        cancelled = true;
        existingScript.removeEventListener("load", initializeGoogleButton);
        googleIframeObserverRef.current?.disconnect();
        googleIframeObserverRef.current = null;
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleButton;
    script.onerror = () => {
      toast.error("Unable to load Google sign-in.");
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      googleIframeObserverRef.current?.disconnect();
      googleIframeObserverRef.current = null;
    };
  }, [handleGoogleCallback, pushGoogleAuthEvent]);

  const handleFacebookSignIn = async () => {
    try {
      setFacebookLoading(true);
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        returnUrl || "/tools/dashboard/",
      )}`;
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/facebook/url`,
        { params: { redirectTo: callbackUrl } },
      );

      if (!res?.data?.url) {
        toast.error("Unable to start Facebook sign-in.");
        setFacebookLoading(false);
        return;
      }

      window.location.href = res.data.url;
    } catch (err: any) {
      toast.error(
        getApiErrorMessage(err, "Facebook sign-in failed. Please try again."),
      );
      setFacebookLoading(false);
    }
  };

  return (
    <div className="w-[90%]">
      <div className="flex items-center gap-2 my-2">
        <div className="h-px bg-gray-300 flex-1" />
        <span className="text-xs text-gray-500">OR</span>
        <div className="h-px bg-gray-300 flex-1" />
      </div>

      <div
        ref={googleButtonRef}
        data-google-signin
        data-auth-action={authAction}
        className={`google-btn min-h-[44px] flex items-center justify-center ${
          googleLoading ? "opacity-70" : ""
        }`}
      />

      {/* <button
        type="button"
        onClick={handleFacebookSignIn}
        disabled={facebookLoading}
        className="mt-3 w-full border border-gray-300 bg-white text-[#1877F2] font-semibold h-[42px] rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition duration-300 disabled:opacity-70"
      >
        <span className="inline-flex items-center justify-center w-6 h-5 text-[18px] leading-none ml-2.5">
          <FaFacebookF />
        </span>
        <p className="grow text-sm font-normal text-black">
        {facebookLoading ? "Connecting Facebook..." : "Continue with Facebook"}</p>
      </button> */}
    </div>
  );
};

export default SocialAuthButtons;
