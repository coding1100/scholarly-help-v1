"use client";

import { FC, useEffect, useState } from "react";
import { FiBookmark, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import { generateStudyArtifact, gradeShortAnswer, type StudyArtifactType } from "../tutorApi";
import { saveTutorItem } from "../tutorApi";
import {
  loadTutorMastery,
  recordTutorQuizResults,
  weakTopics,
  type TutorMasterySnapshot,
  type TutorQuizResultItem,
} from "../tutorMastery";
import type { SaveHandler } from "../TutorWorkspace";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
  simpleExplanation: string;
  topic: string;
  questionFormat: "mcq" | "short_answer";
  answer: string;
}

interface QuizAnswerRecord {
  correct: boolean;
  selectedIndex: number | null;
  shortAnswerText: string;
  /** AI-graded feedback for a short-answer response, when available. */
  gradedFeedback?: string;
}

interface QuizTabProps {
  sessionId: string | null;
  active: boolean;
  onRegisterSaveHandler?: (handler: SaveHandler) => void;
  onSaved?: () => void;
}

type QuizPhase = "idle" | "loading" | "taking" | "scored";
type QuizKind = "objective" | "subjective" | "mix";
type ObjectiveFormat = "mcq" | "true_false" | "fill_blank";

const MIN_QUESTIONS = 2;
const MAX_QUESTIONS = 30;

