import { CourseCatalogItem, CourseSection, Semester } from "./types";

// Single source of truth for "which class sessions fall on this date" —
// previously computed inline in ScheduleTab only, while CalendarTab (which
// advertises "Classes, coursework deadlines, and personal schedule events in
// one view" and has its own "class" filter pill) never derived this at all
// and silently never showed a single class session.
export const DAY_LETTER_BY_INDEX: Record<number, string> = {
  0: "Su",
  1: "M",
  2: "T",
  3: "W",
  4: "Th",
  5: "F",
  6: "Sa",
};

/** Parses "YYYY-MM-DD" as a local date (not UTC) so weekday derivation
 * matches the calendar day the user actually sees, regardless of timezone. */
function parseLocalDate(isoDate: string): Date | null {
  const match = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

export function weekdayLetterForDate(isoDate: string): string | null {
  const date = parseLocalDate(isoDate);
  if (!date) return null;
  return DAY_LETTER_BY_INDEX[date.getDay()] ?? null;
}

/** True when `isoDate` falls within the semester's [startDate, endDate]
 * range (inclusive) — recurring classes shouldn't appear during breaks,
 * before the term starts, or after finals just because the weekday matches. */
export function isWithinSemesterRange(isoDate: string, semester: Pick<Semester, "startDate" | "endDate">): boolean {
  return isoDate >= semester.startDate && isoDate <= semester.endDate;
}

export interface ClassSessionOccurrence {
  course: CourseCatalogItem;
  section: CourseSection;
}

/** Every course section meeting on `isoDate`, bounded to the semester's date
 * range. Returns [] outside the semester's start/end dates or off-pattern
 * weekdays, so callers don't need to re-derive that bounding logic. */
export function getClassSessionsOnDate(
  isoDate: string,
  courses: CourseCatalogItem[],
  semester: Pick<Semester, "startDate" | "endDate">,
): ClassSessionOccurrence[] {
  if (!isWithinSemesterRange(isoDate, semester)) return [];
  const dayLetter = weekdayLetterForDate(isoDate);
  if (!dayLetter) return [];

  const sessions: ClassSessionOccurrence[] = [];
  for (const course of courses) {
    for (const section of course.sections) {
      if (section.days.includes(dayLetter as CourseSection["days"][number])) {
        sessions.push({ course, section });
      }
    }
  }
  return sessions;
}

/** Parses "HH:MM" (optionally with an AM/PM suffix) to an hour integer —
 * enough precision for grid row placement, not exact minute display. */
export function startHour(time: string): number | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  if (Number.isNaN(hour)) return null;
  if (/pm/i.test(time) && hour < 12) hour += 12;
  if (/am/i.test(time) && hour === 12) hour = 0;
  return hour;
}
