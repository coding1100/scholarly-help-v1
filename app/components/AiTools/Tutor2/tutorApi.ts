"use client";

import axios, { type AxiosRequestConfig } from "axios";
import { getAccessToken } from "@/app/lib/authSession";

// Re-export the Study API surface Tutor2 builds on (sessions, sources,
// streaming tutor chat, artifact generation) — already thorough and
// well-typed; nothing here duplicates it.
export * from "@/app/utils/studyApiClient";

const SOURCE_TOOL = "ai-tutor";

/**
 * "Save Note" / "Save Progress" / "Saved Quizzes" persist through the
 * tool-agnostic NestJS `documents` + `folders` API (same backend the Academic
 * Research Assistant uses), scoped by `source_tool: "ai-tutor"` so saved
 * tutor items never mix with that tool's documents. This client intentionally
 * does NOT import academicResearchApi.ts — the two tools stay decoupled even
 * though they share a backend module.
 */

const getApiBaseUrl = () => {
  const baseUrl = (process.env.NEXT_PUBLIC_NGROX_URL || "").replace(/\/$/, "");
  return baseUrl.endsWith("/v1") ? baseUrl : `${baseUrl}/v1`;
};

const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
};

const unwrapApiData = <T>(payload: T | ApiEnvelope<T>): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    "success" in payload
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
};

const DEFAULT_TIMEOUT_MS = 60_000;

const request = async <T>(
  path: string,
  config: AxiosRequestConfig = {},
): Promise<T> => {
  const response = await axios.request<T | ApiEnvelope<T>>({
    timeout: DEFAULT_TIMEOUT_MS,
    ...config,
    url: `${getApiBaseUrl()}${path}`,
    headers: {
      ...authHeaders(),
      ...(config.headers || {}),
    },
  });
  return unwrapApiData<T>(response.data);
};

export type TutorFolderKind = "Research Notes" | "Solved Homeworks" | "Saved Quizzes";

export type TutorFolderRecord = {
  id: string;
  _id?: string;
  name: string;
  source_tool?: string;
};

export type TutorDocumentRecord = {
  id: string;
  _id?: string;
  title: string;
  content?: string;
  folder_id?: string | null;
  source_tool?: string;
  source_payload?: Record<string, unknown> | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

export const listTutorFolders = () =>
  request<TutorFolderRecord[]>("/documents/folders", {
    method: "GET",
    params: { source_tool: SOURCE_TOOL },
  });

export const createTutorFolder = (name: TutorFolderKind) =>
  request<TutorFolderRecord>("/documents/folders", {
    method: "POST",
    data: { name, source_tool: SOURCE_TOOL },
    headers: { "Content-Type": "application/json" },
  });

/**
 * Idempotent "get or create" for the three fixed tutor folders — callers
 * never need to check existence themselves before saving an item.
 */
export const ensureTutorFolder = async (
  name: TutorFolderKind,
): Promise<TutorFolderRecord> => {
  const existing = await listTutorFolders();
  const found = existing.find((f) => f.name === name);
  if (found) return found;
  return createTutorFolder(name);
};

/**
 * The backend's GET /documents only filters by `title`/`source_tool` (no
 * `folder_id` query param exists), so folder scoping is applied client-side
 * on the full `source_tool: "ai-tutor"` list.
 */
export const listTutorDocuments = async (folderId?: string) => {
  const docs = await request<TutorDocumentRecord[]>("/documents", {
    method: "GET",
    params: { source_tool: SOURCE_TOOL },
  });
  if (!folderId) return docs;
  return docs.filter((doc) => (doc.folder_id || null) === folderId);
};

export const createTutorDocument = (payload: {
  title: string;
  content: string;
  folder_id?: string;
}) =>
  request<TutorDocumentRecord>("/documents", {
    method: "POST",
    data: { ...payload, source_tool: SOURCE_TOOL },
    headers: { "Content-Type": "application/json" },
  });

export const deleteTutorDocument = (id: string) =>
  request<void>(`/documents/${encodeURIComponent(id)}`, { method: "DELETE" });

/**
 * Save an item (a research note, an assignment-progress snapshot, or a
 * completed quiz attempt) into its fixed folder, creating the folder on first
 * use. `sourcePayload` carries structured data (e.g. a quiz's questions +
 * score) alongside the human-readable `content`.
 */
export const saveTutorItem = async (input: {
  folder: TutorFolderKind;
  title: string;
  content: string;
}): Promise<TutorDocumentRecord> => {
  const folder = await ensureTutorFolder(input.folder);
  const folderId = folder.id || folder._id;
  return createTutorDocument({
    title: input.title,
    content: input.content,
    folder_id: folderId,
  });
};
