"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  CheckSquare,
  Bell,
  Plus,
  RefreshCw,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Trash2,
} from "lucide-react";
import {
  Semester,
  CourseCatalogItem,
  Coursework,
  AttendanceLog,
  CalendarEvent,
  AdaptiveAlert,
  NotificationItem,
  NotificationSettings,
} from "@/app/lib/client/coursePlanner/types";
import { CoursePlannerService } from "@/app/lib/client/coursePlanner/service";
import { SetupWizard } from "./Wizard/SetupWizard";
import { OverviewTab } from "./Dashboard/OverviewTab";
import { ScheduleTab } from "./Dashboard/ScheduleTab";
import { CoursesTab } from "./Dashboard/CoursesTab";
import { CourseworkKanbanTab } from "./Dashboard/CourseworkKanbanTab";
import { CalendarTab } from "./Dashboard/CalendarTab";
import { AttendanceTab } from "./Dashboard/AttendanceTab";
import { AdaptivePlanningTab } from "./Dashboard/AdaptivePlanningTab";
import { NotificationDrawer } from "./Dashboard/NotificationDrawer";

export const CoursePlannerTool: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Domain data
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [coursework, setCoursework] = useState<Coursework[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [alerts, setAlerts] = useState<AdaptiveAlert[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    userId: "user_client",
    mutedCourseIds: [],
    reminderLeadTimeHours: 24,
  });

  // UI Drawer State
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Load/error state — the backend is now the sole source of truth (see
  // CoursePlannerService), so a failed request must surface as a real error
  // here rather than silently rendering an empty dashboard.
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load initial data
  const refreshAllData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const semList = await CoursePlannerService.getSemesters();
      setSemesters(semList);

      const activeId = CoursePlannerService.getActiveSemesterId() || semList[0]?.id || null;
      const currentSem = semList.find((s: Semester) => s.id === activeId) || null;
      setActiveSemester(currentSem);

      const notifSettings = await CoursePlannerService.getNotificationSettings();
      setSettings(notifSettings);

      if (currentSem) {
        const [crs, cw, att, cal, alt, notif] = await Promise.all([
          CoursePlannerService.getCourses(currentSem.id),
          CoursePlannerService.getCoursework(currentSem.id),
          CoursePlannerService.getAttendanceLogs(currentSem.id),
          CoursePlannerService.getCalendarEvents(currentSem.id),
          CoursePlannerService.getAdaptiveAlerts(currentSem.id),
          CoursePlannerService.getNotifications(),
        ]);

        setCourses(crs);
        setCoursework(cw);
        setAttendanceLogs(att);
        setCalendarEvents(cal);
        setAlerts(alt);
        setNotifications(notif);
      }
    } catch (err: any) {
      setLoadError(
        err?.response?.status
          ? `Couldn't reach the Course Planner service (${err.response.status}). Please try again.`
          : "Couldn't reach the Course Planner service. Check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleSelectSemester = (id: string) => {
    CoursePlannerService.setActiveSemesterId(id);
    refreshAllData();
  };

  const handleCreateNewSemesterClick = () => {
    setActiveSemester(null);
    CoursePlannerService.setActiveSemesterId("");
  };

  // Deleting a semester cascades to its courses, coursework, attendance
  // logs, and calendar events on the backend — always confirm first.
  const [deleteConfirmSemester, setDeleteConfirmSemester] = useState<Semester | null>(null);

  const handleWizardComplete = () => {
    refreshAllData();
    setActiveTab("overview");
  };

  // Transient banner for a failed mutation (as opposed to loadError, which
  // blocks the whole dashboard). Every handler below calling the backend
  // routes through runMutation so a failure is visible instead of being an
  // unhandled promise rejection the user never sees.
  const [mutationError, setMutationError] = useState<string | null>(null);
  const runMutation = async (fn: () => Promise<void>) => {
    try {
      setMutationError(null);
      await fn();
    } catch (err: any) {
      setMutationError(
        err?.response?.status
          ? `That action failed (${err.response.status}). Please try again.`
          : "That action failed. Please try again."
      );
    }
  };

  const handleDeleteSemester = (semester: Semester) =>
    runMutation(async () => {
      await CoursePlannerService.deleteSemester(semester.id);
      setDeleteConfirmSemester(null);
      await refreshAllData();
    });

  // Course handlers
  const handleUpdateCourse = (id: string, updates: Partial<CourseCatalogItem>) =>
    runMutation(async () => {
      await CoursePlannerService.updateCourse(id, updates);
      if (activeSemester) {
        setCourses(await CoursePlannerService.getCourses(activeSemester.id));
      }
    });

  const handleDeleteCourse = (id: string) =>
    runMutation(async () => {
      await CoursePlannerService.deleteCourse(id);
      if (activeSemester) {
        setCourses(await CoursePlannerService.getCourses(activeSemester.id));
        setCoursework(await CoursePlannerService.getCoursework(activeSemester.id));
        setAttendanceLogs(await CoursePlannerService.getAttendanceLogs(activeSemester.id));
      }
    });

  // Coursework handlers
  const handleCreateCoursework = (item: Omit<Coursework, "id" | "createdAt" | "updatedAt">) =>
    runMutation(async () => {
      await CoursePlannerService.createCoursework(item);
      if (activeSemester) {
        setCoursework(await CoursePlannerService.getCoursework(activeSemester.id));
        setAlerts(await CoursePlannerService.getAdaptiveAlerts(activeSemester.id));
      }
    });

  const handleUpdateCoursework = (id: string, updates: Partial<Coursework>) =>
    runMutation(async () => {
      await CoursePlannerService.updateCoursework(id, updates);
      if (activeSemester) {
        setCoursework(await CoursePlannerService.getCoursework(activeSemester.id));
      }
    });

  const handleDeleteCoursework = (id: string) =>
    runMutation(async () => {
      await CoursePlannerService.deleteCoursework(id);
      if (activeSemester) {
        setCoursework(await CoursePlannerService.getCoursework(activeSemester.id));
      }
    });

  // Attendance handlers
  const handleConfirmAttendance = (id: string, status: "attended" | "missed") =>
    runMutation(async () => {
      await CoursePlannerService.confirmAttendance(id, status);
      if (activeSemester) {
        setAttendanceLogs(await CoursePlannerService.getAttendanceLogs(activeSemester.id));
      }
    });

  // Calendar event handlers
  const handleAddPersonalEvent = (event: Omit<CalendarEvent, "id" | "userId" | "createdAt">) =>
    runMutation(async () => {
      await CoursePlannerService.addCalendarEvent(event);
      if (activeSemester) {
        setCalendarEvents(await CoursePlannerService.getCalendarEvents(activeSemester.id));
      }
    });

  const handleDeletePersonalEvent = (id: string) =>
    runMutation(async () => {
      await CoursePlannerService.deleteCalendarEvent(id);
      if (activeSemester) {
        setCalendarEvents(await CoursePlannerService.getCalendarEvents(activeSemester.id));
      }
    });

  // Adaptive alert handlers
  const handleApplyAlert = (id: string) =>
    runMutation(async () => {
      await CoursePlannerService.applyAdaptiveAlert(id);
      if (activeSemester) {
        setAlerts(await CoursePlannerService.getAdaptiveAlerts(activeSemester.id));
        setCoursework(await CoursePlannerService.getCoursework(activeSemester.id));
      }
    });

  // Notification handlers
  const handleMarkNotificationRead = (id: string) =>
    runMutation(async () => {
      await CoursePlannerService.markNotificationRead(id);
      setNotifications(await CoursePlannerService.getNotifications());
    });

  const handleUpdateSettings = (updates: Partial<NotificationSettings>) =>
    runMutation(async () => {
      setSettings(await CoursePlannerService.updateNotificationSettings(updates));
    });

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const dashboardTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "schedule", label: "Timetable", icon: Clock },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "coursework", label: "Coursework Kanban", icon: CheckSquare },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "attendance", label: "Attendance", icon: ShieldCheck },
    { id: "adaptive", label: "Adaptive Planning", icon: Zap },
  ];

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 text-sm font-semibold">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading your Course Planner…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center bg-white rounded-xl border border-red-200 p-8 shadow-sm">
          <p className="text-sm font-semibold text-red-700 mb-2">Something went wrong</p>
          <p className="text-xs text-gray-500 mb-5">{loadError}</p>
          <button
            onClick={refreshAllData}
            className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white font-semibold text-xs rounded-xl transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative mx-auto max-w-7xl px-3 py-4 sm:px-4 md:px-8 md:py-6 space-y-6">
      {mutationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{mutationError}</span>
          <button onClick={() => setMutationError(null)} className="text-red-400 hover:text-red-600 font-bold px-2">
            ✕
          </button>
        </div>
      )}
      {/* Top Application Header */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 tracking-tight flex items-center gap-2">
              AI Course Planner
              <span className="px-2.5 py-0.5 bg-primary-100 text-primary-500 text-[10px] font-semibold rounded-full border border-primary-200 uppercase">
                Pro
              </span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">Smart timetable scheduling, attendance tracking & workload rebalancing</p>
          </div>
        </div>

        {/* Semester Selector & Header Actions */}
        <div className="flex items-center gap-3">
          {semesters.length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                value={activeSemester?.id || ""}
                onChange={(e) => handleSelectSemester(e.target.value)}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-white shadow-2xs focus:ring-2 focus:ring-primary-400/20"
              >
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status.toUpperCase()})
                  </option>
                ))}
              </select>
              {activeSemester && (
                <button
                  onClick={() => setDeleteConfirmSemester(activeSemester)}
                  className="p-2 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl text-gray-500 hover:text-red-600 transition-all"
                  title={`Delete ${activeSemester.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleCreateNewSemesterClick}
            className="px-3.5 py-2 bg-primary-100 hover:bg-primary-200 text-primary-500 font-semibold text-xs rounded-xl border border-primary-200 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Semester
          </button>

          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 transition-all"
            title="Notifications Queue"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-400 text-white font-semibold text-[9px] rounded-full flex items-center justify-center border-2 border-white">
                {unreadNotifCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main View Switcher: Setup Wizard vs Finalized Dashboard */}
      {!activeSemester || activeSemester.status === "draft" ? (
        <SetupWizard
          activeSemester={activeSemester}
          priorSemesters={semesters.filter((s) => s.status === "finalized" && s.id !== activeSemester?.id)}
          onComplete={handleWizardComplete}
        />
      ) : (
        <div className="space-y-6">
          {/* Dashboard Tab Navigation Bar */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-2 shadow-sm overflow-x-auto flex gap-1.5">
            {dashboardTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? "bg-primary-400 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          {activeTab === "overview" && (
            <OverviewTab
              semester={activeSemester}
              courses={courses}
              coursework={coursework}
              attendanceLogs={attendanceLogs}
              alerts={alerts}
              onNavigateTab={(t) => setActiveTab(t)}
            />
          )}
          {activeTab === "schedule" && (
            <ScheduleTab
              semester={activeSemester}
              courses={courses}
              coursework={coursework}
              attendanceLogs={attendanceLogs}
            />
          )}
          {activeTab === "courses" && (
            <CoursesTab
              courses={courses}
              onUpdateCourse={handleUpdateCourse}
              onDeleteCourse={handleDeleteCourse}
            />
          )}
          {activeTab === "coursework" && (
            <CourseworkKanbanTab
              semesterId={activeSemester.id}
              courses={courses}
              coursework={coursework}
              onCreateCoursework={handleCreateCoursework}
              onUpdateCoursework={handleUpdateCoursework}
              onDeleteCoursework={handleDeleteCoursework}
            />
          )}
          {activeTab === "calendar" && (
            <CalendarTab
              courses={courses}
              coursework={coursework}
              calendarEvents={calendarEvents}
              onAddPersonalEvent={handleAddPersonalEvent}
              onDeletePersonalEvent={handleDeletePersonalEvent}
            />
          )}
          {activeTab === "attendance" && (
            <AttendanceTab
              courses={courses}
              attendanceLogs={attendanceLogs}
              onConfirmAttendance={handleConfirmAttendance}
            />
          )}
          {activeTab === "adaptive" && (
            <AdaptivePlanningTab
              alerts={alerts}
              onApplyAlert={handleApplyAlert}
            />
          )}
        </div>
      )}

      {/* Centralized Notification Slide-Over Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        courses={courses}
        settings={settings}
        onMarkRead={handleMarkNotificationRead}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Delete Semester Confirmation Modal */}
      {deleteConfirmSemester && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Delete Semester?</h3>
            <p className="text-xs text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{deleteConfirmSemester.name}</span>?
            </p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              This will permanently delete all its courses, coursework, attendance logs, and calendar events. This
              cannot be undone.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmSemester(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSemester(deleteConfirmSemester)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
