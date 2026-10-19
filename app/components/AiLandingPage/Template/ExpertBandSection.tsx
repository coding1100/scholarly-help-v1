"use client";

import { FC, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { submitLead, toUsE164 } from "@/app/lib/client/leadCapture";
import { EXPERT_BAND_ID } from "./ui";
import type { LandingContent } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const input =
  "min-h-[50px] rounded-[10px] border-0 bg-white px-3.5 text-[15px] text-[#111111] outline-none placeholder:text-[#757575] focus:ring-2 focus:ring-[#F26A1B] md:min-h-[52px] md:px-4";

/**
 * Lead band for work bigger than the free tool handles. Email and phone go
 * through the same lead flow as the site's other quote forms, then on to the
 * same thank-you page.
 */
const ExpertBandSection: FC<{
  content: LandingContent["expertBand"];
  ctaLabel: string;
  placement: string;
}> = ({ content: c, ctaLabel, placement }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const phoneNumber = toUsE164(phone);
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!phoneNumber) {
      setError("Enter a valid US phone number.");
      return;
    }

    setError("");
    setSending(true);
    try {
      await submitLead({ email: email.trim(), phoneNumber });
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "landing_expert_lead",
          landing_placement: placement,
          page_path: window.location.pathname,
        });
      } catch {
        // Never block the lead if GTM is unavailable.
      }
      router.push("/thank-you-2");
    } catch {
      setError("Could not send. Please try again.");
      setSending(false);
    }
  };

  return (
    <section
      id={EXPERT_BAND_ID}
      className="scroll-mt-[70px] bg-[#F4F3FD] px-4 py-7 md:px-6 md:py-14"
    >
      <div className="mx-auto flex max-w-[1000px] flex-col gap-3 rounded-2xl border-t-[5px] border-[#F26A1B] bg-[linear-gradient(135deg,#161A33_0%,#262B5C_100%)] px-[18px] py-[22px] text-white shadow-[0_14px_32px_rgba(22,26,51,0.30)] md:gap-4 md:rounded-[18px] md:px-9 md:py-[34px] md:shadow-[0_18px_44px_rgba(22,26,51,0.30)]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full bg-[#F26A1B] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.05em]">
            {c.tag}
          </span>
          <span className="hidden text-[13px] text-[#C9CBE6] md:inline">{c.tagline}</span>
        </div>
        <h2 className="text-2xl font-extrabold leading-[1.25] md:text-[32px] md:leading-[1.2]">
          {c.titleStart} <span className="text-[#FF9A57]">{c.titleAccent}</span>
        </h2>
        <ul className="flex flex-col gap-1.5 text-sm text-[#E4E6F7] md:flex-row md:flex-wrap md:gap-x-[26px] md:gap-y-2">
          {c.checks.map((check) => (
            <li key={check}>
              <span aria-hidden="true" className="text-[#4ADE80]">
                ✓
              </span>{" "}
              {check}
            </li>
          ))}
        </ul>

        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:pt-1"
        >
          <label htmlFor={`${EXPERT_BAND_ID}-email`} className="sr-only">
            Email
          </label>
          <input
            id={`${EXPERT_BAND_ID}-email`}
            type="email"
            autoComplete="email"
            placeholder="Email *"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${input} md:flex-[1_1_220px]`}
          />
          <label htmlFor={`${EXPERT_BAND_ID}-phone`} className="sr-only">
            Phone
          </label>
          <input
            id={`${EXPERT_BAND_ID}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Phone # *"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`${input} md:flex-[1_1_200px]`}
          />
          <button
            type="submit"
            disabled={sending}
            className="min-h-[52px] rounded-[10px] bg-[linear-gradient(90deg,#F26A1B,#FF8A3D)] px-[26px] text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(242,106,27,0.45)] disabled:cursor-wait disabled:opacity-70 md:flex-none"
          >
            {sending ? "Sending" : ctaLabel}
          </button>
        </form>
        {error ? (
          <p role="alert" className="text-sm text-[#FCA5A5]">
            {error}
          </p>
        ) : null}

        <p className="text-xs leading-normal text-[#A9ACCB]">
          {c.note}
          {c.rating ? (
            <>
              {" · "}
              <span aria-hidden="true" className="text-[#F5B301]">
                ★★★★★
              </span>{" "}
              {c.rating}
            </>
          ) : null}
        </p>
      </div>
    </section>
  );
};

export default ExpertBandSection;
