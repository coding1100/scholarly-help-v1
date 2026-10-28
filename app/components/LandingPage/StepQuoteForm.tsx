"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useQuoteLead } from "./useQuoteLead";
import { usePageData } from "./usePageData";
import { QuoteLeadError, QuoteLeadNote } from "./QuoteLeadFields";

const HELP_OPTIONS = [
  "Full online class",
  "Online exam",
  "Homework or quizzes",
  "Writing assignments",
];

const buttonClass =
  "flex h-12 shrink-0 items-center justify-center rounded-md border border-transparent bg-[#ff641a] px-6 text-[15px] font-bold text-white transition duration-300 hover:border-[#ff641a] hover:bg-white hover:text-[#ff641a] disabled:cursor-wait disabled:opacity-80";

const inputClass =
  "block h-12 w-full rounded-md border bg-white px-4 text-sm text-[#111111] placeholder-[#9CA3AF] outline-none transition focus:border-[#ff641a] focus:ring-2 focus:ring-[#ff641a]/30";

/**
 * hero: inside the hero card. process: straight on the dark process panel.
 * final: inside the white card on the final CTA.
 */
type Variant = "hero" | "process" | "final";

const STYLES: Record<
  Variant,
  {
    align: string;
    heading: string;
    muted: string;
    options: string;
    option: string;
    input: string;
    fields: string;
    note: string;
    error: string;
  }
> = {
  hero: {
    align: "text-left md:text-center",
    heading: "text-[#111111]",
    muted: "text-[#6B7280]",
    options: "grid-cols-2 md:grid-cols-4",
    option: "border-transparent bg-[#EEF0FD]",
    input: "border-[#E3E5F3]",
    fields: "flex-col",
    note: "justify-center text-[#6B7280]",
    error: "text-[#D93025]",
  },
  process: {
    align: "text-center",
    heading: "text-white",
    muted: "text-white/75",
    options: "grid-cols-2 md:grid-cols-4",
    option: "border-transparent bg-white",
    input: "border-transparent",
    fields: "flex-col sm:flex-row",
    note: "justify-center text-white/75",
    error: "text-[#FFB59A]",
  },
  final: {
    align: "text-left",
    heading: "text-[#111111]",
    muted: "text-[#6B7280]",
    options: "grid-cols-2",
    option: "border-[#E3E5F3] bg-white",
    input: "border-[#E3E5F3]",
    fields: "flex-col",
    note: "justify-start text-[#6B7280]",
    error: "text-[#D93025]",
  },
};

interface StepQuoteFormProps {
  variant: Variant;
  /** Show the fixed "scroll back to the form" button once the form is off screen. */
  stickyCta?: boolean;
}

/**
 * Two-step quote form: tap what you need help with, then leave an email and
 * mobile number. The tapped option is sent as the lead's instructions.
 */
export default function StepQuoteForm({ variant, stickyCta = false }: StepQuoteFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [helpWith, setHelpWith] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const { submit, sending, error } = useQuoteLead({
    logToLandingSheet: variant === "hero",
  });
  const styles = STYLES[variant];
  // Same CTA as /take-my-class (HeroForm2's label).
  const ctaLabel =
    usePageData()?.getQuote?.ctaButton?.text || "Secure My 'A' or 'B' Grades";

  useEffect(() => {
    if (step === 2) emailRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!stickyCta || !formRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsFormVisible(entry.isIntersecting),
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" },
    );
    observer.observe(formRef.current);
    return () => observer.disconnect();
  }, [stickyCta]);

  const chooseOption = (option: string) => {
    setHelpWith(option);
    setStep(2);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit({ classDetails: helpWith, email, phone });
  };

  const scrollToForm = () => {
    if (!formRef.current) return;
    const top = formRef.current.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      <form
        ref={formRef}
        id={variant === "hero" ? "quote-form" : undefined}
        method="post"
        onSubmit={onSubmit}
        className="flex flex-col gap-3"
      >
        {step === 1 ? (
          <>
            <p className={`text-[15px] font-semibold sm:text-base ${styles.align} ${styles.heading}`}>
              What do you need help with?{" "}
              <span className={`whitespace-nowrap text-xs font-medium ${styles.muted}`}>
                &middot; Step 1 of 2
              </span>
            </p>
            <div className={`grid gap-2 sm:gap-3 ${styles.options}`}>
              {HELP_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => chooseOption(option)}
                  className={`flex min-h-[52px] items-center md:min-h-[44px] justify-center rounded-md border px-2 py-2 text-center text-[13px] font-semibold leading-tight text-[#111111] transition hover:border-[#ff641a] sm:text-sm ${styles.option}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <QuoteLeadNote text="No spam · Takes 30 seconds" className={styles.note} />
          </>
        ) : (
          <>
            <div className={`${styles.align} ${styles.heading}`}>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${styles.muted}`}>
                Step 2 of 2
              </p>
              <p className="mt-1 text-[15px] font-semibold sm:text-base">
                Where should we text your price?
              </p>
            </div>
            <div className={`flex gap-3 ${styles.fields}`}>
              <input
                ref={emailRef}
                type="email"
                name="email"
                aria-label="Email"
                placeholder="Email *"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} ${styles.input}`}
              />
              <input
                type="tel"
                name="phone"
                aria-label="Mobile number"
                placeholder="+1 (555) 000-0000"
                autoComplete="tel"
                inputMode="tel"
                required
                maxLength={30}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${inputClass} ${styles.input}`}
              />
              {variant === "process" && (
                <button type="submit" disabled={sending} className={buttonClass}>
                  {sending ? "Sending..." : ctaLabel}
                </button>
              )}
            </div>
            <p className={`text-xs ${styles.align} ${styles.muted}`}>
              We&apos;ll text you your price. No spam.
            </p>
            {variant !== "process" && (
              <button type="submit" disabled={sending} className={`${buttonClass} w-full`}>
                {sending ? "Sending..." : ctaLabel}
              </button>
            )}
            <QuoteLeadError message={error} className={styles.error} />
          </>
        )}
      </form>

      {stickyCta && !isFormVisible && (
        <button
          type="button"
          onClick={scrollToForm}
          className="fixed bottom-2 left-1/2 z-50 h-12 w-[75%] -translate-x-1/2 cursor-pointer rounded-md border border-transparent bg-[#ff641a] px-4 text-sm font-medium uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:border-[#ff641a] hover:bg-white hover:text-[#ff641a] sm:w-fit"
        >
          {ctaLabel}
        </button>
      )}
    </>
  );
}
