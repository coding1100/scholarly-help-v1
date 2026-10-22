"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axiosInstance from "@/app/axios";

const inputClass =
  "block h-[54px] w-full rounded-xl border border-[#D4D4DF] bg-white px-4 text-[17px] text-[#111111] outline-none transition placeholder:text-[#757575] focus:border-[#D45410] focus:ring-2 focus:ring-[#D45410]/20 md:h-[60px]";

const labelClass =
  "mb-1.5 block text-[13px] font-semibold leading-5 text-[#111111]";

/**
 * Email + mobile lead form for the free-tools take-my-class variants. Sends
 * the same quote lead as the HeroForm2 full form, then routes to /thank-you.
 */
export default function FreeToolsLeadForm() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid") ?? "";
    const gclid = params.get("gclid") ?? "";
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    const fd = new FormData();
    if (fbclid) fd.append("fbclid", fbclid);
    if (gclid) fd.append("gclid", gclid);
    fd.append("url", window.location.href);
    fd.append("email", trimmedEmail);
    fd.append("phone_number", trimmedPhone);

    void fetch("/api/tmc-lp-landing-sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: trimmedEmail,
        phone: trimmedPhone,
        formType: "free-tools",
        fbclid,
        gclid,
        landingPage: pathname || "",
      }),
    }).catch(() => {});

    try {
      await axiosInstance.post(`/order/quote`, fd);
      router.push("/thank-you");
    } catch {
      alert("Failed to send request, try again later");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[620px] text-left">
      <div className="grid gap-[10px] md:grid-cols-2 md:gap-[14px]">
        <div>
          <label htmlFor="free-tools-email" className={labelClass}>
            Email
          </label>
          <input
            id="free-tools-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="free-tools-phone" className={labelClass}>
            Mobile number
          </label>
          <input
            id="free-tools-phone"
            type="tel"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            required
            pattern="[0-9\(\)+\-.\s]{10,}"
            title="Enter a valid mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className={inputClass}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-[15px] flex h-[61px] w-full items-center justify-center rounded-[10px] bg-[#D45410] text-[18px] font-extrabold text-white transition hover:bg-[#BC4A0E] disabled:cursor-wait disabled:opacity-80 md:mt-[13px] md:h-[66px] md:text-[20.5px]"
      >
        {loading ? "Sending..." : "Get My Free Access"}
      </button>
      <p className="mt-[10px] text-center text-xs leading-5 text-[#707080] md:mt-3">
        Free, no card needed.
      </p>
    </form>
  );
}
