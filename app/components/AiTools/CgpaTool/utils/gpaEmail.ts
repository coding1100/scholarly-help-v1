import { CalculatorState } from "../types";
import { computeAllSemesterTotals, computeCumulativeTotals } from "./calc";
import { clampMin, formatGpaMaybe, parseNumberLoose } from "./numbers";

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Weighted GPA from “previous semesters” rows only (ignores preferences). */
function computePreviousRowsOnlyGpa(state: CalculatorState): number | null {
  let credits = 0;
  let qualityPoints = 0;
  for (const r of state.previousSemesters || []) {
    const creditsRaw = parseNumberLoose(r.credits);
    const gpaRaw = parseNumberLoose(r.gpa);
    if (creditsRaw === null || gpaRaw === null) continue;
    const c = clampMin(creditsRaw, 0);
    const g = clampMin(gpaRaw, 0);
    if (c <= 0) continue;
    credits += c;
    qualityPoints += g * c;
  }
  return credits > 0 ? qualityPoints / credits : null;
}

/** Single display GPA for CRM sync (CGPA when available, else fallbacks). */
export function formatCgpaForEmailAndSync(state: CalculatorState): string {
  const totals = computeCumulativeTotals(state);
  if (totals.cgpa !== null) return formatGpaMaybe(totals.cgpa);
  const prevOnly = computePreviousRowsOnlyGpa(state);
  if (prevOnly !== null) return formatGpaMaybe(prevOnly);
  const semesterTotals = computeAllSemesterTotals(state.semesters, state.gradeScale);
  const tc = semesterTotals.reduce((s, x) => s + x.totals.totalCredits, 0);
  const tqp = semesterTotals.reduce((s, x) => s + x.totals.totalQualityPoints, 0);
  if (tc > 0) return formatGpaMaybe(tqp / tc);
  return "—";
}

