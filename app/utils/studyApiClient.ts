const STUDY_API_BASE = "/api/study";
const ACTIVE_STUDY_SESSION_KEY = "sh_active_study_session_id_v1";

export interface StudySessionDto {
  _id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type StudySourceKind = "text" | "url" | "file" | "youtube";

export interface CreateSourceInput {
  kind: StudySourceKind;
  name: string;
  text: string;
}

export interface StudySourceDto {
  _id: string;
  sessionId: string;
  kind: StudySourceKind;
  name: string;
  chunkCount: number;
  createdAt: string;
}

export type StudyArtifactType = "notes" | "summary" | "flashcards" | "quizzes";

export type StudyLearningMode = "research" | "quiz" | "exam";

export interface GenerateStudyArtifactOptions {
  mode?: StudyLearningMode;
  examTopics?: string[];
}

export type TutorMessageImageDto = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

export interface TutorMessageDto {
  _id: string;
  sessionId: string;
  role: "user" | "assistant";
  message: string;
  citations: number[];
  provenance?: "source" | "general" | "image";
  attachments?: TutorMessageImageDto[];
  createdAt: string;
}

export interface TutorAttachmentInput {
  type: "image";
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface StudyArtifactDto {
  _id: string;
  sessionId: string;
  type: StudyArtifactType;
  content: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface StudySessionDetailsDto {
  session: StudySessionDto;
  sources: Array<
    StudySourceDto & {
      text: string;
      chunks: string[];
    }
  >;
  artifacts: StudyArtifactDto[];
  tutorMessages: TutorMessageDto[];
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function getUserId() {
  if (typeof window === "undefined") return "anonymous";
  return localStorage.getItem("user_id") || "anonymous";
}

function getAccessToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

async function callStudyApi<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${STUDY_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": getUserId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const payload = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.error || `Study API failed for ${path}`);
  }
  return payload.data;
}

export function getActiveStudySessionId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_STUDY_SESSION_KEY);
}

export function setActiveStudySessionId(sessionId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_STUDY_SESSION_KEY, sessionId);
}

export async function listStudySessions() {
  return callStudyApi<StudySessionDto[]>("/sessions", { method: "GET" });
}

export async function createStudySession(title: string) {
  return callStudyApi<StudySessionDto>("/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function addStudySource(
  sessionId: string,
  input: CreateSourceInput,
) {
  return callStudyApi<StudySourceDto>(`/sessions/${sessionId}/sources`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function addStudySourceFile(
  sessionId: string,
  input: { kind?: StudySourceKind; name: string; file: File },
) {
  const token = getAccessToken();
  const form = new FormData();
  form.set("kind", input.kind || "file");
  form.set("name", input.name);
  form.set("file", input.file);

  const res = await fetch(`${STUDY_API_BASE}/sessions/${sessionId}/sources`, {
    method: "POST",
    headers: {
      "x-user-id": getUserId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const payload = (await res.json()) as ApiEnvelope<StudySourceDto>;
  if (!res.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.error || "Study file upload failed");
  }
  return payload.data;
}

export async function getStudySessionDetails(sessionId: string) {
  return callStudyApi<StudySessionDetailsDto>(`/sessions/${sessionId}`, {
    method: "GET",
  });
}

export async function updateStudySessionTitle(sessionId: string, title: string) {
  return callStudyApi<{ session: StudySessionDto }>(`/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteStudySession(sessionId: string) {
  return callStudyApi<{ deleted: boolean }>(`/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export async function fetchStudyExamTopics(sessionId: string) {
  return callStudyApi<{ topics: string[] }>(`/sessions/${sessionId}/topics`, {
    method: "GET",
  });
}

export async function generateStudyArtifact(
  sessionId: string,
  type: StudyArtifactType,
  options: GenerateStudyArtifactOptions = {},
) {
  return callStudyApi<{ type: StudyArtifactType; content: unknown }>(
    `/sessions/${sessionId}/generate/${type}`,
    {
      method: "POST",
      body: JSON.stringify({
        mode: options.mode || "research",
        examTopics: options.examTopics || [],
      }),
    },
  );
}

export async function askStudyTutor(
  sessionId: string,
  message: string,
  attachments?: TutorAttachmentInput[],
) {
  return callStudyApi<{
    answer: string;
    citations: number[];
    provenance?: "source" | "general" | "image";
  }>(
    `/sessions/${sessionId}/tutor`,
    {
      method: "POST",
      body: JSON.stringify({ message, attachments }),
    },
  );
}

export async function streamStudyTutor(
  sessionId: string,
  message: string,
  attachments: TutorAttachmentInput[] | undefined,
  options: {
    mode?: StudyLearningMode;
    examTopics?: string[];
  } | undefined,
  handlers: {
    onChunk: (text: string) => void;
    onDone?: (payload: {
      citations: number[];
      provenance?: "source" | "general" | "image";
    }) => void;
    onError?: (message: string) => void;
  },
) {
  const token = getAccessToken();
  const res = await fetch(`${STUDY_API_BASE}/sessions/${sessionId}/tutor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": getUserId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message,
      attachments,
      stream: true,
      mode: options?.mode || "research",
      examTopics: options?.examTopics || [],
    }),
  });
  if (!res.ok || !res.body) {
    const payload = (await res.json().catch(() => null)) as ApiEnvelope<unknown> | null;
    throw new Error(payload?.error || "Tutor streaming request failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let receivedAnyChunk = false;
  let receivedDone = false;

  const processEventBlock = (part: string) => {
    const normalized = part.replace(/\r/g, "");
    const lines = normalized.split("\n");
    const eventLine = lines.find((line) => line.startsWith("event:"));
    const dataLines = lines
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.replace(/^data:\s?/, ""));
    if (dataLines.length === 0) return;
    const eventName = eventLine?.replace("event:", "").trim() || "message";
    const jsonRaw = dataLines.join("\n").trim();
    if (!jsonRaw) return;
    const payload = JSON.parse(jsonRaw) as {
      text?: string;
      citations?: number[];
      message?: string;
      provenance?: "source" | "general" | "image";
    };
    if (eventName === "chunk" && payload.text) {
      receivedAnyChunk = true;
      handlers.onChunk(payload.text);
    }
    if (eventName === "done") {
      receivedDone = true;
      handlers.onDone?.({
        citations: payload.citations || [],
        provenance: payload.provenance,
      });
    }
    if (eventName === "error") {
      const errorMessage = payload.message || "Tutor stream failed";
      handlers.onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r/g, "");
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    for (const part of parts) {
      processEventBlock(part);
    }
  }

  const trailing = buffer.trim();
  if (trailing) {
    processEventBlock(trailing);
  }
  if (!receivedAnyChunk && !receivedDone) {
    const fallback = "No tutor response received from the stream.";
    handlers.onError?.(fallback);
    throw new Error(fallback);
  }
}

