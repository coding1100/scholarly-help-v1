export type SemesterStatus = "draft" | "finalized" | "archived";

export interface Semester {
  id: string;
  userId: string;
  name: string;
  term: "Fall" | "Spring" | "Summer" | "Winter";
  year: number;
  startDate: string; // ISO format "YYYY-MM-DD"
  endDate: string; // ISO format "YYYY-MM-DD"
  creditTarget: number;
  status: SemesterStatus;
  selectedScheduleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSection {
  id: string;
  // Optional: the backend's CourseSectionDto rejects this field on create
  // (it's assigned server-side once the parent course document exists), so
  // it's only populated once a section comes back from a fetch.
  courseId?: string;
  sectionNumber: string; // e.g. "01", "A"
  instructor: string;
  days: ("M" | "T" | "W" | "Th" | "F" | "Sa" | "Su")[];
  startTime: string; // "09:00" (24h format)
  endTime: string; // "10:15" (24h format)
  location?: string;
}

export interface CourseCatalogItem {
  id: string;
  semesterId: string;
  code: string; // e.g. "CS 101"
  title: string; // e.g. "Introduction to Computer Science"
  credits: number;
  color: string; // Hex color tag
  isRequired: boolean;
  isElective: boolean;
  instructor?: string;
  description?: string;
  retakenFromSemesterId?: string;
  sections: CourseSection[];
  mutedNotifications?: boolean;
  attendanceTargetPercent?: number; // default 80
}

// Response shape from the backend's LLM syllabus extraction (POST
// tools/course-planner/extract and .../extract-file). Course entries here
// are catalog shapes without an id/semesterId yet — those are assigned once
// the caller adds them to the pool via CoursePlannerService.addCourse.
export interface ExtractedSyllabusCourse {
  code: string;
  title: string;
  credits?: number;
  instructor?: string;
  isRequired?: boolean;
  sections?: Omit<CourseSection, "id" | "courseId">[];
}

export interface ExtractedSyllabusCoursework {
  title: string;
  dueDate?: string;
  type?: string;
  priority?: string;
}

export interface ExtractedSyllabusResult {
  courses: ExtractedSyllabusCourse[];
  coursework: ExtractedSyllabusCoursework[];
}

export interface SchedulePreferences {
  rawPrompt?: string;
  maxCampusDays?: number;
  noMorningClasses?: boolean; // Before 10:00 AM
  noFridayClasses?: boolean;
  preferredInstructors?: string[];
  dislikedInstructors?: string[];
  preferredTimeWindows?: { start: string; end: string }[];
}

export interface ScheduleConflict {
  id: string;
  courseId1: string;
  sectionId1: string;
  courseId2: string;
  sectionId2: string;
  type: "time_overlap" | "credit_mismatch" | "preference_violation";
  description: string;
}

export interface ScheduleOption {
  id: string;
  name: string;
  sectionIds: string[]; // List of selected section IDs for each course
  score: number;
  compromises: string[];
  satisfiesPreferences: boolean;
  tradeOffs: string[];
  conflicts: ScheduleConflict[];
}

export type CourseworkType = "assignment" | "exam" | "quiz" | "project";
export type KanbanStatus = "backlog" | "todo" | "in_progress" | "done";
export type CompletionState = "pending" | "done" | "missed";
export type PriorityLevel = "low" | "medium" | "high";

export interface Coursework {
  id: string;
  semesterId: string;
  courseId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string "YYYY-MM-DDTHH:mm"
  type: CourseworkType;
  kanbanStatus: KanbanStatus;
  priority: PriorityLevel;
  completionState: CompletionState;
  rescheduledFromDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type PolicyPreset = "standard" | "strict" | "relaxed";
export type AttendanceStatus = "attended" | "missed" | "upcoming";

export interface AttendanceLog {
  id: string;
  semesterId: string;
  courseId: string;
  sectionId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  status: AttendanceStatus;
  isConfirmed: boolean;
  autoDerived: boolean;
}

export interface CourseAttendancePolicy {
  id: string;
  semesterId: string;
  courseId: string;
  policyPreset: PolicyPreset;
  maxMissedAllowed: number;
  targetPercentage: number; // e.g. 80
}

export type CalendarCategory = "class" | "coursework" | "personal";

export interface CalendarEvent {
  id: string;
  userId?: string;
  semesterId?: string;
  courseId?: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime?: string; // "09:00"
  endTime?: string; // "10:15"
  category: CalendarCategory;
  attendanceStatus?: AttendanceStatus;
  color?: string;
  description?: string;
  createdAt: string;
}

export type AlertStatus = "pending" | "applied" | "ignored";

export interface AdaptiveAlert {
  id: string;
  semesterId: string;
  title: string;
  description: string;
  sourceSyllabusItemId?: string;
  proposedChanges: {
    courseworkId: string;
    courseworkTitle: string;
    oldDueDate: string;
    newDueDate: string;
    reason: string;
  }[];
  status: AlertStatus;
  createdAt: string;
}

export type NotificationCategory = "attendance" | "deadline" | "adaptive" | "system";

export interface NotificationItem {
  id: string;
  userId: string;
  semesterId?: string;
  courseId?: string;
  category: NotificationCategory;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  userId?: string;
  mutedCourseIds: string[];
  reminderLeadTimeHours: number; // e.g. 1, 24, 48
}
