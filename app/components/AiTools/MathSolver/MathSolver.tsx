"use client";

import React, { FC, useState } from "react";
import dynamic from "next/dynamic";
import { FaRegCopy } from "react-icons/fa";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

const StemSolver = dynamic(() => import("./StemSolver"), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-sm text-gray-500">Loading STEM solver…</div>,
});

interface MathSolverProps {
  setFlag: (value: boolean) => void;
}

/*
// ============================================================================
// TRIANGLE SOLVER FUNCTIONALITY (COMMENTED OUT COMPLETELY AS REQUESTED)
// ============================================================================

interface SideResult {
  decimal: number;
  radical: string | null;
}

interface SolverResponse {
  status: string;
  input: {
    a?: number | null;
    b?: number | null;
    c?: number | null;
  };
  result: {
    a: SideResult | null;
    b: SideResult | null;
    c: SideResult | null;
  };
  steps: string[];
  formula: string;
}
*/

const MathSolver: FC<MathSolverProps> = ({ setFlag }) => {
  /*
  // Triangle Solver state
  const [solverMode, setSolverMode] = useState<"triangle" | "stem">("stem");
  const [sideA, setSideA] = useState<string>("");
  const [sideB, setSideB] = useState<string>("");
  const [sideC, setSideC] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SolverResponse | null>(null);
  const [error, setError] = useState<string>("");

  const handleClear = () => {
    setSideA("");
    setSideB("");
    setSideC("");
    setResult(null);
    setError("");
  };

  const handleSolve = async () => {
    const sidesProvided = [sideA.trim(), sideB.trim(), sideC.trim()].filter(
      (side) => side !== "",
    ).length;

    if (sidesProvided !== 2) {
      setError("Please provide exactly two sides to solve the triangle.");
      toast.error("Please provide exactly two sides.");
      return;
    }

    const payload: { a?: number; b?: number; c?: number } = {};

    if (sideA.trim()) {
      const aValue = Number(sideA.trim());
      if (isNaN(aValue) || aValue <= 0) {
        setError("Side 'a' must be a positive number.");
        toast.error("Side 'a' must be a positive number.");
        return;
      }
      payload.a = aValue;
    }
    if (sideB.trim()) {
      const bValue = Number(sideB.trim());
      if (isNaN(bValue) || bValue <= 0) {
        setError("Side 'b' must be a positive number.");
        toast.error("Side 'b' must be a positive number.");
        return;
      }
      payload.b = bValue;
    }
    if (sideC.trim()) {
      const cValue = Number(sideC.trim());
      if (isNaN(cValue) || cValue <= 0) {
        setError("Side 'c' must be a positive number.");
        toast.error("Side 'c' must be a positive number.");
        return;
      }
      payload.c = cValue;
    }

    trackToolGenerate({ toolName: "Math Solver (Local)" });
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const { a, b, c } = payload;
      let solved: { a: number; b: number; c: number };
      let missing: "a" | "b" | "c";
      if (a === undefined) {
        if (b === undefined || c === undefined || c <= b) throw new Error("Hypotenuse c must be greater than side b.");
        solved = { a: Math.sqrt(c * c - b * b), b, c }; missing = "a";
      } else if (b === undefined) {
        if (c === undefined || c <= a) throw new Error("Hypotenuse c must be greater than side a.");
        solved = { a, b: Math.sqrt(c * c - a * a), c }; missing = "b";
      } else {
        solved = { a, b, c: Math.hypot(a, b) }; missing = "c";
      }
      const side = (value: number): SideResult => ({ decimal: value, radical: null });
      setResult({
        status: "success", input: payload,
        result: { a: side(solved.a), b: side(solved.b), c: side(solved.c) },
        formula: "a² + b² = c²",
        steps: [
          `Identify ${missing} as the unknown side.`,
          missing === "c" ? "Use c = √(a² + b²)." : `Rearrange the Pythagorean theorem to solve for ${missing}.`,
          `${missing} = ${solved[missing].toFixed(6)}`,
        ],
      });
      setFlag(true);
      toast.success("Triangle solved locally.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not solve this triangle.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyResult = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy.");
    }
  };

  const formatSideValue = (sideResult: SideResult | null): string => {
    if (!sideResult) return "N/A";
    if (sideResult.radical) {
      return `${sideResult.radical} ≈ ${sideResult.decimal.toFixed(4)}`;
    }
    return sideResult.decimal.toString();
  };
  */

  return (
    <div className="container relative mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 overflow-hidden transition-colors duration-300 rounded-xl">
        {/* Main Overview Section */}
        <div className="pt-6 pb-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1 transition-colors duration-300 text-center">
            Math Solver
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
            STEM Solver (Math)
          </p>
        </div>

        {/* STEM Solver Component */}
        <div className="p-6 border-t dark:border-gray-700">
          <StemSolver setFlag={setFlag} />
        </div>
      </div>
    </div>
  );
};

export default MathSolver;
