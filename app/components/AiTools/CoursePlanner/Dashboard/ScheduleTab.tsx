import React, { useState } from "react";
import { Printer, Calendar, Clock, BookOpen, AlertCircle } from "lucide-react";
import { CourseCatalogItem, Coursework, AttendanceLog, Semester } from "@/app/lib/client/coursePlanner/types";

interface Props {
  semester: Semester;
  courses: CourseCatalogItem[];
  coursework: Coursework[];
  attendanceLogs: AttendanceLog[];
}

// Parses "HH:MM" (optionally with an AM/PM suffix) to an hour integer for
// row placement — matches the backend engine's own time handling closely
// enough for display purposes (this only needs the hour, not the minute).
const startHour = (time: string): number | null => {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  if (Number.isNaN(hour)) return null;
  if (/pm/i.test(time) && hour < 12) hour += 12;
  if (/am/i.test(time) && hour === 12) hour = 0;
  return hour;
};

// getDay() index -> the schedule's day-letter tokens, so a coursework due
// date can be matched against a section's `days` array correctly (the
// prior version matched by substring against the raw ISO string, which
// spuriously matched "T"/"F" appearing anywhere inside a timestamp).
const DAY_LETTER_BY_INDEX: Record<number, string> = { 0: "Su", 1: "M", 2: "T", 3: "W", 4: "Th", 5: "F", 6: "Sa" };

export const ScheduleTab: React.FC<Props> = ({
  semester,
  courses,
  coursework,
}) => {
  const days: ("M" | "T" | "W" | "Th" | "F")[] = ["M", "T", "W", "Th", "F"];
  const dayNames: Record<string, string> = { M: "Monday", T: "Tuesday", W: "Wednesday", Th: "Thursday", F: "Friday" };

  // Only future/pending coursework is worth badging on a recurring weekly
  // grid — a due date is a single day, but the grid repeats every week, so
  // this shows "something for this course is due soon, on this weekday"
  // rather than pinning to one specific calendar date.
  const pendingByCourseAndDay = new Map<string, Set<string>>();
  coursework
    .filter((cw) => cw.completionState === "pending")
    .forEach((cw) => {
      const parsed = new Date(cw.dueDate);
      if (Number.isNaN(parsed.getTime())) return;
      const dayLetter = DAY_LETTER_BY_INDEX[parsed.getDay()];
      const key = `${cw.courseId}_${dayLetter}`;
      if (!pendingByCourseAndDay.has(key)) pendingByCourseAndDay.set(key, new Set());
      pendingByCourseAndDay.get(key)!.add(cw.title);
    });

  // The grid's hour range is derived from the actual schedule instead of a
  // fixed 08:00-17:00 window — a section starting at 18:00 previously had
  // no row to render in at all and silently vanished from the timetable.
  const allStartHours = courses
    .flatMap((c) => c.sections.map((sec) => startHour(sec.startTime)))
    .filter((h): h is number => h !== null);
  const earliestHour = Math.min(8, ...allStartHours);
  const latestHour = Math.max(17, ...allStartHours);
  const timeSlots = Array.from(
    { length: latestHour - earliestHour + 1 },
    (_, i) => `${String(earliestHour + i).padStart(2, "0")}:00`
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Weekly Class Timetable</h2>
          <p className="text-sm text-gray-500">Accepted schedule timetable with course colors and due-date badges</p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-all flex items-center gap-2"
        >
          <Printer className="w-3.5 h-3.5" /> Print / Export Timetable
        </button>
      </div>

      {/* Interactive Timetable Grid */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Days Header */}
          <div className="grid grid-cols-6 border-b border-gray-200 pb-3 mb-3 text-center">
            <div className="text-xs font-semibold text-gray-400 uppercase">Time</div>
            {days.map((d) => (
              <div key={d} className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                {dayNames[d]}
              </div>
            ))}
          </div>

          {/* Time Rows */}
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <div key={slot} className="grid grid-cols-6 items-stretch min-h-[70px] border-b border-gray-100 pb-2">
                <div className="text-xs font-semibold text-gray-400 pt-2 text-center">{slot}</div>

                {days.map((day) => {
                  // Find sections matching this day & start hour
                  const slotHour = parseInt(slot.slice(0, 2), 10);
                  const activeSessions: Array<{ course: CourseCatalogItem; section: any }> = [];
                  courses.forEach((c) => {
                    c.sections.forEach((sec) => {
                      if (sec.days.includes(day) && startHour(sec.startTime) === slotHour) {
                        activeSessions.push({ course: c, section: sec });
                      }
                    });
                  });

                  return (
                    <div key={day} className="p-1">
                      {activeSessions.map(({ course, section }: { course: CourseCatalogItem; section: any }) => {
                        const dueTitles = pendingByCourseAndDay.get(`${course.id}_${day}`);
                        return (
                        <div
                          key={section.id}
                          className="p-2.5 rounded-xl border text-white shadow-xs transition-transform hover:scale-[1.02]"
                          style={{ backgroundColor: course.color }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs">{course.code}</span>
                            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-bold">
                              Sec {section.sectionNumber}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-90 truncate mt-0.5">{course.title}</p>
                          {dueTitles && dueTitles.size > 0 && (
                            <p
                              className="text-[9px] font-bold bg-black/25 rounded px-1 py-0.5 mt-1 truncate"
                              title={Array.from(dueTitles).join(", ")}
                            >
                              📌 Due: {Array.from(dueTitles)[0]}{dueTitles.size > 1 ? ` +${dueTitles.size - 1}` : ""}
                            </p>
                          )}
                          <p className="text-[10px] font-semibold mt-1 opacity-90">
                            {section.startTime} - {section.endTime}
                          </p>
                          {section.location && (
                            <p className="text-[9px] opacity-75 truncate">📍 {section.location}</p>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
