"use client";

import type { LeadFormContent } from "@/app/lib/blog/types";
import { Field, inputClass } from "./fields";

const FIELDS: { key: keyof LeadFormContent; label: string; hint?: string; long?: boolean }[] = [
  { key: "heading", label: "Heading" },
  { key: "highlight", label: "Highlighted words", hint: "Part of the heading shown in orange, e.g. “stats tutor”." },
  { key: "text", label: "Text", long: true },
  { key: "buttonLabel", label: "Button label" },
  { key: "note", label: "Small print", hint: "e.g. Free Inquiry · Reply in 15 Minutes. On phones the in-article form shows the sidebar’s small print." },
];

/**
 * Text fields of one blog lead form. In blog settings these are the defaults; in the post
 * editor they are optional overrides, with the defaults shown as placeholders.
 */
export default function LeadFormFields({
  title,
  value,
  placeholders,
  onChange,
}: {
  title: string;
  value: Partial<LeadFormContent>;
  placeholders?: Partial<LeadFormContent>;
  onChange: (value: Partial<LeadFormContent>) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-[#e2e8f4] p-3">
      <legend className="px-1 text-sm font-semibold text-[#283c88]">{title}</legend>
      {FIELDS.map(({ key, label, hint, long }) => (
        <Field key={key} label={label} hint={hint}>
          {long ? (
            <textarea
              className={`${inputClass} min-h-[60px]`}
              value={value[key] ?? ""}
              placeholder={placeholders?.[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            />
          ) : (
            <input
              className={inputClass}
              value={value[key] ?? ""}
              placeholder={placeholders?.[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            />
          )}
        </Field>
      ))}
    </fieldset>
  );
}
