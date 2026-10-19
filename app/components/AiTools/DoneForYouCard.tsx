"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiMessageCircle, FiMessageSquare } from "react-icons/fi";
import { submitLead, toUsE164 } from "@/app/lib/client/leadCapture";
import { SMS_NUMBER, handleTextUsClick } from "@/app/lib/client/smsTracking";
import {
  EXPERT_WHATSAPP_HREF,
  trackExpertWhatsAppClick,
} from "./expertWhatsApp";
import { useMobileCtaBar } from "./useMobileCtaBar";

type Variant = "rail" | "landing";

/**
 * Class names per variant. "rail" is the card beside a tool page (hidden
 * below xl, where its sticky bar takes over). "landing" is the panel joined to
 * the tool in a landing page hero: always visible, compact below lg, and the
 * landing template supplies its own sticky bar.
 */
const STYLES = {
  rail: {
    card: "hidden flex-col rounded-2xl bg-[#0F172A] px-6 pb-6 pt-[26px] text-white xl:flex",
    pill: "inline-flex self-start rounded-full bg-[#1E293B] px-2.5 py-1 text-xs font-semibold leading-4 text-[#CBD5E1]",
    title: "mt-3.5 text-[22px] font-bold leading-7 text-white",
    body: "mt-4 text-sm leading-relaxed text-[#CBD5E1]",
    checks: "mt-3 space-y-1.5 text-sm font-medium leading-5 text-[#E2E8F0]",
    check: "flex items-center gap-2",
    checkIcon: "h-4 w-4 shrink-0 text-[#4ADE80]",
    bottom: "mt-auto pt-8",
    label: "block text-[13px] font-semibold leading-5 text-[#E2E8F0]",
    row: "mt-1.5 flex gap-2",
    input:
      "h-[46px] min-w-0 flex-1 rounded-[10px] border-0 bg-white px-3 text-sm text-[#0F172A] outline-none placeholder:text-[#757575] focus:ring-2 focus:ring-[#EA580C]",
    button:
      "h-[46px] w-20 shrink-0 rounded-[10px] bg-[#EA580C] text-sm font-bold text-white transition hover:bg-[#C2410C] disabled:cursor-wait disabled:opacity-70",
    sent: "mt-1.5 flex h-[46px] items-center gap-2 text-sm font-medium text-[#E2E8F0]",
    error: "mt-1.5 text-xs text-[#F87171]",
    or: "my-3 flex items-center gap-3 text-xs leading-4 text-[#64748B]",
    orLine: "h-px flex-1 bg-[#2D3B4F]",
    whatsApp:
      "flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#20B259] text-[15px] font-bold text-white transition hover:bg-[#20B259]/10",
    whatsAppIcon: "h-3.5 w-3.5 shrink-0 text-[#22C55E]",
  },
  landing: {
    card: "flex flex-col gap-2.5 rounded-[10px] bg-[#14182B] p-[18px] text-white lg:gap-3 lg:rounded-l-none lg:rounded-r-lg lg:p-5",
    pill: "self-start rounded-full bg-[#2B2F55] px-2.5 py-[3px] text-[11px] font-semibold text-[#C9C6FF] lg:text-[10px]",
    title: "text-lg font-bold leading-[1.3] lg:text-[17px]",
    body: "text-[13px] leading-[1.55] text-[#C9CBDA] lg:text-[11px]",
    checks: "hidden flex-col gap-1.5 text-[11px] lg:flex",
    check: "flex items-center gap-1.5",
    checkIcon: "h-3 w-3 shrink-0 text-[#4ADE80]",
    bottom: "flex flex-col gap-2 lg:mt-auto",
    label: "sr-only text-[11px] font-semibold lg:not-sr-only lg:block",
    row: "flex gap-1.5 lg:mt-2",
    input:
      "min-h-[46px] min-w-0 flex-1 rounded-md border-0 bg-white px-3 text-[15px] text-[#111111] outline-none placeholder:text-[#757575] focus:ring-2 focus:ring-[#F26A1B] lg:min-h-[38px] lg:rounded lg:px-2.5 lg:text-[11px]",
    button:
      "min-h-[46px] shrink-0 rounded-md bg-[#F26A1B] px-4 text-sm font-bold text-white transition hover:bg-[#D85A10] disabled:cursor-wait disabled:opacity-70 lg:min-h-[38px] lg:rounded lg:px-3 lg:text-[11px]",
    sent: "flex items-center gap-2 rounded-md bg-[#2B2F55] p-3 text-[13px] leading-normal lg:text-[11px]",
    error: "text-xs text-[#F87171]",
    or: "hidden text-center text-[10px] text-[#8C90AA] lg:block",
    orLine: "hidden",
    whatsApp:
      "flex min-h-[46px] items-center justify-center rounded-md border-[1.5px] border-[#4ADE80] text-sm font-semibold text-[#4ADE80] transition hover:bg-[#4ADE80]/10 lg:min-h-[38px] lg:rounded lg:text-[11px]",
    whatsAppIcon: "hidden",
  },
} satisfies Record<Variant, Record<string, string>>;

