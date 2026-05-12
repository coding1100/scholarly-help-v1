import type { CalculatorState } from "../types";
import {
  computeAllSemesterTotals,
  computeCumulativeTotals,
} from "./calc";
import { formatGpaMaybe } from "./numbers";

export type CgpaGhlSnapshotSemesterTotal = {
  semesterId: string;
  title: string;
  totalCredits: number;
  totalQualityPoints: number;
  /** Display GPA per semester (uses "—" when not computable). */
  gpa: string;
  validCourseCount: number;
};

export type CgpaGhlSnapshot = {
  v: 1;
  submittedAt: string;
  gradeScale: CalculatorState["gradeScale"];
  semesters: CalculatorState["semesters"];
  previousSemesters: CalculatorState["previousSemesters"];
  preferences: CalculatorState["preferences"];
  computed: {
    semesterTotals: CgpaGhlSnapshotSemesterTotal[];
    cumulative: {
      includePrevious: boolean;
      previousCredits: number;
      previousGpa: string;
      currentCredits: number;
      currentQualityPoints: number;
      finalCredits: number;
      finalQualityPoints: number;
      cgpa: string;
    };
  };
};

export function buildCgpaGhlSnapshot(
  state: CalculatorState,
): CgpaGhlSnapshot {
  const semesterTotalsRaw = computeAllSemesterTotals(
    state.semesters,
    state.gradeScale,
  );
  const cumulative = computeCumulativeTotals(state);

  const semesterTotals: CgpaGhlSnapshotSemesterTotal[] =
    semesterTotalsRaw.map((row) => {
      const semester = state.semesters.find((s) => s.id === row.semesterId);
      return {
        semesterId: row.semesterId,
        title: semester?.title ?? "",
        totalCredits: row.totals.totalCredits,
        totalQualityPoints: row.totals.totalQualityPoints,
        gpa: formatGpaMaybe(row.totals.gpa),
        validCourseCount: row.totals.validCourseCount,
      };
    });

  return {
    v: 1,
    submittedAt: new Date().toISOString(),
    gradeScale: state.gradeScale,
    semesters: state.semesters,
    previousSemesters: state.previousSemesters,
    preferences: state.preferences,
    computed: {
      semesterTotals,
      cumulative: {
        includePrevious: cumulative.includePrevious,
        previousCredits: cumulative.previousCredits,
        previousGpa: formatGpaMaybe(cumulative.previousGpa),
        currentCredits: cumulative.currentCredits,
        currentQualityPoints: cumulative.currentQualityPoints,
        finalCredits: cumulative.finalCredits,
        finalQualityPoints: cumulative.finalQualityPoints,
        cgpa: formatGpaMaybe(cumulative.cgpa),
      },
    },
  };
}
