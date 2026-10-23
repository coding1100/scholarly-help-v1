"use client";

import { FormEvent, useState } from "react";
import axiosInstance from "@/app/axios";
import type { LeadFormContent, LeadFormPosition } from "@/app/lib/blog/types";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}

/** Heading with the `highlight` words in orange (first match, case-insensitive). */
function Heading({ heading, highlight }: { heading: string; highlight: string }) {
  const at = highlight ? heading.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
  if (at < 0) return <>{heading}</>;
  return (
    <>
      {heading.slice(0, at)}
      <span className="blog-lead-highlight">{heading.slice(at, at + highlight.length)}</span>
      {heading.slice(at + highlight.length)}
    </>
  );
}

const digitCount = (value: string) => value.replace(/\D/g, "").length;

/**
 * Email + phone lead form shown in blog posts. Leads go to the backend
 * (/order/blog-lead/), which forwards them to GHL, email and the Google Sheet.
 */
export default function LeadForm({
  position,
  content,
  postSlug,
  postTitle,
  disabled = false,
  mobileNote,
}: {
  position: LeadFormPosition;
  content: LeadFormContent;
  postSlug: string;
  postTitle: string;
  /** Admin preview: shown but not submittable. */
  disabled?: boolean;
  /** Shorter small print shown instead of `content.note` on phones. */
  mobileNote?: string;
}) {
  const [startedAt] = useState(() => Date.now());
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    if (digitCount(phone) < 7 || digitCount(phone) > 15) {
      setError("Please enter a valid phone number.");
      return;
    }
    const website = String(new FormData(event.currentTarget).get("website") || "");
    setStatus("sending");
    setError("");
    try {
      await axiosInstance.post("/order/blog-lead/", {
        email: email.trim(),
        phone: phone.trim(),
        postSlug,
        postTitle,
        form: position,
        pageUrl: window.location.href.split("#")[0],
        website,
        startedAt,
      });
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "blog_lead_submit", form_position: position, post_slug: postSlug, page_path: window.location.pathname });
      setStatus("done");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      setError(typeof message === "string" ? message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  const idPrefix = `blog-lead-${position}`;
  return (
    <section className={`blog-lead blog-lead-${position}`} aria-labelledby={`${idPrefix}-title`}>
      {/* Not a heading tag: the page outline stays limited to the article content. */}
      <div id={`${idPrefix}-title`} className="blog-lead-title">
        <Heading heading={content.heading} highlight={content.highlight} />
      </div>
      {status === "done" ? (
        <p className="blog-lead-thanks" role="status">
          Thanks! We&apos;ve got your details and a tutor will reach out shortly.
        </p>
      ) : (
        <>
          {content.text && <p className="blog-lead-text">{content.text}</p>}
          <form className="blog-lead-form" onSubmit={onSubmit} noValidate={false}>
            <label className="blog-hp" aria-hidden>
              Website <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <input
              className="blog-lead-input"
              type="email"
              name="email"
              placeholder="Email *"
              aria-label="Email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="blog-lead-input"
              type="tel"
              name="phone"
              placeholder="Phone # *"
              aria-label="Phone number"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button className="blog-lead-button" type="submit" disabled={status === "sending" || disabled}>
              {status === "sending" ? "Sending…" : content.buttonLabel}
            </button>
          </form>
          {error && <p className="blog-lead-error" role="alert">{error}</p>}
          {disabled && <p className="blog-lead-note">Preview: the form is disabled here.</p>}
          {content.note && (
            <p className="blog-lead-note">
              {mobileNote ? (
                <>
                  <span className="blog-lead-note-desktop">{content.note}</span>
                  <span className="blog-lead-note-mobile">{mobileNote}</span>
                </>
              ) : (
                content.note
              )}
            </p>
          )}
        </>
      )}
    </section>
  );
}
