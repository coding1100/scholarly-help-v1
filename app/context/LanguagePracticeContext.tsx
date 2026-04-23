"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { sendChatMessage } from "../utilities/api";
import { requestTokenUsageRefresh } from "@/app/utils/tokenUsageClient";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type LanguagePracticeStep =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8;

export type Goal = "Travel" | "Work" | "Exams" | "Casual conversation";

export type PracticeArea =
  | "assessment"
  | "goals"
  | "vocabulary"
  | "grammar"
  | "conversation"
  | "pronunciation"
  | "progress";

export type ChatTurn = {
  id: string;
  role: "user" | "ai";
  content: string;
  createdAt: number;
};

export type SkillsProgress = {
  vocabulary: number; // 0..100
  grammar: number; // 0..100
  conversation: number; // 0..100
  pronunciation: number; // 0..100
  consistency: number; // 0..100
};

type AiResult = {
  displayMarkdown: string;
  nextPrompt?: string;
  levelUpdate?: CEFRLevel;
  progressDelta?: Partial<SkillsProgress>;
};

type LanguagePracticeState = {
  step: LanguagePracticeStep;
  setStep: (step: LanguagePracticeStep) => void;

  language: string | null;
  setLanguage: (language: string) => void;

  level: CEFRLevel | null;
  setLevel: (level: CEFRLevel | null) => void;

  goals: Goal[];
  setGoals: (goals: Goal[]) => void;

  progress: SkillsProgress;
  bumpProgress: (delta: Partial<SkillsProgress>) => void;

  conversationId: string | null;
  isAiBusy: boolean;

  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;

  history: Record<PracticeArea, ChatTurn[]>;
  pushTurn: (area: PracticeArea, turn: ChatTurn) => void;
  clearArea: (area: PracticeArea) => void;

  callAi: (args: {
    area: PracticeArea;
    userInput: string;
    hint?: string;
  }) => Promise<AiResult>;
};

const LanguagePracticeContext = createContext<LanguagePracticeState | undefined>(
  undefined
);

const clamp01 = (n: number) => Math.max(0, Math.min(100, n));

