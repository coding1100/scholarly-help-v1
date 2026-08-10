import { fetchWithAuthRetry } from "@/app/lib/authSession";

const TUTOR_AGENT_ID = "education.personal_tutor";
const MICRO_LEARNING_AGENT_ID = "education.micro_learning_agent";
const TUTOR_WORKSPACE_STORAGE_KEY = "sh_tutor_workspace_v1";

const trimTrailingSlash = (url: string) => (url.endsWith("/") ? url.slice(0, -1) : url);

function getTutorGuestId(): string {
  if (typeof window === "undefined") return "guest_server";
  const studyId = localStorage.getItem("user_id");
  if (studyId?.startsWith("guest_")) return studyId;
  const studyGuestId = localStorage.getItem("sh_guest_study_user_id_v1");
  if (studyGuestId?.startsWith("guest_")) return studyGuestId;
  const existing = localStorage.getItem("scholarly_guest_user_id");
  if (existing) return existing;
  const guestId = `guest_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  localStorage.setItem("scholarly_guest_user_id", guestId);
  return guestId;
}

const getPublicBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_BASE_URL || "";

  return trimTrailingSlash(url);
};

const PUBLIC_BASE_URL = getPublicBaseUrl();
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

const assertApiConfig = () => {
  if (!PUBLIC_BASE_URL || !API_KEY) {
    throw new Error(
      "AI agent API is not configured. Set NEXT_PUBLIC_BASE_URL and NEXT_PUBLIC_API_KEY.",
    );
  }
};

export interface ChatResponse {
  conversation_id: string;
  message: string;
  agent_id: string;
}

export interface ChatRequest {
  conversation_id: string | null;
  message: string;
}

export type AgentTaskRequest = {
  task: "create_study_schedule" | "create_practice_exam";
  parameters: Record<string, string | number | boolean | string[]>;
};

/** Sends a versioned, machine-readable task instead of prompt-like tool instructions. */
export function sendAgentTask(request: AgentTaskRequest, conversationId: string | null = null) {
  return sendChatMessage(JSON.stringify({ schema_version: 1, ...request }), conversationId);
}

export interface ParsedQuestion {
  number: number;
  question: string;
  options: { letter: string; text: string }[];
  answer: string;
}

export type TutorAcademicLevel = "high_school" | "college" | "phd";
export type TutorAction = "ask_question" | "upload_notes" | "practice";
export type TutorLearningMode =
  | "question_answering"
  | "source_based_learning"
  | "practice_quiz_generator";

export interface TutorProgress {
  sessions_completed?: number;
  practice_sessions_attempted?: number;
  practice_sessions_completed?: number;
  source_sessions?: number;
  average_score?: number;
  weak_topics?: string[];
  mastery_by_topic?: Record<string, number>;
  recent_activity?: string[];
  next_recommended_action?: string;
}

export interface TutorWorkspace {
  subject?: string;
  academic_level?: TutorAcademicLevel;
  learner_name?: string;
  selected_action?: TutorAction;
  selected_mode?: TutorLearningMode;
  progress?: TutorProgress;
  recent_sources?: TutorSource[];
  recent_results?: TutorResponse[];
}

export interface TutorSource {
  source_kind?: string;
  source_name?: string;
}

export interface TutorPracticeOption {
  id: string;
  text: string;
}

export interface TutorPracticeQuestion {
  id: string;
  prompt: string;
  type?: string;
  concept?: string;
  options?: TutorPracticeOption[];
  answer?: string;
  explanation?: string;
}

export interface TutorPracticeSet {
  title?: string;
  instructions?: string;
  questions: TutorPracticeQuestion[];
}

export interface TutorExecuteRequest {
  action: TutorAction;
  learning_mode: TutorLearningMode;
  subject: string;
  academic_level: TutorAcademicLevel;
  learner_name?: string;
  prompt?: string;
  question_count?: number;
  practice_format?: string;
  source_kind?: string;
  source_name?: string;
  source_text?: string;
}

export interface TutorResponse {
  action?: TutorAction;
  learning_mode?: TutorLearningMode;
  subject?: string;
  academic_level?: TutorAcademicLevel;
  learner_name?: string;
  summary?: string | null;
  explanation?: string | null;
  steps?: string[];
  practice_set?: TutorPracticeSet | null;
  key_concepts?: string[];
  progress_snapshot?: TutorProgress;
  suggested_next_actions?: string[];
}

export interface SendChatMessageInput {
  message: string;
  conversationId?: string | null;
  documentContext?: string;
  history?: Array<{ role: "user" | "model"; text: string }>;
  mode?: string;
  level?: string;
  rubric?: string;
  onChunk?: (fullText: string, updatedConversationId?: string) => void;
}

export async function sendChatMessage(
  inputOrMessage: string | SendChatMessageInput,
  conversationId: string | null = null,
  onChunk?: (fullText: string, updatedConversationId?: string) => void
): Promise<ChatResponse> {
  const isInputObj = typeof inputOrMessage === "object" && inputOrMessage !== null;
  const message = isInputObj ? inputOrMessage.message : inputOrMessage;
  const targetConvId = isInputObj ? (inputOrMessage.conversationId ?? conversationId) : conversationId;
  const chunkCallback = isInputObj ? inputOrMessage.onChunk : onChunk;
  const documentContext = isInputObj ? inputOrMessage.documentContext : undefined;
  const history = isInputObj ? inputOrMessage.history : undefined;
  const mode = isInputObj ? inputOrMessage.mode : undefined;
  const level = isInputObj ? inputOrMessage.level : undefined;
  const rubric = isInputObj ? inputOrMessage.rubric : undefined;

  const backendBase =
    process.env.NEXT_PUBLIC_NGROX_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5008/v1";
  const endpoint = `${trimTrailingSlash(backendBase)}/tools/ai-tutor/chat`;

  const response = await fetchWithAuthRetry(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": getTutorGuestId(),
    },
    body: JSON.stringify({
      sessionId: targetConvId,
      message,
      documentContext,
      history,
      mode,
      level,
      rubric,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  let finalConversationId = conversationId || "";
  let fullMessage = "";

  if (response.body && chunkCallback) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let doneFullText = "";

    const processEvent = (eventBlock: string) => {
      const dataLines = eventBlock
        .replace(/\r/g, "")
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.replace(/^data:\s?/, ""));
      if (dataLines.length === 0) return;
      const dataStr = dataLines.join("\n").trim();
      if (!dataStr || dataStr === "[DONE]") return;
      let data: {
        conversation_id?: string;
        sessionId?: string;
        text?: string;
        message?: string;
        content?: string;
        delta?: string;
        fullText?: string;
        error?: string;
      };
      try {
        data = JSON.parse(dataStr);
      } catch {
        throw new Error("The Tutor stream returned an invalid event.");
      }
      if (data.error) throw new Error(data.error);
      if (data.conversation_id || data.sessionId) {
        finalConversationId = data.conversation_id || data.sessionId || finalConversationId;
      }
      doneFullText = data.fullText || doneFullText;
      const delta = data.text || data.message || data.content || data.delta || "";
      if (delta) {
        fullMessage += delta;
        chunkCallback(fullMessage, finalConversationId);
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r/g, "");
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      for (const event of events) {
        processEvent(event);
      }
    }
    buffer += decoder.decode().replace(/\r/g, "");
    if (buffer.trim()) processEvent(buffer);
    if (!fullMessage && doneFullText) {
      fullMessage = doneFullText;
      chunkCallback(fullMessage, finalConversationId);
    }
    if (!fullMessage) throw new Error("No Tutor response was received.");
  } else {
    const text = await response.text();
    const streamMessage = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.replace(/^data:\s*/, ""))
      .filter((line) => line && line !== "[DONE]")
      .map((line) => {
        try {
          const data = JSON.parse(line);
          if (data.conversation_id) finalConversationId = data.conversation_id;
          return data.message || data.content || data.delta || data.text || "";
        } catch {
          return line;
        }
      })
      .join("");

    try {
      const data = JSON.parse(text);
      finalConversationId = data.conversation_id || finalConversationId;
      fullMessage = data.message || data.response || streamMessage || text;
    } catch {
      fullMessage = streamMessage || text;
    }
  }

  return {
    conversation_id: finalConversationId,
    message: fullMessage,
    agent_id: TUTOR_AGENT_ID,
  };
}

/**
 * Send a message to the micro-learning agent
 */
export async function sendMicroLearningMessage(
  message: string,
  conversationId: string | null = null,
): Promise<ChatResponse> {
  assertApiConfig();
  const response = await fetch(
    `${PUBLIC_BASE_URL}/agents/${MICRO_LEARNING_AGENT_ID}/chat`,
    {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = (await response.json()) as Partial<ChatResponse> & {
    conversation_id?: string;
    message?: string;
    agent_id?: string;
  };

  return {
    conversation_id: data.conversation_id || conversationId || "",
    message: data.message || "",
    agent_id: data.agent_id || MICRO_LEARNING_AGENT_ID,
  };
}

export async function getTutorWorkspace(): Promise<TutorWorkspace> {
  if (typeof window === "undefined") return {};

  const savedWorkspace = window.localStorage.getItem(TUTOR_WORKSPACE_STORAGE_KEY);
  if (!savedWorkspace) return {};

  try {
    return JSON.parse(savedWorkspace);
  } catch {
    return {};
  }
}

export async function updateTutorWorkspace(
  workspace: TutorWorkspace
): Promise<TutorWorkspace> {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      TUTOR_WORKSPACE_STORAGE_KEY,
      JSON.stringify(workspace)
    );
  }

  return workspace;
}

export async function executeTutorAction(
  payload: TutorExecuteRequest
): Promise<TutorResponse> {
  const message = `Run this Tutor Tool action as a structured AI learning workflow. Return only valid JSON with these fields: action, learning_mode, subject, academic_level, learner_name, summary, explanation, steps, practice_set, key_concepts, progress_snapshot, suggested_next_actions.

Payload:
${JSON.stringify(payload, null, 2)}`;

  const response = await sendChatMessage(message);
  const content = response.message.trim();
  const jsonText = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(jsonText);
  } catch {
    const jsonStart = jsonText.indexOf("{");
    const jsonEnd = jsonText.lastIndexOf("}");

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      try {
        return JSON.parse(jsonText.slice(jsonStart, jsonEnd + 1));
      } catch {
        // Fall through to the structured fallback below.
      }
    }

    return {
      action: payload.action,
      learning_mode: payload.learning_mode,
      subject: payload.subject,
      academic_level: payload.academic_level,
      learner_name: payload.learner_name,
      summary: null,
      explanation: content,
      steps: [],
      practice_set: null,
      key_concepts: [],
      suggested_next_actions: [],
    };
  }
}

/**
 * Parse quiz response from API into structured questions
 */
export function parseQuiz(quizText: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  // Split by question markers
  const questionBlocks = quizText.split(/\*\*Question \d+:\*\*/).filter(
    (block) => block.trim().length > 0
  );

  questionBlocks.forEach((block, idx) => {
    const parts = block.split("//").map((p) => p.trim()).filter((p) => p);

    if (parts.length < 5) return; // Need at least question + 4 options + answer

    // First part is the question text
    const questionText = parts[0].replace(/\*\*/g, "").trim();

    // Next 4 parts should be options (A, B, C, D)
    const options: { letter: string; text: string }[] = [];
    for (let i = 1; i < 5; i++) {
      const optionMatch = parts[i].match(/^([A-D])\)\s*(.+)$/);
      if (optionMatch) {
        options.push({
          letter: optionMatch[1],
          text: optionMatch[2].trim(),
        });
      }
    }

    // Last part should be the answer
    let answer = "";
    const answerMatch = parts[parts.length - 1].match(/\*\*Answer:\*\*\s*([A-D])/);
    if (answerMatch) {
      answer = answerMatch[1];
    } else {
      // Try to find answer in the block
      const answerRegex = /\*\*Answer:\*\*\s*([A-D])/;
      const match = block.match(answerRegex);
      if (match) {
        answer = match[1];
      }
    }

    if (questionText && options.length === 4 && answer) {
      questions.push({
        number: idx + 1,
        question: questionText,
        options: options,
        answer: answer,
      });
    }
  });

  return questions;
}

/**
 * Parse quiz response from API in "Question X:" or "Question X of Y" format
 */
export function parseQuizFromResponse(quizText: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  const normalizedText = quizText.replace(/\\n/g, '\n');
  const questionRegex = /\*\*Question (\d+)(?:\s+of\s+(\d+))?:\*\*/g;
  const questionMatches = Array.from(normalizedText.matchAll(questionRegex));

  if (questionMatches.length === 0) {
    return questions;
  }

  questionMatches.forEach((match, idx) => {
    const questionNumber = parseInt(match[1]);
    const startIndex = match.index! + match[0].length;
    const endIndex = idx < questionMatches.length - 1 
      ? questionMatches[idx + 1].index! 
      : normalizedText.length;

    const questionBlock = normalizedText.substring(startIndex, endIndex).trim();
    const optionStartRegex = /\n([A-D])\)/;
    const optionStartMatch = questionBlock.match(optionStartRegex);
    
    if (!optionStartMatch) {
      const optionStartMatchInline = questionBlock.match(/([A-D])\)/);
      if (!optionStartMatchInline) return;
    }

    const optionStartIndex = optionStartMatch 
      ? questionBlock.indexOf(optionStartMatch[0])
      : questionBlock.search(/[A-D]\)/);
    
    let questionText = questionBlock.substring(0, optionStartIndex).trim();
    
    questionText = questionText
      .replace(/^###?\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/---+/g, '')
      .replace(/^Question \d+:\s*/, '')
      .trim();

    const options: { letter: string; text: string }[] = [];
    const answerStartIndex = questionBlock.search(/\*\*Answer:\*\*/i);
    const optionsSection = answerStartIndex > -1 
      ? questionBlock.substring(0, answerStartIndex)
      : questionBlock;
    
    const optionRegex = /^([A-D])\)\s*(.+)$/gm;
    let optionMatch;

    while ((optionMatch = optionRegex.exec(optionsSection)) !== null) {
      options.push({
        letter: optionMatch[1],
        text: optionMatch[2].trim(),
      });
    }

    const answerMatch = questionBlock.match(/\*\*Answer:\*\*\s*([A-D])/i);
    const answer = answerMatch ? answerMatch[1] : '';

    if (questionText && options.length >= 2) {
      questions.push({
        number: questionNumber,
        question: questionText,
        options: options,
        answer: answer,
      });
    }
  });

  return questions;
}

/**
 * Generate quiz questions via API
 */
export async function generateQuiz(
  topic: string,
  difficulty: string,
  numberOfQuestions: number = 5,
  conversationId: string | null = null
): Promise<{ questions: ParsedQuestion[]; conversationId: string }> {
  const message = `Generate a quiz about ${topic} with ${numberOfQuestions} multiple choice questions at ${difficulty} difficulty level. Format each question as: **Question [Number]:** [question text] // A) [option] // B) [option] // C) [option] // D) [option] // **Answer:** [letter]`;

  const response = await sendChatMessage(message, conversationId);
  const parsedQuestions = parseQuiz(response.message);

  return {
    questions: parsedQuestions,
    conversationId: response.conversation_id,
  };
}
