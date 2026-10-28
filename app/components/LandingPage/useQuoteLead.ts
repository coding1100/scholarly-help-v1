"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/axios";
import { appendMetaLeadFields, pushQuoteLeadEvent } from "@/app/utils/metaLeadEvent";

export type QuoteLead = {
  classDetails: string;
  email: string;
  phone: string;
};

const digitCount = (value: string) => value.replace(/\D/g, "").length;

/**
 * Sends a quote lead the same way the hero form does (/order/quote with the ad
 * click ids and page URL), then routes to /thank-you. With `logToLandingSheet`
 * the lead is also logged to the TMC landing sheet, as HeroForm2 does.
 */
export function useQuoteLead({ logToLandingSheet = false } = {}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async ({ classDetails, email, phone }: QuoteLead) => {
    if (digitCount(phone) < 7 || digitCount(phone) > 15) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setSending(true);
    setError("");

    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid");
    const gclid = params.get("gclid");
    const fd = new FormData();
    if (fbclid) fd.append("fbclid", fbclid);
    if (gclid) fd.append("gclid", gclid);
    fd.append("url", window.location.href);
    fd.append("email", email.trim());
    fd.append("phone_number", phone.trim());
    fd.append("instructions", classDetails.trim());
    const metaEventId = appendMetaLeadFields(fd);

    if (logToLandingSheet) {
      void fetch("/api/tmc-lp-landing-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          instructions: classDetails.trim(),
          formType: "full-form",
          fbclid: fbclid ?? "",
          gclid: gclid ?? "",
          landingPage: window.location.pathname,
        }),
      }).catch(() => {});
    }

    try {
      await axiosInstance.post(`/order/quote`, fd);
      pushQuoteLeadEvent(metaEventId);
      router.push("/thank-you");
    } catch {
      setError("Failed to send request, try again later.");
      setSending(false);
    }
  };

  return { submit, sending, error };
}
