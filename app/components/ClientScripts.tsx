"use client";

import { usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import Script from "next/script";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { initializeAuthSession, installAxiosAuthRefresh } from "@/app/lib/authSession";
import { hasRefreshSessionHint } from "@/app/lib/accessTokenStore";
import BillingGate from "@/app/components/AiTools/BillingGate";
import GuestRunGate from "@/app/components/AiTools/GuestGate/GuestRunGate";
import { dispatchBillingGateEvent, isBillingGateError } from "@/app/lib/client/billingGateCodes";
import CheckoutConfirmationOverlay from "@/app/components/AiTools/CheckoutConfirmationOverlay";
import LiveChatLauncher from "@/app/components/LiveChatLauncher";

/**
 * Global handler for the backend's gate codes (see billingGateCodes.ts):
 * FREE_RUN_LIMIT_EXCEEDED / INSUFFICIENT_CREDITS open the upgrade popup
 * (BillingGate), GUEST_RUN_LIMIT_EXCEEDED opens the sign-up gate
 * (GuestRunGate). Installed once here instead of in every tool component's
 * catch block, since every tool route can return any of them.
 */
function installGateCodeHandler(): () => void {
  const interceptor = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (isBillingGateError(error)) {
        dispatchBillingGateEvent(error.response?.data?.code);
      }
      return Promise.reject(error);
    },
  );
  return () => axios.interceptors.response.eject(interceptor);
}

declare global {
  interface Window {
    LiveChatWidget?: {
      call: (method: string, ...args: any[]) => void;
      on: (event: string, callback: (...args: any[]) => void) => void;
    };
    __lc?: {
      license: number;
      integration_name: string;
      product_name: string;
    };
  }
}

export default function ClientScripts() {
  const currentPage = usePathname();
  const isHomePage = currentPage === "/";
  const isAboutPage =
    currentPage === "/about-us" || currentPage === "/about-us/";

  const ShowLiveChat = isHomePage;

  useEffect(() => {
    const message = sessionStorage.getItem("auth:success-toast");
    if (message) {
      sessionStorage.removeItem("auth:success-toast");
      toast.success(message, { id: "auth-success" });
    }
  }, []);

  useEffect(() => {
    const uninstallAuthRefresh = installAxiosAuthRefresh();
    const uninstallGateCodeHandler = installGateCodeHandler();
    // Only bootstrap a session for visitors who have signed in on this device.
    // Without the hint the refresh is guaranteed to fail, and it still costs a
    // cross-origin DNS + TLS + CORS preflight (~1150ms in) on anonymous landing
    // traffic. Signed-in reloads are unaffected: the hint is written whenever an
    // access token is persisted. Any real backend request still refreshes on
    // demand through the axios interceptor installed above.
    if (hasRefreshSessionHint()) void initializeAuthSession();
    return () => {
      uninstallAuthRefresh();
      uninstallGateCodeHandler();
    };
  }, []);

  // Memoize functions to prevent unnecessary re-renders
  const hideLiveChatWidget = useCallback(() => {
    if (typeof window === "undefined") return;

    if (window.LiveChatWidget) {
      try {
        window.LiveChatWidget.call("hide");
      } catch (error) {
        // Silently fail if widget not ready
      }
    }

    const selectors = [
      "#livechat-container",
      '[id*="livechat"]',
      '[class*="livechat"]',
      '[id*="LiveChat"]',
      '[class*="LiveChat"]',
      'iframe[src*="livechatinc.com"]',
      'iframe[src*="livechat"]',
    ];

    selectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = "none";
            el.style.visibility = "hidden";
          }
        });
      } catch (e) {
        // Ignore selector errors
      }
    });
  }, []);

  // Hide LiveChat when not on home (e.g. after navigating away from "/")
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!ShowLiveChat) {
      hideLiveChatWidget();
    }
  }, [currentPage, ShowLiveChat, hideLiveChatWidget]);

  return (
    <>
      {/* Global toast host. Mounted once here (a client component present on every
          page) so success/error toasts from any tool are actually rendered. */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* Global billing upgrade popup and guest sign-up gate, opened from the
          backend's gate codes on any tool (see installGateCodeHandler above). */}
      <BillingGate />
      <GuestRunGate />

      {/* Confirms a just-completed Stripe checkout eagerly (see the component's
          own doc comment for why this exists alongside the invoice.paid webhook). */}
      <CheckoutConfirmationOverlay />

      {/* LiveChat - home page only, downloaded when the visitor opens it */}
      {ShowLiveChat && <LiveChatLauncher />}

      {/* HelpCrunch - only on /about-us/ page, loaded lazily */}
      {isAboutPage && (
        <Script id="helpcrunch-sdk" strategy="lazyOnload">
          {`
            window.helpcrunchSettings = {
              organization: 'scholarlyhelp',
              appId: 'c8e064ed-a989-4a62-ac3a-e4b2fbe4c1ce',
            };
            (function(w,d){
              var hS=w.helpcrunchSettings;
              if(!hS||!hS.organization){return;}
              var widgetSrc='https://embed.helpcrunch.com/sdk.js';
              w.HelpCrunch=function(){w.HelpCrunch.q.push(arguments)};
              w.HelpCrunch.q=[];
              function r(){
                if (d.querySelector('script[src="' + widgetSrc + '"]')) { return; }
                var s=d.createElement('script');
                s.async=1;
                s.type='text/javascript';
                s.src=widgetSrc;
                (d.body||d.head).appendChild(s);
              }
              if(d.readyState === 'complete'||hS.loadImmediately){r();}
              else if(w.attachEvent){w.attachEvent('onload',r);}
              else{w.addEventListener('load',r,false);}
            })(window, document);
          `}
        </Script>
      )}
    </>
  );
}
