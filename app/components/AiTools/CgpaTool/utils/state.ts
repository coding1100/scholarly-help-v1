import { CalculatorState, Course, PreviousSemesterGpa, Semester } from "../types";
import { DEFAULT_GRADE_SCALE } from "./gradeScale";
import { createId } from "./id";

export function createEmptyCourse(): Course {
  return {
    id: createId("course"),
    name: "",
    gradeLetter: "",
    credits: "",
  };
}

export function createSemester(index: number, courseRows = 2): Semester {
  return {
    id: createId("sem"),
    title: `Semester ${index}`,
    courses: Array.from({ length: courseRows }, () => createEmptyCourse()),
  };
}

export function createPreviousSemesterRow(): PreviousSemesterGpa {
  return { id: createId("prev"), credits: "", gpa: "" };
}

export function createInitialState(): CalculatorState {
  return {
    gradeScale: DEFAULT_GRADE_SCALE,
    semesters: [createSemester(1)],
    previousSemesters: [createPreviousSemesterRow()],
    preferences: {
      includePreviousInCgpa: true,
      currentSemesterOnly: false,
    },
  };
}

type LegacyLoadedState =
  | (Partial<CalculatorState> & { previous?: { gpa?: unknown; credits?: unknown } })
  | Record<string, unknown>;

export function normalizeLoadedState(maybe: LegacyLoadedState, fallback: CalculatorState): CalculatorState {
  // Defensive normalization: keep shape stable as the tool evolves.
  const m = maybe as any;
  const gradeScale = m?.gradeScale?.letters?.length ? (m.gradeScale as CalculatorState["gradeScale"]) : fallback.gradeScale;
  const semesters = Array.isArray(m?.semesters) && m.semesters.length ? (m.semesters as any[]) : (fallback.semesters as any[]);

  const loadedPrevRows = Array.isArray(m?.previousSemesters) ? (m.previousSemesters as any[]) : null;
  const legacyPrev = m?.previous && typeof m.previous === "object" ? (m.previous as any) : null;

  const previousSemesters: PreviousSemesterGpa[] = loadedPrevRows
    ? loadedPrevRows.map((r: any) => ({
        id: r?.id || createId("prev"),
        credits: typeof r?.credits === "string" ? r.credits : "",
        gpa: typeof r?.gpa === "string" ? r.gpa : "",
      }))
    : legacyPrev
      ? [
          {
            id: createId("prev"),
            credits: typeof legacyPrev.credits === "string" ? legacyPrev.credits : "",
            gpa: typeof legacyPrev.gpa === "string" ? legacyPrev.gpa : "",
          },
        ]
      : fallback.previousSemesters;

  return {
    gradeScale,
    semesters: semesters.map((s: any, idx: number) => ({
      id: s?.id || createId("sem"),
      title: s?.title || `Semester ${idx + 1}`,
      courses: (Array.isArray(s?.courses) ? s.courses : []).map((c: any) => ({
        id: c?.id || createId("course"),
        name: typeof c?.name === "string" ? c.name : "",
        gradeLetter: typeof c?.gradeLetter === "string" ? c.gradeLetter : "",
        credits: typeof c?.credits === "string" ? c.credits : "",
      })),
    })) as Semester[],
    previousSemesters: previousSemesters.length ? previousSemesters : [createPreviousSemesterRow()],
    preferences: {
      includePreviousInCgpa:
        typeof m?.preferences?.includePreviousInCgpa === "boolean"
          ? (m.preferences.includePreviousInCgpa as boolean)
          : fallback.preferences.includePreviousInCgpa,
      currentSemesterOnly:
        typeof m?.preferences?.currentSemesterOnly === "boolean"
          ? (m.preferences.currentSemesterOnly as boolean)
          : fallback.preferences.currentSemesterOnly,
    },
  };
}

