import { CalculatorState, Course, Semester } from "../types";
import { getGradePoints } from "./gradeScale";
import { clampMin, parseNumberLoose } from "./numbers";

export type CourseComputed = {
  credits: number;
  gradePoints: number;
  qualityPoints: number;
};

export type SemesterTotals = {
  totalCredits: number;
  totalQualityPoints: number;
  gpa: number | null;
  validCourseCount: number;
};

export type CumulativeTotals = {
  includePrevious: boolean;
  previousCredits: number;
  previousGpa: number | null;
  previousQualityPoints: number;
  currentCredits: number;
  currentQualityPoints: number;
  finalCredits: number;
  finalQualityPoints: number;
  cgpa: number | null;
};

export function computeCourse(course: Course, gradeScale: CalculatorState["gradeScale"]): CourseComputed | null {
  const gradeLetter = (course.gradeLetter ?? "").trim();
  const gradePoints = gradeLetter ? getGradePoints(gradeScale, gradeLetter) : null;
  if (gradePoints === null) return null;

  const creditsRaw = parseNumberLoose(course.credits);
  if (creditsRaw === null) return null;
  const credits = clampMin(creditsRaw, 0);

  // Ignore non-positive credits for GPA (prevents divide-by-zero noise and matches typical calculators).
  if (credits <= 0 || credits > 100) return null;

  const qualityPoints = gradePoints * credits;
  return { credits, gradePoints, qualityPoints };
}

export function computeSemesterTotals(
  semester: Semester,
  gradeScale: CalculatorState["gradeScale"],
): SemesterTotals {
  let totalCredits = 0;
  let totalQualityPoints = 0;
  let validCourseCount = 0;

  for (const c of semester.courses) {
    const computed = computeCourse(c, gradeScale);
    if (!computed) continue;
    totalCredits += computed.credits;
    totalQualityPoints += computed.qualityPoints;
    validCourseCount += 1;
  }

  const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : null;
  return { totalCredits, totalQualityPoints, gpa, validCourseCount };
}

export function computeAllSemesterTotals(
  semesters: Semester[],
  gradeScale: CalculatorState["gradeScale"],
) {
  return semesters.map((s) => ({ semesterId: s.id, totals: computeSemesterTotals(s, gradeScale) }));
}

/** True if user entered at least one valid previous-semester row or one valid course row (grade + credits). */
export function hasAnyCalculableCgpaInput(state: CalculatorState): boolean {
  for (const r of state.previousSemesters || []) {
    const creditsRaw = parseNumberLoose(r.credits);
    const gpaRaw = parseNumberLoose(r.gpa);
    if (creditsRaw === null || gpaRaw === null) continue;
    const credits = clampMin(creditsRaw, 0);
    if (credits > 0) return true;
  }
  for (const s of state.semesters) {
    if (computeSemesterTotals(s, state.gradeScale).validCourseCount > 0) {
      return true;
    }
  }
  return false;
}

export function computeCumulativeTotals(state: CalculatorState): CumulativeTotals {
  const includePrevious = !!state.preferences.includePreviousInCgpa;
  let previousCredits = 0;
  let previousQualityPoints = 0;

  if (includePrevious) {
    for (const r of state.previousSemesters || []) {
      const creditsRaw = parseNumberLoose(r.credits);
      const gpaRaw = parseNumberLoose(r.gpa);
      if (creditsRaw === null || gpaRaw === null) continue;
      const credits = clampMin(creditsRaw, 0);
      const gpa = clampMin(gpaRaw, 0);
      const maximumGradePoint = Math.max(...Object.values(state.gradeScale.pointsByLetter));
      if (credits <= 0 || credits > 1000 || gpa > maximumGradePoint) continue;
      previousCredits += credits;
      previousQualityPoints += gpa * credits;
    }
  }

  const previousGpa = previousCredits > 0 ? previousQualityPoints / previousCredits : null;

  const semestersToInclude = state.preferences.currentSemesterOnly
    ? state.semesters.slice(-1)
    : state.semesters;

  let currentCredits = 0;
  let currentQualityPoints = 0;

  for (const s of semestersToInclude) {
    const totals = computeSemesterTotals(s, state.gradeScale);
    currentCredits += totals.totalCredits;
    currentQualityPoints += totals.totalQualityPoints;
  }

  const finalCredits = previousCredits + currentCredits;
  const finalQualityPoints = previousQualityPoints + currentQualityPoints;

  const cgpa = finalCredits > 0 ? finalQualityPoints / finalCredits : null;

  return {
    includePrevious,
    previousCredits,
    previousGpa,
    previousQualityPoints,
    currentCredits,
    currentQualityPoints,
    finalCredits,
    finalQualityPoints,
    cgpa,
  };
}

