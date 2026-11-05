"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { BlogBlock, BlogBlockType, FeatureIcon } from "@/app/lib/blog/types";
import { Field, ImageField, inputClass } from "./fields";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-40 animate-pulse rounded-lg bg-[#eef0f8]" />,
});

const BLOCK_LABELS: Record<BlogBlockType, string> = {
  richText: "Text",
  image: "Image",
  featureGrid: "Feature cards",
  cta: "Call to action",
  linkCards: "Link cards",
  stats: "Stats strip",
  video: "YouTube video",
  faq: "FAQ",
};

const ICONS: FeatureIcon[] = ["star", "check", "clock", "book", "target", "shield", "lightbulb", "chart"];

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random());

export function emptyBlock(type: BlogBlockType): BlogBlock {
  const id = newId();
  switch (type) {
    case "richText": return { id, type, html: "" };
    case "image": return { id, type, url: "", alt: "", caption: "" };
    case "featureGrid": return { id, type, title: "", items: [{ icon: "star", title: "", text: "" }] };
    case "cta": return { id, type, heading: "", text: "", buttonLabel: "", buttonUrl: "" };
    case "linkCards": return { id, type, items: [{ imageUrl: "", title: "", url: "" }] };
    case "stats": return { id, type };
    case "video": return { id, type, url: "" };
    case "faq": return { id, type, title: "Frequently Asked Questions", items: [{ question: "", answer: "" }] };
  }
}

