import { AttendanceLog, CourseCatalogItem } from "./types";

export interface AttendanceStats {
  /** Confirmed session count. Zero means the course has no attendance
   *  history yet — distinct from a genuinely low/perfect percentage. */
  totalConfirmed: number;
  attendedCount: number;
  missedCount: number;
  /** null when totalConfirmed is 0 — there is no real percentage to show. */
  pct: number | null;
  targetPct: number;
  /** Only meaningful when pct is not null. */
  isLow: boolean;
}

// Single source of truth for "is this course's attendance below target" —
// previously computed independently (with different rounding) in both
// AttendanceTab and OverviewTab, which could disagree at the boundary.
export function computeAttendanceStats(course: CourseCatalogItem, attendanceLogs: AttendanceLog[]): AttendanceStats {
  const courseLogs = attendanceLogs.filter((a) => a.courseId === course.id && a.isConfirmed);
  const attendedCount = courseLogs.filter((a) => a.status === "attended").length;
  const missedCount = courseLogs.filter((a) => a.status === "missed").length;
  const targetPct = course.attendanceTargetPercent || 80;

  if (courseLogs.length === 0) {
    return { totalConfirmed: 0, attendedCount, missedCount, pct: null, targetPct, isLow: false };
  }

  const pct = Math.round((attendedCount / courseLogs.length) * 100);
  return { totalConfirmed: courseLogs.length, attendedCount, missedCount, pct, targetPct, isLow: pct < targetPct };
}