type CardStyles = (typeof STYLES)[Variant];

function pushDataLayer(event: Record<string, string>) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ...event, page_path: window.location.pathname });
  } catch {
    // Never block the action if GTM is unavailable.
  }
}

function TextMeForm({
  placement,
  s,
}: {
  placement: string;
  s: CardStyles;
}) {
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
    try {
      await submitLead({ phoneNumber });
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
      <p role="status" className={s.sent}>
        <FiCheck aria-hidden="true" className={s.checkIcon} />
        Thanks! We will text you shortly.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor={inputId} className={s.label}>
        Get your free quote by text
      </label>
      <div className={s.row}>
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
          className={s.input}
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className={s.button}
        >
          {status === "sending" ? "Sending" : "Text me"}
        </button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className={s.error}>
          {error}
        </p>
      ) : null}
    </form>
  );
}

/**
 * Sticky bottom bar that stands in for the rail card below `xl`. Portalled to
 * <body> so it shows even when a caller hides the card's column on small
 * screens.
 */
function MobileBar({ placement }: { placement: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  useMobileCtaBar(barRef);

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
 * pages. `placement` is sent with every click so each surface's leads can be
 * told apart. See STYLES for how the two variants lay out.
 */
export default function DoneForYouCard({
  placement,
  variant = "rail",
  className = "",
}: {
  placement: string;
  variant?: Variant;
  className?: string;
}) {
  const s = STYLES[variant];
  // The rail's bar is portalled, so it can only mount on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <section aria-label="Done for you" className={`${s.card} ${className}`}>
        <span className={s.pill}>Done-for-you</span>
        <h2 className={s.title}>Working full-time while taking classes?</h2>
        <p className={s.body}>
          Our experts can take a class off your plate so you keep your GPA, and
          your evenings.
        </p>
        <ul className={s.checks}>
          <li className={s.check}>
            <FiCheck aria-hidden="true" className={s.checkIcon} />
            Free quote, no commitment
          </li>
          <li className={s.check}>
            <FiCheck aria-hidden="true" className={s.checkIcon} />
            Classes, exams and assignments
          </li>
        </ul>

        {/* Pinned to the bottom when the card stretches to the tool's height. */}
        <div className={s.bottom}>
          <TextMeForm placement={placement} s={s} />

          <div className={s.or}>
            <span aria-hidden="true" className={s.orLine} />
            or
            <span aria-hidden="true" className={s.orLine} />
          </div>

          <a
            href={EXPERT_WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackExpertWhatsAppClick(placement)}
            className={s.whatsApp}
          >
            <FiMessageCircle aria-hidden="true" className={s.whatsAppIcon} />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {variant === "rail" && mounted
        ? createPortal(<MobileBar placement={placement} />, document.body)
        : null}
    </>
  );
}
