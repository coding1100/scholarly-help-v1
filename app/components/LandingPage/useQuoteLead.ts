"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/axios";

export type QuoteLead = {
  classDetails: string;
  email: string;
  phone: string;
};

const digitCount = (value: string) => value.replace(/\D/g, "").length;

/**
 * Sends a quote lead the same way the hero form does (/order/quote with the ad
 * click ids and page URL), then routes to /thank-you.
 */
export function useQuoteLead() {
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

    try {
      await axiosInstance.post(`/order/quote`, fd);
      router.push("/thank-you");
    } catch {
      setError("Failed to send request, try again later.");
      setSending(false);
    }
  };

  return { submit, sending, error };
}
