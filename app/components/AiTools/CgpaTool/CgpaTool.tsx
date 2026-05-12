"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalculatorState, Semester } from "./types";
import GPAResultCard from "./components/GPAResultCard";
import SemesterCard from "./components/SemesterCard";
import GradeScaleEditor from "./components/GradeScaleEditor";
import { Button, Input } from "./components/ui";
import {
  clearCgpaToolState,
  loadCgpaToolState,
  saveCgpaToolState,
} from "./utils/storage";
import {
  createInitialState,
  createSemester,
  normalizeLoadedState,
} from "./utils/state";
import {
  computeAllSemesterTotals,
  hasAnyCalculableCgpaInput,
} from "./utils/calc";
import { formatCgpaForEmailAndSync, isValidEmail } from "./utils/gpaEmail";
import { buildCgpaGhlSnapshot } from "./utils/cgpaGhlSnapshot";
import { syncCgpaToGhl } from "./utils/ghlCgpaSync";
import { usePathname } from "next/navigation";

function getDeviceLabel() {
  if (typeof navigator === "undefined") return "";
  const ua = navigator.userAgent || "";
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return "Mobile";
  return "Desktop";
}

const CALCULATE_CGPA_GATE_MESSAGE = "First add values to calculate CGPA";

type CgpaToolProps = {
  gateResults?: boolean;
  persistState?: boolean;
  /** When set with `gateResults`, numeric results stay hidden even after unlock succeeds. */
  neverShowResultsOnPage?: boolean;
};

