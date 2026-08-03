"use client";

import React from "react";
import { Course, GradeScale } from "../types";
import GradeSelect from "./GradeSelect";
import { Button, Input } from "./ui";

export default function CourseRow(props: {
  course: Course;
  gradeScale: GradeScale;
  onChange: (next: Course) => void;
  onRemove: () => void;
  showCourseName?: boolean;
}) {
  const {
    course,
    gradeScale,
    onChange,
    onRemove,
    showCourseName = true,
  } = props;

  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      {showCourseName ? (
        <div className="col-span-6 md:col-span-4">
          <Input
            value={course.name}
            onChange={(e) => onChange({ ...course, name: e.target.value })}
            placeholder="Course name (optional)"
            aria-label="Course name"
          />
        </div>
      ) : null}

      <div className="col-span-6 md:col-span-3">
        <GradeSelect
          value={course.gradeLetter}
          onChange={(next) => onChange({ ...course, gradeLetter: next })}
          gradeScale={gradeScale}
          ariaLabel="Letter grade"
        />
      </div>

      <div className="col-span-10 md:col-span-3">
        <Input
          inputMode="decimal"
          type="number"
          min="0.01"
          max="100"
          step="0.01"
          value={course.credits}
          onChange={(e) => onChange({ ...course, credits: e.target.value })}
          placeholder="Credits"
          aria-label="Credit hours"
          aria-describedby={`credits-help-${course.id}`}
        />
        <span id={`credits-help-${course.id}`} className="sr-only">Credit hours must be between 0.01 and 100.</span>
      </div>

      <div className="col-span-2 flex justify-center">
        <Button
          type="button"
          variant="ghost"
          onClick={onRemove}
          className="w-full sm:w-10 sm:px-0 lg:w-auto lg:px-3 "
          aria-label="Remove course"
        >
          <span className="hidden lg:inline">Remove</span>
          <svg
            className="block lg:hidden"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