function safeJsonExtract(text: string): unknown | null {
  const raw = text.trim();
  // Common failure mode: assistant wraps JSON in ```json ... ```
  const fenced = raw.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1]?.trim() ?? raw;

  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function buildAiMessage(params: {
  language: string | null;
  level: CEFRLevel | null;
  goals: Goal[];
  step: LanguagePracticeStep;
  area: PracticeArea;
  userInput: string;
  hint?: string;
}) {
  const { language, level, goals, step, area, userInput, hint } = params;

  const context = {
    language: language ?? "Unknown (user has not selected yet)",
    level: level ?? "Unknown (determine/adapt automatically)",
    goals,
    step,
    area,
  };

  return [
    "You are a friendly, tutor-like, structured, encouraging language-learning agent (Duolingo-style).",
    "You must adapt difficulty automatically based on the learner’s performance and confidence.",
    "Correct mistakes politely, explain errors simply, and ask follow-up questions.",
    "Roles by area:",
    "- assessment: examiner + coach (mix MCQ + short answers, short & encouraging)",
    "- vocabulary: tutor introducing words contextually + mini practice",
    "- grammar: tutor explaining rule + examples + feedback",
    "- conversation: conversation partner in a real-world scenario (natural, not robotic)",
    "- pronunciation: coach giving phonetic hints and text-based feedback (no audio required)",
    "",
    "Return STRICT JSON only (no markdown fences) with this schema:",
    "{",
    '  "displayMarkdown": string,',
    '  "nextPrompt"?: string,',
    '  "levelUpdate"?: "A1"|"A2"|"B1"|"B2"|"C1"|"C2",',
    '  "progressDelta"?: { "vocabulary"?: number, "grammar"?: number, "conversation"?: number, "pronunciation"?: number, "consistency"?: number }',
    "}",
    "",
    `Context: ${JSON.stringify(context)}`,
    hint ? `Hint: ${hint}` : "",
    "",
    `User input: ${userInput}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function LanguagePracticeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [step, setStep] = useState<LanguagePracticeStep>(1);
  const [language, setLanguage] = useState<string | null>(null);
  const [level, setLevel] = useState<CEFRLevel | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progress, setProgress] = useState<SkillsProgress>({
    vocabulary: 10,
    grammar: 10,
    conversation: 10,
    pronunciation: 10,
    consistency: 10,
  });
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isAiBusy, setIsAiBusy] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [history, setHistory] = useState<Record<PracticeArea, ChatTurn[]>>({
    assessment: [],
    goals: [],
    vocabulary: [],
    grammar: [],
    conversation: [],
    pronunciation: [],
    progress: [],
  });

  const bumpProgress = (delta: Partial<SkillsProgress>) => {
    setProgress((p) => ({
      vocabulary: clamp01(p.vocabulary + (delta.vocabulary ?? 0)),
      grammar: clamp01(p.grammar + (delta.grammar ?? 0)),
      conversation: clamp01(p.conversation + (delta.conversation ?? 0)),
      pronunciation: clamp01(p.pronunciation + (delta.pronunciation ?? 0)),
      consistency: clamp01(p.consistency + (delta.consistency ?? 0)),
    }));
  };

  const pushTurn = (area: PracticeArea, turn: ChatTurn) => {
    setHistory((h) => ({ ...h, [area]: [...h[area], turn] }));
  };

  const clearArea = (area: PracticeArea) => {
    setHistory((h) => ({ ...h, [area]: [] }));
  };

  const callAi: LanguagePracticeState["callAi"] = async ({
    area,
    userInput,
    hint,
  }) => {
    setIsAiBusy(true);
    const userTurn: ChatTurn = {
      id: `u_${Date.now()}`,
      role: "user",
      content: userInput,
      createdAt: Date.now(),
    };
    pushTurn(area, userTurn);

    try {
      const message = buildAiMessage({
        language,
        level,
        goals,
        step,
        area,
        userInput,
        hint,
      });

      const res = await sendChatMessage(message, conversationId);
      setConversationId(res.conversation_id);
      requestTokenUsageRefresh(0);

      const parsed = safeJsonExtract(res.message);
      let ai: AiResult | null = null;

      if (
        parsed &&
        typeof parsed === "object" &&
        parsed !== null &&
        "displayMarkdown" in parsed
      ) {
        const p = parsed as Partial<AiResult>;
        if (typeof p.displayMarkdown === "string") {
          ai = {
            displayMarkdown: p.displayMarkdown,
            nextPrompt: typeof p.nextPrompt === "string" ? p.nextPrompt : undefined,
            levelUpdate:
              p.levelUpdate === "A1" ||
                p.levelUpdate === "A2" ||
                p.levelUpdate === "B1" ||
                p.levelUpdate === "B2" ||
                p.levelUpdate === "C1" ||
                p.levelUpdate === "C2"
                ? p.levelUpdate
                : undefined,
            progressDelta:
              p.progressDelta && typeof p.progressDelta === "object"
                ? (p.progressDelta as Partial<SkillsProgress>)
                : undefined,
          };
        }
      }

      // Fallback if the model doesn't comply
      const result: AiResult =
        ai ??
        ({
          displayMarkdown: res.message,
        } satisfies AiResult);

      if (result.levelUpdate) setLevel(result.levelUpdate);
      if (result.progressDelta) bumpProgress(result.progressDelta);

      const aiTurn: ChatTurn = {
        id: `a_${Date.now() + 1}`,
        role: "ai",
        content: result.displayMarkdown,
        createdAt: Date.now() + 1,
      };
      pushTurn(area, aiTurn);

      return result;
    } finally {
      setIsAiBusy(false);
    }
  };

  const value = useMemo<LanguagePracticeState>(
    () => ({
      step,
      setStep,
      language,
      setLanguage: (l) => setLanguage(l.trim()),
      level,
      setLevel,
      goals,
      setGoals,
      progress,
      bumpProgress,
      conversationId,
      isAiBusy,
      onboardingComplete,
      setOnboardingComplete,
      history,
      pushTurn,
      clearArea,
      callAi,
    }),
    [
      step,
      language,
      level,
      goals,
      progress,
      conversationId,
      isAiBusy,
      onboardingComplete,
      history,
    ]
  );

  return (
    <LanguagePracticeContext.Provider value={value}>
      {children}
    </LanguagePracticeContext.Provider>
  );
}

export function useLanguagePractice() {
  const ctx = useContext(LanguagePracticeContext);
  if (!ctx) throw new Error("useLanguagePractice must be used within provider");
  return ctx;
}

