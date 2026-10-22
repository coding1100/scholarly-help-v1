"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiMessageCircle, FiMessageSquare } from "react-icons/fi";
import axiosInstance from "@/app/axios";
import { SMS_NUMBER, handleTextUsClick } from "@/app/lib/client/smsTracking";
import {
  EXPERT_WHATSAPP_HREF,
  trackExpertWhatsAppClick,
} from "./expertWhatsApp";

/**
 * Height of the mobile bar, published on <html> so the layouts that host it
 * (ToolsLayout, MainLayout) can reserve the same space at the bottom and the
 * bar never covers the end of the page.
 */
const BAR_HEIGHT_VAR = "--done-for-you-bar-height";

// Same US number rule as the existing take-my-class phone form.
const US_PHONE_REGEX = /^\+1[2-9]\d{2}[2-9](?!11)\d{6}$/;

/** Accepts "(555) 123-4567", "555-123-4567", "+1 555 123 4567" etc. */
function toUsE164(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  const e164 =
    digits.length === 10
      ? `+1${digits}`
      : digits.length === 11 && digits.startsWith("1")
        ? `+${digits}`
        : "";
  return US_PHONE_REGEX.test(e164) ? e164 : null;
}

function pushDataLayer(event: Record<string, string>) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ...event, page_path: window.location.pathname });
  } catch {
    // Never block the action if GTM is unavailable.
  }
}

function TextMeForm({ placement }: { placement: string }) {
  const inputId = useId();
  const errorId = useId();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const phoneNumber = toUsE164(phone);
    if (!phoneNumber) {
      setError("Enter a valid US phone number.");
      return;
    }

    setError("");
    setStatus("sending");
    // The backend upserts a GHL contact tagged ai-tools, ai-tools-done-for-you
    // and tool-<slug> for the tool this page hosts.
    const tool = window.location.pathname.match(/^\/tools\/([a-z0-9-]+)/)?.[1];
    try {
      await axiosInstance.post("/order/tools-lead/", { phoneNumber, tool });
      pushDataLayer({
        event: "done_for_you_text_me",
        done_for_you_placement: placement,
      });
      setStatus("sent");
    } catch {
      setError("Could not send. Please try again or chat on WhatsApp.");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <p
        role="status"
        className="mt-1.5 flex h-[46px] items-center gap-2 text-sm font-medium text-[#E2E8F0]"
      >
        <FiCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[#4ADE80]" />
        Thanks! We will text you shortly.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label
        htmlFor={inputId}
        className="block text-[13px] font-semibold leading-5 text-[#E2E8F0]"
      >
        Get your free quote by text
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (error) setError("");
          }}
          placeholder="+1 (555) 123-4567"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-[46px] min-w-0 flex-1 rounded-[10px] border-0 bg-white px-3 text-sm text-[#0F172A] outline-none placeholder:text-[#757575] focus:ring-2 focus:ring-[#EA580C]"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-[46px] w-20 shrink-0 rounded-[10px] bg-[#EA580C] text-sm font-bold text-white transition hover:bg-[#C2410C] disabled:cursor-wait disabled:opacity-70"
        >
          {status === "sending" ? "Sending" : "Text me"}
        </button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-[#F87171]">
          {error}
        </p>
      ) : null}
    </form>
  );
}

/**
 * Sticky bottom bar that stands in for the card below `xl`. Portalled to
 * <body> so it shows even when a caller hides the card's column on small
 * screens, and it publishes its height for the layouts to pad against.
 */
function MobileBar({ placement }: { placement: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const root = document.documentElement;
    const publishHeight = () =>
      root.style.setProperty(BAR_HEIGHT_VAR, `${bar.offsetHeight}px`);
    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(bar);
    root.dataset.doneForYouBar = "";
    return () => {
      observer.disconnect();
      root.style.removeProperty(BAR_HEIGHT_VAR);
      delete root.dataset.doneForYouBar;
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-30 rounded-t-2xl bg-[#0F172A] px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3.5 text-white shadow-[0_-8px_24px_rgba(15,23,42,0.18)] xl:hidden"
    >
      <p className="text-base font-bold leading-5">
        Working full-time while taking classes?
      </p>
      <p className="mt-1 text-[13px] leading-[18px] text-[#CBD5E1]">
        Our experts can take a class off your plate. Free quote, no commitment.
      </p>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <a
          href={`sms:${SMS_NUMBER}`}
          onClick={(e) => {
            pushDataLayer({
              event: "done_for_you_text_us",
              done_for_you_placement: placement,
            });
            handleTextUsClick(e);
          }}
          className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-white text-sm font-bold text-[#0F172A]"
        >
          <FiMessageSquare aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          Text us
        </a>
        <a
          href={EXPERT_WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackExpertWhatsAppClick(`${placement}_mobile`)}
          className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#1E7B3C] text-sm font-bold text-white transition hover:bg-[#186631]"
        >
          <FiMessageCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}

/**
 * Dark "Done-for-you" upsell shown beside every tool and on the tool landing
 * pages. From `xl` up it renders as a card in the caller's layout; below that
 * the card is hidden and a sticky bottom bar takes over. `placement` is sent
 * with every click so each surface's leads can be told apart.
 */
export default function DoneForYouCard({
  placement,
  className = "",
}: {
  placement: string;
  className?: string;
}) {
  // The bar is portalled, so it can only mount on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <section
        aria-label="Done for you"
        className={`hidden flex-col rounded-2xl bg-[#0F172A] px-6 pb-6 pt-[26px] text-white xl:flex ${className}`}
      >
        <span className="inline-flex self-start rounded-full bg-[#1E293B] px-2.5 py-1 text-xs font-semibold leading-4 text-[#CBD5E1]">
          Done-for-you
        </span>
        <h2 className="mt-3.5 text-[22px] font-bold leading-7 text-white">
          Working full-time while taking classes?
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[#CBD5E1]">
          Our experts can take a class off your plate so you keep your GPA, and
          your evenings.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm font-medium leading-5 text-[#E2E8F0]">
          <li className="flex items-center gap-2">
            <FiCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[#4ADE80]" />
            Free quote, no commitment
          </li>
          <li className="flex items-center gap-2">
            <FiCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[#4ADE80]" />
            Classes, exams and assignments
          </li>
        </ul>

        {/* Pinned to the bottom when the card stretches to the tool's height. */}
        <div className="mt-auto pt-8">
          <TextMeForm placement={placement} />

          <div className="my-3 flex items-center gap-3 text-xs leading-4 text-[#64748B]">
            <span aria-hidden="true" className="h-px flex-1 bg-[#2D3B4F]" />
            or
            <span aria-hidden="true" className="h-px flex-1 bg-[#2D3B4F]" />
          </div>

          <a
            href={EXPERT_WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackExpertWhatsAppClick(placement)}
            className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#20B259] text-[15px] font-bold text-white transition hover:bg-[#20B259]/10"
          >
            <FiMessageCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {mounted ? createPortal(<MobileBar placement={placement} />, document.body) : null}
    </>
  );
}
