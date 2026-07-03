export type StudyArtifactType =
  | "notes"
  | "summary"
  | "flashcards"
  | "quizzes";

/** How the AI should teach and prioritize content */
export type StudyLearningMode = "research" | "quiz" | "exam";

export type StudySourceKind = "text" | "url" | "file" | "youtube";

export interface StudySession {
  _id?: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySource {
  _id?: string;
  sessionId: string;
  kind: StudySourceKind;
  name: string;
  text: string;
  chunks: string[];
  createdAt: Date;
}

export interface StudyArtifact {
  _id?: string;
  sessionId: string;
  type: StudyArtifactType;
  content: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export type TutorMessageImageAttachment = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

export interface TutorMessage {
  _id?: string;
  sessionId: string;
  role: "user" | "assistant";
  message: string;
  citations: number[];
  provenance?: "source" | "general" | "image";
  attachments?: TutorMessageImageAttachment[];
  createdAt: Date;
}

export interface GenerateArtifactOptions {
  mode?: StudyLearningMode;
  examTopics?: string[];
  /**
   * The artifact content from the previous generation of the same type, if any.
   * When present, the user pressed "Regenerate" because they didn't like it —
   * generation must produce a substantially different version, not a repeat.
   */
  previousContent?: unknown;
}
