import axios from "axios";
import { getAccessToken } from "@/app/lib/authSession";
import type {
  CheckWorkResult,
  HomeworkMode,
  HomeworkSessionDTO,
  PracticeQuestionDTO,
} from "./types";

function baseUrl() {
  return `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/homework-helper`;
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function detectFromText(text: string, signal?: AbortSignal) {
  const res = await axios.post<HomeworkSessionDTO>(
    `${baseUrl()}/sessions`,
    { text },
    { headers: authHeaders(), signal },
  );
  return res.data;
}

export async function detectFromImage(file: File, extraText?: string, signal?: AbortSignal) {
  const form = new FormData();
  form.append("image", file);
  if (extraText) form.append("extra_text", extraText);
  const res = await axios.post<HomeworkSessionDTO>(`${baseUrl()}/sessions/image`, form, {
    headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
    signal,
  });
  return res.data;
}

export async function detectFromDocument(file: File, signal?: AbortSignal) {
  const form = new FormData();
  form.append("file", file);
  const res = await axios.post<HomeworkSessionDTO>(`${baseUrl()}/sessions/document`, form, {
    headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
    signal,
  });
  return res.data;
}

export async function listSessions() {
  const res = await axios.get<HomeworkSessionDTO[]>(`${baseUrl()}/sessions`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function getSession(sessionId: string) {
  const res = await axios.get<HomeworkSessionDTO>(`${baseUrl()}/sessions/${sessionId}`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function deleteSession(sessionId: string) {
  await axios.delete(`${baseUrl()}/sessions/${sessionId}`, { headers: authHeaders() });
}

export async function updateDetection(
  sessionId: string,
  patch: { level?: string; subject?: string; topic?: string },
) {
  const res = await axios.patch<HomeworkSessionDTO>(
    `${baseUrl()}/sessions/${sessionId}/detection`,
    patch,
    { headers: authHeaders() },
  );
  return res.data;
}

export async function generateMode(sessionId: string, mode: HomeworkMode) {
  const res = await axios.post<{ mode: HomeworkMode; content: unknown; session: HomeworkSessionDTO }>(
    `${baseUrl()}/sessions/${sessionId}/mode`,
    { mode },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function askAboutStep(sessionId: string, stepIndex: number, question: string) {
  const res = await axios.post<{ response: string }>(
    `${baseUrl()}/sessions/${sessionId}/ask`,
    { step_index: stepIndex, question },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function proposeMethod(sessionId: string, proposal: string) {
  const res = await axios.post<{ response: string }>(
    `${baseUrl()}/sessions/${sessionId}/propose-method`,
    { proposal },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function answerSocratic(sessionId: string, questionIndex: number, answer: string) {
  const res = await axios.post<{ correct: boolean; feedback: string }>(
    `${baseUrl()}/sessions/${sessionId}/socratic/answer`,
    { question_index: questionIndex, answer },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function getSocraticHint(sessionId: string, questionIndex: number) {
  const res = await axios.post<{ hints: string[] }>(
    `${baseUrl()}/sessions/${sessionId}/socratic/hint`,
    { question_index: questionIndex },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function checkWork(sessionId: string, attemptText: string) {
  const res = await axios.post<CheckWorkResult>(
    `${baseUrl()}/sessions/${sessionId}/check-work`,
    { attempt_text: attemptText },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function generatePractice(sessionId: string) {
  const res = await axios.post<{ questions: PracticeQuestionDTO[] }>(
    `${baseUrl()}/sessions/${sessionId}/practice`,
    {},
    { headers: authHeaders() },
  );
  return res.data;
}

export async function submitPracticeAnswer(sessionId: string, questionIndex: number, answer: string) {
  const res = await axios.post<{ correct: boolean; solution: string }>(
    `${baseUrl()}/sessions/${sessionId}/practice/answer`,
    { question_index: questionIndex, answer },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function completeSession(sessionId: string) {
  const res = await axios.post<HomeworkSessionDTO>(
    `${baseUrl()}/sessions/${sessionId}/complete`,
    {},
    { headers: authHeaders() },
  );
  return res.data;
}
