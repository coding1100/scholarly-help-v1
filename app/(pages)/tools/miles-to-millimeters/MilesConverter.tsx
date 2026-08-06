"use client";

import { useMemo, useState } from "react";
import { formatAdaptiveNumber, strictFiniteNumber } from "@/app/lib/client/toolOptimization";

const MILLIMETERS_PER_MILE = 1_609_344;

export default function MilesConverter() {
  const [direction, setDirection] = useState<"mi-mm" | "mm-mi">("mi-mm");
  const [raw, setRaw] = useState("");
  const parsed = useMemo(() => strictFiniteNumber(raw), [raw]);
  const result = parsed === null ? null : direction === "mi-mm" ? parsed * MILLIMETERS_PER_MILE : parsed / MILLIMETERS_PER_MILE;
  const from = direction === "mi-mm" ? "Miles" : "Millimeters";
  const to = direction === "mi-mm" ? "Millimeters" : "Miles";
  return <main className="min-h-screen bg-slate-50 px-4 py-16">
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <h1 className="text-3xl font-bold text-slate-900">Miles and Millimeters Converter</h1>
      <p className="mt-2 text-slate-600">Strict, bidirectional distance conversion with scientific notation for extreme values.</p>
      <button type="button" onClick={() => { setDirection((value) => value === "mi-mm" ? "mm-mi" : "mi-mm"); setRaw(""); }} className="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold" aria-label={`Switch to ${to} to ${from}`}>Swap direction</button>
      <label className="mt-6 block text-sm font-semibold text-slate-800" htmlFor="distance-value">{from}</label>
      <input id="distance-value" value={raw} onChange={(event) => setRaw(event.target.value)} inputMode="decimal" placeholder="e.g. 1.25 or 2e3" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500" aria-invalid={raw.length > 0 && parsed === null} />
      {raw && parsed === null && <p className="mt-2 text-sm text-red-600" role="alert">Enter one complete finite number. Units and partial values are not accepted.</p>}
      <output className="mt-6 block rounded-xl bg-blue-50 p-5" aria-live="polite">
        <span className="block text-sm font-medium text-blue-700">{to}</span>
        <strong className="mt-1 block break-all text-2xl text-blue-950">{result === null ? "—" : formatAdaptiveNumber(result)}</strong>
      </output>
      <p className="mt-5 text-sm text-slate-500">1 mile = {MILLIMETERS_PER_MILE.toLocaleString()} millimeters exactly.</p>
    </section>
  </main>;
}
