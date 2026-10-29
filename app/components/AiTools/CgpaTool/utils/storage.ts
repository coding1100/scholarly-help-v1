import { CalculatorState } from "../types";

const STORAGE_KEY = "scholarlyhelp.cgpaTool.v1";

export function loadCgpaToolState(): CalculatorState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as CalculatorState;
  } catch {
    return null;
  }
}

export function saveCgpaToolState(state: CalculatorState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / privacy errors
  }
}

export function clearCgpaToolState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

