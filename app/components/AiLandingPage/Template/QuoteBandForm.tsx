"use client";

import { FC, FormEvent, useId, useState } from "react";
import { useQuoteLead } from "@/app/components/LandingPage/useQuoteLead";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const input =
  "min-h-[50px] rounded-[10px] border-0 bg-white px-3.5 text-[15px] text-[#111111] outline-none placeholder:text-[#757575] focus:ring-2 focus:ring-[#F26A1B] md:min-h-[52px] md:px-4";

/**
 * Email + phone form for the CTA band. Sends the lead through the site's
 * quote flow (useQuoteLead), which also routes to the thank-you page.
 */
const QuoteBandForm: FC<{ submitLabel: string }> = ({ submitLabel }) => {
  const emailId = useId();
  const phoneId = useId();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const { submit, sending, error } = useQuoteLead();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    void submit({ classDetails: "", email, phone });
  };

  const message = emailError || error;

  return (
    <>
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:pt-1"
      >
        <label htmlFor={emailId} className="sr-only">
          Email
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          placeholder="Email *"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${input} md:flex-[1_1_220px]`}
        />
        <label htmlFor={phoneId} className="sr-only">
          Phone
        </label>
        <input
          id={phoneId}
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
          {sending ? "Sending" : submitLabel}
        </button>
      </form>
      {message ? (
        <p role="alert" className="text-sm text-[#FCA5A5]">
          {message}
        </p>
      ) : null}
    </>
  );
};

export default QuoteBandForm;
