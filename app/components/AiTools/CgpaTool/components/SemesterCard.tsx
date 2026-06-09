"use client";

import React, { useMemo } from "react";
import { Semester, GradeScale } from "../types";
import { computeSemesterTotals } from "../utils/calc";
import { formatGpaMaybe, roundTo } from "../utils/numbers";
import { createEmptyCourse } from "../utils/state";
import CourseRow from "./CourseRow";
import { Button, Card, CardBody, CardHeader, Input, Stat } from "./ui";

export default function SemesterCard(props: {
  semester: Semester;
  gradeScale: GradeScale;
  onChange: (next: Semester) => void;
  onRemoveSemester: () => void;
  onCalculateGpa?: () => void;
  /** Shown under the semester action row when opening the email popup is blocked (e.g. no grades entered). */
  calculateGpaBlockedMessage?: string | null;
  disableRemove?: boolean;
  showResults?: boolean;
}) {
  const {
    semester,
    gradeScale,
    onChange,
    onRemoveSemester,
    onCalculateGpa,
    calculateGpaBlockedMessage,
    disableRemove,
    showResults = true,
  } = props;

  const totals = useMemo(
    () => computeSemesterTotals(semester, gradeScale),
    [semester, gradeScale],
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="min-w-0 sm:w-auto w-full">
          <Input
            value={semester.title}
            onChange={(e) => onChange({ ...semester, title: e.target.value })}
            aria-label="Semester title"
          />
        </div>
        <Button
          type="button"
          variant="danger"
          onClick={onRemoveSemester}
          disabled={!!disableRemove}
          className="w-10 sm:px-0 lg:w-auto lg:px-3"
          aria-label="Remove semester"
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
      </CardHeader>

      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          {semester.courses.map((c) => (
            <CourseRow
              key={c.id}
              course={c}
              gradeScale={gradeScale}
              onChange={(nextCourse) =>
                onChange({
                  ...semester,
                  courses: semester.courses.map((x) =>
                    x.id === c.id ? nextCourse : x,
                  ),
                })
              }
              onRemove={() =>
                onChange({
                  ...semester,
                  courses: semester.courses.filter((x) => x.id !== c.id),
                })
              }
            />
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={() =>
                onChange({
                  ...semester,
                  courses: [...semester.courses, createEmptyCourse()],
                })
              }
              aria-label="Add course"
            >
              <span className="hidden md:inline">Add course</span>
              <span className="md:hidden" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Button>
            {onCalculateGpa ? (
              <Button
                type="button"
                variant="primary"
                onClick={onCalculateGpa}
                className=""
              >
                Calculate GPA
              </Button>
            ) : null}
          </div>
          {calculateGpaBlockedMessage ? (
            <p className="text-right text-sm text-[#f60606]" role="alert">
              {calculateGpaBlockedMessage}
            </p>
          ) : null}
        </div>

        {showResults ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat
              label="Total credits"
              value={roundTo(totals.totalCredits, 2).toFixed(2)}
            />
            <Stat
              label="Quality points"
              value={roundTo(totals.totalQualityPoints, 4).toFixed(4)}
              subValue="(unrounded internally)"
            />
            <Stat
              label="Semester GPA"
              value={formatGpaMaybe(totals.gpa)}
              subValue="GPA = quality points ÷ credits"
            />
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
