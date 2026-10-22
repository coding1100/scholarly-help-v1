"use client";

import { FormEvent, useState } from "react";

type PublicComment = { _id: string; name: string; body: string; createdAt: string };

export default function CommentSection({
  postId,
  comments,
  open,
}: {
  postId: string;
  comments: PublicComment[];
  open: boolean;
}) {
  const [startedAt] = useState(() => Date.now());
  const [state, setState] = useState<{ status: "idle" | "sending" | "done" | "error"; message?: string }>({ status: "idle" });

  if (!open && !comments.length) return null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          name: form.get("name"),
          email: form.get("email"),
          body: form.get("body"),
          website: form.get("website"),
          startedAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      formEl.reset();
      setState({ status: "done", message: "Thanks! Your comment will appear after it's approved." });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Something went wrong." });
    }
  }

  return (
    <section className="blog-comments" aria-labelledby="blog-comments-title">
      <h2 id="blog-comments-title">{comments.length ? `Comments (${comments.length})` : "Leave a Comment"}</h2>
      {comments.map((c) => (
        <div key={c._id} className="blog-comment">
          <div className="blog-comment-head">
            <span className="blog-comment-avatar" aria-hidden>{c.name.charAt(0).toUpperCase()}</span>
            <strong>{c.name}</strong>
            <time dateTime={c.createdAt}>
              {new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </div>
          <p>{c.body}</p>
        </div>
      ))}
      {open ? (
        <form className="blog-comment-form" onSubmit={onSubmit}>
          {comments.length > 0 && <h3 className="blog-full blog-side-title" style={{ margin: "8px 0 0" }}>Leave a Comment</h3>}
          <label className="blog-hp" aria-hidden>
            Website <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <input className="blog-input" name="name" placeholder="Your name" required maxLength={80} aria-label="Your name" />
          <input className="blog-input" type="email" name="email" placeholder="Your email (not published)" required aria-label="Your email" />
          <textarea className="blog-input" name="body" placeholder="Write your comment…" required maxLength={3000} aria-label="Comment" />
          <div className="blog-full" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <button className="blog-btn" type="submit" disabled={state.status === "sending"}>
              {state.status === "sending" ? "Posting…" : "Post Comment"}
            </button>
            <span className="blog-comment-note">Comments are reviewed before they appear.</span>
          </div>
          {state.message && (
            <p className={`blog-full blog-form-msg`} role={state.status === "error" ? "alert" : "status"} style={{ color: state.status === "error" ? "#b91c1c" : "#15803d" }}>
              {state.message}
            </p>
          )}
        </form>
      ) : (
        <p className="blog-comment-note" style={{ marginTop: 12 }}>Comments are closed.</p>
      )}
    </section>
  );
}
