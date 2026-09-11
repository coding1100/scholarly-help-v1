"use client";

import React, { useRef, useState } from "react";
import MathProse from "@/app/components/AiTools/shared/MathProse";
import styles from "../homework-helper.module.css";
import QuestionHeader from "../components/QuestionHeader";
import type { HomeworkSessionDTO } from "../types";

interface StepByStepScreenProps {
  session: HomeworkSessionDTO;
  loading: boolean;
  onAsk: (stepIndex: number, question: string) => Promise<string>;
  onPropose: (proposal: string) => Promise<string>;
  onComplete: () => void;
}

const StepByStepScreen: React.FC<StepByStepScreenProps> = ({
  session,
  loading,
  onAsk,
  onPropose,
  onComplete,
}) => {
  const steps = session.content.stepByStep || [];
  const [stepIndex, setStepIndex] = useState(0);
  const [whyOpen, setWhyOpen] = useState<Record<number, boolean>>({});
  const [askResponses, setAskResponses] = useState<Record<number, string>>({});
  const [askBusy, setAskBusy] = useState<number | null>(null);
  const [proposeOpen, setProposeOpen] = useState(false);
  const [proposeResponse, setProposeResponse] = useState<string | null>(null);
  const [proposeBusy, setProposeBusy] = useState(false);
  const askInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const proposeInputRef = useRef<HTMLInputElement>(null);

  if (!steps.length) {
    return (
      <div>
        <QuestionHeader session={session} />
        <div className="text-[var(--ink-faint)] text-sm italic">No steps generated yet.</div>
      </div>
    );
  }

  const submitAsk = async (i: number) => {
    const input = askInputRefs.current[i];
    const value = input?.value.trim();
    if (!value) return;
    setAskBusy(i);
    try {
      const response = await onAsk(i, value);
      setAskResponses((prev) => ({ ...prev, [i]: response }));
    } finally {
      setAskBusy(null);
    }
  };

  const submitPropose = async () => {
    const value = proposeInputRef.current?.value.trim();
    if (!value) return;
    setProposeBusy(true);
    try {
      const response = await onPropose(value);
      setProposeResponse(response);
    } finally {
      setProposeBusy(false);
    }
  };

  return (
    <div>
      <QuestionHeader session={session} />

      {(session.method_formula || session.method) && (
        <div className="bg-[var(--pen-soft)] rounded-lg px-3.5 py-2.5 mb-5 text-[13px]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[var(--pen)] font-semibold">Using: {session.method}</span>
              {session.method_formula && (
                <span className="font-mono text-[var(--ink-soft)]"> ({session.method_formula})</span>
              )}
            </div>
            <button
              type="button"
              className="text-[var(--pen)] font-semibold underline text-[12.5px]"
              onClick={() => setProposeOpen((v) => !v)}
            >
              Propose a different approach
            </button>
          </div>
          {proposeOpen && (
            <div className="flex gap-2 mt-2.5">
              <input
                ref={proposeInputRef}
                type="text"
                placeholder="e.g. Can we use...?"
                disabled={proposeBusy}
                className="flex-1 px-2.5 py-1.5 border border-[var(--line)] rounded-md text-[13.5px] bg-[var(--paper-raised)] text-[var(--ink)] disabled:opacity-60"
                onKeyDown={(e) => e.key === "Enter" && submitPropose()}
              />
              <button
                type="button"
                disabled={proposeBusy}
                className="text-[13px] px-3 py-1.5 rounded-md border border-[var(--line)] disabled:opacity-50"
                onClick={submitPropose}
              >
                Ask
              </button>
            </div>
          )}
          {proposeResponse && (
            <MathProse
              text={proposeResponse}
              className="block mt-2.5 px-3 py-2 rounded-md text-[13.5px] leading-relaxed bg-[var(--paper-raised)]"
            />
          )}
        </div>
      )}

      <div>
        {steps.slice(0, stepIndex + 1).map((step, i) => {
          const isCurrent = i === stepIndex && stepIndex < steps.length;
          const isDone = i < stepIndex;
          return (
            <div
              key={i}
              className={`${styles.card} ${isCurrent ? styles.stepCardCurrent : ""} p-4.5 mb-2.5 ${
                !isCurrent ? "opacity-60" : ""
              }`}
              style={{ padding: "18px 20px" }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  aria-hidden="true"
                  className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center text-[11px] ${
                    isDone
                      ? "bg-[var(--green)] border-[var(--green)] text-white"
                      : "border-[var(--line)] text-transparent"
                  }`}
                  style={isCurrent ? { borderColor: "var(--pen)" } : undefined}
                >
                  {isDone ? "✓" : ""}
                </span>
                {isDone && <span className="sr-only">Completed:</span>}
                <span className={`${styles.serif} font-semibold text-[16px]`}>{step.title}</span>
              </div>
              <MathProse
                text={step.body}
                allowHtml
                className="block text-[14.5px] leading-relaxed pl-[29px]"
              />
              {step.formula && (
                <div className={`${styles.formula} text-[14.5px] rounded-md px-3.5 py-2 my-2 ml-[29px] inline-block`}>
                  <MathProse text={step.formula} />
                </div>
              )}
              <div className="flex gap-4 pl-[29px] mt-2.5 flex-wrap items-center">
                <button
                  type="button"
                  aria-expanded={!!whyOpen[i]}
                  aria-controls={`hh-why-${i}`}
                  className="text-[12.5px] text-[var(--red)] font-semibold border-b border-dashed border-[var(--red)]"
                  onClick={() => setWhyOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                >
                  Why this step?
                </button>
              </div>
              {whyOpen[i] && (
                <MathProse
                  id={`hh-why-${i}`}
                  text={step.why}
                  className={`${styles.whyBox} block mt-2.5 ml-[29px] px-3.5 py-2.5 rounded-r-md text-[13px] leading-relaxed`}
                />
              )}
              <div className="pl-[29px] mt-3">
                <input
                  ref={(el) => {
                    askInputRefs.current[i] = el;
                  }}
                  type="text"
                  placeholder="Ask about this step..."
                  disabled={askBusy === i}
                  className="w-full max-w-[340px] px-2.5 py-1.5 border border-[var(--line)] rounded-md text-[13px] bg-[var(--paper-raised)] text-[var(--ink)] disabled:opacity-60"
                  onKeyDown={(e) => e.key === "Enter" && submitAsk(i)}
                />
                {askBusy === i && (
                  <div role="status" aria-live="polite" className="text-[12px] text-[var(--ink-faint)] mt-1.5">
                    Thinking…
                  </div>
                )}
                {askResponses[i] && (
                  <div role="status" aria-live="polite">
                    <MathProse
                      text={askResponses[i]}
                      className="block mt-2 px-3 py-2 bg-[var(--pen-soft)] rounded-md text-[13px] leading-relaxed max-w-[420px] text-[var(--pen)]"
                    />
                  </div>
                )}
              </div>
              {isCurrent && (
                <div className="pl-[29px] mt-3.5">
                  <button
                    type="button"
                    disabled={loading}
                    className="text-[13.5px] font-semibold px-3.5 py-1.5 rounded-md bg-[var(--pen-btn)] text-white disabled:opacity-50"
                    onClick={() => setStepIndex((n) => n + 1)}
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {stepIndex >= steps.length && (
        <>
          <div className={`${styles.feedbackCorrect} rounded-[10px] px-5 py-4.5 my-4 text-center`}>
            <div className="font-mono text-[11px] uppercase tracking-wide">Answer</div>
            <MathProse text={session.answer} className={`${styles.serif} block text-[26px] font-bold mt-1`} />
          </div>
          <button
            type="button"
            className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg bg-[var(--pen-btn)] text-white"
            onClick={onComplete}
          >
            Complete question
          </button>
        </>
      )}
    </div>
  );
};

export default StepByStepScreen;
