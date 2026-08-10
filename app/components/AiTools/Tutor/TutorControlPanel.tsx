"use client";

import { useMemo, useState } from "react";
import {
  FiBookOpen,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiEdit3,
  FiTarget,
} from "react-icons/fi";
import {
  TutorMasterySnapshot,
  TutorPreferences,
} from "@/app/components/AiTools/Tutor/tutorExperience";

type Option<T extends string> = { value: T; label: string };

function ChoiceRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#73789a]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              value === option.value
                ? "border-[#5f70ff] bg-[#eef1ff] text-[#4653c9]"
                : "border-[#e0e3f4] bg-white text-[#646987] hover:border-[#bfc7ff]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TutorControlPanel({
  preferences,
  mastery,
  onChange,
  onStartPlacement,
}: {
  preferences: TutorPreferences;
  mastery: TutorMasterySnapshot;
  onChange: (next: TutorPreferences) => void;
  onStartPlacement: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const weakest = useMemo(
    () =>
      Object.values(mastery.topics)
        .sort((a, b) => a.mastery - b.mastery)
        .slice(0, 3),
    [mastery.topics],
  );
  const patch = <K extends keyof TutorPreferences>(key: K, value: TutorPreferences[K]) =>
    onChange({ ...preferences, [key]: value });

  // Colour-code: ≥75 green, ≥45 amber, else red
  const masteryColor =
    mastery.overall >= 75
      ? { track: "bg-[#d1fae5]", fill: "bg-[#10b981]", text: "text-[#065f46]", badge: "bg-[#ecfdf5] text-[#047857]" }
      : mastery.overall >= 45
      ? { track: "bg-[#fef3c7]", fill: "bg-[#f59e0b]", text: "text-[#78350f]", badge: "bg-[#fffbeb] text-[#b45309]" }
      : { track: "bg-[#fee2e2]", fill: "bg-[#ef4444]", text: "text-[#7f1d1d]", badge: "bg-[#fef2f2] text-[#b91c1c]" };

  // Step dots — one pip per 10% of mastery, filled up to current level
  const PIPS = 10;
  const filledPips = Math.round(mastery.overall / PIPS);

  return (
    <section className="rounded-2xl border border-[#dfe3ff] bg-white shadow-[0_8px_30px_rgba(71,83,170,0.08)]">
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        {/* ── Header row ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-base font-semibold text-[#242842]">
              <FiBookOpen className="h-4 w-4 text-[#5f70ff]" />
              AI Tutor setup
            </p>
            <p className="mt-1 text-xs text-[#747996]">
              Your choices shape explanations, practice, and feedback for this course.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#dfe3f7] px-3 py-1.5 text-xs font-semibold text-[#5f6483] hover:bg-[#f7f8ff]"
          >
            {expanded ? "Hide setup" : "Personalize"}
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {/* ── Mastery progress meter ──────────────────────────── */}
        <div className={`rounded-xl border px-4 py-3 ${masteryColor.track} border-current/10`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wide ${masteryColor.text}`}>
              Overall mastery
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${masteryColor.badge}`}>
              {mastery.overall}%
            </span>
          </div>
          {/* Segmented pip bar */}
          <div className="mt-2.5 flex items-center gap-1">
            {Array.from({ length: PIPS }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  i < filledPips ? masteryColor.fill : "bg-white/60"
                }`}
              />
            ))}
          </div>
          {/* Continuous bar underneath for smooth feel */}
          <div className={`mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/40`}>
            <div
              className={`h-full rounded-full transition-all duration-700 ${masteryColor.fill}`}
              style={{ width: `${mastery.overall}%` }}
            />
          </div>
          {mastery.sessionsCompleted > 0 && (
            <p className={`mt-2 text-[11px] ${masteryColor.text} opacity-70`}>
              {mastery.questionsAnswered} question{mastery.questionsAnswered !== 1 ? "s" : ""} answered
              {" · "}
              {mastery.sessionsCompleted} session{mastery.sessionsCompleted !== 1 ? "s" : ""} completed
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            ["research", "Research", FiBookOpen],
            ["quiz", "Practice", FiTarget],
            ["exam", "Exam prep", FiClock],
            ["assignment", "Assignment", FiEdit3],
          ] as const).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => patch("mode", value)}
              className={`rounded-xl border p-3 text-left transition ${
                preferences.mode === value
                  ? "border-[#7080f4] bg-[#f1f3ff] shadow-[0_0_0_1px_rgba(95,112,255,0.12)]"
                  : "border-[#e7e9f5] bg-[#fbfbfe] hover:border-[#cbd2ff]"
              }`}
            >
              <Icon className="h-4 w-4 text-[#5f70ff]" />
              <span className="mt-1.5 block text-xs font-semibold text-[#353951]">{label}</span>
            </button>
          ))}
        </div>

        {weakest.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#73789a]">
              Needs work
            </p>
            {weakest.map((topic) => (
              <div key={topic.topic} className="flex items-center gap-2 rounded-lg border border-[#ffd5ce] bg-[#fff4f1] px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#bd5a47]">
                  {topic.topic}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#ffd5ce]">
                    <div
                      className="h-full rounded-full bg-[#ef4444] transition-all duration-500"
                      style={{ width: `${topic.mastery}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-bold text-[#bd5a47]">
                    {topic.mastery}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {expanded ? (
          <div className="grid gap-5 border-t border-[#eceefa] pt-4 lg:grid-cols-2">
            <ChoiceRow
              label="Academic level"
              value={preferences.academicLevel}
              options={[
                { value: "high_school", label: "High school" },
                { value: "college", label: "College" },
                { value: "phd", label: "PhD" },
              ]}
              onChange={(value) => patch("academicLevel", value)}
            />
            <ChoiceRow
              label="Timing"
              value={preferences.timing}
              options={[
                { value: "soon", label: "Exam is soon" },
                { value: "plenty", label: "I have time" },
              ]}
              onChange={(value) => patch("timing", value)}
            />
            <ChoiceRow
              label="Question format"
              value={preferences.examFormat}
              options={[
                { value: "mcq", label: "Multiple choice" },
                { value: "short_answer", label: "Short answer" },
                { value: "mixed", label: "Mixed" },
              ]}
              onChange={(value) => patch("examFormat", value)}
            />
            <div>
              <ChoiceRow
                label="Difficulty"
                value={preferences.difficulty}
                options={[
                  { value: "easy", label: "Easy" },
                  { value: "medium", label: "Medium" },
                  { value: "hard", label: "Hard" },
                  { value: "adaptive", label: "Adaptive" },
                ]}
                onChange={(value) => patch("difficulty", value)}
              />
              <button
                type="button"
                onClick={onStartPlacement}
                className="mt-3 text-xs font-semibold text-[#5262df] underline decoration-[#bfc7ff] underline-offset-2"
              >
                Not sure? Run a placement check
              </button>
            </div>
            <label className="lg:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#73789a]">
                Rubric or instructor focus
              </span>
              <textarea
                value={preferences.rubric}
                onChange={(event) => patch("rubric", event.target.value)}
                rows={2}
                placeholder="Example: Focus on real-world application and grade short answers for reasoning, not memorization."
                className="w-full resize-none rounded-xl border border-[#dfe3f4] bg-[#fbfbfe] px-3 py-2.5 text-sm text-[#34384f] outline-none focus:border-[#7b88ef] focus:ring-2 focus:ring-[#e2e6ff]"
              />
            </label>
          </div>
        ) : null}
      </div>
    </section>
  );
}
