"use client";

import { useEffect, useState } from "react";

// LiveChat's own install snippet (license 19303287), kept verbatim. It defines
// window.LiveChatWidget, which queues calls until tracking.js has loaded.
const LIVECHAT_SNIPPET = `
window.__lc = window.__lc || {};
window.__lc.license = 19303287;
window.__lc.integration_name = "manual_onboarding";
window.__lc.product_name = "livechat";
;(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice))
`;

/**
 * Stand-in for the LiveChat bubble. The widget is only downloaded when the
 * visitor taps this button, then opens straight away. Loading it on page load
 * cost ~350 KB of third-party JS, and its auto greeting slid a 320x620 panel
 * over the hero on mobile (CLS above 1.0 in Lighthouse).
 *
 * Same size and position as LiveChat's own minimized bubble, which replaces
 * this button once the widget reports ready.
 */
export default function LiveChatLauncher() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");

  // The widget may already be loaded from an earlier visit to this route in
  // the same session; never load it twice.
  useEffect(() => {
    if (window.LiveChatWidget) setStatus("ready");
  }, []);

  const openChat = () => {
    if (status !== "idle") return;
    setStatus("loading");
    const script = document.createElement("script");
    script.id = "livechat-script";
    script.text = LIVECHAT_SNIPPET;
    document.body.appendChild(script);
    window.LiveChatWidget?.call("maximize");
    window.LiveChatWidget?.on("ready", () => setStatus("ready"));
  };

  if (status === "ready") return null;

  return (
    <button
      type="button"
      onClick={openChat}
      aria-label="Open live chat"
      aria-busy={status === "loading"}
      className="fixed bottom-4 right-2 z-[2147483639] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#1c1c1c] shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
    >
      {/* The widget takes a few seconds to boot, so show that the tap landed. */}
      {status === "loading" ? (
        <span
          aria-hidden="true"
          className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/30 border-t-white"
        />
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 4h14a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 19 17h-8.2L7 20.5V17H5a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 5 4z"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
