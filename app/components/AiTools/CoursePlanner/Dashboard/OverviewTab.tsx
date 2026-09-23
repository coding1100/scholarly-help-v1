import React from "react";
import { FiBookOpen, FiCheckSquare, FiClock, FiShield, FiArrowRight, FiZap } from "react-icons/fi";
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
      {/* Section Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-500">
            {semester.name} ({semester.term} {semester.year})
          </span>
          <h2 className="text-lg font-semibold text-gray-800 mt-0.5">Semester Overview</h2>
          <p className="text-xs text-gray-500 mt-1">
            {courses.length} active courses enrolled, {totalCredits}/{semester.creditTarget} target credits
          </p>
        </div>

        <button
          onClick={() => onNavigateTab("schedule")}
          className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
        >
          View Timetable <FiArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Enrolled Courses</span>
            <FiBookOpen className="w-4 h-4 text-primary-400" />
          </div>
          <span className="text-2xl font-semibold text-gray-800">{courses.length}</span>
          <p className="text-xs text-gray-400 mt-1">{totalCredits} total credits</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Pending Tasks</span>
            <FiCheckSquare className="w-4 h-4 text-primary-400" />
          </div>
          <span className="text-2xl font-semibold text-gray-800">{pendingTasks.length}</span>
          <p className="text-xs text-gray-400 mt-1">Kanban tasks remaining</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Classes Today</span>
            <FiClock className="w-4 h-4 text-primary-400" />
          </div>
          <span className="text-2xl font-semibold text-gray-800">{upcomingToday.length}</span>
          <p className="text-xs text-gray-400 mt-1">Scheduled sessions</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Low Attendance Alerts</span>
            <FiShield className="w-4 h-4 text-primary-400" />
          </div>
          <span className="text-2xl font-semibold text-gray-800">{lowAttendanceCourses.length}</span>
          <p className="text-xs text-gray-400 mt-1">Courses below target %</p>
        </div>
      </div>

      {/* Adaptive Workload Alert Banner if any pending */}
      {pendingAlerts.length > 0 && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-400 flex items-center justify-center">
              <FiZap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-800">
                {pendingAlerts[0].title}
                {pendingAlerts.length > 1 && (
                  <span className="ml-1.5 font-normal text-gray-500">+{pendingAlerts.length - 1} more</span>
                )}
              </h4>
              <p className="text-xs text-gray-500">{pendingAlerts[0].description}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("adaptive")}
            className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Review Adaptive Action{pendingAlerts.length > 1 ? "s" : ""}
          </button>
        </div>
      )}

      {/* Content Grid: Left Active Courses, Right Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Courses Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Enrolled Course Catalog</h3>
            <button onClick={() => onNavigateTab("courses")} className="text-xs font-semibold text-primary-400 hover:underline">
              Manage Courses
            </button>
          </div>

          <div className="space-y-2.5">
            {courses.map((c) => (
              <div key={c.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-8 rounded-full" style={{ backgroundColor: c.color }} />
                  <div>
                    <span className="font-semibold text-gray-800 text-xs">{c.code}</span>
                    <span className="text-xs text-gray-500 ml-1.5">{c.title}</span>
                    {c.instructor && <p className="text-xs text-gray-400">Prof. {c.instructor}</p>}
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 font-semibold text-xs rounded-full">
                  {c.credits} cr
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Coursework Deadlines */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Upcoming Coursework Deadlines</h3>
            <button onClick={() => onNavigateTab("coursework")} className="text-xs font-semibold text-primary-400 hover:underline">
              Kanban Board
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">No pending tasks. All coursework is done.</div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.slice(0, 4).map((cw) => {
                const course = courses.find((c) => c.id === cw.courseId);
                return (
                  <div key={cw.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-800 text-xs">{cw.title}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-primary-400">{course?.code || "COURSE"}</span>
                        <span className="text-xs text-gray-400">Due {cw.dueDate.replace("T", " ")}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ring-1 ${
                        cw.priority === "high"
                          ? "bg-red-50 text-red-600 ring-red-200"
                          : cw.priority === "medium"
                          ? "bg-secondary-200/40 text-secondary-500 ring-secondary-200"
                          : "bg-gray-100 text-gray-600 ring-gray-200"
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
