"use client";

import { FiCheck } from "react-icons/fi";
import {
  EXPERT_WHATSAPP_HREF,
  trackExpertWhatsAppClick,
} from "./Dashboard/ExpertHelpCard";

/**
 * Dark "Done-for-you" WhatsApp upsell shown beside every tool. `placement` is
 * sent with the WhatsApp click event so each tool's leads can be told apart;
 * `title` and `body` let a tool fit the pitch to what the user is doing.
 */
export default function DoneForYouCard({
  placement,
  title = "No time to study at all this week?",
  body = "Our experts can take a class off your plate so you keep your GPA, and your evenings.",
  className = "",
}: {
  placement: string;
  title?: string;
  body?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-3xl bg-[#0F172A] p-6 text-white shadow-[0_4px_30px_rgba(15,23,42,0.15)] sm:p-7 ${className}`}
    >
      <div>
        <span className="mb-4 inline-flex items-center rounded-full bg-[#1E293B] px-3 py-1 text-xs font-semibold text-gray-300">
          Done-for-you
        </span>
        <h2 className="mb-3 text-xl font-bold leading-snug text-white sm:text-2xl">
          {title}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-400">
          {body}
        </p>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-300 sm:text-sm">
          <FiCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Free quote, no commitment</span>
        </div>
      </div>

      <a
        href={EXPERT_WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackExpertWhatsAppClick(placement)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#16A34A] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#15803D] sm:text-base"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4 shrink-0"
        >
          <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7c1.7.9 3.6 1.4 5.6 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3ZM12 21.5c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.6 9.6 0 1 1 8.4 4.7Zm5.3-7.1c-.3-.1-1.7-.850-2-.95-.3-.1-.5-.1-.7.15-.2.3-.75.95-.9 1.15-.2.2-.35.2-.65.05-1.75-.85-2.9-1.55-4.05-3.5-.3-.55.3-.5.9-1.65.1-.2.05-.35 0-.5s-.7-1.6-.9-2.2c-.25-.6-.5-.5-.7-.5h-.6c-.2 0-.5.05-.8.35-.3.3-1.05 1-1.05 2.5s1.1 2.9 1.25 3.1c.15.2 2.15 3.3 5.2 4.6 2 .85 2.75.95 3.75.8.6-.1 1.7-.7 1.95-1.35.25-.65.25-1.2.15-1.35-.05-.1-.25-.2-.55-.3Z" />
        </svg>
        <span>Chat on WhatsApp</span>
      </a>
    </div>
  );
}
