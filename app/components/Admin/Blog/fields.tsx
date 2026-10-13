"use client";

import { useState, type ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-[#d6dbec] bg-white px-3 py-2 text-sm text-[#1f2937] focus:border-[#283c88] focus:outline-none focus:ring-2 focus:ring-[#283c88]/20";

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-[#283c88]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[#6b7280]">{hint}</span>}
    </label>
  );
}

export function Panel({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-xl border border-[#e2e8f4] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-[#1a2456]">{title}</h2>
        {actions}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Uploads an image to Cloudinary through the admin API and returns its URL. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/blog/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-[#283c88]">{label}</span>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-24 w-40 shrink-0 rounded-lg border border-[#e2e8f4] object-cover" />
        ) : (
          <div className="flex h-24 w-40 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#c5cce8] text-xs text-[#6b7280]">
            No image
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input className={inputClass} value={value} placeholder="https://… or upload" onChange={(e) => onChange(e.target.value)} />
          <div className="flex items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-[#c5cce8] bg-[#eef0f8] px-3 py-1.5 text-sm font-medium text-[#283c88] hover:bg-[#dfe3f3]">
              {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {value && (
              <button type="button" className="text-sm text-[#da0e0e] hover:underline" onClick={() => onChange("")}>
                Remove
              </button>
            )}
          </div>
          {error && <p className="text-sm text-[#da0e0e]">{error}</p>}
        </div>
      </div>
    </div>
  );
}
