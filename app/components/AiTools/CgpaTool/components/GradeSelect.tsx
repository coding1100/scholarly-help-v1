"use client";

import React from "react";
import { GradeScale } from "../types";
import { Select } from "./ui";

export default function GradeSelect(props: {
  value: string;
  onChange: (next: string) => void;
  gradeScale: GradeScale;
  ariaLabel?: string;
}) {
  const { value, onChange, gradeScale, ariaLabel } = props;
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel || "Grade"}
    >
      <option value="">Select</option>
      {gradeScale.letters.map((l) => (
        <option key={l} value={l}>
          {l}
        </option>
      ))}
    </Select>
  );
}
