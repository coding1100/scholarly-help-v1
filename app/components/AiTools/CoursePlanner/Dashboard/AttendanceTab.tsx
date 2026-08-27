import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Clock, ShieldAlert } from "lucide-react";
import { CourseCatalogItem, AttendanceLog } from "@/app/lib/client/coursePlanner/types";
import { computeAttendanceStats } from "@/app/lib/client/coursePlanner/attendance";

interface Props {
  courses: CourseCatalogItem[];
  attendanceLogs: AttendanceLog[];
  onConfirmAttendance: (id: string, status: "attended" | "missed") => void;
}

export const AttendanceTab: React.FC<Props> = ({
  courses,
  attendanceLogs,
  onConfirmAttendance,
}) => {
  // Unconfirmed or today logs queue
  const confirmationQueue = attendanceLogs.filter((a) => !a.isConfirmed).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Attendance Policy & Tracking</h2>
          <p className="text-sm text-gray-500">Auto-derived class attendance confirmation queue and course percentage tracking</p>
        </div>

        <div className="text-xs font-semibold text-gray-400">
          {attendanceLogs.filter((a) => a.isConfirmed).length} Sessions Recorded
        </div>
      </div>

      {/* Confirmation Queue Banner */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-400" /> Daily Attendance Confirmation Queue ({confirmationQueue.length})
        </h3>

        {confirmationQueue.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-xs">
            All class session attendance is up to date!
          </div>
        ) : (
          <div className="space-y-2.5">
            {confirmationQueue.map((log) => {
              const course = courses.find((c) => c.id === log.courseId);
              return (
                <div key={log.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-8 rounded-full" style={{ backgroundColor: course?.color || "#3b82f6" }} />
                    <div>
                      <span className="font-bold text-gray-900 text-xs">{course?.code || "COURSE"}</span>
                      <span className="text-xs text-gray-500 font-medium ml-2">— Class Session on {log.date}</span>
                      <p className="text-[11px] text-gray-400">Time: {log.startTime} - {log.endTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onConfirmAttendance(log.id, "attended")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all shadow-2xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Attended
                    </button>

                    <button
                      onClick={() => onConfirmAttendance(log.id, "missed")}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-all shadow-2xs flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Missed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Per-Course Attendance % Stats */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Per-Course Attendance Statistics</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const stats = computeAttendanceStats(course, attendanceLogs);
            const { attendedCount, missedCount, pct, targetPct, isLow, totalConfirmed } = stats;
            const hasHistory = totalConfirmed > 0;

            return (
              <div key={course.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
                    <span className="font-bold text-gray-900 text-sm">{course.code}</span>
                  </div>

                  {!hasHistory ? (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 font-semibold text-[10px] rounded-md">
                      No Sessions Yet
                    </span>
                  ) : isLow ? (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 font-semibold text-[10px] rounded-md flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Low Attendance
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-semibold text-[10px] rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Good Standing
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">Attendance Rate</span>
                    <span className={isLow ? "text-red-600 font-bold" : "text-gray-900"}>
                      {hasHistory ? `${pct}% (Target: ${targetPct}%)` : "No sessions recorded yet"}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${isLow ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${hasHistory ? pct : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
                  <span>Attended: {attendedCount}</span>
                  <span>Missed: {missedCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
