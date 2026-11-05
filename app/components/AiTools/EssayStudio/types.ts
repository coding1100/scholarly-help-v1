export type EssayStudioStep =
  | "start"
  | "setup"
  | "thesis"
  | "outline"
  | "draft"
  | "grader"
  | "discussion";

export interface OutlinePoint {
  text: string;
}

export interface BodySection {
  id?: string;
  roman?: string;
  title: string;
  points: OutlinePoint[];
}

export interface EssayOutline {
  intro: OutlinePoint[];
  body: BodySection[];
  conclusion: OutlinePoint[];
}

export interface ThesisOption {
  tag: string;
  text: string;
}

export interface EssayStudioSessionData {
  id: string;
  title: string;
  topic: string;
  assignmentPrompt: string;
  hasRubric: boolean;
  academicLevel: "undergraduate" | "graduate" | "doctoral";
  essayType: string;
  targetWords: number;
  citationStyle: "apa7" | "mla9" | "chicago17" | "harvard" | "none";
  sourcesCount: number;
  researchQuestion: string;
  selectedThesisIndex: number;
  thesisOptions: ThesisOption[];
  outline: EssayOutline | null;
  draft: string;
  aiScore: number;
  aiSkipped: boolean;
  lastUpdated: string;
  stoppedAtStep: EssayStudioStep;
}

export interface RubricCriterionScore {
  name: string;
  score: number;
  maxScore: number;
}

export interface GradeFix {
  pointsGain: number;
  title: string;
  instruction: string;
}

export interface GradeResult {
  letterGrade: string;
  score: number;
  summary: string;
  criteria: RubricCriterionScore[];
  topFixes: GradeFix[];
}
