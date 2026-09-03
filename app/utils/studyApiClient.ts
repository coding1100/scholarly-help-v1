import { fetchWithAuthRetry } from "@/app/lib/authSession";
import { dispatchBillingGateEvent, isBillingGateResponseBody } from "@/app/lib/client/billingGateCodes";

const STUDY_API_BASE = "/api/study";
const ACTIVE_STUDY_SESSION_KEY = "sh_active_study_session_id_v1";
const GUEST_STUDY_USER_KEY = "sh_guest_study_user_id_v1";

export interface StudySessionDto {
  _id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  tutorState?: Record<string, unknown>;
}

export type StudySourceKind = "text" | "url" | "file" | "youtube";

export interface CreateSourceInput {
  kind: StudySourceKind;
  name: string;
  text: string;
}

export type StudySourceIndexStatus =
  | "pending"
  | "indexed"
  | "keyword_only"
  | "failed";

export interface StudySourceDto {
  _id: string;
  sessionId: string;
  kind: StudySourceKind;
  name: string;
  chunkCount: number;
  createdAt: string;
  /** Durable RAG index status; "pending" right after upload until it finishes. */
  indexStatus?: StudySourceIndexStatus;
  indexedAt?: string;
}

export type StudyArtifactType =
  | "outline"
  | "syllabus"
  | "notes"
  | "summary"
  | "flashcards"
  | "quizzes";

export type StudyLearningMode = "research" | "quiz" | "exam";

export interface GenerateStudyArtifactOptions {
  mode?: StudyLearningMode;
  examTopics?: string[];
  difficulty?: "easy" | "medium" | "hard" | "adaptive";
  questionFormat?: "mcq" | "short_answer" | "mixed";
  questionCount?: number;
  preAssessment?: boolean;
  academicLevel?: "high_school" | "college" | "phd";
  rubric?: string;
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
  const existing = localStorage.getItem("user_id");
  if (existing?.startsWith("guest_")) return existing;
  // Mint a stable per-guest id so guest Study data is isolated and can be
  // migrated to the real account on sign-up. Overwritten with the real
  // user_id at login (see auth/callback).
  const savedGuestId = localStorage.getItem(GUEST_STUDY_USER_KEY);
  if (savedGuestId?.startsWith("guest_")) return savedGuestId;
  const guestId = `guest_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  localStorage.setItem(GUEST_STUDY_USER_KEY, guestId);
  if (!existing) localStorage.setItem("user_id", guestId);
  return guestId;
}

async function callStudyApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetchWithAuthRetry(studyApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": getUserId(),
      ...(init?.headers || {}),
    },
  });

  const payload = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !payload.success || payload.data === undefined) {
    if (isBillingGateResponseBody(res.status, payload)) dispatchBillingGateEvent();
    throw new Error(payload.error || `Study API failed for ${path}`);
  }
  return payload.data;
}

function studyApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${STUDY_API_BASE}${
    normalizedPath.endsWith("/") ? normalizedPath : `${normalizedPath}/`
  }`;
}

export function getActiveStudySessionId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_STUDY_SESSION_KEY);
}

export function setActiveStudySessionId(sessionId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_STUDY_SESSION_KEY, sessionId);
}

/**
 * Forget the active session (e.g. after "Back to start" deletes it). Without
 * this, bootstrap would keep resolving a now-deleted id from localStorage.
 */
export function clearActiveStudySessionId() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVE_STUDY_SESSION_KEY);
}

export async function listStudySessions() {
  return callStudyApi<StudySessionDto[]>("/sessions", { method: "GET" });
}

/**
 * Push the study-session-created event to GTM's dataLayer.
 *
 * NOT fired inside createStudySession. A session is created moments before its
 * first source is added, and if that source add fails the session is rolled
 * back — so firing at creation time would report sessions that never really
 * existed for the user. The caller invokes this only once the session AND its
 * first source are both confirmed saved (i.e. the success message is shown).
 *
 * Never let analytics break the app: no-op on the server and swallow failures.
 */
export function trackStudySessionCreated(input: {
  sessionId: string;
  sourceKind?: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as Window & {
      dataLayer?: Array<Record<string, unknown>>;
    };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: "study_session_created",
      study_session_id: input.sessionId,
      ...(input.sourceKind ? { source_kind: input.sourceKind } : {}),
    });
  } catch {
    // GTM unavailable/blocked — must not affect the study flow.
  }
}

