"use client";

import { usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

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