export default function CgpaTool(props: CgpaToolProps = {}) {
  const {
    gateResults = false,
    persistState = true,
    neverShowResultsOnPage = false,
  } = props;
  const initial = useMemo(() => createInitialState(), []);
  const [state, setState] = useState<CalculatorState>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"calculator" | "gradeScale">(
    "calculator",
  );
  const [resultsUnlocked, setResultsUnlocked] = useState(!gateResults);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [headerCalculateCgpaError, setHeaderCalculateCgpaError] = useState<
    string | null
  >(null);
  const [
    semesterCalculateGpaErrorSemesterId,
    setSemesterCalculateGpaErrorSemesterId,
  ] = useState<string | null>(null);
  const currentRoute = usePathname();
  useEffect(() => {
    if (!persistState) {
      setHydrated(true);
      return;
    }
    const loaded = loadCgpaToolState();
    if (loaded) setState(normalizeLoadedState(loaded, initial));
    setHydrated(true);
  }, [initial, persistState]);

  useEffect(() => {
    if (!persistState) return;
    if (!hydrated) return;
    saveCgpaToolState(state);
  }, [state, hydrated, persistState]);

  const semesterTotals = useMemo(
    () => computeAllSemesterTotals(state.semesters, state.gradeScale),
    [state.semesters, state.gradeScale],
  );

  const hasCalculableCgpaInput = useMemo(
    () => hasAnyCalculableCgpaInput(state),
    [state],
  );

  useEffect(() => {
    if (hasCalculableCgpaInput) {
      setHeaderCalculateCgpaError(null);
      setSemesterCalculateGpaErrorSemesterId(null);
    }
  }, [hasCalculableCgpaInput]);

  function tryOpenCalculateCgpaPopup(
    source: "header" | "semester",
    semesterId?: string,
  ) {
    if (!gateResults) return;
    if (!hasAnyCalculableCgpaInput(state)) {
      if (source === "header") {
        setHeaderCalculateCgpaError(CALCULATE_CGPA_GATE_MESSAGE);
        setSemesterCalculateGpaErrorSemesterId(null);
      } else if (semesterId) {
        setHeaderCalculateCgpaError(null);
        setSemesterCalculateGpaErrorSemesterId(semesterId);
      }
      return;
    }
    setHeaderCalculateCgpaError(null);
    setSemesterCalculateGpaErrorSemesterId(null);
    setShowEmailPopup(true);
  }

  function setSemester(next: Semester) {
    if (gateResults) setResultsUnlocked(false);
    setState((prev) => ({
      ...prev,
      semesters: prev.semesters.map((s) => (s.id === next.id ? next : s)),
    }));
  }

  function addSemester() {
    if (gateResults) setResultsUnlocked(false);
    setState((prev) => ({
      ...prev,
      semesters: [
        ...prev.semesters,
        createSemester(prev.semesters.length + 1, 4),
      ],
    }));
  }

  function removeSemester(id: string) {
    if (gateResults) setResultsUnlocked(false);
    setState((prev) => {
      const next = prev.semesters.filter((s) => s.id !== id);
      // Ensure at least one semester exists.
      return {
        ...prev,
        semesters: next.length ? next : [createSemester(1, 4)],
      };
    });
  }

  function resetAll() {
    const next = createInitialState();
    setState(next);
    if (persistState) clearCgpaToolState();
    if (gateResults) setResultsUnlocked(false);
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const cgpaDisplay = formatCgpaForEmailAndSync(state);
    if (cgpaDisplay === "—") {
      toast.error(
        "Add at least one course with a grade and credits, or enter previous semester credits and GPA.",
      );
      return;
    }

    setIsSending(true);

    const fbclid =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("fbclid")?.trim() ||
          ""
        : "";

    void fetch("/api/cgpa-lp-sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: trimmedEmail,
        fbc: fbclid,
        device: getDeviceLabel(),
      }),
    }).catch(() => {});

    try {
      const ghlOutcome = await syncCgpaToGhl({
        email: trimmedEmail,
        cgpa: cgpaDisplay,
        snapshot: buildCgpaGhlSnapshot(state),
      });

      if (!ghlOutcome.ok) {
        toast.error(ghlOutcome.message);
        return;
      }

      toast.success("Your CGPA is saved and your results are unlocked.");
      setEmail("");
      setShowEmailPopup(false);
      if (!neverShowResultsOnPage) {
        setResultsUnlocked(true);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div
      className={`container ${currentRoute === "/tools/cgpa-calculator/" && "overflow-y-auto h-[90vh] "} mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl`}
    >
      <div className="bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300">
        <div className="w-full">
          <div className="mx-auto">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    CGPA / College GPA Calculator
                  </div>
                  <div className="mt-1 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300">
                    Enter your complete cousrse details by semester
                  </div>
                </div>
                {/* {activeScreen === "calculator" ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {gateResults ? (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setShowEmailPopup(true)}
                        className="w-full sm:w-auto"
                      >
                        Calculate CGPA
                      </Button>
                    ) : null}
                    {currentRoute !== "/cgpa-calculator/" && (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setActiveScreen("gradeScale")}
                        className="w-full sm:w-auto"
                      >
                        Change grade scale
                      </Button>
                    )}
                  </div>
                ) : null} */}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {activeScreen === "gradeScale" ? (
                <GradeScaleEditor
                  gradeScale={state.gradeScale}
                  onBack={() => setActiveScreen("calculator")}
                  onChange={(next) =>
                    setState((prev) => ({ ...prev, gradeScale: next }))
                  }
                />
              ) : (
                <>
                  {/* Summary moved to top (no right sidebar) */}
                  <GPAResultCard
                    state={state}
                    onChange={setState}
                    onReset={resetAll}
                    locked={gateResults && !resultsUnlocked}
                    lockedBlurb={
                      neverShowResultsOnPage
                        ? "Your CGPA will be sent on your email only and is not shown on this page."
                        : undefined
                    }
                  />

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Semesters
                    </div>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:items-start">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={addSemester}
                      >
                        Add semester
                      </Button>
                      {gateResults ? (
                        <div className="flex w-full sm:w-auto flex-col gap-1 sm:items-end">
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => tryOpenCalculateCgpaPopup("header")}
                          >
                            Calculate CGPA
                          </Button>
                        </div>
                      ) : null}
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={resetAll}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                  {headerCalculateCgpaError ? (
                    <p
                      className="text-sm text-[#f60606] text-right"
                      role="alert"
                    >
                      {headerCalculateCgpaError}
                    </p>
                  ) : null}
                  <div className="space-y-4">
                    {state.semesters.map((s) => (
                      <div key={s.id} className="space-y-2">
                        <SemesterCard
                          semester={s}
                          gradeScale={state.gradeScale}
                          onChange={setSemester}
                          onRemoveSemester={() => removeSemester(s.id)}
                          disableRemove={state.semesters.length <= 1}
                          showResults={!gateResults || resultsUnlocked}
                          onCalculateGpa={
                            gateResults
                              ? () =>
                                  tryOpenCalculateCgpaPopup("semester", s.id)
                              : undefined
                          }
                          calculateGpaBlockedMessage={
                            semesterCalculateGpaErrorSemesterId === s.id
                              ? CALCULATE_CGPA_GATE_MESSAGE
                              : null
                          }
                        />
                        {(() => {
                          const found = semesterTotals.find(
                            (x) => x.semesterId === s.id,
                          );
                          if (!found) return null;
                          if (found.totals.validCourseCount > 0) return null;
                          return (
                            <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
                              Tip: only rows with a grade and positive credits
                              are counted.
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEmailPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setShowEmailPopup(false)}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-md bg-white/80 p-2 text-slate-500 backdrop-blur hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323dd6] dark:bg-slate-950/80 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
              disabled={isSending}
            >
              <svg
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
            </button>
            <div className="pr-10 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Enter your email to save your result and unlock your CGPA below
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleEmailSubmit}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                disabled={isSending}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSending || !email.trim()}
                >
                  {isSending ? (
                    <>
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        aria-hidden="true"
                      />
                      Sending...
                    </>
                  ) : (
                    "Save & show my CGPA"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
