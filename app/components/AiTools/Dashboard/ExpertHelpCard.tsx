"use client";

import { FiCheck } from "react-icons/fi";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}

/** Shared by the dashboard card and the sidebar's "Get expert help" entry. */
export const EXPERT_WHATSAPP_HREF =
  "https://api.whatsapp.com/send?phone=14108445419";

export function trackExpertWhatsAppClick(placement: string) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "whatsapp_click",
    whatsapp_placement: placement,
    page_path: window.location.pathname,
  });
}

/**
 * Done-for-you upsell in the dashboard's right rail. Greens are literal hex:
 * this project's Tailwind config replaces the default palette and generates no
 * green scale, and these match the site header's existing WhatsApp button.
 */
export default function ExpertHelpCard() {
  return (
    <section
      aria-label="Done for you"
      className="rounded-2xl border border-[#BFE3A8] bg-[#F2FAEC] p-5 dark:border-[#41A800]/30 dark:bg-[#41A800]/10"
    >
      <span className="inline-flex items-center rounded-full bg-[#DCF2CE] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#2F7A00] dark:bg-[#41A800]/20 dark:text-[#9BD97A]">
        Done-for-you
      </span>

      <h2 className="mt-3 text-lg font-bold leading-snug text-gray-900 dark:text-gray-100">
        Need someone to take your online class?
      </h2>
      <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
        Working full-time and keeping up with weekly coursework is a lot. An
        expert can take the class off your plate.
      </p>

      <p className="mt-3 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
        <FiCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[#2F7A00] dark:text-[#9BD97A]" />
        Free quote, no commitment
      </p>

      <a
        href={EXPERT_WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackExpertWhatsAppClick("dashboard_done_for_you")}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F7A33] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(31,122,51,0.28)] transition hover:bg-[#186127] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A33] focus-visible:ring-offset-2"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7c1.7.9 3.6 1.4 5.6 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3ZM12 21.5c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.6 9.6 0 1 1 8.4 4.7Zm5.3-7.1c-.3-.1-1.7-.850-2-.95-.3-.1-.5-.1-.7.15-.2.3-.75.95-.9 1.15-.2.2-.35.2-.65.05-1.75-.85-2.9-1.55-4.05-3.5-.3-.55.3-.5.9-1.65.1-.2.05-.35 0-.5s-.7-1.6-.9-2.2c-.25-.6-.5-.5-.7-.5h-.6c-.2 0-.5.05-.8.35-.3.3-1.05 1-1.05 2.5s1.1 2.9 1.25 3.1c.15.2 2.15 3.3 5.2 4.6 2 .85 2.75.95 3.75.8.6-.1 1.7-.7 1.95-1.35.25-.65.25-1.2.15-1.35-.05-.1-.25-.2-.55-.3Z" />
        </svg>
        Get a quote on WhatsApp
      </a>
    </section>
  );
}