function BlockFields({ block, onChange }: { block: BlogBlock; onChange: (b: BlogBlock) => void }) {
  switch (block.type) {
    case "richText":
      return <RichTextEditor value={block.html} onChange={(html) => onChange({ ...block, html })} />;
    case "image":
      return (
        <div className="space-y-3">
          <ImageField label="Image" value={block.url} onChange={(url) => onChange({ ...block, url })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Alt text" hint="Describe the image for screen readers and Google.">
              <input className={inputClass} value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
            </Field>
            <Field label="Caption (optional)">
              <input className={inputClass} value={block.caption ?? ""} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
            </Field>
          </div>
        </div>
      );
    case "video":
      return (
        <Field label="YouTube URL">
          <input className={inputClass} value={block.url} placeholder="https://www.youtube.com/watch?v=…" onChange={(e) => onChange({ ...block, url: e.target.value })} />
        </Field>
      );
    case "cta":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Heading"><input className={inputClass} value={block.heading} onChange={(e) => onChange({ ...block, heading: e.target.value })} /></Field>
          <Field label="Text (optional)"><input className={inputClass} value={block.text ?? ""} onChange={(e) => onChange({ ...block, text: e.target.value })} /></Field>
          <div className="sm:col-span-2">
            <Field label="Checklist points (optional, one per line)">
              <textarea
                className={`${inputClass} min-h-[60px]`}
                value={(block.bullets ?? []).join("\n")}
                onChange={(e) => onChange({ ...block, bullets: e.target.value.split("\n") })}
              />
            </Field>
          </div>
          <Field label="Button label"><input className={inputClass} value={block.buttonLabel} onChange={(e) => onChange({ ...block, buttonLabel: e.target.value })} /></Field>
          <Field label="Button link" hint="A site path like /take-my-class/ or a full https:// URL.">
            <input className={inputClass} value={block.buttonUrl} onChange={(e) => onChange({ ...block, buttonUrl: e.target.value })} />
          </Field>
        </div>
      );
    case "stats":
      return (
        <p className="text-sm text-[#4b5563]">
          Shows the stats strip (e.g. “95% Success Rate”). Its numbers are edited once for all posts in{" "}
          <Link href="/admin/blog/settings" target="_blank" className="font-semibold text-[#283c88] underline">Blog Settings</Link> (opens in a new tab).
        </p>
      );
    case "linkCards":
      return (
        <div className="space-y-3">
          {block.items.map((item, i) => {
            const setItem = (patch: Partial<typeof item>) =>
              onChange({ ...block, items: block.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
            return (
              <div key={i} className="space-y-2 rounded-lg border border-[#e2e8f4] p-3">
                <ImageField label={`Card ${i + 1} image`} value={item.imageUrl} onChange={(imageUrl) => setItem({ imageUrl })} />
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input className={inputClass} placeholder="Title" value={item.title} onChange={(e) => setItem({ title: e.target.value })} />
                  <input className={inputClass} placeholder="Link, e.g. /homework/" value={item.url} onChange={(e) => setItem({ url: e.target.value })} />
                  <button type="button" className="text-sm text-[#da0e0e] hover:underline" onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}>Remove</button>
                </div>
              </div>
            );
          })}
          <button type="button" className="text-sm font-semibold text-[#283c88] hover:underline" onClick={() => onChange({ ...block, items: [...block.items, { imageUrl: "", title: "", url: "" }] })}>
            + Add card
          </button>
        </div>
      );
    case "featureGrid":
      return (
        <div className="space-y-3">
          <Field label="Section heading (optional, shown in the table of contents)">
            <input className={inputClass} value={block.title ?? ""} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          </Field>
          {block.items.map((item, i) => {
            const setItem = (patch: Partial<typeof item>) =>
              onChange({ ...block, items: block.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
            return (
              <div key={i} className="grid gap-2 rounded-lg border border-[#e2e8f4] p-3 sm:grid-cols-[120px_1fr_2fr_auto]">
                <select className={inputClass} value={item.icon} onChange={(e) => setItem({ icon: e.target.value as FeatureIcon })} aria-label="Icon">
                  {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                <input className={inputClass} placeholder="Card title" value={item.title} onChange={(e) => setItem({ title: e.target.value })} />
                <input className={inputClass} placeholder="Card text" value={item.text} onChange={(e) => setItem({ text: e.target.value })} />
                <button type="button" className="text-sm text-[#da0e0e] hover:underline" onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}>Remove</button>
              </div>
            );
          })}
          <button type="button" className="text-sm font-semibold text-[#283c88] hover:underline" onClick={() => onChange({ ...block, items: [...block.items, { icon: "star", title: "", text: "" }] })}>
            + Add card
          </button>
        </div>
      );
    case "faq":
      return (
        <div className="space-y-3">
          <Field label="Section heading">
            <input className={inputClass} value={block.title ?? ""} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          </Field>
          {block.items.map((item, i) => {
            const setItem = (patch: Partial<typeof item>) =>
              onChange({ ...block, items: block.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
            return (
              <div key={i} className="space-y-2 rounded-lg border border-[#e2e8f4] p-3">
                <div className="flex gap-2">
                  <input className={inputClass} placeholder="Question" value={item.question} onChange={(e) => setItem({ question: e.target.value })} />
                  <button type="button" className="shrink-0 text-sm text-[#da0e0e] hover:underline" onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}>Remove</button>
                </div>
                <textarea className={`${inputClass} min-h-[70px]`} placeholder="Answer" value={item.answer} onChange={(e) => setItem({ answer: e.target.value })} />
              </div>
            );
          })}
          <button type="button" className="text-sm font-semibold text-[#283c88] hover:underline" onClick={() => onChange({ ...block, items: [...block.items, { question: "", answer: "" }] })}>
            + Add question
          </button>
        </div>
      );
  }
}

export function AddBlockMenu({ onAdd }: { onAdd: (type: BlogBlockType) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-[#c5cce8] bg-[#f8f9fc] p-3">
      <span className="text-sm font-semibold text-[#283c88]">Add block:</span>
      {(Object.keys(BLOCK_LABELS) as BlogBlockType[]).map((type) => (
        <button key={type} type="button" onClick={() => onAdd(type)} className="rounded-md border border-[#c5cce8] bg-white px-2.5 py-1 text-sm text-[#283c88] hover:bg-[#eef0f8]">
          + {BLOCK_LABELS[type]}
        </button>
      ))}
    </div>
  );
}

export default function BlockEditor({ blocks, onChange }: { blocks: BlogBlock[]; onChange: (blocks: BlogBlock[]) => void }) {
  const update = (i: number, block: BlogBlock) => onChange(blocks.map((b, j) => (j === i ? block : b)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const insertAfter = (i: number, type: BlogBlockType) => {
    const next = [...blocks];
    next.splice(i + 1, 0, emptyBlock(type));
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {blocks.length === 0 && <p className="text-sm text-[#6b7280]">No content yet. Add a block to start writing.</p>}
      {blocks.map((block, i) => (
        <div key={block.id} className="rounded-xl border border-[#e2e8f4] bg-[#fcfcfe] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded bg-[#eef0f8] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#283c88]">
              {i + 1}. {BLOCK_LABELS[block.type]}
            </span>
            <div className="flex items-center gap-1 text-sm">
              <button type="button" className="rounded px-2 py-0.5 text-[#374151] hover:bg-[#eef0f8] disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move block up">↑</button>
              <button type="button" className="rounded px-2 py-0.5 text-[#374151] hover:bg-[#eef0f8] disabled:opacity-30" disabled={i === blocks.length - 1} onClick={() => move(i, 1)} aria-label="Move block down">↓</button>
              <select
                className="rounded border border-[#d6dbec] px-1 py-0.5 text-xs text-[#283c88]"
                value=""
                aria-label="Insert block below"
                onChange={(e) => e.target.value && insertAfter(i, e.target.value as BlogBlockType)}
              >
                <option value="">+ Insert below</option>
                {(Object.keys(BLOCK_LABELS) as BlogBlockType[]).map((t) => <option key={t} value={t}>{BLOCK_LABELS[t]}</option>)}
              </select>
              <button type="button" className="rounded px-2 py-0.5 text-[#da0e0e] hover:bg-[#fef2f2]" onClick={() => onChange(blocks.filter((_, j) => j !== i))} aria-label="Delete block">
                Delete
              </button>
            </div>
          </div>
          <BlockFields block={block} onChange={(b) => update(i, b)} />
        </div>
      ))}
      <AddBlockMenu onAdd={(type) => onChange([...blocks, emptyBlock(type)])} />
    </div>
  );
}
