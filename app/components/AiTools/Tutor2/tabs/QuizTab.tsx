"use client";

import { FC, useEffect, useState } from "react";
import { FiBookmark, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import { generateStudyArtifact, type StudyArtifactType } from "../tutorApi";
import { saveTutorItem } from "../tutorApi";
import {
  loadTutorMastery,
  recordTutorQuizResults,
  weakTopics,
  type TutorMasterySnapshot,
  type TutorQuizResultItem,
} from "../tutorMastery";

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

interface QuizTabProps {
  sessionId: string | null;
  active: boolean;
}

type QuizPhase = "idle" | "loading" | "taking" | "scored";

const QuizTab: FC<QuizTabProps> = ({ sessionId, active }) => {
  const [phase, setPhase] = useState<QuizPhase>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState("");
  const [results, setResults] = useState<TutorQuizResultItem[]>([]);
  const [mastery, setMastery] = useState<TutorMasterySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) setMastery(loadTutorMastery(sessionId));
  }, [sessionId]);

  const startQuiz = async (topics?: string[]) => {
    if (!sessionId) return;
    setPhase("loading");
    setError(null);
    try {
      const { content } = await generateStudyArtifact(
        sessionId,
        "quizzes" as StudyArtifactType,
        { mode: "quiz", examTopics: topics },
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
          return Array.isArray(q.options) && q.options.length === 4;
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

      setQuestions(cleaned);
      setQIndex(0);
      setSelected(null);
      setShortAnswerInput("");
      setResults([]);
      setPhase("taking");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate a quiz. Please retry.");
      setPhase("idle");
    }
  };

  const currentQuestion = questions[qIndex];

  const submitAnswer = () => {
    if (!currentQuestion) return;
    const correct =
      currentQuestion.questionFormat === "mcq"
        ? selected === currentQuestion.correctAnswerIndex
        : shortAnswerInput.trim().length > 0 &&
          shortAnswerInput.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();

    setResults((prev) => [
      ...prev,
      { topic: currentQuestion.topic, correct, skipped: false, usedHint: false },
    ]);

    const nextIndex = qIndex + 1;
    if (nextIndex < questions.length) {
      setQIndex(nextIndex);
      setSelected(null);
      setShortAnswerInput("");
    } else {
      finishQuiz([
        ...results,
        { topic: currentQuestion.topic, correct, skipped: false, usedHint: false },
      ]);
    }
  };

  const finishQuiz = (finalResults: TutorQuizResultItem[]) => {
    if (sessionId) {
      const snapshot = recordTutorQuizResults(sessionId, finalResults);
      setMastery(snapshot);
    }
    setPhase("scored");
  };

  const missedTopics = () => {
    const missed = new Set<string>();
    results.forEach((r, i) => {
      if (!r.correct) missed.add(questions[i]?.topic || "General");
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

  const saveQuizAttempt = async () => {
    const score = results.filter((r) => r.correct).length;
    const content = [
      `Score: ${score}/${questions.length}`,
      "",
      ...questions.map((q, i) => {
        const r = results[i];
        return `${i + 1}. ${q.question}\n${r?.correct ? "✅ Correct" : "❌ Missed"} — ${q.explanation}`;
      }),
    ].join("\n");
    try {
      await saveTutorItem({
        folder: "Saved Quizzes",
        title: `Quiz — ${new Date().toLocaleDateString()} (${score}/${questions.length})`,
        content,
      });
      toast.success("Saved to Saved Quizzes");
    } catch {
      toast.error("Could not save this quiz attempt. Please retry.");
    }
  };

  const score = results.filter((r) => r.correct).length;
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
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-gray-500">
            Generate a quiz from your uploaded material — questions and answers are scored from
            real backend content only.
          </p>
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
          <p className="mt-2 text-sm font-medium text-gray-800">{currentQuestion.question}</p>

          {currentQuestion.questionFormat === "mcq" ? (
            <div className="mt-3 space-y-2">
              {currentQuestion.options.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    selected === i
                      ? "border-primary-400 bg-primary-100"
                      : "border-gray-300 bg-white hover:border-primary-400"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <input
              value={shortAnswerInput}
              onChange={(e) => setShortAnswerInput(e.target.value)}
              placeholder="Type your answer…"
              className="mt-3 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-800 outline-none transition-colors duration-300 focus:border-primary-400"
            />
          )}

          <button
            type="button"
            onClick={submitAnswer}
            disabled={
              currentQuestion.questionFormat === "mcq"
                ? selected === null
                : !shortAnswerInput.trim()
            }
            className="mt-4 self-start rounded-lg bg-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-300 active:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {qIndex + 1 < questions.length ? "Next" : "Finish"}
          </button>
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
