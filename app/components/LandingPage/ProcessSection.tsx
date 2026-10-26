"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { usePageData } from "./usePageData";
import { getProcessFormCopy } from "./processFormCopy";
import { useQuoteLead } from "./useQuoteLead";
import {
  CLASS_DETAILS_PLACEHOLDER,
  PHONE_PLACEHOLDER,
  QuoteLeadError,
  QuoteLeadNote,
  quoteButtonClass,
  quoteInputClass,
} from "./QuoteLeadFields";

/** Two-step quote form under the process steps: class details, then contact. */
function StepOneForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [classDetails, setClassDetails] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const { submit, sending, error } = useQuoteLead();
  const { heading, description } = getProcessFormCopy(usePathname());

  useEffect(() => {
    if (step === 2) emailRef.current?.focus();
  }, [step]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    void submit({ classDetails, email, phone });
  };

  return (
    <div className="mx-auto mt-14 max-w-3xl border-t border-white/15 pt-10 text-center">
      <h3 className="text-[26px] font-semibold leading-tight max-[768px]:text-[22px]">
        {heading}
      </h3>
      <p className="mt-2 text-sm text-white/80 sm:text-base">{description}</p>
      <form method="post" onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
          Step {step} of 2
        </p>
        {step === 1 ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="classDetails"
              aria-label="Class details"
              placeholder={CLASS_DETAILS_PLACEHOLDER}
              required
              maxLength={200}
              value={classDetails}
              onChange={(e) => setClassDetails(e.target.value)}
              className={`${quoteInputClass} sm:flex-1`}
            />
            <button type="submit" className={quoteButtonClass}>
              Next &rarr;
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
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
              className={`${quoteInputClass} sm:flex-1`}
            />
            <input
              type="tel"
              name="phone"
              aria-label="Mobile number"
              placeholder={PHONE_PLACEHOLDER}
              autoComplete="tel"
              inputMode="tel"
              required
              maxLength={30}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${quoteInputClass} sm:flex-1`}
            />
            <button type="submit" disabled={sending} className={quoteButtonClass}>
              {sending ? "Sending..." : "Get My Match"}
            </button>
          </div>
        )}
        <QuoteLeadError message={error} />
        <div className="flex items-center justify-center gap-4">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-white/75 underline-offset-2 hover:underline"
            >
              &larr; Back
            </button>
          )}
          <QuoteLeadNote text="No spam" />
        </div>
      </form>
    </div>
  );
}

export default function ProcessSection() {
  const data = usePageData();
  const processSection = data?.processSection;

  type StepType = {
    stepNumber?: number;
    title: string;
    description: string;
  };

  const defaultSteps: StepType[] = [
    { stepNumber: 1, title: "Place Your<br/>Order", description: "Use our online form, WhatsApp, Live chat, or email to submit order" },
    { stepNumber: 2, title: "Confirm<br/>Payment", description: "Secure your order with an advance payment to initiate the process." },
    { stepNumber: 3, title: "Expert Work<br/>in Progress", description: "Our skilled tutors start working on your order promptly." },
    { stepNumber: 4, title: "Get Your<br/>Solution", description: "Receive your completed work on time, ready for submission." }
  ];

  const steps = useMemo(() => {
    if (processSection?.steps && Array.isArray(processSection.steps) && processSection.steps.length > 0) {
      return processSection.steps;
    }
    return defaultSteps;
  }, [processSection]);
  return (
    <section className="w-full bg-white text-[#171717]">
      <div className="mx-auto max-w-7xl pb-10 max-[1320px]:px-8">
        <div className="relative rounded-2xl bg-[#3C3D5D] px-6 py-12 sm:px-10 lg:px-14 lg:py-16 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-[42px] max-[768px]:text-[28px] text-[#000]font-bold  sm:font-bold font-semibold leading-tight">
              {processSection?.mainHeading || "State-of-the-Art Process We Follow"}
            </h2>
            <p className="mt-3 sm:text-[18px] text-sm font-medium text-white/80">
              {processSection?.description || "Beyond the subjects listed below, we excel at handling diverse topics effectively. Our expertise knows no bounds, ensuring we're ready for any challenge that comes our way."}
            </p>
          </div>

          <div className="mt-[80px] grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step: StepType, index: number) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                <div className="relative mb-3 h-[98px] w-[98px]">
                  <span className="absolute inset-0 rounded-full bg-white/10 rounded-tl-none rounded-bl-none rounded-tr-[90px] rounded-br-[90px] w-[50px] left-[52px]" />
                  <span className="relative z-[1] inline-block w-full text-center text-[98px] font-semibold leading-none">
                    {step.stepNumber || index + 1}
                  </span>
                </div>
                <h3
                  className="text-[30px] font-semibold leading-tight max-[768px]:text-[22px]"
                  dangerouslySetInnerHTML={{ __html: step.title || '' }}
                />
                <p className="mt-3 text-[18px] leading-relaxed text-white/85">
                  {step.description || ''}
                </p>

                {index < steps.length - 1 && (
                  <div className="pointer-events-none absolute right-[-24px] top-1/2 hidden h-36 -translate-y-1/2 lg:block">
                    <span className="block h-full w-px bg-white/20" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <StepOneForm />
        </div>
      </div>
    </section>
  );
}
