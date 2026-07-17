"use client";

import React, { FC, useEffect, useState } from "react";
import { FaRegCopy } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import StemSolver from "./StemSolver";

interface PythagorasSolverProps {
  setFlag: (value: boolean) => void;
}

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

const PythagorasSolver: FC<PythagorasSolverProps> = ({ setFlag }) => {
  const [token, setToken] = useState<string | null>(null);
  const [solverMode, setSolverMode] = useState<"triangle" | "stem">("triangle");
  const [sideA, setSideA] = useState<string>("");
  const [sideB, setSideB] = useState<string>("");
  const [sideC, setSideC] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SolverResponse | null>(null);
  const [error, setError] = useState<string>("");
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  const handleClear = () => {
    setSideA("");
    setSideB("");
    setSideC("");
    setResult(null);
    setError("");
  };

  const handleSolve = async () => {
    // Count how many sides are provided
    const sidesProvided = [sideA.trim(), sideB.trim(), sideC.trim()].filter(
      (side) => side !== "",
    ).length;

    if (sidesProvided !== 2) {
      setError("Please provide exactly two sides to solve the triangle.");
      toast.error("Please provide exactly two sides.");
      return;
    }

    // Validate and build the payload BEFORE consuming a guest AI click, so
    // invalid input never counts against the guest's allowance.
    const payload: {
      a?: number;
      b?: number;
      c?: number;
    } = {};

    if (sideA.trim()) {
      const aValue = parseFloat(sideA.trim());
      if (isNaN(aValue) || aValue <= 0) {
        setError("Side 'a' must be a positive number.");
        toast.error("Side 'a' must be a positive number.");
        return;
      }
      payload.a = aValue;
    }
    if (sideB.trim()) {
      const bValue = parseFloat(sideB.trim());
      if (isNaN(bValue) || bValue <= 0) {
        setError("Side 'b' must be a positive number.");
        toast.error("Side 'b' must be a positive number.");
        return;
      }
      payload.b = bValue;
    }
    if (sideC.trim()) {
      const cValue = parseFloat(sideC.trim());
      if (isNaN(cValue) || cValue <= 0) {
        setError("Side 'c' must be a positive number.");
        toast.error("Side 'c' must be a positive number.");
        return;
      }
      payload.c = cValue;
    }

    // Guests get a small number of free AI actions across all tools; the gate
    // opens instead of calling the AI once the allowance is used up.
    guardAiClick(async () => {
      trackToolGenerate({ toolName: "Pythagoras Equation Solver" });
      setIsSubmitting(true);
      setError("");
      setResult(null);

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/pythagoras-equation-solver`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        // Backend wraps responses as { success, message, data }
        const responsePayload = response.data?.data ?? response.data;

        if (responsePayload?.status === "success") {
          setResult(responsePayload);
          setFlag(true);
          toast.success("Triangle solved successfully!");
        } else {
          setError("Failed to solve the triangle. Please try again.");
          toast.error("Failed to solve the triangle.");
        }
      } catch (error: any) {
        console.error("Error solving triangle:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    });
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

  return (
    <div className="container relative mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <ToolsApiLoader show={isSubmitting} />
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {/* Main Overview Section */}
        <div className="pt-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 transition-colors duration-300 text-center">
            {solverMode === "triangle"
              ? "Pythagoras Equation Solver"
              : "STEM Problem Solver"}
          </h2>
        </div>

        {/* Mode toggle: deterministic triangle solver vs AI STEM solver */}
        <div className="flex justify-center pb-2">
          <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-900">
            {(
              [
                { key: "triangle", label: "Triangle Solver" },
                { key: "stem", label: "STEM Solver (Math · Physics · Chemistry)" },
              ] as { key: "triangle" | "stem"; label: string }[]
            ).map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setSolverMode(m.key)}
                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors duration-200 ${
                  solverMode === m.key
                    ? "bg-[#155dfc] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {solverMode === "stem" && (
          <div className="p-6 border-b dark:border-gray-700">
            <StemSolver setFlag={setFlag} />
          </div>
        )}

        {/* Input Section (Triangle solver) */}
        {solverMode === "triangle" && (
        <div className="p-6 border-b dark:border-gray-700">
          <div className="space-y-4">
            {/* Formula Display */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-[#193cb8] rounded-md p-4">
              <p className="text-lg font-semibold text-[#193cb8] dark:text-blue-300 text-center">
                Formula: a² + b² = c²
              </p>
              <p className="text-sm text-[#155dfc] dark:text-[#51a2ff] text-center mt-1">
                (where c is the hypotenuse)
              </p>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Side A */}
              <div>
                <label
                  htmlFor="sideA"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Side a:
                </label>
                <input
                  id="sideA"
                  type="number"
                  step="any"
                  min="0"
                  value={sideA}
                  onChange={(e) => setSideA(e.target.value)}
                  placeholder="Enter side a"
                  className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                />
              </div>

              {/* Side B */}
              <div>
                <label
                  htmlFor="sideB"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Side b:
                </label>
                <input
                  id="sideB"
                  type="number"
                  step="any"
                  min="0"
                  value={sideB}
                  onChange={(e) => setSideB(e.target.value)}
                  placeholder="Enter side b"
                  className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                />
              </div>

              {/* Side C (Hypotenuse) */}
              <div>
                <label
                  htmlFor="sideC"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Side c (Hypotenuse):
                </label>
                <input
                  id="sideC"
                  type="number"
                  step="any"
                  min="0"
                  value={sideC}
                  onChange={(e) => setSideC(e.target.value)}
                  placeholder="Enter side c"
                  className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                />
              </div>
            </div>

            {/* Note */}
            <p className="text-sm text-gray-500 dark:text-gray-400 italic transition-colors duration-300">
              Note: Provide exactly two sides to solve for the third. All values
              must be positive numbers.
            </p>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSolve}
                disabled={
                  isSubmitting ||
                  (!sideA.trim() && !sideB.trim() && !sideC.trim())
                }
                className={`px-6 py-2.5 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-300 ${
                  isSubmitting ||
                  (!sideA.trim() && !sideB.trim() && !sideC.trim())
                    ? "bg-[#565add] dark:bg-[#565add] cursor-not-allowed"
                    : "bg-[#155dfc] hover:bg-[#4147fb]"
                }`}
              >
                {isSubmitting ? "Solving..." : "Solve"}
              </button>

              <button
                onClick={handleClear}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-md font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Results Section (Triangle solver) */}
        {solverMode === "triangle" && result && (
          <div className="p-6 space-y-6">
            {/* Formula */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300">
                Formula Used:
              </h3>
              <p className="text-xl font-mono text-center text-gray-800 dark:text-gray-100 transition-colors duration-300">
                {result.formula}
              </p>
            </div>

            {/* Results Display */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">
                Results:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Side A Result */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Side a:
                    </h4>
                    {result.result.a && (
                      <button
                        onClick={() =>
                          handleCopyResult(formatSideValue(result.result.a))
                        }
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-300"
                        title="Copy result"
                      >
                        <FaRegCopy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {result.result.a ? (
                      <>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                          {formatSideValue(result.result.a)}
                        </p>
                        {result.result.a.radical && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                            Radical: {result.result.a.radical}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          Decimal: {result.result.a.decimal.toFixed(4)}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {result.input.a?.toString() || "N/A"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Side B Result */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Side b:
                    </h4>
                    {result.result.b && (
                      <button
                        onClick={() =>
                          handleCopyResult(formatSideValue(result.result.b))
                        }
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-300"
                        title="Copy result"
                      >
                        <FaRegCopy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {result.result.b ? (
                      <>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                          {formatSideValue(result.result.b)}
                        </p>
                        {result.result.b.radical && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                            Radical: {result.result.b.radical}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          Decimal: {result.result.b.decimal.toFixed(4)}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {result.input.b?.toString() || "N/A"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Side C Result */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Side c (Hypotenuse):
                    </h4>
                    {result.result.c && (
                      <button
                        onClick={() =>
                          handleCopyResult(formatSideValue(result.result.c))
                        }
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-300"
                        title="Copy result"
                      >
                        <FaRegCopy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {result.result.c ? (
                      <>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                          {formatSideValue(result.result.c)}
                        </p>
                        {result.result.c.radical && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                            Radical: {result.result.c.radical}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          Decimal: {result.result.c.decimal.toFixed(4)}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {result.input.c?.toString() || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Solution */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">
                Step-by-Step Solution:
              </h3>
              <div className="space-y-2">
                {result.steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-[#193cb8] dark:text-blue-200 text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      {step}
                    </p>
                    <button
                      onClick={() => handleCopyResult(step)}
                      className="flex-shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-300"
                      title="Copy step"
                    >
                      <FaRegCopy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Quote */}
      <div className="text-sm font-serif text-center pt-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <q>
          Master the Pythagorean theorem with ScholarlyHelp&apos;s Pythagoras
          Equation Solver. Get instant, accurate solutions with step-by-step
          explanations and simplified radical forms for your right-angled
          triangle problems.
        </q>
      </div>
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default PythagorasSolver;
