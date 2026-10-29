import { CalculatorState, Course, PreviousSemesterGpa, Semester } from "../types";
import { DEFAULT_GRADE_SCALE } from "./gradeScale";
import { createId } from "./id";

export function createEmptyCourse(): Course {
  return {
    id: createId("course"),
    name: "",
    gradeLetter: "",
    credits: "",
  };
}

export function createSemester(index: number, courseRows = 2): Semester {
  return {
    id: createId("sem"),
    title: `Semester ${index}`,
    courses: Array.from({ length: courseRows }, () => createEmptyCourse()),
  };
}

export function createPreviousSemesterRow(): PreviousSemesterGpa {
  return { id: createId("prev"), credits: "", gpa: "" };
}

export function createInitialState(): CalculatorState {
  return {
    gradeScale: DEFAULT_GRADE_SCALE,
    semesters: [createSemester(1)],
    previousSemesters: [createPreviousSemesterRow()],
    preferences: {
      includePreviousInCgpa: true,
      currentSemesterOnly: false,
    },
  };
}
