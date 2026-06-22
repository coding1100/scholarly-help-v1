"use client";

import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

export const ACADEMIC_PAYWALL_MESSAGE =
  "Your token balance is exhausted. Please upgrade to continue using AI tools.";

const getApiBaseUrl = () => {
  const baseUrl = (process.env.NEXT_PUBLIC_NGROX_URL || "").replace(/\/$/, "");
  return baseUrl.endsWith("/v1") ? baseUrl : `${baseUrl}/v1`;
};

const getAccessToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isTokenBalanceError = (error: unknown) =>
  // NOTE: Token enforcement should be handled entirely by the backend.
  // Keeping previous frontend paywall detection here (commented) in case we
  // want to re-enable client-side messaging later.
  //
  // axios.isAxiosError(error) && error.response?.status === 403;
  false;

export const getAcademicErrorMessage = (error: unknown, fallback: string) =>
  // NOTE: Do not swap error messages based on token status on the client.
  // Keep the old logic commented (do not delete) so behavior can be restored.
  //
  // isTokenBalanceError(error) ? ACADEMIC_PAYWALL_MESSAGE : fallback;
  fallback;

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
};

const unwrapApiData = <T>(payload: T | ApiEnvelope<T>): T => {
  // Backend wraps responses as { success, message, data }
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

// Default network timeout for research-assistant API calls. Generous enough for
// LLM-backed endpoints, but bounded so a hung backend doesn't leave the UI
// stuck on a spinner forever.
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

export type DocumentRecord = {
  id: string;
  _id?: string;
  title: string;
  content?: string;
  updatedAt?: string;
  updated_at?: string;
  createdAt?: string;
  created_at?: string;
  is_published?: boolean;
};

export type ResearchChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ResearchReviewFeedback = {
  grammar: string;
  clarity: string;
  structure: string;
  evidence_gaps: string;
  citation_opportunities: string;
};

export type SourceRecord = {
  id: string;
  _id?: string;
  title: string;
  authors?: string[];
  year?: number;
  type?: "journal" | "book" | "website" | "pdf" | "other" | string;
  doi?: string;
  url?: string;
  abstract?: string;
  tags?: string[];
  extracted_text?: string;
};

export const listDocuments = (title?: string) =>
  request<DocumentRecord[]>("/documents", {
    method: "GET",
    params: title ? { title } : undefined,
  });

export const createDocument = (payload: { title: string; content: string }) =>
  request<DocumentRecord>("/documents", {
    method: "POST",
    data: payload,
    headers: { "Content-Type": "application/json" },
  });

export const getDocument = (id: string) =>
  request<DocumentRecord>(`/documents/${encodeURIComponent(id)}`, {
    method: "GET",
  });

export const updateDocumentTitle = (id: string, title: string) =>
  request<DocumentRecord>(`/documents/${encodeURIComponent(id)}/title`, {
    method: "PATCH",
    data: { title },
    headers: { "Content-Type": "application/json" },
  });

export const updateDocumentContent = (id: string, content: string) =>
  request<DocumentRecord>(`/documents/${encodeURIComponent(id)}/content`, {
    method: "PATCH",
    data: { content },
    headers: { "Content-Type": "application/json" },
  });

export const deleteDocument = (id: string) =>
  request<void>(`/documents/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

export const toggleDocumentPublish = (id: string) =>
  request<DocumentRecord>(`/documents/${encodeURIComponent(id)}/publish`, {
    method: "PATCH",
  });

export const generateEssayOutline = (payload: {
  topic: string;
  essay_level: "high school" | "college" | "post graduate";
  essay_type: string;
}) =>
  request<{
    topic?: string;
    keywords?: string[];
    outline?: Array<{ section?: string; title?: string } | string>;
    tokens_used?: number;
  }>("/tools/essay-outline", {
    method: "POST",
    data: payload,
    headers: { "Content-Type": "application/json" },
  });

export const parseDocumentFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return request<{ text: string } | string>("/tools/parse-document", {
    method: "POST",
    data: formData,
  }).then((data) =>
    typeof data === "string" ? { text: data } : { text: data.text || "" },
  );
};

export const generateParagraph = (payload: {
  topic: string;
  headings: string[];
  current_section: string;
  content_sofar: string;
}) =>
  request<{
    section_content: string;
    llm_used?: string;
    tokens_used?: number;
  }>("/tools/paragraph-generator", {
    method: "POST",
    data: payload,
    headers: { "Content-Type": "application/json" },
  });

export type HumanizerTone =
  | "natural"
  | "simple"
  | "polished"
  | "academic"
  | "custom";

export type RewriteIntensity = "normal" | "moderate" | "full";

export type HumanizerDiffSegment = {
  type: "equal" | "insert" | "delete";
  value: string;
};

export type HumanizerResponse = {
  original_text?: string;
  tone_mode?: HumanizerTone;
  selected_tone?: HumanizerTone;
  rewrite_intensity?: RewriteIntensity;
  rewritten_text?: string;
  /** Backward-compatible alias for `rewritten_text`. */
  humanized_text: string;
  diff?: HumanizerDiffSegment[] | null;
  citations_preserved?: boolean;
  citation_count?: number;
  llm_used?: string;
  tokens_used?: number;
};

export const humanizeText = (payload: {
  text: string;
  tone?: HumanizerTone;
  rewrite_intensity?: RewriteIntensity;
  custom_tone_instruction?: string;
}) =>
  request<HumanizerResponse>("/tools/humanizer", {
    method: "POST",
    data: {
      text: payload.text,
      tone_mode: payload.tone || "natural",
      rewrite_intensity: payload.rewrite_intensity || "moderate",
      ...(payload.custom_tone_instruction
        ? { custom_tone_instruction: payload.custom_tone_instruction }
        : {}),
      preserve_citations: true,
      return_diff: false,
    },
    headers: { "Content-Type": "application/json" },
  });

export type ParaphraseToneMode =
  | "standard"
  | "academic"
  | "formal"
  | "casual"
  | "creative"
  | "professional"
  | "persuasive"
  | "simple";

/** Selection rewrites that map onto the existing paraphrase tone modes. */
export const paraphraseSelection = (payload: {
  text: string;
  tone_mode: ParaphraseToneMode;
}) =>
  request<{
    original_text: string;
    paraphrased_text: string;
    tone_mode: string;
    llm_used?: string;
    tokens_used?: number;
  }>("/tools/paraphrase", {
    method: "POST",
    data: { text: payload.text, tone_mode: payload.tone_mode },
    headers: { "Content-Type": "application/json" },
  });

export type RewriteActionName = "strengthen" | "counter" | "tense";
export type RewriteTense = "past" | "present" | "future";

/** Content-changing selection rewrites not covered by paraphrase tone modes. */
export const rewriteAction = (payload: {
  text: string;
  action: RewriteActionName;
  tense?: RewriteTense;
  topic?: string;
}) =>
  request<{
    original_text: string;
    result_text: string;
    action: RewriteActionName;
    tense?: RewriteTense;
    mode: "append" | "replace";
    llm_used?: string;
    tokens_used?: number;
  }>("/tools/rewrite-action", {
    method: "POST",
    data: {
      text: payload.text,
      action: payload.action,
      ...(payload.tense ? { tense: payload.tense } : {}),
      ...(payload.topic ? { topic: payload.topic } : {}),
    },
    headers: { "Content-Type": "application/json" },
  });

export const sendResearchChat = (payload: {
  messages: ResearchChatMessage[];
  document_content?: string;
  citation_style?: string;
}) =>
  request<{ reply: string; llm_used: string; tokens_used: number }>(
    "/tools/research-chat",
    {
      method: "POST",
      data: payload,
      headers: { "Content-Type": "application/json" },
    },
  );

export const runResearchReview = (payload: {
  content: string;
  document_title?: string;
  citation_style?: string;
}) =>
  request<{
    feedback: ResearchReviewFeedback;
    llm_used: string;
    tokens_used: number;
  }>("/tools/research-review", {
    method: "POST",
    data: payload,
    headers: { "Content-Type": "application/json" },
  });

export const searchCitations = (params: {
  q: string;
  type?: "title" | "doi" | "pmid";
  style?: "APA" | "MLA" | "Chicago" | "Harvard";
}) =>
  request<{
    results: Array<{
      title: string;
      authors: string[];
      year: number;
      journal: string;
      doi: string;
      url: string;
      full_citation: string;
      in_text_citation: string;
    }>;
    total: number;
  }>("/tools/citation-search", {
    method: "GET",
    params: {
      q: params.q,
      type: params.type || "title",
      style: params.style || "APA",
    },
  });

export const listSources = (q?: string) =>
  request<SourceRecord[]>("/sources", {
    method: "GET",
    params: q ? { q } : undefined,
  });

export const createSource = (payload: {
  title: string;
  authors?: string[];
  year?: number;
  type?: "journal" | "book" | "website" | "pdf" | "other";
  doi?: string;
  url?: string;
  abstract?: string;
  tags?: string[];
}) =>
  request<SourceRecord>("/sources", {
    method: "POST",
    data: payload,
    headers: { "Content-Type": "application/json" },
  });

export const uploadSource = (
  file: File,
  fields: Record<string, unknown> = {},
) => {
  const formData = new FormData();
  formData.append("file", file);

  Object.entries(fields).forEach(([key, value]) => {
    if (value == null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`${key}[]`, String(item)));
      return;
    }
    formData.append(key, String(value));
  });

  return request<SourceRecord>("/sources/upload", {
    method: "POST",
    data: formData,
  });
};

export const getSource = (id: string) =>
  request<SourceRecord>(`/sources/${encodeURIComponent(id)}`, {
    method: "GET",
  });

export const removeSource = (id: string) =>
  request<void>(`/sources/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

export const getAxiosStatus = (error: unknown) =>
  (error as AxiosError | undefined)?.response?.status;

export type ProductTourState = {
  academic_research_assistant_tour_completed: boolean;
  ai_study_workspace_tour_completed: boolean;
};

/** @deprecated Use ProductTourState */
export type AcademicResearchTourState = ProductTourState;

export const getProductTourState = () =>
  request<ProductTourState>("/users/me/tour-state", {
    method: "GET",
  });

export const getAcademicResearchTourState = getProductTourState;

export const completeAcademicResearchTour = () =>
  request<ProductTourState>("/users/me/tour-state", {
    method: "PATCH",
    data: { academic_research_assistant_tour_completed: true },
    headers: { "Content-Type": "application/json" },
  });

export const completeStudyWorkspaceTour = () =>
  request<ProductTourState>("/users/me/tour-state", {
    method: "PATCH",
    data: { ai_study_workspace_tour_completed: true },
    headers: { "Content-Type": "application/json" },
  });
