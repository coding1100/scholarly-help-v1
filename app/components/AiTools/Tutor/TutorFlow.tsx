"use client";

import "katex/dist/katex.min.css";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import FloatingChat from "../FloatingChat/FloatingChat";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import {
  executeTutorAction,
  getTutorWorkspace,
  TutorAcademicLevel,
  TutorAction,
  TutorExecuteRequest,
  TutorLearningMode,
  TutorPracticeSet,
  TutorResponse,
  TutorWorkspace,
  updateTutorWorkspace,
} from "@/app/utilities/api";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import axios from "axios";
import { getAccessToken } from "@/app/lib/authSession";

const academicLevels: {
  value: TutorAcademicLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "high_school",
    label: "High School",
    description: "Foundation and exam-ready explanations",
  },
  {
    value: "college",
    label: "College",
    description: "Deeper coursework and applied practice",
  },
  {
    value: "phd",
    label: "PhD",
    description: "Advanced research-level support",
  },
];

const actionOptions: {
  value: TutorAction;
  mode: TutorLearningMode;
  label: string;
  description: string;
}[] = [
  {
    value: "ask_question",
    mode: "question_answering",
    label: "Ask Question",
    description: "Get an explanation, steps, and practice for one question.",
  },
  {
    value: "upload_notes",
    mode: "source_based_learning",
    label: "Upload Notes",
    description:
      "Use pasted notes or extracted PDF text for source-based learning.",
  },
  {
    value: "practice",
    mode: "practice_quiz_generator",
    label: "Practice",
    description: "Generate a structured quiz and grade it locally.",
  },
];

type PracticeAnswers = Record<string, string>;

function gradePracticeSet(
  practiceSet: TutorPracticeSet,
  answers: PracticeAnswers,
) {
  const results = practiceSet.questions.map((question) => {
    const submitted = answers[question.id];
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s.-]/g, " ").replace(/\b(?:a|an|the)\b/g, " ").replace(/\s+/g, " ").trim();
    const expected = normalize(question.answer || "");
    const received = normalize(String(submitted || ""));
    const option = question.options?.find((item) => normalize(item.id) === received);
    const receivedText = option ? normalize(option.text) : received;
    const expectedOption = question.options?.find((item) => normalize(item.id) === expected);
    const expectedText = expectedOption ? normalize(expectedOption.text) : expected;
    const expectedTokens = new Set(expectedText.split(" ").filter(Boolean));
    const receivedTokens = new Set(receivedText.split(" ").filter(Boolean));
    const overlap = [...expectedTokens].filter((token) => receivedTokens.has(token)).length / Math.max(1, expectedTokens.size);
    const isCorrect = Boolean(expectedText) && (receivedText === expectedText || overlap >= 0.85);

    return {
      id: question.id,
      concept: question.concept || "General",
      correct: isCorrect,
    };
  });

  const total = results.length || 1;
  const correct = results.filter((item) => item.correct).length;
  const weakTopics = [
    ...new Set(
      results.filter((item) => !item.correct).map((item) => item.concept),
    ),
  ];
  const masteredTopics = [
    ...new Set(
      results.filter((item) => item.correct).map((item) => item.concept),
    ),
  ];

  return {
    score: Math.round((correct / total) * 100),
    weakTopics,
    masteredTopics,
  };
}

function formatTutorValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(formatTutorValue).filter(Boolean).join(", ");
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const preferredFields = ["step", "title", "description", "text", "prompt"];
    const preferredText = preferredFields
      .map((field) => formatTutorValue(record[field]))
      .filter(Boolean)
      .join(": ");

    if (preferredText) return preferredText;

    return Object.entries(record)
      .map(([key, item]) => `${key}: ${formatTutorValue(item)}`)
      .filter(Boolean)
      .join(", ");
  }

  return String(value);
}

