export type StudyArtifactType =
  | "notes"
  | "summary"
  | "flashcards"
  | "quizzes";

/** How the AI should teach and prioritize content */
export type StudyLearningMode = "research" | "quiz" | "exam";

export type StudySourceKind = "text" | "url" | "file" | "youtube";

/**
 * Durable RAG indexing status persisted per source. Lets retrieval quality be
 * observed and recovered instead of silently degrading to keyword-only forever
 * when embedding fails or the process stops mid-index.
 */
export type StudySourceIndexStatus =
  | "pending"
  | "indexed"
  | "keyword_only"
  | "failed";

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
  /** Durable RAG indexing status (see StudySourceIndexStatus). */
  indexStatus?: StudySourceIndexStatus;
  /** When the last (re)index attempt completed. */
  indexedAt?: Date;
  /** Embedder used when vectors were produced (detect model drift). */
  embedderId?: string;
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
