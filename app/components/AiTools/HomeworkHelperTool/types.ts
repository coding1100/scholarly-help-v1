export type HomeworkInputType = "math" | "physics" | "text" | "text-lit" | "code";
export type HomeworkMode = "stepbystep" | "socratic" | "explain" | "checkwork" | "solution";
export type HomeworkStatus = "detected" | "in_progress" | "completed";

export type ScreenName =
  | "home"
  | "analyzing"
  | "detected"
  | "modeSelect"
  | "solving"
  | "complete"
  | "practice"
  | "myhomework";

export interface HomeworkSessionDTO {
  session_id: string;
  source: "text" | "image" | "document";
  question: string;
  subject: string;
  topic: string;
  level: string;
  method: string;
  method_formula: string | null;
  input_type: HomeworkInputType;
  answer: string;
  content: {
    stepByStep?: StepDTO[];
    socratic?: SocraticQuestionDTO[];
    explain?: ExplainDTO;
    practiceSet?: PracticeQuestionDTO[];
  };
  status: HomeworkStatus;
  mode: HomeworkMode | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StepDTO {
  title: string;
  body: string;
  formula: string;
  why: string;
}

export interface SocraticQuestionDTO {
  q: string;
  acceptable_answer_summary: string;
  correct_msg: string;
  hints: string[];
}

export interface ExplainDTO {
  concept_name: string;
  body: string;
}

export interface PracticeQuestionDTO {
  q: string;
  acceptable_answer_summary: string;
  solution: string;
  hint: string;
}

export interface CheckWorkResult {
  status: "correct" | "partial" | "wrong";
  title: string;
  body: string;
}

export const INPUT_TOOLKITS: Record<HomeworkInputType, { label: string; syms: string[] } | null> = {
  math: { label: "Math keyboard", syms: ["x²", "√", "π", "a÷b", "( )", "≤", "≥", "≠", "±"] },
  physics: { label: "Math + Physics keyboard", syms: ["F=ma", "Δ", "θ", "→", "N", "kg", "m/s²", "≤", "≥"] },
  "text-lit": { label: "Text — with literary formatting", syms: ["“ ”", "—", "…", "¶ new para"] },
  code: { label: "Code snippets", syms: ["for x in items:", "if", "%", "==", "+=", "return", "def "] },
  text: null,
};
