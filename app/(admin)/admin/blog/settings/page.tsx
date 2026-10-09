"use client";

import { useEffect, useState } from "react";
import AdminButton from "@/app/components/Admin/AdminButton";
import { useAdminSuccess } from "@/app/components/Admin/AdminSuccessProvider";
import { useAdminPageTitleOptional } from "@/app/components/Admin/AdminPageTitleContext";
import { Field, ImageField, inputClass, Panel } from "@/app/components/Admin/Blog/fields";
import type { BlogSettings } from "@/app/lib/blog/types";

export default function BlogSettingsPage() {
  const pageTitle = useAdminPageTitleOptional();
  const { showSuccess } = useAdminSuccess();
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => pageTitle?.setPageTitle("Blog Settings"), [pageTitle]);
  useEffect(() => {
    fetch("/api/admin/blog/settings").then((r) => r.json()).then((d) => {
      setSettings(d.settings);
      setSubscriberCount(d.subscriberCount ?? 0);
    });
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSettings(data.settings);
      showSuccess("Settings saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <p className="text-sm text-[#6b7280]">Loading…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <Panel title="Comments">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={settings.commentsEnabled}
            onChange={(e) => setSettings({ ...settings, commentsEnabled: e.target.checked })}
          />
          <span>
            <span className="block text-sm font-semibold text-[#1a2456]">Enable comments on the blog</span>
            <span className="block text-xs text-[#6b7280]">
              When off, no post shows the comment form and new comments are rejected. Already approved comments stay visible.
              Each post can also turn comments off on its own. New comments always wait for approval.
            </span>
          </span>
        </label>
      </Panel>

      <Panel title="Blog home page (/blog/)">
        <Field label="Heading">
          <input className={inputClass} value={settings.indexTitle} onChange={(e) => setSettings({ ...settings, indexTitle: e.target.value })} />
        </Field>
        <Field label="Intro text" hint="One paragraph per line.">
          <textarea
            className={`${inputClass} min-h-[120px]`}
            value={settings.indexIntro.join("\n")}
            onChange={(e) => setSettings({ ...settings, indexIntro: e.target.value.split("\n") })}
          />
        </Field>
        <ImageField label="Header image" value={settings.indexImageUrl} onChange={(indexImageUrl) => setSettings({ ...settings, indexImageUrl })} />
      </Panel>

      <Panel title="Newsletter sign-ups">
        <p className="text-sm text-[#374151]">
          {subscriberCount} email{subscriberCount === 1 ? "" : "s"} collected from the blog sidebar form.
        </p>
        {/* File download from an API route, so a plain link (not next/link) is intended. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/admin/blog/subscribers" download className="inline-block rounded-lg border border-[#c5cce8] bg-[#eef0f8] px-4 py-2 text-sm font-medium text-[#283c88] hover:bg-[#dfe3f3]">
          Download CSV
        </a>
      </Panel>

      {error && <p role="alert" className="text-sm text-[#da0e0e]">{error}</p>}
      <AdminButton variant="primaryLg" loading={saving} onClick={save}>Save settings</AdminButton>
    </div>
  );
}
