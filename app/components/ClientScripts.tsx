"use client";

import { usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import Script from "next/script";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { initializeAuthSession, installAxiosAuthRefresh } from "@/app/lib/authSession";
import { hasRefreshSessionHint } from "@/app/lib/accessTokenStore";
import BillingGate from "@/app/components/AiTools/BillingGate";
import CheckoutConfirmationOverlay from "@/app/components/AiTools/CheckoutConfirmationOverlay";

/**
 * Global handler for the backend's post-login free-run quota (see
 * free-run-quota.decorator.ts). Installed once here instead of in every tool
 * component's catch block, since every tool route can return this same 403.
 * Dispatches a window event that BillingGate (mounted below) listens for and
 * opens the upgrade popup on — the same event-bridge pattern this app already
 * uses for the Study Workspace's "study:auth-gate".
 */
function installFreeRunQuotaHandler(): () => void {
  const interceptor = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error?.response?.status === 403 &&
        error.response?.data?.code === "FREE_RUN_LIMIT_EXCEEDED"
      ) {
        window.dispatchEvent(new CustomEvent("billing:free-run-limit-exceeded"));
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
    const uninstallAuthRefresh = installAxiosAuthRefresh();
    const uninstallFreeRunQuotaHandler = installFreeRunQuotaHandler();
    // Only bootstrap a session for visitors who have signed in on this device.
    // Without the hint the refresh is guaranteed to fail, and it still costs a
    // cross-origin DNS + TLS + CORS preflight (~1150ms in) on anonymous landing
    // traffic. Signed-in reloads are unaffected: the hint is written whenever an
    // access token is persisted. Any real backend request still refreshes on
    // demand through the axios interceptor installed above.
    if (hasRefreshSessionHint()) void initializeAuthSession();
    return () => {
      uninstallAuthRefresh();
      uninstallFreeRunQuotaHandler();
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

      {/* Global billing upgrade popup, opened when a signed-in user's free
          runs are exhausted on any tool (see installFreeRunQuotaHandler above). */}
      <BillingGate />

      {/* Confirms a just-completed Stripe checkout eagerly (see the component's
          own doc comment for why this exists alongside the invoice.paid webhook). */}
      <CheckoutConfirmationOverlay />

      {/* LiveChat - load script only on home page */}
      {ShowLiveChat && (
        <Script id="livechat-script" strategy="lazyOnload">
          {`
          window.__lc = window.__lc || {};
          window.__lc.license = 19303287;
          window.__lc.integration_name = "manual_onboarding";
          window.__lc.product_name = "livechat";
          ;(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice))
        `}
        </Script>
      )}

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
