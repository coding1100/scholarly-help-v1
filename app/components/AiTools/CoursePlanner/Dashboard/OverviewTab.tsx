import React from "react";
import { BookOpen, Calendar, Clock, AlertTriangle, CheckSquare, Bell, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { Semester, CourseCatalogItem, Coursework, AttendanceLog, AdaptiveAlert } from "@/app/lib/client/coursePlanner/types";
import { computeAttendanceStats } from "@/app/lib/client/coursePlanner/attendance";

interface Props {
  semester: Semester;
  courses: CourseCatalogItem[];
  coursework: Coursework[];
  attendanceLogs: AttendanceLog[];
  alerts: AdaptiveAlert[];
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<Props> = ({
  semester,
  courses,
  coursework,
  attendanceLogs,
  alerts,
  onNavigateTab,
}) => {
  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  const pendingTasks = coursework.filter((cw) => cw.kanbanStatus !== "done");
  const upcomingToday = attendanceLogs.filter((a) => a.date === new Date().toISOString().split("T")[0]);

  // Compute low attendance alert courses — shares the same rounding/logic as
  // AttendanceTab.tsx via computeAttendanceStats, so a course can't disagree
  // between "low" here and "good standing" there at the same percentage.
  const lowAttendanceCourses = courses.filter((c) => computeAttendanceStats(c, attendanceLogs).isLow);

  const pendingAlerts = alerts.filter((a) => a.status === "pending");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-500 to-gray-900 text-white rounded-xl p-6 shadow-md flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-white/10 text-primary-200 font-semibold text-xs rounded-full uppercase tracking-wider">
            {semester.name} ({semester.term} {semester.year})
          </span>
          <h2 className="text-xl font-semibold mt-2">Semester Command Center</h2>
          <p className="text-sm text-primary-200 mt-1">
            {courses.length} Active Courses enrolled · {totalCredits}/{semester.creditTarget} target credits
          </p>
        </div>

        <button
          onClick={() => onNavigateTab("schedule")}
          className="px-5 py-2.5 bg-white text-primary-500 font-semibold text-xs rounded-xl shadow-sm hover:bg-primary-100 transition-all flex items-center gap-2"
        >
          View Timetable <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-primary-400" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{courses.length}</span>
          <p className="text-[11px] text-gray-400 mt-1">{totalCredits} total credits</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Pending Tasks</span>
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{pendingTasks.length}</span>
          <p className="text-[11px] text-gray-400 mt-1">Kanban tasks remaining</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Classes Today</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{upcomingToday.length}</span>
          <p className="text-[11px] text-gray-400 mt-1">Scheduled sessions</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Low Attendance Alerts</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{lowAttendanceCourses.length}</span>
          <p className="text-[11px] text-gray-400 mt-1">Courses below target %</p>
        </div>
      </div>

      {/* Adaptive Workload Alert Banner if any pending */}
      {pendingAlerts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-900">{pendingAlerts[0].title}</h4>
              <p className="text-xs text-amber-700">{pendingAlerts[0].description}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("adaptive")}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
          >
            Review Adaptive Action
          </button>
        </div>
      )}

      {/* Content Grid: Left Active Courses, Right Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Courses Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Enrolled Course Catalog</h3>
            <button onClick={() => onNavigateTab("courses")} className="text-xs font-semibold text-primary-400 hover:underline">
              Manage Courses
            </button>
          </div>

          <div className="space-y-3">
            {courses.map((c) => (
              <div key={c.id} className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-8 rounded-full" style={{ backgroundColor: c.color }} />
                  <div>
                    <span className="font-bold text-gray-900 text-xs">{c.code}</span>
                    <span className="text-xs text-gray-500 font-medium ml-1.5">— {c.title}</span>
                    {c.instructor && <p className="text-[10px] text-gray-400">Prof: {c.instructor}</p>}
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 font-semibold text-xs rounded-lg">
                  {c.credits} cr
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Coursework Deadlines */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Upcoming Coursework Deadlines</h3>
            <button onClick={() => onNavigateTab("coursework")} className="text-xs font-semibold text-primary-400 hover:underline">
              Kanban Board
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">No pending tasks! All coursework is done.</div>
          ) : (
            <div className="space-y-2.5">
              {pendingTasks.slice(0, 4).map((cw) => {
                const course = courses.find((c) => c.id === cw.courseId);
                return (
                  <div key={cw.id} className="p-3 bg-gray-50/70 rounded-xl border border-gray-200/60 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 text-xs">{cw.title}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-primary-400">{course?.code || "COURSE"}</span>
                        <span className="text-[10px] text-gray-400">• Due {cw.dueDate.replace("T", " ")}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                        cw.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : cw.priority === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {cw.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
