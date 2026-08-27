import axios from "axios";
import {
  Semester,
  CourseCatalogItem,
  Coursework,
  AttendanceLog,
  CalendarEvent,
  AdaptiveAlert,
  NotificationItem,
  NotificationSettings,
  ScheduleOption,
  ExtractedSyllabusResult,
} from "./types";

const getBaseUrl = () => process.env.NEXT_PUBLIC_NGROX_URL || "http://localhost:5008/v1";

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Mongoose documents serialize their identifier as `_id`, but every client
// type in this module (Semester, CourseCatalogItem, CourseSection, ...)
// declares `id`. Recursively mirror `_id` onto `id` on every object/array in
// the response (including embedded subdocuments like course.sections[]) so
// the rest of the app can rely on `.id` everywhere, matching the types.
// Does not mutate/remove `_id` — only adds `id` alongside it.
const normalizeIds = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(normalizeIds);
  }
  if (value && typeof value === "object") {
    const out: any = {};
    for (const key of Object.keys(value)) {
      out[key] = normalizeIds(value[key]);
    }
    if (out._id !== undefined && out.id === undefined) {
      out.id = String(out._id);
    }
    return out;
  }
  return value;
};

// Every successful backend response is wrapped by NestJS's TransformInterceptor
// as { success, message, data } — unwrap to `.data.data` so callers get the
// actual payload, not the envelope, with `_id` normalized to `id` throughout.
const unwrap = <T>(res: { data: { data: unknown } }): T => normalizeIds(res.data.data) as T;

