"use client";

import { useEffect, useState } from "react";
import AdminButton from "@/app/components/Admin/AdminButton";
import { useAdminSuccess } from "@/app/components/Admin/AdminSuccessProvider";
import { useAdminPageTitleOptional } from "@/app/components/Admin/AdminPageTitleContext";
import { Field, ImageField, inputClass, Panel } from "@/app/components/Admin/Blog/fields";
import type { BlogSettings, HelpBox, LeadFormContent } from "@/app/lib/blog/types";
import LeadFormFields from "@/app/components/Admin/Blog/LeadFormFields";

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

      <Panel title="Stats strip">
        <label className="flex items-center gap-2 text-sm font-semibold text-[#1a2456]">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={settings.statsStrip.enabled}
            onChange={(e) => setSettings({ ...settings, statsStrip: { ...settings.statsStrip, enabled: e.target.checked } })}
          />
          Show the stats strip
        </label>
        <p className="text-xs text-[#6b7280]">Appears wherever a post has a “Stats strip” block. Same numbers on every post.</p>
        {settings.statsStrip.items.map((item, i) => {
          const setItem = (patch: Partial<typeof item>) =>
            setSettings({
              ...settings,
              statsStrip: { ...settings.statsStrip, items: settings.statsStrip.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) },
            });
          return (
            <div key={i} className="grid grid-cols-[110px_1fr_auto] gap-2">
              <input className={inputClass} placeholder="95%" value={item.value} onChange={(e) => setItem({ value: e.target.value })} aria-label={`Stat ${i + 1} value`} />
              <input className={inputClass} placeholder="Success Rate" value={item.label} onChange={(e) => setItem({ label: e.target.value })} aria-label={`Stat ${i + 1} label`} />
              <button
                type="button"
                className="text-sm text-[#da0e0e] hover:underline"
                onClick={() => setSettings({ ...settings, statsStrip: { ...settings.statsStrip, items: settings.statsStrip.items.filter((_, j) => j !== i) } })}
              >
                Remove
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="text-sm font-semibold text-[#283c88] hover:underline"
          onClick={() => setSettings({ ...settings, statsStrip: { ...settings.statsStrip, items: [...settings.statsStrip.items, { value: "", label: "" }] } })}
        >
          + Add stat
        </button>
      </Panel>

      <Panel title="Help box (end of every article, shown only when the lead forms are off)">
        {(() => {
          const help = settings.helpBox;
          const setHelp = (patch: Partial<HelpBox>) => setSettings({ ...settings, helpBox: { ...help, ...patch } });
          return (
            <>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#1a2456]">
                <input type="checkbox" className="h-4 w-4" checked={help.enabled} onChange={(e) => setHelp({ enabled: e.target.checked })} />
                Show the help box on every post
              </label>
              <Field label="Heading">
                <input className={inputClass} value={help.heading} onChange={(e) => setHelp({ heading: e.target.value })} />
              </Field>
              <Field label="Text">
                <textarea className={`${inputClass} min-h-[80px]`} value={help.text} onChange={(e) => setHelp({ text: e.target.value })} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Main button label"><input className={inputClass} value={help.primaryLabel} onChange={(e) => setHelp({ primaryLabel: e.target.value })} /></Field>
                <Field label="Main button link"><input className={inputClass} value={help.primaryUrl} placeholder="/order/" onChange={(e) => setHelp({ primaryUrl: e.target.value })} /></Field>
                <Field label="Second button label"><input className={inputClass} value={help.secondaryLabel} onChange={(e) => setHelp({ secondaryLabel: e.target.value })} /></Field>
                <Field label="Second button link"><input className={inputClass} value={help.secondaryUrl} placeholder="/academic-research/" onChange={(e) => setHelp({ secondaryUrl: e.target.value })} /></Field>
              </div>
            </>
          );
        })()}
      </Panel>

      <Panel title="Lead forms (email + phone)">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={settings.leadForms.enabled}
            onChange={(e) => setSettings({ ...settings, leadForms: { ...settings.leadForms, enabled: e.target.checked } })}
          />
          <span>
            <span className="block text-sm font-semibold text-[#1a2456]">Show the lead forms on every post</span>
            <span className="block text-xs text-[#6b7280]">
              One form at the end of the article (in place of the help box) and a compact one at the bottom of the sidebar (in place of the newsletter box). Leads go to GHL, email and
              the Google Sheet. Each post can change this text or hide the forms.
            </span>
          </span>
        </label>
        <LeadFormFields
          title="In-article form"
          value={settings.leadForms.inline}
          onChange={(v) => setSettings({ ...settings, leadForms: { ...settings.leadForms, inline: v as LeadFormContent } })}
        />
        <LeadFormFields
          title="Sidebar form"
          value={settings.leadForms.sidebar}
          onChange={(v) => setSettings({ ...settings, leadForms: { ...settings.leadForms, sidebar: v as LeadFormContent } })}
        />
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
