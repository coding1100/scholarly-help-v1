"use client";

import { FormEvent, useState } from "react";

export default function NewsletterForm() {
  const [startedAt] = useState(() => Date.now());
  const [state, setState] = useState<{ status: "idle" | "sending" | "done" | "error"; message?: string }>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/blog/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), website: form.get("website"), startedAt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState({ status: "done", message: "Thanks! You're subscribed." });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Something went wrong." });
    }
  }

  return (
    <div className="blog-newsletter">
      <h3>Get the latest research tips and academic insights delivered</h3>
      <p>Join 25,000+ students worldwide</p>
      {state.status === "done" ? (
        <p className="blog-form-msg" role="status">{state.message}</p>
      ) : (
        <form onSubmit={onSubmit}>
          <label className="blog-hp" aria-hidden>
            Website <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <input className="blog-input" type="email" name="email" placeholder="Email" required aria-label="Email address" />
          <button className="blog-btn" type="submit" disabled={state.status === "sending"}>
            {state.status === "sending" ? "Sending…" : "Send"}
          </button>
          {state.status === "error" && <p className="blog-form-msg" role="alert">{state.message}</p>}
        </form>
      )}
    </div>
  );
}