// Every call here throws on failure — callers (CoursePlannerService) are
// responsible for surfacing that to the UI. Swallowing errors into an empty
// array/default here would make a real backend outage indistinguishable
// from "no data yet", which previously masked failures as empty states.
export const CoursePlannerApi = {
  // --- Semesters ---
  async getSemesters(): Promise<Semester[]> {
    const res = await axios.get(`${getBaseUrl()}/tools/course-planner/semesters`, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async createSemester(dto: Partial<Semester>): Promise<Semester> {
    const res = await axios.post(`${getBaseUrl()}/tools/course-planner/semesters`, dto, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async updateSemester(id: string, dto: Partial<Semester>): Promise<Semester> {
    const res = await axios.put(`${getBaseUrl()}/tools/course-planner/semesters/${id}`, dto, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async deleteSemester(id: string): Promise<boolean> {
    await axios.delete(`${getBaseUrl()}/tools/course-planner/semesters/${id}`, {
      headers: getAuthHeaders(),
    });
    return true;
  },

  // --- Courses ---
  async getCourses(semesterId: string): Promise<CourseCatalogItem[]> {
    const res = await axios.get(`${getBaseUrl()}/tools/course-planner/courses`, {
      params: { semesterId },
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async addCourse(dto: any): Promise<CourseCatalogItem> {
    const res = await axios.post(`${getBaseUrl()}/tools/course-planner/courses`, dto, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async updateCourse(id: string, dto: any): Promise<CourseCatalogItem> {
    const res = await axios.put(`${getBaseUrl()}/tools/course-planner/courses/${id}`, dto, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async deleteCourse(id: string): Promise<boolean> {
    await axios.delete(`${getBaseUrl()}/tools/course-planner/courses/${id}`, {
      headers: getAuthHeaders(),
    });
    return true;
  },

  async importRetakes(targetSemesterId: string, sourceSemesterId: string): Promise<CourseCatalogItem[]> {
    const res = await axios.post(
      `${getBaseUrl()}/tools/course-planner/courses/retake-import`,
      { targetSemesterId, sourceSemesterId },
      { headers: getAuthHeaders() },
    );
    return unwrap(res);
  },

  // --- Syllabus Extraction (LLM-backed) ---
  async extractSyllabusText(text: string): Promise<ExtractedSyllabusResult> {
    const res = await axios.post(
      `${getBaseUrl()}/tools/course-planner/extract`,
      { text },
      { headers: getAuthHeaders() },
    );
    return unwrap(res);
  },

  async extractSyllabusFile(file: File): Promise<ExtractedSyllabusResult> {
    const formData = new FormData();
    formData.append("file", file);
    // Don't set Content-Type manually — the browser/axios must generate it
    // (including the multipart boundary) from the FormData instance itself.
    const res = await axios.post(
      `${getBaseUrl()}/tools/course-planner/extract-file`,
      formData,
      { headers: getAuthHeaders() },
    );
    return unwrap(res);
  },

  // --- Schedules ---
  async generateSchedules(dto: any): Promise<ScheduleOption[]> {
    const res = await axios.post(`${getBaseUrl()}/tools/course-planner/schedules/generate`, dto, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async finalizeSchedule(dto: any): Promise<Semester> {
    const res = await axios.post(`${getBaseUrl()}/tools/course-planner/schedules/finalize`, dto, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  // LLM-backed: interprets a free-text request against the real course
  // catalog and returns a server-validated section swap. Used both by the
  // chat panel and by "Auto Swap" conflict resolution (which synthesizes a
  // query from the conflict description).
  async chatEditSchedule(dto: {
    semesterId: string;
    currentSectionIds: string[];
    userQuery: string;
  }): Promise<{ success: boolean; explanation: string; updatedSectionIds: string[] }> {
    const res = await axios.post(`${getBaseUrl()}/tools/course-planner/schedules/chat`, dto, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  // --- Coursework ---
  async getCoursework(semesterId: string): Promise<Coursework[]> {
    const res = await axios.get(`${getBaseUrl()}/tools/course-planner/coursework`, {
      params: { semesterId },
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async createCoursework(dto: any): Promise<Coursework> {
    const res = await axios.post(`${getBaseUrl()}/tools/course-planner/coursework`, dto, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async updateCoursework(id: string, dto: any): Promise<Coursework> {
    const res = await axios.put(`${getBaseUrl()}/tools/course-planner/coursework/${id}`, dto, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async deleteCoursework(id: string): Promise<boolean> {
    await axios.delete(`${getBaseUrl()}/tools/course-planner/coursework/${id}`, {
      headers: getAuthHeaders(),
    });
    return true;
  },

  // --- Attendance ---
  async getAttendanceLogs(semesterId: string): Promise<AttendanceLog[]> {
    const res = await axios.get(`${getBaseUrl()}/tools/course-planner/attendance`, {
      params: { semesterId },
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async confirmAttendance(id: string, status: "attended" | "missed"): Promise<AttendanceLog> {
    const res = await axios.put(
      `${getBaseUrl()}/tools/course-planner/attendance/${id}`,
      { status },
      { headers: getAuthHeaders() },
    );
    return unwrap(res);
  },

  // --- Calendar ---
  async getCalendarEvents(semesterId?: string): Promise<CalendarEvent[]> {
    const res = await axios.get(`${getBaseUrl()}/tools/course-planner/calendar`, {
      params: { semesterId },
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async createCalendarEvent(dto: any): Promise<CalendarEvent> {
    const res = await axios.post(`${getBaseUrl()}/tools/course-planner/calendar`, dto, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async deleteCalendarEvent(id: string): Promise<boolean> {
    await axios.delete(`${getBaseUrl()}/tools/course-planner/calendar/${id}`, {
      headers: getAuthHeaders(),
    });
    return true;
  },

  // --- Adaptive Alerts ---
  async getAdaptiveAlerts(semesterId: string): Promise<AdaptiveAlert[]> {
    const res = await axios.get(`${getBaseUrl()}/tools/course-planner/adaptive`, {
      params: { semesterId },
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async applyAdaptiveAlert(id: string): Promise<boolean> {
    await axios.put(`${getBaseUrl()}/tools/course-planner/adaptive/${id}`, {}, {
      headers: getAuthHeaders(),
    });
    return true;
  },

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await axios.get(`${getBaseUrl()}/tools/course-planner/notifications`, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async markNotificationRead(id: string): Promise<boolean> {
    await axios.put(`${getBaseUrl()}/tools/course-planner/notifications/${id}/read`, {}, {
      headers: getAuthHeaders(),
    });
    return true;
  },

  async getNotificationSettings(): Promise<NotificationSettings> {
    const res = await axios.get(`${getBaseUrl()}/tools/course-planner/notifications/settings`, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },

  async updateNotificationSettings(dto: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const res = await axios.put(`${getBaseUrl()}/tools/course-planner/notifications/settings`, dto, {
      headers: getAuthHeaders(),
    });
    return unwrap(res);
  },
};