export async function createStudySession(title: string) {
  return callStudyApi<StudySessionDto>("/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

/** Move a guest's study sessions onto the now-authenticated account. */
export async function claimGuestStudyData(guestUserId: string) {
  return callStudyApi<{ migrated: number }>("/claim-guest", {
    method: "POST",
    body: JSON.stringify({ guestUserId }),
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
  const form = new FormData();
  form.set("kind", input.kind || "file");
  form.set("name", input.name);
  form.set("file", input.file);

  const res = await fetchWithAuthRetry(studyApiUrl(`/sessions/${sessionId}/sources`), {
    method: "POST",
    headers: {
      "x-user-id": getUserId(),
    },
    body: form,
  });

  const payload = (await res.json()) as ApiEnvelope<StudySourceDto>;
  if (!res.ok || !payload.success || payload.data === undefined) {
    if (isBillingGateResponseBody(res.status, payload)) dispatchBillingGateEvent();
    throw new Error(payload.error || "Study file upload failed");
  }
  return payload.data;
}

export async function getStudySessionDetails(sessionId: string) {
  return callStudyApi<StudySessionDetailsDto>(`/sessions/${sessionId}`, {
    method: "GET",
  });
}

export async function streamStudySourceStatuses(
  sessionId: string,
  onStatuses: (statuses: Array<{ id: string; name: string; indexStatus?: StudySourceIndexStatus }>) => void,
  signal: AbortSignal,
) {
  const response = await fetchWithAuthRetry(studyApiUrl(`/sessions/${sessionId}/events`), {
    headers: { "x-user-id": getUserId(), Accept: "text/event-stream" }, signal, cache: "no-store",
  });
  if (!response.ok || !response.body) throw new Error("Could not open source status stream.");
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
  while (!signal.aborted) {
    const { done, value } = await reader.read(); if (done) return;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n"); buffer = events.pop() || "";
    for (const event of events) {
      if (!event.includes("event: source-status")) continue;
      const data = event.split("\n").find((line) => line.startsWith("data:"))?.slice(5).trim();
      if (data) onStatuses(JSON.parse(data));
    }
  }
}

export async function updateStudySessionTitle(sessionId: string, title: string) {
  return callStudyApi<{ session: StudySessionDto }>(`/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function updateStudySessionTutorState(
  sessionId: string,
  tutorState: Record<string, unknown>,
) {
  return callStudyApi<{ session: StudySessionDto }>(`/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({ tutorState }),
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
  return callStudyApi<{
    type: StudyArtifactType;
    content: unknown;
  }>(
    `/sessions/${sessionId}/generate/${type}`,
    {
      method: "POST",
      body: JSON.stringify({
        mode: options.mode || "research",
        examTopics: options.examTopics || [],
        difficulty: options.difficulty || "adaptive",
        questionFormat: options.questionFormat || "mcq",
        questionCount: options.questionCount,
        preAssessment: Boolean(options.preAssessment),
        academicLevel: options.academicLevel || "college",
        rubric: options.rubric || "",
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
    tutorContext?: string;
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
  const res = await fetchWithAuthRetry(studyApiUrl(`/sessions/${sessionId}/tutor`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": getUserId(),
    },
    body: JSON.stringify({
      message,
      attachments,
      stream: true,
      mode: options?.mode || "research",
      examTopics: options?.examTopics || [],
      tutorContext: options?.tutorContext || "",
    }),
  });
  if (!res.ok || !res.body) {
    const payload = (await res.json().catch(() => null)) as ApiEnvelope<unknown> | null;
    if (isBillingGateResponseBody(res.status, payload)) dispatchBillingGateEvent();
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
    let payload: {
      text?: string;
      citations?: number[];
      message?: string;
      provenance?: "source" | "general" | "image";
    };
    try {
      payload = JSON.parse(jsonRaw);
    } catch {
      // A truncated final event (connection cut mid-write) would otherwise throw
      // out of the whole stream and REPLACE an already-delivered answer with an
      // error. Skip the unparseable block instead — the text streamed so far
      // stays intact.
      return;
    }
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