const QuizTab: FC<QuizTabProps> = ({ sessionId, active, onRegisterSaveHandler, onSaved }) => {
  const [phase, setPhase] = useState<QuizPhase>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [answersByIndex, setAnswersByIndex] = useState<Record<number, QuizAnswerRecord>>({});
  const [mastery, setMastery] = useState<TutorMasterySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shortfallCount, setShortfallCount] = useState<number | null>(null);
  const [grading, setGrading] = useState(false);

  // Pre-quiz setup
  const [quizKind, setQuizKind] = useState<QuizKind>("objective");
  const [objectiveFormats, setObjectiveFormats] = useState<ObjectiveFormat[]>(["mcq"]);
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    if (sessionId) setMastery(loadTutorMastery(sessionId));
  }, [sessionId]);

  const toggleObjectiveFormat = (format: ObjectiveFormat) => {
    setObjectiveFormats((prev) => {
      if (prev.includes(format)) {
        const next = prev.filter((f) => f !== format);
        return next.length > 0 ? next : prev; // keep at least one selected
      }
      return [...prev, format];
    });
  };

  const startQuiz = async (topics?: string[]) => {
    if (!sessionId) return;
    setPhase("loading");
    setError(null);
    setShortfallCount(null);
    try {
      const formatHints: string[] = [];
      if (quizKind === "objective") {
        if (objectiveFormats.includes("true_false")) {
          formatHints.push(
            'Some of the multiple-choice questions should be True/False style (exactly 2 options: "True" and "False", correctAnswerIndex 0 or 1).',
          );
        }
        if (objectiveFormats.includes("fill_blank")) {
          formatHints.push(
            "Include fill-in-the-blank questions: questionFormat short_answer, phrased as a sentence with a blank (e.g. 'The powerhouse of the cell is the ____.'), answer is the short missing word or phrase.",
          );
        }
      } else if (quizKind === "mix") {
        if (objectiveFormats.includes("true_false")) {
          formatHints.push(
            'Some of the MULTIPLE-CHOICE half should be True/False style (exactly 2 options: "True" and "False", correctAnswerIndex 0 or 1).',
          );
        }
        // Fill-in-the-blank is deliberately NOT applied in Mix — the
        // short-answer half of a mixed quiz is meant to be conceptual/
        // theoretical (see quizUserPrompt's "mixed" branch), and a
        // fill-in-the-blank hint would collapse that back into an objective
        // recall question, defeating the point of the subjective half.
      }
      const questionFormat: "mcq" | "short_answer" | "mixed" =
        quizKind === "subjective" ? "short_answer" : quizKind === "mix" ? "mixed" : "mcq";

      const { content } = await generateStudyArtifact(
        sessionId,
        "quizzes" as StudyArtifactType,
        {
          mode: "quiz",
          examTopics: topics,
          questionCount,
          questionFormat,
          rubric: formatHints.join(" "),
        },
      );
      const raw = Array.isArray(content) ? content : [];
      // The backend already drops malformed/incomplete items server-side
      // (no more fake "Option A/B/C/D" filler) — this is a defensive
      // second check so the UI never renders a question it can't actually
      // grade, without inventing placeholder content to fill the gap.
      const cleaned: QuizQuestion[] = raw
        .filter((q: any) => {
          if (!q?.question) return false;
          if (q.questionFormat === "short_answer") return Boolean(q.answer);
          return Array.isArray(q.options) && q.options.length >= 2;
        })
        .map((q: any) => ({
          id: q.id,
          question: q.question,
          options: q.options || [],
          correctAnswerIndex: q.correctAnswerIndex ?? 0,
          explanation: q.explanation || "",
          hint: q.hint || "",
          simpleExplanation: q.simpleExplanation || "",
          topic: q.topic || "General",
          questionFormat: q.questionFormat === "short_answer" ? "short_answer" : "mcq",
          answer: q.answer || "",
        }));

      if (cleaned.length === 0) {
        setError("No usable questions could be generated from your material. Try again.");
        setPhase("idle");
        return;
      }

      if (!topics && cleaned.length < questionCount) {
        setShortfallCount(cleaned.length);
      }

      setQuestions(cleaned);
      setQIndex(0);
      setSelected(null);
      setShortAnswerInput("");
      setShowFeedback(false);
      setAnswersByIndex({});
      setPhase("taking");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate a quiz. Please retry.");
      setPhase("idle");
    }
  };

  const currentQuestion = questions[qIndex];
  const currentAnswer = answersByIndex[qIndex];

  const submitAnswer = async () => {
    if (!currentQuestion) return;

    if (currentQuestion.questionFormat === "mcq") {
      const correct = selected === currentQuestion.correctAnswerIndex;
      setAnswersByIndex((prev) => ({
        ...prev,
        [qIndex]: { correct, selectedIndex: selected, shortAnswerText: shortAnswerInput },
      }));
      setShowFeedback(true);
      return;
    }

    // Short answer: exact string matching fails correct answers that are
    // phrased differently from the model answer (articles, synonyms,
    // rephrasing), so ask the model to grade it instead. Fall back to a
    // lenient local comparison if the grading call fails, so a network hiccup
    // never blocks the student from finishing the quiz.
    const trimmed = shortAnswerInput.trim();
    if (!trimmed) {
      setAnswersByIndex((prev) => ({
        ...prev,
        [qIndex]: { correct: false, selectedIndex: null, shortAnswerText: shortAnswerInput },
      }));
      setShowFeedback(true);
      return;
    }

    setGrading(true);
    try {
      const result = sessionId
        ? await gradeShortAnswer(sessionId, {
            question: currentQuestion.question,
            modelAnswer: currentQuestion.answer,
            studentAnswer: trimmed,
          })
        : null;
      const correct =
        result?.correct ??
        trimmed.toLowerCase().replace(/^(a|an|the)\s+/, "") ===
          currentQuestion.answer.trim().toLowerCase().replace(/^(a|an|the)\s+/, "");
      setAnswersByIndex((prev) => ({
        ...prev,
        [qIndex]: {
          correct,
          selectedIndex: null,
          shortAnswerText: shortAnswerInput,
          gradedFeedback: result?.feedback,
        },
      }));
    } catch {
      const correct =
        trimmed.toLowerCase().replace(/^(a|an|the)\s+/, "") ===
        currentQuestion.answer.trim().toLowerCase().replace(/^(a|an|the)\s+/, "");
      setAnswersByIndex((prev) => ({
        ...prev,
        [qIndex]: { correct, selectedIndex: null, shortAnswerText: shortAnswerInput },
      }));
    } finally {
      setGrading(false);
      setShowFeedback(true);
    }
  };

  const goNext = () => {
    const nextIndex = qIndex + 1;
    if (nextIndex < questions.length) {
      const nextAnswer = answersByIndex[nextIndex];
      setQIndex(nextIndex);
      setSelected(nextAnswer?.selectedIndex ?? null);
      setShortAnswerInput(nextAnswer?.shortAnswerText ?? "");
      setShowFeedback(Boolean(nextAnswer));
    } else {
      finishQuiz();
    }
  };

  const goBack = () => {
    if (qIndex === 0) return;
    const prevIndex = qIndex - 1;
    const prevAnswer = answersByIndex[prevIndex];
    setQIndex(prevIndex);
    setSelected(prevAnswer?.selectedIndex ?? null);
    setShortAnswerInput(prevAnswer?.shortAnswerText ?? "");
    setShowFeedback(Boolean(prevAnswer));
  };

  const finishQuiz = () => {
    const finalResults: TutorQuizResultItem[] = questions.map((q, i) => ({
      topic: q.topic,
      correct: Boolean(answersByIndex[i]?.correct),
      skipped: !answersByIndex[i],
      usedHint: false,
    }));
    if (sessionId) {
      const snapshot = recordTutorQuizResults(sessionId, finalResults);
      setMastery(snapshot);
    }
    setPhase("scored");
  };

  const results = questions.map((_, i) => answersByIndex[i]);

  const missedTopics = () => {
    const missed = new Set<string>();
    questions.forEach((q, i) => {
      const r = answersByIndex[i];
      if (r && !r.correct) missed.add(q.topic || "General");
    });
    return Array.from(missed);
  };

  const retakeMissed = () => {
    const topics = missedTopics();
    if (topics.length === 0) {
      startQuiz();
      return;
    }
    startQuiz(topics);
  };

  const buildQuizAttemptContent = () => {
    const score = results.filter((r) => r?.correct).length;
    return {
      score,
      content: [
        `Score: ${score}/${questions.length}`,
        "",
        ...questions.map((q, i) => {
          const r = answersByIndex[i];
          return `${i + 1}. ${q.question}\n${r?.correct ? "✅ Correct" : "❌ Missed"} — ${q.explanation}`;
        }),
      ].join("\n"),
    };
  };

  const saveQuizAttempt = async () => {
    const { score, content } = buildQuizAttemptContent();
    try {
      await saveTutorItem({
        folder: "Saved Quizzes",
        title: `Quiz — ${new Date().toLocaleDateString()} (${score}/${questions.length})`,
        content,
      });
      toast.success("Saved to Saved Quizzes");
      onSaved?.();
    } catch {
      toast.error("Could not save this quiz attempt. Please retry.");
    }
  };

  useEffect(() => {
    if (!onRegisterSaveHandler) return;
    onRegisterSaveHandler({
      hasContent: questions.length > 0 && Object.keys(answersByIndex).length > 0,
      save: async (projectLabel?: string) => {
        if (questions.length === 0 || Object.keys(answersByIndex).length === 0) return;
        const { score, content } = buildQuizAttemptContent();
        await saveTutorItem({
          folder: "Saved Quizzes",
          title: projectLabel
            ? `${projectLabel} — Quiz (${score}/${questions.length})`
            : `Quiz — ${new Date().toLocaleDateString()} (${score}/${questions.length})`,
          content,
        });
      },
    });
  }, [questions, answersByIndex, onRegisterSaveHandler]);

  const score = results.filter((r) => r?.correct).length;
  const weak = mastery ? weakTopics(mastery) : [];

  return (
    <div className={`flex h-full flex-col overflow-y-auto p-4 ${active ? "" : "hidden"}`}>
      {mastery && mastery.sessionsCompleted > 0 ? (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
          <p className="font-semibold text-gray-800">
            Overall mastery: {mastery.overall}% · {mastery.questionsAnswered} questions answered
          </p>
          {weak.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {weak.map((t) => (
                <span
                  key={t.topic}
                  className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700"
                >
                  {t.topic} · {t.mastery}%
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 font-semibold text-emerald-600">All practiced topics look solid.</p>
          )}
        </div>
      ) : null}

      {phase === "idle" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="max-w-sm text-sm text-gray-500">
            Generate a quiz from your uploaded material — questions and answers are scored from
            real backend content only.
          </p>

          <div className="w-full max-w-sm space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-gray-700">Question type</p>
              <div className="flex gap-1.5">
                {(["objective", "subjective", "mix"] as QuizKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setQuizKind(kind)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      quizKind === kind
                        ? "border-primary-400 bg-primary-400 text-white"
                        : "border-gray-300 bg-white text-gray-600 hover:border-primary-400"
                    }`}
                  >
                    {kind}
                  </button>
                ))}
              </div>
            </div>

            {quizKind !== "subjective" ? (
              <div>
                <p className="mb-1.5 text-xs font-semibold text-gray-700">
                  Objective format{quizKind === "mix" ? " (for the multiple-choice half)" : ""}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    (quizKind === "mix"
                      ? [
                          { key: "mcq", label: "Multiple Choice" },
                          { key: "true_false", label: "True / False" },
                        ]
                      : [
                          { key: "mcq", label: "Multiple Choice" },
                          { key: "true_false", label: "True / False" },
                          { key: "fill_blank", label: "Fill in the Blank" },
                        ]) as { key: ObjectiveFormat; label: string }[]
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleObjectiveFormat(key)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        objectiveFormats.includes(key)
                          ? "border-primary-400 bg-primary-100 text-primary-500"
                          : "border-gray-300 bg-white text-gray-600 hover:border-primary-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Number of questions
              </label>
              <input
                type="number"
                min={MIN_QUESTIONS}
                max={MAX_QUESTIONS}
                value={questionCount}
                onChange={(e) => {
                  const val = Math.round(Number(e.target.value));
                  if (Number.isNaN(val)) return;
                  setQuestionCount(Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, val)));
                }}
                className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-800 outline-none transition-colors duration-300 focus:border-primary-400"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                {MIN_QUESTIONS}–{MAX_QUESTIONS} questions
              </p>
            </div>
          </div>

          {error ? <p className="text-xs text-red-500">{error}</p> : null}
          <button
            type="button"
            onClick={() => startQuiz()}
            disabled={!sessionId}
            className="rounded-lg bg-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-300 active:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Generate Quiz
          </button>
        </div>
      ) : null}

      {phase === "loading" ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          Generating your quiz…
        </div>
      ) : null}

      {phase === "taking" && currentQuestion ? (
        <div className="flex flex-1 flex-col">
          <p className="text-xs font-semibold text-gray-500">
            Question {qIndex + 1} of {questions.length} · {currentQuestion.topic}
          </p>
          {shortfallCount !== null ? (
            <p className="mt-1 text-[11px] text-amber-600">
              Generated {shortfallCount} of {questionCount} requested questions from your
              material.
            </p>
          ) : null}
          <p className="mt-2 text-sm font-medium text-gray-800">{currentQuestion.question}</p>

          {currentQuestion.questionFormat === "mcq" ? (
            <div className="mt-3 space-y-2">
              {currentQuestion.options.map((option, i) => {
                const isCorrectOption = i === currentQuestion.correctAnswerIndex;
                const isSelected = selected === i;
                let optionClass =
                  "border-gray-300 bg-white hover:border-primary-400";
                if (showFeedback) {
                  if (isCorrectOption) {
                    optionClass = "border-emerald-400 bg-emerald-50 text-emerald-700";
                  } else if (isSelected && !isCorrectOption) {
                    optionClass = "border-red-400 bg-red-50 text-red-700";
                  } else {
                    optionClass = "border-gray-200 bg-white text-gray-400";
                  }
                } else if (isSelected) {
                  optionClass = "border-primary-400 bg-primary-100";
                }
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => !showFeedback && setSelected(i)}
                    disabled={showFeedback}
                    className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${optionClass}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-3">
              <input
                value={shortAnswerInput}
                onChange={(e) => !showFeedback && setShortAnswerInput(e.target.value)}
                disabled={showFeedback}
                placeholder="Type your answer…"
                className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-800 outline-none transition-colors duration-300 focus:border-primary-400 disabled:bg-gray-50"
              />
              {showFeedback ? (
                <p className="mt-1.5 text-xs text-gray-600">
                  Model answer: <span className="font-semibold">{currentQuestion.answer}</span>
                </p>
              ) : null}
            </div>
          )}

          {showFeedback ? (
            <div
              className={`mt-3 rounded-lg border p-3 text-xs ${
                currentAnswer?.correct
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <p className="font-semibold">
                {currentAnswer?.correct ? "Correct!" : "Not quite."}
              </p>
              {currentQuestion.questionFormat === "short_answer" && currentAnswer?.gradedFeedback ? (
                <p className="mt-1 text-gray-600">{currentAnswer.gradedFeedback}</p>
              ) : currentQuestion.explanation ? (
                <p className="mt-1 text-gray-600">{currentQuestion.explanation}</p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={qIndex === 0}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (showFeedback) {
                  goNext();
                } else {
                  void submitAnswer();
                }
              }}
              disabled={
                grading ||
                (!showFeedback &&
                  (currentQuestion.questionFormat === "mcq"
                    ? selected === null
                    : !shortAnswerInput.trim()))
              }
              className="rounded-lg bg-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-300 active:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {grading
                ? "Grading…"
                : showFeedback
                  ? qIndex + 1 < questions.length
                    ? "Next"
                    : "Finish"
                  : "Submit"}
            </button>
          </div>
        </div>
      ) : null}

      {phase === "scored" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-lg font-semibold text-gray-800">
            {score}/{questions.length} correct
          </p>
          {missedTopics().length > 0 ? (
            <p className="text-xs text-red-600">
              Weak this round: {missedTopics().join(", ")}
            </p>
          ) : (
            <p className="text-xs font-semibold text-emerald-600">All topics solid this round!</p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={retakeMissed}
              className="flex items-center gap-1.5 rounded-lg border border-primary-400 bg-white px-3 py-2 text-xs font-medium text-primary-400 transition-colors hover:bg-primary-100"
            >
              <FiRefreshCw className="h-3.5 w-3.5" />
              {missedTopics().length > 0 ? "Retake missed topics" : "New quiz"}
            </button>
            <button
              type="button"
              onClick={saveQuizAttempt}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <FiBookmark className="h-3.5 w-3.5" />
              Save attempt
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QuizTab;
