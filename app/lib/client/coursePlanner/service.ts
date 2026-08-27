import {
  Semester,
  CourseCatalogItem,
  Coursework,
  AttendanceLog,
  CalendarEvent,
  AdaptiveAlert,
  NotificationItem,
  NotificationSettings,
  SchedulePreferences,
  ScheduleOption,
  PolicyPreset,
  ExtractedSyllabusResult,
} from "./types";
import { CoursePlannerApi } from "./api";

// The NestJS backend is the source of truth for all Course Planner data.
// localStorage here is used ONLY for the "which semester is currently
// selected" UI preference — never as a fallback store for semesters,
// courses, coursework, schedules, or anything else that must round-trip
// through the backend. All read/write methods below call the backend
// directly and let failures propagate to the caller (CoursePlannerTool.tsx
// renders an error state) rather than silently falling back to stale or
// fabricated local data.
const ACTIVE_SEMESTER_KEY = "cp_active_semester_id";

export class CoursePlannerService {
  static getActiveSemesterId(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(ACTIVE_SEMESTER_KEY);
    } catch {
      return null;
    }
  }

  static setActiveSemesterId(id: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ACTIVE_SEMESTER_KEY, id);
    } catch {
      // Non-fatal: worst case the user has to re-select a semester.
    }
  }

  // --- Semester Operations ---
  static async getSemesters(): Promise<Semester[]> {
    return CoursePlannerApi.getSemesters();
  }

  static async createSemester(
    data: Omit<Semester, "id" | "userId" | "createdAt" | "updatedAt" | "status" | "selectedScheduleId">
  ): Promise<Semester> {
    const created = await CoursePlannerApi.createSemester(data);
    this.setActiveSemesterId(created.id);
    return created;
  }

  static async updateSemester(id: string, updates: Partial<Semester>): Promise<Semester> {
    return CoursePlannerApi.updateSemester(id, updates);
  }

  static async deleteSemester(id: string): Promise<void> {
    await CoursePlannerApi.deleteSemester(id);
    // The backend cascades this delete to the semester's courses, coursework,
    // attendance logs, and calendar events — if the deleted semester was the
    // active one, clear that pointer so a stale id isn't reselected on the
    // next load.
    if (this.getActiveSemesterId() === id) {
      this.setActiveSemesterId("");
    }
  }

  // --- Course Pool & Sections ---
  static async getCourses(semesterId: string): Promise<CourseCatalogItem[]> {
    return CoursePlannerApi.getCourses(semesterId);
  }

  static async addCourse(course: Omit<CourseCatalogItem, "id">): Promise<CourseCatalogItem> {
    return CoursePlannerApi.addCourse(course);
  }

  static async updateCourse(id: string, updates: Partial<CourseCatalogItem>): Promise<CourseCatalogItem> {
    return CoursePlannerApi.updateCourse(id, updates);
  }

  static async deleteCourse(id: string): Promise<void> {
    await CoursePlannerApi.deleteCourse(id);
  }

  static async importRetakeCourses(targetSemesterId: string, sourceSemesterId: string): Promise<CourseCatalogItem[]> {
    return CoursePlannerApi.importRetakes(targetSemesterId, sourceSemesterId);
  }

  // --- Syllabus Extraction ---
  static async extractSyllabusText(text: string): Promise<ExtractedSyllabusResult> {
    return CoursePlannerApi.extractSyllabusText(text);
  }

  static async extractSyllabusFile(file: File): Promise<ExtractedSyllabusResult> {
    return CoursePlannerApi.extractSyllabusFile(file);
  }

  // --- Scheduler ---
  // Schedule generation is server-side logic (day/time overlap detection,
  // section scoring, conflict resolution) — there is no local fallback here
  // by design. If the backend call fails, the caller sees the error and the
  // wizard should show a real error state, not a silently-computed
  // client-side schedule the user never asked to trust.
  static async generateSchedules(
    semesterId: string,
    preferences: SchedulePreferences
  ): Promise<ScheduleOption[]> {
    return CoursePlannerApi.generateSchedules({ semesterId, ...preferences });
  }

  static async finalizeSchedule(
    semesterId: string,
    scheduleOption: ScheduleOption,
    policyPreset: PolicyPreset = "standard",
    targetOverrides: Record<string, number> = {}
  ): Promise<Semester> {
    return CoursePlannerApi.finalizeSchedule({
      semesterId,
      selectedScheduleId: scheduleOption.id,
      selectedSectionIds: scheduleOption.sectionIds,
      policyPreset,
      targetOverrides,
    });
  }

  // LLM-backed schedule edit: sends the user's free-text request (or a
  // synthesized one for "Auto Swap") to the backend, which resolves it
  // against the real catalog and returns a validated section swap.
  static async chatEditSchedule(
    semesterId: string,
    currentSectionIds: string[],
    userQuery: string
  ): Promise<{ success: boolean; explanation: string; updatedSectionIds: string[] }> {
    return CoursePlannerApi.chatEditSchedule({ semesterId, currentSectionIds, userQuery });
  }

  // --- Coursework ---
  static async getCoursework(semesterId: string): Promise<Coursework[]> {
    return CoursePlannerApi.getCoursework(semesterId);
  }

  static async createCoursework(item: Omit<Coursework, "id" | "createdAt" | "updatedAt">): Promise<Coursework> {
    return CoursePlannerApi.createCoursework(item);
  }

  static async updateCoursework(id: string, updates: Partial<Coursework>): Promise<Coursework> {
    return CoursePlannerApi.updateCoursework(id, updates);
  }

  static async deleteCoursework(id: string): Promise<void> {
    await CoursePlannerApi.deleteCoursework(id);
  }

  // --- Attendance ---
  static async getAttendanceLogs(semesterId: string): Promise<AttendanceLog[]> {
    return CoursePlannerApi.getAttendanceLogs(semesterId);
  }

  static async confirmAttendance(logId: string, status: "attended" | "missed"): Promise<AttendanceLog> {
    return CoursePlannerApi.confirmAttendance(logId, status);
  }

  // --- Calendar ---
  static async getCalendarEvents(semesterId?: string): Promise<CalendarEvent[]> {
    return CoursePlannerApi.getCalendarEvents(semesterId);
  }

  static async createCalendarEvent(event: Omit<CalendarEvent, "id" | "createdAt">): Promise<CalendarEvent> {
    return CoursePlannerApi.createCalendarEvent(event);
  }

  static async addCalendarEvent(event: Omit<CalendarEvent, "id" | "createdAt">): Promise<CalendarEvent> {
    return this.createCalendarEvent(event);
  }

  static async deleteCalendarEvent(id: string): Promise<void> {
    await CoursePlannerApi.deleteCalendarEvent(id);
  }

  // --- Adaptive Alerts ---
  static async getAdaptiveAlerts(semesterId: string): Promise<AdaptiveAlert[]> {
    return CoursePlannerApi.getAdaptiveAlerts(semesterId);
  }

  static async applyAdaptiveAlert(alertId: string): Promise<boolean> {
    return CoursePlannerApi.applyAdaptiveAlert(alertId);
  }

  // --- Notifications ---
  static async getNotifications(): Promise<NotificationItem[]> {
    return CoursePlannerApi.getNotifications();
  }

  static async markNotificationRead(id: string): Promise<void> {
    await CoursePlannerApi.markNotificationRead(id);
  }

  static async getNotificationSettings(): Promise<NotificationSettings> {
    return CoursePlannerApi.getNotificationSettings();
  }

  static async updateNotificationSettings(updates: Partial<NotificationSettings>): Promise<NotificationSettings> {
    return CoursePlannerApi.updateNotificationSettings(updates);
  }
}