function TutorMarkdown({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm as any, remarkMath as any]}
      rehypePlugins={[rehypeKatex as any]}
      className={[
        "prose prose-sm max-w-none",
        "prose-headings:mt-3 prose-headings:mb-2 prose-headings:text-black",
        "prose-p:my-2 prose-p:text-gray-700",
        "prose-strong:text-black",
        "prose-a:text-[#155dfc] hover:prose-a:text-[#2b7fff]",
        "prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5",
        "prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5",
        "prose-li:my-1",
        "prose-code:rounded prose-code:bg-black/5 prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:text-black",
        "prose-pre:rounded-lg prose-pre:bg-[#0b1220] prose-pre:p-4 prose-pre:text-gray-100 prose-pre:shadow-sm",
        "prose-pre:overflow-x-auto",
        className,
      ].join(" ")}
      components={{
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        code: ({ className, children, ...props }) => {
          const isBlock = Boolean(className);
          if (!isBlock) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          return (
            <pre className="not-prose">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function TutorFlow() {
  const [workspace, setWorkspace] = useState<TutorWorkspace | null>(null);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [subject, setSubject] = useState("");
  const [academicLevel, setAcademicLevel] =
    useState<TutorAcademicLevel>("high_school");
  const [selectedAction, setSelectedAction] =
    useState<TutorAction>("ask_question");
  const [prompt, setPrompt] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [isExtractingSource, setIsExtractingSource] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [result, setResult] = useState<TutorResponse | null>(null);
  const [answers, setAnswers] = useState<PracticeAnswers>({});
  const [grade, setGrade] = useState<ReturnType<
    typeof gradePracticeSet
  > | null>(null);

  const selectedOption = useMemo(
    () => actionOptions.find((action) => action.value === selectedAction)!,
    [selectedAction],
  );

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const savedWorkspace = await getTutorWorkspace();
        setWorkspace(savedWorkspace);
        setSubject(savedWorkspace.subject || "");
        setAcademicLevel(savedWorkspace.academic_level || "high_school");
        if (savedWorkspace.selected_action) {
          setSelectedAction(savedWorkspace.selected_action);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load Tutor workspace.";
        toast.error(message);
      } finally {
        setIsWorkspaceLoading(false);
      }
    };

    loadWorkspace();
  }, []);

  const getHiddenLearnerName = () => {
    if (typeof window === "undefined") return undefined;
    return window.localStorage.getItem("user_name") || undefined;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }

    if (selectedAction === "upload_notes" && !sourceText.trim()) {
      toast.error("Please paste notes or extracted PDF text.");
      return;
    }

    if (selectedAction !== "upload_notes" && !prompt.trim()) {
      toast.error("Please enter what you want to learn.");
      return;
    }

    const learnerName = getHiddenLearnerName();
    const nextWorkspace: TutorWorkspace = {
      ...workspace,
      subject: subject.trim(),
      academic_level: academicLevel,
      learner_name: learnerName,
      selected_action: selectedAction,
      selected_mode: selectedOption.mode,
      recent_sources: workspace?.recent_sources || [],
      recent_results: workspace?.recent_results || [],
    };

    const payload: TutorExecuteRequest = {
      action: selectedAction,
      learning_mode: selectedOption.mode,
      subject: subject.trim(),
      academic_level: academicLevel,
      learner_name: learnerName,
    };

    if (selectedAction === "upload_notes") {
      payload.source_kind = "text";
      payload.source_name = sourceName.trim() || "Pasted notes";
      payload.source_text = sourceText.trim();
      payload.prompt =
        prompt.trim() ||
        "Summarize the source, explain the core process, and generate practice.";
    } else {
      payload.prompt = prompt.trim();
    }

    if (selectedAction === "practice") {
      payload.question_count = questionCount;
      payload.practice_format = "multiple_choice";
    }

    setIsExecuting(true);
    setGrade(null);
    setAnswers({});

    try {
      trackToolGenerate({ toolName: "Tutor Tool" });
      await updateTutorWorkspace(nextWorkspace);
      const tutorResult = await executeTutorAction(payload);
      const updatedWorkspace: TutorWorkspace = {
        ...nextWorkspace,
        progress: tutorResult.progress_snapshot || nextWorkspace.progress,
        recent_sources:
          selectedAction === "upload_notes"
            ? [
                ...(nextWorkspace.recent_sources || []),
                {
                  source_kind: payload.source_kind,
                  source_name: payload.source_name,
                },
              ]
            : nextWorkspace.recent_sources,
        recent_results: [
          tutorResult,
          ...(nextWorkspace.recent_results || []),
        ].slice(0, 5),
      };

      setResult(tutorResult);
      setWorkspace(updatedWorkspace);
      await updateTutorWorkspace(updatedWorkspace);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to run Tutor action.";
      toast.error(message);
    } finally {
      setIsExecuting(false);
    }
  };

  const extractSourceFile = async (file?: File) => {
    if (!file) return;
    setIsExtractingSource(true);
    try {
      const form = new FormData(); form.append("file", file);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_NGROX_URL}/tools/parse-document`, form, {
        headers: { Authorization: `Bearer ${getAccessToken()}`, "Content-Type": "multipart/form-data" },
      });
      const payload = response.data?.data ?? response.data;
      const extracted = typeof payload === "string" ? payload : payload?.text;
      if (!extracted) throw new Error("No readable text was found in this file.");
      setSourceName(file.name); setSourceText(extracted);
      toast.success("Source document extracted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not extract this document.");
    } finally { setIsExtractingSource(false); }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
  };

  const handleGradePractice = () => {
    if (!result?.practice_set) return;
    setGrade(gradePracticeSet(result.practice_set, answers));
  };

  return (
    <div className="relative flex justify-center bg-linear-to-br from-gray-100 to-gray-200">
      <ToolsApiLoader show={isWorkspaceLoading || isExecuting} />
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-3xl border border-white/40 bg-white/30 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/20 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div>
              <p className="text-xl font-semibold text-black">
                AI Personal Tutor
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Set the subject and academic level, choose an action, then
                review the structured result.
              </p>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-semibold text-black"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Organic Chemistry"
                className="w-full rounded-lg border border-gray-300/50 bg-white/40 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-[#2b7fff]/50 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50"
              />
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-black">
                Academic Level
              </p>
              <div className="grid gap-3">
                {academicLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setAcademicLevel(level.value)}
                    className={`rounded-xl border-2 bg-white/40 p-4 text-left transition-all ${
                      academicLevel === level.value
                        ? "border-[#2b7fff] shadow-lg shadow-[#2b7fff]/20"
                        : "border-gray-300/50 hover:border-gray-400/50"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-black">
                      {level.label}
                    </span>
                    <span className="mt-1 block text-xs text-gray-600">
                      {level.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-black">
                Choose Action
              </p>
              <div className="grid gap-3">
                {actionOptions.map((action) => (
                  <button
                    key={action.value}
                    type="button"
                    onClick={() => setSelectedAction(action.value)}
                    className={`rounded-xl border-2 bg-white/40 p-4 text-left transition-all ${
                      selectedAction === action.value
                        ? "border-[#2b7fff] shadow-lg shadow-[#2b7fff]/20"
                        : "border-gray-300/50 hover:border-gray-400/50"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-black">
                      {action.label}
                    </span>
                    <span className="mt-1 block text-xs text-gray-600">
                      {action.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedAction === "upload_notes" && (
              <div>
                <label
                  htmlFor="sourceName"
                  className="mb-2 block text-sm font-semibold text-black"
                >
                  Source Name
                </label>
                <input
                  id="sourceName"
                  type="text"
                  value={sourceName}
                  onChange={(event) => setSourceName(event.target.value)}
                  placeholder="chapter-3.pdf"
                  className="w-full rounded-lg border border-gray-300/50 bg-white/40 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-[#2b7fff]/50 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50"
                />
                <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  {isExtractingSource ? "Extracting…" : "Upload source document"}
                  <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.txt" disabled={isExtractingSource} onChange={(event) => void extractSourceFile(event.target.files?.[0])} />
                </label>
              </div>
            )}

            <div>
              <label
                htmlFor="prompt"
                className="mb-2 block text-sm font-semibold text-black"
              >
                {selectedAction === "upload_notes"
                  ? "Prompt"
                  : "Question or Practice Prompt"}
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={
                  selectedAction === "practice"
                    ? "Create a focused review set for light-dependent reactions."
                    : "Explain this topic and generate practice."
                }
                rows={4}
                className="w-full rounded-lg border border-gray-300/50 bg-white/40 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-[#2b7fff]/50 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50"
              />
            </div>

            {selectedAction === "upload_notes" && (
              <div>
                <label
                  htmlFor="sourceText"
                  className="mb-2 block text-sm font-semibold text-black"
                >
                  Source text
                </label>
                <textarea
                  id="sourceText"
                  value={sourceText}
                  onChange={(event) => setSourceText(event.target.value)}
                  placeholder="Upload a document above or paste notes here."
                  rows={6}
                  className="w-full rounded-lg border border-gray-300/50 bg-white/40 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-[#2b7fff]/50 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50"
                />
              </div>
            )}

            {selectedAction === "practice" && (
              <div>
                <label
                  htmlFor="questionCount"
                  className="mb-2 block text-sm font-semibold text-black"
                >
                  Question Count
                </label>
                <input
                  id="questionCount"
                  type="number"
                  min={1}
                  max={20}
                  value={questionCount}
                  onChange={(event) =>
                    setQuestionCount(Number(event.target.value) || 1)
                  }
                  className="w-full rounded-lg border border-gray-300/50 bg-white/40 px-4 py-3 text-sm text-black focus:border-[#2b7fff]/50 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isExecuting || isWorkspaceLoading}
              className="w-full rounded-lg bg-[#2b7fff] py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#155dfc] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isExecuting ? "Running Tutor Action..." : "Run Tutor Action"}
            </button>
          </div>
        </form>

        <div className="relative rounded-3xl border border-white/40 bg-white/30 p-6 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/20 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <p className="text-xl font-semibold text-black">
              Results Workspace
            </p>

            {!result ? (
              <div className="mt-6 rounded-xl border border-gray-300/50 bg-white/40 p-5 text-sm text-gray-600">
                Run a Tutor action to see explanation, steps, practice, and progress here.
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {result.summary && (
                  <section className="rounded-xl border border-gray-300/50 bg-white/40 p-5">
                    <h3 className="mb-2 text-base font-semibold text-black">
                      Summary
                    </h3>
                    <TutorMarkdown content={formatTutorValue(result.summary)} />
                  </section>
                )}

                {result.explanation && (
                  <section className="rounded-xl border border-gray-300/50 bg-white/40 p-5">
                    <h3 className="mb-2 text-base font-semibold text-black">
                      Explanation
                    </h3>
                    <TutorMarkdown
                      content={formatTutorValue(result.explanation)}
                    />
                  </section>
                )}

                {result.steps && result.steps.length > 0 && (
                  <section className="rounded-xl border border-gray-300/50 bg-white/40 p-5">
                    <h3 className="mb-3 text-base font-semibold text-black">
                      Steps
                    </h3>
                    <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
                      {result.steps.map((step, index) => (
                        <li key={`${formatTutorValue(step)}-${index}`}>
                          {formatTutorValue(step)}
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {result.key_concepts && result.key_concepts.length > 0 && (
                  <section className="rounded-xl border border-gray-300/50 bg-white/40 p-5">
                    <h3 className="mb-3 text-base font-semibold text-black">
                      Key Concepts
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.key_concepts.map((concept, index) => (
                        <span
                          key={`${formatTutorValue(concept)}-${index}`}
                          className="rounded-full bg-[#2b7fff]/10 px-3 py-1 text-xs font-semibold text-[#155dfc]"
                        >
                          {formatTutorValue(concept)}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {result.practice_set && (
                  <section className="rounded-xl border border-gray-300/50 bg-white/40 p-5">
                    <h3 className="text-base font-semibold text-black">
                      {formatTutorValue(result.practice_set.title) ||
                        "Practice Set"}
                    </h3>
                    {result.practice_set.instructions && (
                      <p className="mt-2 text-sm text-gray-600">
                        {formatTutorValue(result.practice_set.instructions)}
                      </p>
                    )}

                    <div className="mt-5 space-y-5">
                      {result.practice_set.questions.map((question) => (
                        <div
                          key={question.id}
                          className="rounded-xl border border-gray-300/50 bg-white/50 p-4"
                        >
                          <p className="text-sm font-semibold text-black">
                            {formatTutorValue(question.prompt)}
                          </p>
                          {question.options && question.options.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              {question.options.map((option) => (
                                <label
                                  key={option.id}
                                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300/50 bg-white/40 p-3 text-sm text-gray-700"
                                >
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value={option.id}
                                    checked={answers[question.id] === option.id}
                                    onChange={(event) =>
                                      handleAnswerChange(
                                        question.id,
                                        event.target.value,
                                      )
                                    }
                                  />
                                  <span>
                                    {formatTutorValue(option.id)}.{" "}
                                    {formatTutorValue(option.text)}
                                  </span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={answers[question.id] || ""}
                              onChange={(event) =>
                                handleAnswerChange(
                                  question.id,
                                  event.target.value,
                                )
                              }
                              placeholder="Type your answer"
                              className="mt-3 w-full rounded-lg border border-gray-300/50 bg-white/40 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-[#2b7fff]/50 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50"
                            />
                          )}

                          {grade && question.explanation && (
                            <div className="mt-3">
                              <TutorMarkdown
                                content={formatTutorValue(question.explanation)}
                                className="prose-p:text-gray-600"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleGradePractice}
                      className="mt-5 rounded-lg bg-[#2b7fff] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#155dfc]"
                    >
                      Grade Practice Set
                    </button>

                    {grade && (
                      <div className="mt-5 rounded-xl border border-gray-300/50 bg-white/50 p-4">
                        <p className="text-lg font-semibold text-black">
                          Score: {grade.score}%
                        </p>
                        <p className="mt-2 text-sm text-gray-700">
                          Weak topics: {grade.weakTopics.join(", ") || "None"}
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                          Mastered topics:{" "}
                          {grade.masteredTopics.join(", ") || "None"}
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {result.progress_snapshot && (
                  <section className="rounded-xl border border-gray-300/50 bg-white/40 p-5">
                    <h3 className="mb-3 text-base font-semibold text-black">
                      Progress
                    </h3>
                    <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                      <p>
                        Sessions completed:{" "}
                        {result.progress_snapshot.sessions_completed ?? 0}
                      </p>
                      <p>
                        Average score:{" "}
                        {result.progress_snapshot.average_score ?? 0}%
                      </p>
                      <p className="sm:col-span-2">
                        Next recommended action:{" "}
                        {formatTutorValue(
                          result.progress_snapshot.next_recommended_action,
                        ) ||
                          "Not available"}
                      </p>
                    </div>
                  </section>
                )}

                {result.suggested_next_actions &&
                  result.suggested_next_actions.length > 0 && (
                    <section className="rounded-xl border border-gray-300/50 bg-white/40 p-5">
                      <h3 className="mb-3 text-base font-semibold text-black">
                        Suggested Next Actions
                      </h3>
                      <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
                        {result.suggested_next_actions.map((action, index) => (
                          <li key={`${formatTutorValue(action)}-${index}`}>
                            {formatTutorValue(action)}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {result && <FloatingChat />}
    </div>
  );
}
