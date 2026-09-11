import axios from "axios";
import { getAccessToken } from "@/app/lib/authSession";
import type {
  CheckWorkResult,
  DetectionResponseDTO,
  HomeworkMode,
  HomeworkSessionDTO,
  PracticeQuestionDTO,
} from "./types";

function baseUrl() {
  return `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/homework-helper`;
}

/**
 * The backend's OptionalAuthGuard identifies an unauthenticated caller as
 * `guest:<X-User-Id or IP>` (see optional-auth.guard.ts). Without a stable
 * X-User-Id, it falls back to request.ip, which can differ between two
 * requests from the same browser (proxy/load balancer, network change) —
 * a session created under one guest id then 404s on the very next call
 * under another. Every other session-based tool (Essay Grader, AI Tutor,
 * Essay Generator, Study Workspace) mints and sends this same
 * `"user_id"` localStorage value as X-User-Id for exactly that reason; each
 * duplicates its own minting copy, so this mirrors that same convention
 * (the `guest_...` prefix and the "user_id" key) rather than depending on
 * another tool having run first — Homework Helper must work standalone.
 * Login overwrites "user_id" with the real id (see auth/callback), so this
 * naturally stops minting guest ids once the user signs in.
 */
function getOrCreateGuestUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  const existing = window.localStorage.getItem("user_id");
  if (existing) return existing;
  const guestId = `guest_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  window.localStorage.setItem("user_id", guestId);
  return guestId;
}

function authHeaders() {
  const token = getAccessToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-User-Id": getOrCreateGuestUserId(),
  };
}

/**
 * Every backend controller response is wrapped by a global NestJS
 * interceptor (TransformInterceptor, src/main.ts) as
 * `{ success, message, data }` — the actual payload lives under `.data`.
 * Unwrap defensively (fall back to the raw payload) so this still works if
 * a route ever bypasses the interceptor, matching the same `unwrap` pattern
 * already used by Essay Grader / Course Planner's API clients.
 */
function unwrap<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

export async function detectFromText(text: string, signal?: AbortSignal) {
  const res = await axios.post(
    `${baseUrl()}/sessions`,
    { text },
    { headers: authHeaders(), signal },
  );
  return unwrap<DetectionResponseDTO>(res.data);
}

export async function detectFromImage(file: File, extraText?: string, signal?: AbortSignal) {
  const form = new FormData();
  form.append("image", file);
  if (extraText) form.append("extra_text", extraText);
  const res = await axios.post(`${baseUrl()}/sessions/image`, form, {
    headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
    signal,
  });
  return unwrap<DetectionResponseDTO>(res.data);
}

export async function detectFromDocument(file: File, signal?: AbortSignal) {
  const form = new FormData();
  form.append("file", file);
  const res = await axios.post(`${baseUrl()}/sessions/document`, form, {
    headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
    signal,
  });
  return unwrap<DetectionResponseDTO>(res.data);
}

export async function createSessionsFromDetection(
  detectionId: string,
  questionIndices: number[],
) {
  const res = await axios.post(
    `${baseUrl()}/sessions/from-detection`,
    { detection_id: detectionId, question_indices: questionIndices },
    { headers: authHeaders() },
  );
  return unwrap<HomeworkSessionDTO[]>(res.data);
}

export async function listSessions() {
  const res = await axios.get(`${baseUrl()}/sessions`, {
    headers: authHeaders(),
  });
  return unwrap<HomeworkSessionDTO[]>(res.data);
}

export async function getSession(sessionId: string) {
  const res = await axios.get(`${baseUrl()}/sessions/${sessionId}`, {
    headers: authHeaders(),
  });
  return unwrap<HomeworkSessionDTO>(res.data);
}

export async function deleteSession(sessionId: string) {
  await axios.delete(`${baseUrl()}/sessions/${sessionId}`, { headers: authHeaders() });
}

export async function updateDetection(
  sessionId: string,
  patch: { level?: string; subject?: string; topic?: string },
) {
  const res = await axios.patch(
    `${baseUrl()}/sessions/${sessionId}/detection`,
    patch,
    { headers: authHeaders() },
  );
  return unwrap<HomeworkSessionDTO>(res.data);
}

export async function generateMode(sessionId: string, mode: HomeworkMode) {
  const res = await axios.post(
    `${baseUrl()}/sessions/${sessionId}/mode`,
    { mode },
    { headers: authHeaders() },
  );
  return unwrap<{ mode: HomeworkMode; content: unknown; session: HomeworkSessionDTO }>(res.data);
}

export async function askAboutStep(sessionId: string, stepIndex: number, question: string) {
  const res = await axios.post(
    `${baseUrl()}/sessions/${sessionId}/ask`,
    { step_index: stepIndex, question },
    { headers: authHeaders() },
  );
  return unwrap<{ response: string }>(res.data);
}

export async function proposeMethod(sessionId: string, proposal: string) {
  const res = await axios.post(
    `${baseUrl()}/sessions/${sessionId}/propose-method`,
    { proposal },
    { headers: authHeaders() },
  );
  return unwrap<{ response: string }>(res.data);
}

export async function answerSocratic(sessionId: string, questionIndex: number, answer: string) {
  const res = await axios.post(
    `${baseUrl()}/sessions/${sessionId}/socratic/answer`,
    { question_index: questionIndex, answer },
    { headers: authHeaders() },
  );
  return unwrap<{ correct: boolean; feedback: string }>(res.data);
}

export async function getSocraticHint(sessionId: string, questionIndex: number) {
  const res = await axios.post(
    `${baseUrl()}/sessions/${sessionId}/socratic/hint`,
    { question_index: questionIndex },
    { headers: authHeaders() },
  );
  return unwrap<{ hints: string[] }>(res.data);
}

export async function checkWork(sessionId: string, attemptText: string) {
  const res = await axios.post(
    `${baseUrl()}/sessions/${sessionId}/check-work`,
    { attempt_text: attemptText },
    { headers: authHeaders() },
  );
  return unwrap<CheckWorkResult>(res.data);
}

export async function generatePractice(sessionId: string) {
  const res = await axios.post(
    `${baseUrl()}/sessions/${sessionId}/practice`,
    {},
    { headers: authHeaders() },
  );
  return unwrap<{ questions: PracticeQuestionDTO[] }>(res.data);
}

export async function submitPracticeAnswer(sessionId: string, questionIndex: number, answer: string) {
  const res = await axios.post(
    `${baseUrl()}/sessions/${sessionId}/practice/answer`,
    { question_index: questionIndex, answer },
    { headers: authHeaders() },
  );
  return unwrap<{ correct: boolean; solution: string }>(res.data);
}

export async function completeSession(sessionId: string) {
  const res = await axios.post(
    `${baseUrl()}/sessions/${sessionId}/complete`,
    {},
    { headers: authHeaders() },
  );
  return unwrap<HomeworkSessionDTO>(res.data);
}
