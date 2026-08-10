"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiPlus,
  FiBarChart2,
  FiFolder,
  FiCalendar,
  FiFileText,
  FiCompass,
  FiMic,
  FiX,
  FiPaperclip,
  FiUploadCloud,
  FiArrowUp,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { tryConsumeGuestClick } from "@/app/lib/client/guestClickLimits";
import { fetchWithAuthRetry } from "@/app/lib/authSession";
import {
  createStudySession,
  getStudySessionDetails,
  listStudySessions,
  setActiveStudySessionId,
  streamStudyTutor,
} from "@/app/utils/studyApiClient";
import MarkDown from "@/app/components/MarkDown/MarkDown";

// ---------- TYPES ----------
export type DrawerType = "dashboard" | "sessions" | "calendar" | "notes" | null;

interface Message {
  id: string;
  sender: "bot" | "user";
  kind?: "text" | "source" | "outline" | "material_card";
  html?: string;
  text?: string;
  tag?: string;
  source?: { sectionId: string; label: string };
  material?: { label: string; content: string };
  outline?: {
    chapterOrder: string[];
    outlineMeta: Record<string, ChapterMeta>;
    syllabusAdded: boolean;
  };
}

interface QuickReply {
  label: string;
  desc?: string;
  action: () => void;
}

interface CrumbStep {
  label: string;
  fn: () => void;
}

interface DeadlineItem {
  label: string;
  urgency: "urgent" | "soon" | "later";
  due: string;
}

interface TopicMeta {
  name: string;
  status: "ok" | "bad" | "pending";
}

interface ChapterMeta {
  name: string;
  weight: number | null;
  pct: number;
  assessedFrom: string | null;
  topics: TopicMeta[];
}

interface QuestionItem {
  topic: string;
  q: string;
  opts: string[];
  correct: number;
  optsHard: string[];
  correctHard: number;
  explain: string;
  hint: string;
  eli6: string;
  answer?: string;
  questionFormat?: "mcq" | "short_answer";
  source?: string;
  sourceLabel?: string;
}

const SHORT_ANSWER_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in",
  "is", "it", "of", "on", "or", "that", "the", "to", "was", "were", "with",
]);

function shortAnswerMatches(response: string, expected: string): boolean {
  const normalize = (value: string) => value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !SHORT_ANSWER_STOP_WORDS.has(word));
  const responseTokens = new Set(normalize(response));
  const expectedTokens = [...new Set(normalize(expected))];
  if (expectedTokens.length === 0 || responseTokens.size === 0) return false;
  const matches = expectedTokens.filter((token) => responseTokens.has(token)).length;
  const requiredMatches = expectedTokens.length <= 2
    ? expectedTokens.length
    : Math.max(2, Math.ceil(expectedTokens.length * 0.6));
  return matches >= requiredMatches;
}

interface QuizSnapshot {
  score: number;
  wrongTopics: string[];
  chapterKey: string;
  redrillMode: boolean;
  applyRubric: boolean;
}

interface BackendSession {
  id: string;
  title: string;
  updatedAt: string;
}

// Step plan sequence for progress meter after Level step
const STEP_PLANS: Record<string, string[]> = {
  quiz: ["Level", "Rubric", "Mode", "Timing", "Format", "Difficulty"],
  research: ["Level", "Rubric", "Mode", "Time"],
  assignment: ["Level", "Rubric", "Mode", "Assignment"],
  debate: ["Level", "Rubric", "Mode", "Topic"],
};

// ---------- HELPER FUNCTIONS ----------

function getGuestOrUserId(): string {
  if (typeof window === "undefined") return "guest_default";
  const storedUserId = localStorage.getItem("user_id");
  if (storedUserId?.startsWith("guest_")) return storedUserId;
  let guestId = localStorage.getItem("sh_guest_study_user_id_v1");
  if (!guestId?.startsWith("guest_")) {
    guestId = `guest_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem("sh_guest_study_user_id_v1", guestId);
    if (!storedUserId) localStorage.setItem("user_id", guestId);
  }
  return guestId;
}

function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "x-user-id": getGuestOrUserId(),
  };
  return headers;
}

// ---------- HELPER COMPONENTS FOR SAFE HTML & OUTLINE ----------

function MaterialCardMessage({
  label,
  content,
}: {
  label: string;
  content: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const wordCount = content ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full rounded-2xl border border-[#dfe3ff] bg-gradient-to-br from-white to-[#f8f9ff] p-4 text-xs shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5f70ff]/10 text-base font-bold text-[#5f70ff]">
            📄
          </div>
          <div>
            <h4 className="font-bold text-[#242842]">{label || "Uploaded Material"}</h4>
            <p className="text-[11px] text-[#646987]">
              {wordCount > 0 ? `${wordCount} words` : "Course Material"} : Indexed for AI Tutor
            </p>
          </div>
        </div>
        {content && content.length > 100 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg bg-[#eef1ff] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#5f70ff] hover:bg-[#5f70ff]/15"
          >
            {expanded ? "Hide Preview ▲" : "View Preview ▼"}
          </button>
        )}
      </div>

      {expanded && content && (
        <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-[#dfe3ff] bg-white p-3 font-mono text-[11px] text-[#646987]">
          {content.slice(0, 1500)}
          {content.length > 1500 && "..."}
        </div>
      )}
    </div>
  );
}

function SafeMessageHtml({ html }: { html: string }) {
  if (!html) return null;
  return (
    <div className="prose prose-sm max-w-none break-words text-[#242842]">
      <MarkDown content={html} />
    </div>
  );
}

function OutlineMessage({
  snapshot,
  onStartQuiz,
}: {
  snapshot: {
    chapterOrder: string[];
    outlineMeta: Record<string, ChapterMeta>;
    syllabusAdded: boolean;
  };
  onStartQuiz: (key: string) => void;
}) {
  if (!snapshot.chapterOrder || snapshot.chapterOrder.length === 0) {
    return (
      <div className="rounded-xl border border-[#dfe3ff] bg-[#fbfbff] p-4 text-xs text-[#646987]">
        <p className="font-semibold text-[#242842]">Course Outline Ready</p>
        <p className="mt-1">Ask any question in the prompt box below or attach notes to generate custom chapters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {snapshot.chapterOrder.map((key) => {
        const c = snapshot.outlineMeta[key];
        if (!c) return null;
        return (
          <div
            key={key}
            className="mt-2 rounded-xl border border-[#dfe3ff] bg-[#fbfbff] p-3 transition hover:border-[#5f70ff]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#242842]">{c.name}</span>
              <div className="flex items-center gap-2">
                {c.weight !== null ? (
                  <span className="rounded-full border border-[#dfe3ff] px-2 py-0.5 text-[10px] font-mono text-[#646987]">
                    {c.weight}% of grade
                  </span>
                ) : (
                  <span className="rounded-full border border-[#dfe3ff] px-2 py-0.5 text-[10px] font-mono text-[#9398b8] opacity-60">
                    weight unknown
                  </span>
                )}
                {c.pct === 0 && !c.assessedFrom ? (
                  <span className="font-mono text-xs text-[#9398b8] opacity-60">not yet assessed</span>
                ) : (
                  <span className="font-mono text-xs font-semibold text-[#5f70ff]">
                    {c.pct}% {c.assessedFrom && <span className="text-[10px] text-[#9398b8]">({c.assessedFrom})</span>}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onStartQuiz(key)}
                  className="rounded-full bg-[#5f70ff] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#4a5be6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f70ff]"
                >
                  Start Practice ›
                </button>
              </div>
            </div>
            <div className="mt-2 border-t border-[#eef1ff] pt-2">
              {c.topics.map((t, idx) => {
                const cls = t.status === "ok" ? "text-[#10b981]" : t.status === "bad" ? "text-[#ef4444]" : "text-[#9398b8]";
                const icon = t.status === "ok" ? "✓" : t.status === "bad" ? "⚠" : "·";
                return (
                  <div key={idx} className="flex justify-between py-1 text-xs text-[#646987]">
                    <span>{t.name}</span>
                    <span className={`${cls} font-bold`}>{icon}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="mt-2 text-[11px] text-[#9398b8]">
        {snapshot.syllabusAdded
          ? "Course breakdown based on your syllabus and assessments."
          : "Add your syllabus to see grade weighting too."}
      </p>
    </div>
  );
}

export default function AiTutorChat({ initialSessionId }: { initialSessionId?: string }) {
  // ---------- STATE ----------
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [courseChip, setCourseChip] = useState<string>("");
  const [crumbTrail, setCrumbTrail] = useState<CrumbStep[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickReplies, setQuickReplies] = useState<{ options: QuickReply[]; row?: boolean } | null>(null);
  const [showHelper, setShowHelper] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Backend session & loading state
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionStatus, setSessionStatus] = useState<
    "initializing" | "ready" | "error"
  >("initializing");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [backendSessions, setBackendSessions] = useState<BackendSession[]>([]);
  const uploadInFlightRef = useRef(false);

  // Scheduler Ref
  const scheduledTasksRef = useRef<Set<number>>(new Set());

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setTimeout(() => {
      scheduledTasksRef.current.delete(timerId);
      callback();
    }, delay);

    scheduledTasksRef.current.add(timerId);
    return timerId;
  }, []);

  const clearScheduledTasks = useCallback(() => {
    scheduledTasksRef.current.forEach((timerId) => window.clearTimeout(timerId));
    scheduledTasksRef.current.clear();
  }, []);

  useEffect(() => clearScheduledTasks, [clearScheduledTasks]);

  // File Input Refs
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  // Accumulates interim + final Web Speech API results for lecture capture mode
  const liveMicTranscriptRef = useRef<string>("");
  const [isMicCapturingLecture, setIsMicCapturingLecture] = useState(false);
  const isMicCapturingLectureRef = useRef(false);

  // Initialize Speech-to-Text (English only)
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let finalSegment = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalSegment += event.results[i][0].transcript + " ";
          }
        }
        if (finalSegment) {
          if (isMicCapturingLectureRef.current) {
            liveMicTranscriptRef.current += finalSegment;
          } else {
            setInputValue((prev) => (prev ? prev + " " + finalSegment.trim() : finalSegment.trim()));
          }
        }
      };

      rec.onerror = (event: any) => {
        // 'no-speech' is a normal timeout; restart silently for lecture mode
        if (event.error === "no-speech" && isMicCapturingLectureRef.current && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch { /* already started */ }
          return;
        }
        setIsListening(false);
        setIsMicCapturingLecture(false);
      };
      rec.onend = () => {
        if (isMicCapturingLectureRef.current && recognitionRef.current) {
          // Auto-restart so long lectures aren't cut off by browser 60s limit
          try { recognitionRef.current.start(); } catch { /* already started */ }
          return;
        }
        setIsListening(false);
      };
      recognitionRef.current = rec;
      return () => {
        isMicCapturingLectureRef.current = false;
        rec.onend = null;
        try { rec.abort(); } catch { /* already stopped */ }
      };
    }
  }, []);

  /** Standard chat-box dictation (short, fills input field) */
  const toggleListening = () => {
    if (!recognitionRef.current) {
      addBotMessage("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }
    if (isListening && !isMicCapturingLecture) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else if (!isListening) {
      liveMicTranscriptRef.current = "";
      isMicCapturingLectureRef.current = false;
      setIsMicCapturingLecture(false);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  /** Lecture capture mode: mic records long-form and saves as study material */
  const toggleLectureMicCapture = () => {
    if (!recognitionRef.current) {
      addBotMessage("Speech recognition is not supported in this browser.");
      return;
    }
    if (isMicCapturingLecture) {
      // Stop and save the accumulated transcript as a material source
      isMicCapturingLectureRef.current = false;
      try { recognitionRef.current.stop(); } catch { /* ok */ }
      setIsListening(false);
      setIsMicCapturingLecture(false);
      const transcript = liveMicTranscriptRef.current.trim();
      liveMicTranscriptRef.current = "";
      if (transcript && transcript.length > 20) {
        const label = tutorState._pendingCourseLabel || "Live Lecture Recording";
        setUploadedSourceText(transcript);
        confirmMaterial(label, "live-lecture.txt", transcript);
      } else {
        addBotMessage("No speech was captured. Make sure your microphone is active and speak in English.");
      }
    } else {
      liveMicTranscriptRef.current = "";
      isMicCapturingLectureRef.current = true;
      setIsMicCapturingLecture(true);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        isMicCapturingLectureRef.current = false;
        setIsListening(false);
        setIsMicCapturingLecture(false);
      }
    }
  };

  // Drawers & Calendar State
  const [calendarTab, setCalendarTab] = useState<string>("all");
  const [showNotesToggle, setShowNotesToggle] = useState<boolean>(false);
  const [showGuideToggle, setShowGuideToggle] = useState<boolean>(false);
  const [uploadedSourceText, setUploadedSourceText] = useState<string>("");
  const [flashedSection, setFlashedSection] = useState<string | null>(null);

  // Main state machine state
  const [tutorState, setTutorState] = useState<{
    level: string | null;
    rubric: string | null;
    studyStyle: "balanced" | "conceptual" | "cramming";
    mode: "research" | "quiz" | "assignment" | "debate" | null;
    examFormat: string | null;
    difficulty: string | null;
    quizFormat: "mcq" | "short" | "mixed" | null;
    timing: "soon" | "plenty" | null;
    researchTime: string | null;
    qIndex: number;
    score: number;
    awaiting: string | null;
    applyRubric: boolean;
    chapterKey: string;
    wrongTopics: string[];
    activeSet: QuestionItem[];
    redrillMode: boolean;
    syllabusAdded: boolean;
    sessionStart: number;
    chaptersTouched: string[];
    chapterOrder: string[];
    skipMode: boolean;
    _materialConfirmed?: boolean;
    _pendingCourseLabel?: string;
  }>({
    level: null,
    rubric: null,
    studyStyle: "balanced",
    mode: null,
    examFormat: null,
    difficulty: null,
    quizFormat: null,
    timing: null,
    researchTime: null,
    qIndex: 0,
    score: 0,
    awaiting: null,
    applyRubric: false,
    chapterKey: "ch1",
    wrongTopics: [],
    activeSet: [],
    redrillMode: false,
    syllabusAdded: false,
    sessionStart: Date.now(),
    chaptersTouched: [],
    chapterOrder: [],
    skipMode: false,
  });

  // Calendar Deadlines Data
  const [calendarData, setCalendarData] = useState<Record<string, DeadlineItem[] | null>>({
    bio: null,
    chem: null,
    hist: null,
  });

  // Outline Metadata (Dynamic)
  const [outlineMeta, setOutlineMeta] = useState<Record<string, ChapterMeta>>({});

  // Dynamic Course Practice Sets
  const [chapters, setChapters] = useState<Record<string, { name: string; plain: QuestionItem[]; scenario: QuestionItem[] }>>({});

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef(start);
  startRef.current = start;
  const sessionIdRef = useRef("");
  const sessionInitPromiseRef = useRef<Promise<{
    id: string;
    restored: boolean;
  }> | null>(null);
  const initialFlowStartedRef = useRef(false);

  const loadBackendSession = useCallback(async (id: string) => {
    const details = await getStudySessionDetails(id);
    sessionIdRef.current = id;
    setSessionId(id);
    setActiveStudySessionId(id);
    setCourseChip(details.session.title ? `· ${details.session.title}` : "");
    setUploadedSourceText(
      details.sources.map((source) => source.text || "").filter(Boolean).join("\n\n"),
    );
    if (details.tutorMessages.length > 0) {
      setMessages(
        details.tutorMessages.map((message) => ({
          id: message._id,
          sender: message.role === "user" ? "user" as const : "bot" as const,
          text: message.message,
        })),
      );
      setQuickReplies(null);
      setShowHelper(false);
      return true;
    }
    return false;
  }, []);

  /**
   * One shared bootstrap for every Tutor action. React state is intentionally
   * not used as the source of truth here: callbacks created while the initial
   * request is in flight can otherwise retain an empty sessionId. Keeping the
   * in-flight promise and resolved id in refs makes upload/drop/send safe even
   * when the user acts immediately after the UI appears.
   */
  const ensureBackendSession = useCallback(() => {
    if (sessionIdRef.current) {
      return Promise.resolve({ id: sessionIdRef.current, restored: true });
    }
    if (sessionInitPromiseRef.current) return sessionInitPromiseRef.current;

    setSessionStatus("initializing");
    const task = (async () => {
      const sessions = await listStudySessions();
      const normalized = sessions.map((session) => ({
        id: session._id,
        title: session.title,
        updatedAt: session.updatedAt,
      }));
      setBackendSessions(normalized);

      if (normalized.length > 0) {
        const selected =
          normalized.find((session) => session.id === initialSessionId) ||
          normalized[0];
        const restored = await loadBackendSession(selected.id);
        setSessionStatus("ready");
        setMessages((prev) =>
          prev.filter((message) => message.tag !== "session-init-error"),
        );
        return { id: selected.id, restored };
      }

      const created = await createStudySession("AI Tutor Session");
      sessionIdRef.current = created._id;
      setSessionId(created._id);
      setActiveStudySessionId(created._id);
      setBackendSessions([
        {
          id: created._id,
          title: created.title,
          updatedAt: created.updatedAt,
        },
      ]);
      setSessionStatus("ready");
      setMessages((prev) =>
        prev.filter((message) => message.tag !== "session-init-error"),
      );
      return { id: created._id, restored: false };
    })();

    sessionInitPromiseRef.current = task;
    void task.catch(() => {
      if (sessionInitPromiseRef.current === task) {
        sessionInitPromiseRef.current = null;
      }
      setSessionStatus("error");
    });
    return task;
  }, [initialSessionId, loadBackendSession]);

  // Auto-scroll internal chat thread safely
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, quickReplies, showHelper, isStreaming]);

  // Load or initialize backend session on mount (passing auth/guest headers)
  useEffect(() => {
    let cancelled = false;
    async function initBackendSession() {
      try {
        const result = await ensureBackendSession();
        if (
          !cancelled &&
          !result.restored &&
          !initialFlowStartedRef.current
        ) {
          initialFlowStartedRef.current = true;
          startRef.current();
        }
      } catch (e) {
        console.error("Failed to initialize backend session", e);
        if (!cancelled) {
          addBotMessage(
            "The Tutor workspace could not be initialized. Check your connection and try again.",
            "session-init-error",
          );
          setReplies([
            {
              label: "Retry workspace",
              desc: "Reconnect without losing your current page",
              action: () => {
                void ensureBackendSession()
                  .then((result) => {
                    if (!result.restored && !initialFlowStartedRef.current) {
                      initialFlowStartedRef.current = true;
                      startRef.current();
                    }
                  })
                  .catch((retryError) => {
                    console.error("Tutor workspace retry failed", retryError);
                    addBotMessage(
                      "The Tutor workspace still could not connect. Please check your connection and retry.",
                      "session-init-error",
                    );
                  });
              },
            },
          ]);
        }
      }
    }

    void initBackendSession();
    return () => { cancelled = true; };
  }, [ensureBackendSession]);

  // Drawer accessibility - Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeDrawer) {
        setActiveDrawer(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDrawer]);

  // Drag and Drop Event Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    void uploadFileToBackend(files[0]);
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    void uploadFileToBackend(file);
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    void uploadFileToBackend(file);
  };

  // Helper for friendly error messaging
  const renderFriendlyErrorMessage = (errorText: string, status?: number) => {
    let friendly = "We encountered a temporary issue connecting to the AI service.";

    if (status === 401) {
      window.dispatchEvent(
        new CustomEvent("study:auth-gate", { detail: { reason: "query" } }),
      );
      friendly = "🔒 Please sign in to use this AI feature.";
    } else if (status === 503 || errorText.includes("GEMINI_API_KEY") || errorText.includes("not configured")) {
      friendly = "⚠️ AI generation is temporarily unavailable. Your material remains saved; please retry later.";
    } else if (status === 400 || errorText.includes("short") || errorText.includes("extract")) {
      friendly = "⚠️ We couldn't extract enough readable text from this file. Try pasting your text directly into the message box below!";
    } else if (errorText) {
      friendly = `⚠️ ${errorText}`;
    }

    addBotMessage(friendly);
  };

  // Real Backend File & Text Source Ingestion (`POST /api/study/sessions/[id]/sources`)
  const uploadFileToBackend = async (file: File) => {
    if (uploadInFlightRef.current) return;
    uploadInFlightRef.current = true;
    const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|m4a|webm|ogg|aac|flac|mp4)$/i.test(file.name);
    const courseLabel = tutorState._pendingCourseLabel || file.name.replace(/\.[^/.]+$/, "");

    setIsUploading(true);
    setUploadStatus(
      isAudio
        ? `🎙 Transcribing lecture audio "${file.name}" (English only)...`
        : `📎 Uploading and indexing "${file.name}"...`
    );

    // ── Plain-text files: read instantly client-side ──────────────────────────
    if (!isAudio && (file.type.startsWith("text/") || /\.(txt|md|json|csv|py|js|ts)$/i.test(file.name))) {
      try {
        const text = await file.text();
        if (text) setUploadedSourceText(text);
      } catch { /* ignore */ }
    }

    try {
      const targetSessionId = (await ensureBackendSession()).id;
      if (isAudio) {
        // ── AUDIO PATH: Gemini STT via /api/study/transcribe ─────────────────
        if (file.size > 20 * 1024 * 1024) {
          renderFriendlyErrorMessage(
            `Audio file is too large for transcription (max 20 MB). Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
            400,
          );
          return;
        }

        const audioForm = new FormData();
        audioForm.append("file", file);

        const tRes = await fetchWithAuthRetry("/api/study/transcribe", {
          method: "POST",
          body: audioForm,
        });

        if (!tRes.ok) {
          const tErr = await tRes.json().catch(() => ({}));
          renderFriendlyErrorMessage(
            (tErr as { error?: string })?.error || "Audio transcription failed.",
            tRes.status,
          );
          return;
        }

        const tData = (await tRes.json()) as { success: boolean; transcript?: string };
        const transcript = tData?.transcript?.trim() || "";
        if (!transcript) {
          renderFriendlyErrorMessage("No speech detected in the audio file. Try a clearer English recording.", 400);
          return;
        }

        // Save transcript as context + persist as text source
        setUploadedSourceText(transcript);
        confirmMaterial(courseLabel, file.name, transcript);
      } else {
        // ── DOCUMENT PATH: PDF / docx / txt via /api/study/sessions/[id]/sources ─
        const formData = new FormData();
        formData.append("kind", "file");
        formData.append("name", file.name);
        formData.append("file", file);

        const headers = getApiHeaders();
        delete headers["Content-Type"]; // Let browser set multipart boundary

        const res = await fetchWithAuthRetry(`/api/study/sessions/${targetSessionId}/sources`, {
          method: "POST",
          headers,
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const extractedText: string = (data as { data?: { text?: string }; text?: string })?.data?.text
            || (data as { text?: string })?.text
            || "";
          if (extractedText) setUploadedSourceText(extractedText);
          confirmMaterial(courseLabel, file.name, extractedText, true);
        } else {
          const err = await res.json().catch(() => ({}));
          renderFriendlyErrorMessage(
            (err as { error?: string; message?: string })?.error
              || (err as { message?: string })?.message
              || "Upload failed.",
            res.status,
          );
        }
      }
    } catch (e) {
      console.error("uploadFileToBackend error", e);
      renderFriendlyErrorMessage("The material could not be uploaded. Please try again.", 500);
    } finally {
      uploadInFlightRef.current = false;
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  const uploadTextSourceToBackend = async (text: string, sourceName: string = "Pasted Notes") => {
    if (text) {
      setUploadedSourceText(text);
    }
    try {
      const targetSessionId = (await ensureBackendSession()).id;
      const response = await fetchWithAuthRetry(`/api/study/sessions/${targetSessionId}/sources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getApiHeaders(),
        },
        body: JSON.stringify({ kind: "text", name: sourceName, text }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        renderFriendlyErrorMessage(payload?.error || "Source upload failed", response.status);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Source upload error", e);
      renderFriendlyErrorMessage("Source upload failed. Please try again.", 500);
      return false;
    }
  };

  // Real Backend Dynamic Quiz Generation (`POST /api/study/sessions/[id]/generate/quizzes`)
  const generateQuizFromBackend = async (chapterKey: string) => {
    try {
      const targetSessionId = (await ensureBackendSession()).id;
      const res = await fetchWithAuthRetry(`/api/study/sessions/${targetSessionId}/generate/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getApiHeaders(),
        },
        body: JSON.stringify({
          difficulty: tutorState.difficulty?.toLowerCase() || "medium",
          questionFormat:
            tutorState.quizFormat === "short"
              ? "short_answer"
              : tutorState.quizFormat === "mixed"
                ? "mixed"
                : "mcq",
          questionCount: 4,
          academicLevel: tutorState.level?.toLowerCase() || "college",
          rubric: tutorState.rubric || "",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const quizList = data?.data?.content?.quizzes || data?.data?.content;
        if (Array.isArray(quizList) && quizList.length > 0) {
          const parsedQuestions: QuestionItem[] = quizList.map((q: any) => ({
            topic: q.topic || "Core Concept",
            q: q.question || q.q || "What is the primary mechanism described in your material?",
            opts: q.options || q.opts || ["Option A", "Option B", "Option C", "Option D"],
            correct: typeof q.correctAnswerIndex === "number" ? q.correctAnswerIndex : 0,
            optsHard: q.options || q.opts || ["Option A", "Option B", "Option C", "Option D"],
            correctHard: typeof q.correctAnswerIndex === "number" ? q.correctAnswerIndex : 0,
            explain: q.explanation || "See course material for full breakdown.",
            hint: q.hint || "Review your notes for this section.",
            eli6: q.simpleExplanation || "A simple breakdown of the main idea.",
            answer: typeof q.answer === "string" ? q.answer : "",
            questionFormat:
              q.questionFormat === "short_answer" || !Array.isArray(q.options) || q.options.length === 0
                ? "short_answer"
                : "mcq",
          }));

          setChapters((prev) => ({
            ...prev,
            [chapterKey]: {
              name: outlineMeta[chapterKey]?.name || "Practice Chapter",
              plain: parsedQuestions,
              scenario: parsedQuestions,
            },
          }));

          return parsedQuestions;
        }
      } else {
        const err = await res.json().catch(() => ({}));
        renderFriendlyErrorMessage(err?.error || err?.message || "Quiz generation failed", res.status);
      }
    } catch (e) {
      console.error("Backend quiz generation error", e);
    }
    return null;
  };

  // 100% Production-Grade Native Gemini AI Streaming Responder (Primary In-House Backend Engine)
  const sendQueryToBackendTutor = async (userPrompt: string) => {
    setIsStreaming(true);

    const botMsgId = Math.random().toString(36).substr(2, 9);
    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        sender: "bot",
        text: "",
      },
    ]);

    try {
      const targetSessionId = (await ensureBackendSession()).id;
      let streamedText = "";
      await streamStudyTutor(
        targetSessionId,
        userPrompt,
        undefined,
        {
          mode: tutorState.mode === "quiz" ? "quiz" : "research",
          tutorContext: [
            tutorState.level ? `Academic level: ${tutorState.level}` : "",
            tutorState.rubric ? `Rubric: ${tutorState.rubric}` : "",
            tutorState.mode ? `Tutor mode: ${tutorState.mode}` : "",
          ].filter(Boolean).join("\n"),
        },
        {
          onChunk: (delta) => {
            streamedText += delta;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                  ? { ...msg, text: streamedText, html: undefined }
                : msg
            )
          );
          },
        },
      );
    } catch (e: any) {
      console.error("Study Tutor query error", e);
      setMessages((prev) => prev.filter((msg) => msg.id !== botMsgId));
      renderFriendlyErrorMessage(
        e?.message || "Failed to reach AI Tutor server",
        500
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // Calculate urgent items count
  const countUrgent = () => {
    return Object.keys(calendarData).reduce((n, k) => {
      const items = calendarData[k];
      return n + (items ? items.filter((d) => d.urgency === "urgent").length : 0);
    }, 0);
  };
  const urgentBadgeCount = countUrgent();

  // Helper to append bot text bubble
  const addBotMessage = (html: string, tag?: string) => {
    setMessages((prev) => {
      const message: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: "bot",
        html,
        tag,
      };
      if (!tag) return [...prev, message];

      const existingIndex = prev.findIndex((item) => item.tag === tag);
      if (existingIndex < 0) return [...prev, message];
      return prev.map((item, index) =>
        index === existingIndex ? { ...message, id: item.id } : item,
      );
    });
  };

  // Helper to append user bubble
  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        sender: "user",
        text,
      },
    ]);
  };

  // Helper to append source citation message
  const addSourceMessage = (sectionId: string, label: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        sender: "bot",
        kind: "source",
        source: { sectionId, label },
      },
    ]);
  };

  // Helper to append course outline message
  const addOutlineMessage = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        sender: "bot",
        kind: "outline",
        outline: {
          chapterOrder: tutorState.chapterOrder,
          outlineMeta,
          syllabusAdded: tutorState.syllabusAdded,
        },
      },
    ]);
  };

  // Set quick reply options
  const setReplies = (options: QuickReply[], row?: boolean) => {
    setQuickReplies({ options, row });
  };
  const clearReplies = () => setQuickReplies(null);

  // Breadcrumbs helper
  const addCrumb = (label: string, fn: () => void) => {
    setCrumbTrail((prev) => {
      const idx = prev.findIndex((crumb) => crumb.label === label);
      if (idx === -1) {
        return [...prev, { label, fn }];
      }
      return prev.slice(0, idx + 1).map((crumb, index) => (index === idx ? { ...crumb, fn } : crumb));
    });
  };
  const resetCrumbs = () => setCrumbTrail([]);

  const handleCrumbClick = (index: number) => {
    const step = crumbTrail[index];
    if (!step) return;
    setCrumbTrail((prev) => prev.slice(0, index + 1));
    clearReplies();
    step.fn();
  };

  // Helper row toggle
  const renderHelperRow = () => setShowHelper(true);
  const hideHelperRow = () => setShowHelper(false);

  // Jump to note source with highlight
  const jumpToSource = (sectionId: string) => {
    setActiveDrawer("notes");
    setFlashedSection(sectionId);
    schedule(() => setFlashedSection(null), 1600);
  };

  // -------------------------------------------------------------
  // FLOW LOGIC
  // -------------------------------------------------------------

  function startNewChat() {
    if (sessionStatus !== "ready") return;
    initialFlowStartedRef.current = true;
    clearScheduledTasks();
    setMessages([]);
    setOutlineMeta({});
    setTutorState({
      level: null,
      rubric: null,
      studyStyle: "balanced",
      mode: null,
      examFormat: null,
      difficulty: null,
      quizFormat: null,
      timing: null,
      researchTime: null,
      qIndex: 0,
      score: 0,
      awaiting: null,
      applyRubric: false,
      chapterKey: "ch1",
      wrongTopics: [],
      activeSet: [],
      redrillMode: false,
      syllabusAdded: false,
      sessionStart: Date.now(),
      chaptersTouched: [],
      chapterOrder: [],
      skipMode: false,
    });
    setCourseChip("");
    setShowNotesToggle(false);
    setShowGuideToggle(false);
    setActiveDrawer(null);
    resetCrumbs();
    start();
  }

  function start() {
    resetCrumbs();
    addCrumb("Upload", start);
    setMessages([
      {
        id: "initial_welcome_msg",
        sender: "bot",
        html: "Hi! What are we working with today?",
      },
    ]);
    setReplies([
      {
        label: "My whole semester",
        desc: "Build an outline, grade weights, and schedule from your syllabus",
        action: () => {
          askForMaterial("Course Syllabus");
        },
      },
      {
        label: "A course or chapter",
        desc: "Upload notes or slides for a specific topic or test",
        action: () => {
          askForMaterial("Course Notes");
        },
      },
      {
        label: "Skip setup — just ask questions",
        desc: "Jump straight into freeform Q&A",
        action: () => {
          setTutorState((prev) => ({ ...prev, skipMode: true }));
          askForMaterial("Freeform Chat");
        },
      },
    ]);
  }

  function askForMaterial(courseLabel: string) {
    setTutorState((prev) => ({ ...prev, _materialConfirmed: false, _pendingCourseLabel: courseLabel }));
    addCrumb("Upload", () => askForMaterial(courseLabel));

    addBotMessage(
      "Paste your notes, upload a document file (PDF, Doc, Image), or drop in a lecture recording (English Speech-to-Text supported).",
      "material-request",
    );

    setReplies([
      {
        label: "📋 Paste text",
        desc: "Type or paste course notes directly",
        action: () => {
          setTutorState((prev) => ({ ...prev, awaiting: "paste_text" }));
          addBotMessage("Please paste your course notes or syllabus text into the message box below and press Send.");
        },
      },
      {
        label: "📎 Upload document",
        desc: "Select PDF, DOCX, TXT, or Image file",
        action: () => {
          docInputRef.current?.click();
        },
      },
      {
        label: "🎙 Upload lecture audio",
        desc: "Select MP3, WAV, M4A, or WebM (English, up to 20 MB)",
        action: () => {
          audioInputRef.current?.click();
        },
      },
      {
        label: "🔴 Record live lecture",
        desc: "Use your microphone - speaks in English, press Stop when done",
        action: () => {
          toggleLectureMicCapture();
        },
      },
    ]);
  }

  function confirmMaterial(
    courseLabel: string,
    sampleFile?: string,
    pastedContent?: string,
    alreadyPersisted = false,
  ) {
    clearReplies();
    runArranging(courseLabel, sampleFile, pastedContent, alreadyPersisted);
  }

  async function runArranging(
    courseLabel: string,
    sampleFile?: string,
    pastedContent?: string,
    alreadyPersisted = false,
  ) {
    let targetSessionId: string;
    try {
      targetSessionId = (await ensureBackendSession()).id;
    } catch (error) {
      console.error("Tutor session initialization failed", error);
      renderFriendlyErrorMessage(
        "Your Tutor workspace could not be prepared. Check your connection and try again.",
        500,
      );
      return;
    }

    if (pastedContent) {
      setUploadedSourceText(pastedContent);
      if (!alreadyPersisted) {
        const persisted = await uploadTextSourceToBackend(pastedContent, courseLabel);
        if (!persisted) return;
      }
    }

    const materialContent = pastedContent || uploadedSourceText || "";
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        sender: "user",
        kind: "material_card",
        material: {
          label: sampleFile ? `File: ${sampleFile}` : courseLabel || "Uploaded Material",
          content: materialContent,
        },
      },
    ]);

    addBotMessage("⚡ Course material indexed. Generating your study outline...");

    // DYNAMIC BACKEND OUTLINE GENERATION WITH SMART FALLBACK
    let generatedSuccessfully = false;

    try {
        const res = await fetchWithAuthRetry(`/api/study/sessions/${targetSessionId}/generate/outline`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getApiHeaders(),
          },
        });

        if (res.ok) {
          const data = await res.json();
          const outlineData = data?.data?.content;
          if (outlineData?.chapters && Array.isArray(outlineData.chapters) && outlineData.chapters.length > 0) {
            const newOrder: string[] = [];
            const newOutlineMeta: Record<string, ChapterMeta> = {};

            outlineData.chapters.forEach((ch: any, idx: number) => {
              const key = ch.id || `ch_${idx + 1}`;
              newOrder.push(key);
              newOutlineMeta[key] = {
                name: ch.title || `Chapter ${idx + 1}`,
                weight: null,
                pct: 0,
                assessedFrom: null,
                topics: Array.isArray(ch.topics)
                  ? ch.topics.map((t: any) => ({
                    name: typeof t === "string" ? t : t.title || "Topic",
                    status: "pending",
                  }))
                  : [{ name: ch.summary || "Core concept", status: "pending" }],
              };
            });

            setTutorState((prev) => ({
              ...prev,
              chapterOrder: newOrder,
              chapterKey: newOrder[0],
            }));
            setOutlineMeta(newOutlineMeta);
            generatedSuccessfully = true;
          }
        } else {
          const err = await res.json().catch(() => ({}));
          renderFriendlyErrorMessage(err?.error || err?.message || "Outline generation issue", res.status);
        }
    } catch (e) {
      console.error("Outline generation error", e);
    }

    setShowNotesToggle(true);
    setCourseChip("· " + courseLabel);
    if (!generatedSuccessfully) {
      addBotMessage("The AI outline could not be generated. Your material is still saved, so you can ask source-grounded questions below or retry later.");
      landInOpenChat();
    } else if (tutorState.skipMode) {
      addBotMessage("Your source-grounded course outline is ready.");
      landInOpenChat();
    } else {
      addBotMessage("Your source-grounded course outline is ready.");
      previewOutline();
    }
  }

  function previewOutline() {
    addCrumb("Outline", previewOutline);
    addBotMessage("Here is your course outline with chapter mastery based on your material:");
    renderOutline();
    setReplies([
      {
        label: "🚀 Deep Dive Course",
        desc: "Explore key concepts step by step",
        action: () => sendQueryToBackendTutor("Give me a structured deep dive overview of Chapter 1 concepts."),
      },
      {
        label: "📝 Practice Quiz",
        desc: "Diagnostic quiz on uploaded material",
        action: () => startQuiz(tutorState.chapterKey || "ch_1"),
      },
      {
        label: "💡 Key Takeaways",
        desc: "Bullet point summary of core ideas",
        action: () => sendQueryToBackendTutor("Summarize the key takeaways and core formulas from this material."),
      },
      {
        label: "🧭 Guide Me (Setup)",
        desc: "Customize level, rubric, and study mode",
        action: askLevel,
      },
    ]);
  }

  function landInOpenChat() {
    addCrumb("Chat", landInOpenChat);
    renderOutline();
    addBotMessage(
      "Here is your outline. Ask me anything about this material with no setup needed. If you would like to set level, rubric, or mode, tap 🧭 Guide Me on the side."
    );
    setShowGuideToggle(true);
    setTutorState((prev) => ({ ...prev, awaiting: "free" }));
  }

  function askForSyllabus(returnFn: () => void) {
    setTutorState((prev) => ({ ...prev, awaiting: "syllabus" }));
    addBotMessage("Upload your syllabus (PDF, DOCX, image, or paste text) to extract grade weights and dates.");
    setReplies([
      {
        label: "Back",
        action: returnFn,
      },
    ]);
  }

  function showDeadlines() {
    setTutorState((prev) => ({ ...prev, syllabusAdded: true, awaiting: null }));
    addBotMessage("Here's what I extracted from your syllabus:");
    schedule(() => {
      addBotMessage("📅 Grade weighting & deadlines extracted and saved to your Calendar & Outline.");
      renderOutline();
      setReplies([{ label: "Continue setup", action: askLevel }]);
    }, 800);
  }

  function askLevel() {
    addCrumb("Level", askLevel);
    addBotMessage("What level should I explain things at?");
    setReplies([
      {
        label: "High school",
        action: () => {
          setTutorState((prev) => ({ ...prev, level: "High school" }));
          afterLevel();
        },
      },
      {
        label: "College",
        action: () => {
          setTutorState((prev) => ({ ...prev, level: "College" }));
          afterLevel();
        },
      },
      {
        label: "PhD",
        action: () => {
          setTutorState((prev) => ({ ...prev, level: "PhD" }));
          afterLevel();
        },
      },
      {
        label: "Not sure — check my notes",
        desc: "I'll gauge it from what you uploaded",
        action: () => {
          setTutorState((prev) => ({ ...prev, level: "College" }));
          addBotMessage("Based on your uploaded material, setting your target level to <b>College</b>.");
          afterLevel();
        },
      },
    ]);
  }

  function afterLevel() {
    schedule(askRubric, 500);
  }

  function askRubric() {
    addCrumb("Rubric", askRubric);
    addBotMessage("Which grading rubric or standard should I grade your work against?");
    setReplies([
      {
        label: "Standard College Rubric",
        action: () => {
          setTutorState((prev) => ({ ...prev, rubric: "Standard College", applyRubric: true }));
          afterRubric();
        },
      },
      {
        label: "Custom Rubric",
        desc: "Paste your professor's exact criteria",
        action: () => {
          setTutorState((prev) => ({ ...prev, awaiting: "rubric" }));
          addBotMessage("Please paste your rubric criteria below and press Send.");
        },
      },
      {
        label: "Skip Rubric",
        action: () => {
          setTutorState((prev) => ({ ...prev, rubric: null, applyRubric: false }));
          afterRubric();
        },
      },
    ]);
  }

  function processRubric(text: string) {
    setTutorState((prev) => ({ ...prev, rubric: "Custom", applyRubric: true, awaiting: null }));
    addBotMessage("Rubric saved! I'll apply these criteria to all your practice answers.");
    afterRubric();
  }

  function afterRubric() {
    schedule(askMode, 500);
  }

  function askMode() {
    addCrumb("Mode", askMode);
    addBotMessage("How would you like to study today?");
    setReplies([
      {
        label: "Adaptive Quiz",
        desc: "Targeted practice questions matched to your weak spots",
        action: () => selectMode("quiz"),
      },
      {
        label: "Deep Research",
        desc: "Explore concepts with breakdown & citations",
        action: () => selectMode("research"),
      },
      {
        label: "Assignment Help",
        desc: "Thesis check, structure & originality check",
        action: () => selectMode("assignment"),
      },
      {
        label: "Socratic Debate",
        desc: "Challenge your argument to sharpen critical thinking",
        action: () => selectMode("debate"),
      },
    ]);
  }

  function selectMode(mode: "quiz" | "research" | "assignment" | "debate") {
    setTutorState((prev) => ({ ...prev, mode }));
    if (mode === "quiz") schedule(askTiming, 500);
    else if (mode === "research") schedule(askResearchTime, 500);
    else if (mode === "assignment") schedule(startAssignmentFlow, 500);
    else if (mode === "debate") schedule(startDebateFlow, 500);
  }

  function askTiming() {
    addCrumb("Timing", askTiming);
    addBotMessage("When is your test or deadline?");
    setReplies([
      {
        label: "Exam soon (this week)",
        desc: "Focus strictly on high-yield exam questions",
        action: () => {
          setTutorState((prev) => ({ ...prev, timing: "soon" }));
          schedule(askFormat, 500);
        },
      },
      {
        label: "Plenty of time",
        desc: "Build deep conceptual understanding step by step",
        action: () => {
          setTutorState((prev) => ({ ...prev, timing: "plenty" }));
          schedule(askFormat, 500);
        },
      },
    ]);
  }

  function askFormat() {
    addCrumb("Format", askFormat);
    addBotMessage("What question format do you prefer?");
    setReplies([
      {
        label: "Multiple choice (MCQ)",
        action: () => {
          setTutorState((prev) => ({ ...prev, quizFormat: "mcq" }));
          schedule(askDifficulty, 500);
        },
      },
      {
        label: "Short answer / Explanation",
        action: () => {
          setTutorState((prev) => ({ ...prev, quizFormat: "short" }));
          schedule(askDifficulty, 500);
        },
      },
      {
        label: "Mixed format",
        action: () => {
          setTutorState((prev) => ({ ...prev, quizFormat: "mixed" }));
          schedule(askDifficulty, 500);
        },
      },
    ]);
  }

  function askDifficulty() {
    addCrumb("Difficulty", askDifficulty);
    addBotMessage("And how tough should practice be?");
    setReplies(
      [
        {
          label: "Easy",
          action: () => {
            setTutorState((prev) => ({ ...prev, difficulty: "Easy" }));
            afterDifficulty("Easy");
          },
        },
        {
          label: "Medium",
          action: () => {
            setTutorState((prev) => ({ ...prev, difficulty: "Medium" }));
            afterDifficulty("Medium");
          },
        },
        {
          label: "Hard",
          action: () => {
            setTutorState((prev) => ({ ...prev, difficulty: "Hard" }));
            afterDifficulty("Hard");
          },
        },
      ],
      true
    );
  }

  function afterDifficulty(diff: string) {
    const chName = outlineMeta[tutorState.chapterKey]?.name || "uploaded material";
    addBotMessage(`Setup complete! Generating AI practice questions for <b>${chName}</b> at ${diff} level...`);
    schedule(() => startQuiz(tutorState.chapterKey || tutorState.chapterOrder[0] || "ch1"), 800);
  }

  function askResearchTime() {
    addCrumb("Time", askResearchTime);
    addBotMessage("How much time do you have for research today?");
    setReplies([
      {
        label: "Quick 10-minute overview",
        action: () => launchResearch("10m"),
      },
      {
        label: "Deep 30-minute dive",
        action: () => launchResearch("30m"),
      },
    ]);
  }

  function launchResearch(time: string) {
    addBotMessage(`Deep Research session initialized (${time}). Ask any core concept or mechanism to explore with source citations.`);
    setTutorState((prev) => ({ ...prev, awaiting: "free" }));
  }

  function startAssignmentFlow() {
    addCrumb("Assignment", startAssignmentFlow);
    addBotMessage("Assignment Assistant ready. Upload or paste your paper text below to check thesis strength, structure, and originality.");
    setTutorState((prev) => ({ ...prev, awaiting: "free" }));
  }

  function startDebateFlow() {
    addCrumb("Topic", startDebateFlow);
    addBotMessage("Socratic Debate Mode. State your thesis or stance on your uploaded material to begin the debate.");
    setTutorState((prev) => ({ ...prev, awaiting: "free" }));
  }

  async function startQuiz(chapterKey: string, specificTopics?: string[]) {
    // Generate AI quiz questions from backend
    const generated = await generateQuizFromBackend(chapterKey);
    const activeSet = generated || chapters[chapterKey]?.plain || [];

    if (!activeSet.length) {
      addBotMessage("Generating questions from your uploaded text... please ask any question directly in the bar below!");
      setTutorState((prev) => ({ ...prev, awaiting: "free" }));
      return;
    }

    setTutorState((prev) => ({
      ...prev,
      chapterKey,
      activeSet,
      qIndex: 0,
      score: 0,
      wrongTopics: [],
      redrillMode: !!specificTopics,
      awaiting: "quiz",
    }));

    const chName = outlineMeta[chapterKey]?.name || "Practice";
    addBotMessage(`Starting practice for <b>${chName}</b> (${activeSet.length} questions):`);
    schedule(() => askQuizQuestion(0, activeSet), 400);
  }

  function askQuizQuestion(qIndex: number, activeSet: QuestionItem[]) {
    const item = activeSet[qIndex];
    if (!item) return;
    const isHard = tutorState.difficulty === "Hard";
    const opts = isHard ? item.optsHard : item.opts;

    addBotMessage(`<b>Question ${qIndex + 1} of ${activeSet.length}:</b> ${item.q}`);
    renderHelperRow();

    if (item.questionFormat === "short_answer" || opts.length === 0) {
      setTutorState((prev) => ({ ...prev, awaiting: "quiz_answer_short" }));
      addBotMessage("Type your answer in the prompt box below and press Send.");
    } else {
      setReplies(
        opts.map((o, idx) => ({
          label: o,
          action: () => answerQuizMCQ(idx, qIndex, activeSet),
        }))
      );
    }
  }

  function answerQuizMCQ(optIndex: number, qIndex: number, activeSet: QuestionItem[]) {
    hideHelperRow();
    const item = activeSet[qIndex];
    const isHard = tutorState.difficulty === "Hard";
    const correctIdx = isHard ? item.correctHard : item.correct;
    const correct = optIndex === correctIdx;

    if (correct) {
      addBotMessage("✅ Correct! " + item.explain);
    } else {
      addBotMessage(
        `❌ Not quite. The correct answer was <b>${(isHard ? item.optsHard : item.opts)[correctIdx]
        }</b>.<br><br>${item.explain}`
      );
    }

    if (item.source) {
      addSourceMessage(item.source, item.sourceLabel ?? "View source");
    }

    const nextScore = tutorState.score + (correct ? 1 : 0);
    const nextWrongTopics = correct
      ? tutorState.wrongTopics
      : [...tutorState.wrongTopics, item.topic];

    setTutorState((prev) => ({
      ...prev,
      score: nextScore,
      wrongTopics: nextWrongTopics,
    }));

    advanceQuiz(qIndex, activeSet, {
      score: nextScore,
      wrongTopics: nextWrongTopics,
      chapterKey: tutorState.chapterKey,
      redrillMode: tutorState.redrillMode,
      applyRubric: tutorState.applyRubric,
    });
  }

  function checkShortAnswer(text: string) {
    hideHelperRow();
    const activeSet = tutorState.activeSet;
    const item = activeSet[tutorState.qIndex];
    if (!item) return;
    const expected = (item.answer || item.explain || "").trim();
    const correct = shortAnswerMatches(text, expected);

    if (correct) {
      addBotMessage("✅ Excellent explanation! " + item.explain);
    } else {
      addBotMessage(
        `Good try. A strong answer should include: <b>${expected || "the key ideas in the explanation"}</b>.<br><br>${item.explain}`,
      );
    }

    const nextScore = tutorState.score + (correct ? 1 : 0);
    const nextWrongTopics = correct
      ? tutorState.wrongTopics
      : [...tutorState.wrongTopics, item.topic];

    setTutorState((prev) => ({
      ...prev,
      score: nextScore,
      wrongTopics: nextWrongTopics,
    }));

    advanceQuiz(tutorState.qIndex, activeSet, {
      score: nextScore,
      wrongTopics: nextWrongTopics,
      chapterKey: tutorState.chapterKey,
      redrillMode: tutorState.redrillMode,
      applyRubric: tutorState.applyRubric,
    });
  }

  function advanceQuiz(
    qIndex: number,
    activeSet: QuestionItem[],
    snapshot: QuizSnapshot
  ) {
    const nextIdx = qIndex + 1;
    setTutorState((prev) => ({ ...prev, qIndex: nextIdx }));

    if (nextIdx < activeSet.length) {
      schedule(() => askQuizQuestion(nextIdx, activeSet), 500);
      return;
    }

    schedule(() => showScore(activeSet, snapshot), 500);
  }

  function showScore(activeSet: QuestionItem[], snapshot: QuizSnapshot) {
    setTutorState((prev) => ({ ...prev, awaiting: null }));
    clearReplies();

    const total = activeSet.length;
    const pct = Math.round((snapshot.score / total) * 100);
    const chName = outlineMeta[snapshot.chapterKey]?.name || "Practice";

    if (!snapshot.redrillMode) {
      setOutlineMeta((prev) => ({
        ...prev,
        [snapshot.chapterKey]: {
          ...prev[snapshot.chapterKey],
          pct,
          assessedFrom: "this session",
          topics:
            prev[snapshot.chapterKey]?.topics.map((t) => ({
              ...t,
              status: snapshot.wrongTopics.includes(t.name) ? "bad" : "ok",
            })) || [],
        },
      }));
    }

    const weak = [...new Set(snapshot.wrongTopics)];
    const weakTags = weak
      .map(
        (t) =>
          `<span class="inline-block rounded-full border border-[#ffd5ce] bg-[#fff4f1] px-2.5 py-0.5 text-xs text-[#bd5a47] font-semibold">Weak: ${t}</span>`
      )
      .join(" ");

    addBotMessage(
      `${chName} done — <b>${pct}%</b> score this round.<div class="mt-2 flex flex-wrap gap-1.5">${weakTags || '<span class="text-xs text-[#10b981] font-semibold">All topics solid!</span>'
      }</div>`
    );

    const replies: QuickReply[] = [];
    if (weak.length) {
      replies.push({
        label: `Help me with ${weak[0]}`,
        action: () => offerWeakTopicHelp(weak),
      });
    }

    replies.push({ label: "Back to course outline", action: showOutline });
    setReplies(replies);
  }

  function offerWeakTopicHelp(weakTopics: string[]) {
    addBotMessage("Want me to explain it first, try again now, or come back to it tomorrow?");
    setReplies(
      [
        { label: "Explain this first", action: () => teachWeakTopics(weakTopics) },
        { label: "Just quiz me again", action: () => startQuiz(tutorState.chapterKey, weakTopics) },
      ],
      true
    );
  }

  function teachWeakTopics(weakTopics: string[]) {
    weakTopics.forEach((topic) => {
      sendQueryToBackendTutor(`Explain the topic "${topic}" clearly with simple examples.`);
    });
  }

  function renderOutline() {
    addOutlineMessage();
  }

  function showOutline() {
    renderOutline();
    setReplies([
      { label: "Continue setup", action: askLevel },
    ]);
  }

  const handleHint = () => {
    hideHelperRow();
    const item = tutorState.activeSet[tutorState.qIndex];
    if (item) {
      addBotMessage(`💡 <b>Hint:</b> ${item.hint}`, "hint");
    } else {
      sendQueryToBackendTutor("Give me a helpful hint on this topic.");
    }
  };

  const handleExplain = () => {
    hideHelperRow();
    const item = tutorState.activeSet[tutorState.qIndex];
    if (item) {
      addBotMessage(`🤔 <b>Why:</b> ${item.explain}`, "explanation");
    } else {
      sendQueryToBackendTutor("Explain why this concept works the way it does.");
    }
  };

  const handleEli6 = () => {
    hideHelperRow();
    const item = tutorState.activeSet[tutorState.qIndex];
    if (item) {
      addBotMessage(`👶 <b>ELI6:</b> ${item.eli6}`, "explained simply");
    } else {
      sendQueryToBackendTutor("Explain this concept like I am 6 years old.");
    }
  };

  // ---------------- Free Input Handler ----------------
  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;

    if (!tryConsumeGuestClick()) {
      window.dispatchEvent(
        new CustomEvent("study:auth-gate", { detail: { reason: "query" } })
      );
      return;
    }

    setInputValue("");
    clearReplies();
    addUserMessage(text);

    if (tutorState.awaiting === "paste_text") {
      setTutorState((prev) => ({ ...prev, awaiting: null }));
      confirmMaterial(tutorState._pendingCourseLabel || "Pasted Material", `Pasted notes`, text);
      return;
    }
    if (tutorState.awaiting === "rubric") {
      processRubric(text);
      return;
    }
    if (tutorState.awaiting === "syllabus") {
      uploadTextSourceToBackend(text, "Pasted Syllabus");
      schedule(showDeadlines, 500);
      return;
    }
    if (tutorState.awaiting === "quiz_answer_short") {
      checkShortAnswer(text);
      return;
    }

    // Direct Live Streaming Custom Query to AI Backend
    sendQueryToBackendTutor(text);
  };

  // Step progress calculation
  const setupStepLabels = crumbTrail.map((c) => c.label);
  const isSetupActive = setupStepLabels.length > 0;
  const plan = tutorState.mode ? STEP_PLANS[tutorState.mode] : null;
  const totalSetupSteps = plan ? 2 + plan.length : 8;
  const currentStepNum = Math.min(crumbTrail.length, totalSetupSteps);
  const stepsRemaining = Math.max(0, totalSetupSteps - currentStepNum);
  const progressPct = Math.round((currentStepNum / totalSetupSteps) * 100);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex h-[calc(100vh-4.2rem)] w-full overflow-hidden bg-white border-b border-[#dfe3ff]"
    >
      {/* Drag & Drop File Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#5f70ff]/95 backdrop-blur-md text-white transition-all animate-fadeIn">
          <FiUploadCloud className="h-16 w-16 animate-bounce" />
          <p className="mt-3 text-lg font-bold">Drop your course material or lecture recording here</p>
          <p className="mt-1 text-xs opacity-80">Supports PDF, DOCX, TXT, images, and audio files (English STT)</p>
        </div>
      )}

      {/* ── LEFT ICON RAIL ─────────────────────────────────── */}
      <aside className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-[#dfe3ff] bg-[#f4f6ff] py-4">
        <button
          type="button"
          onClick={startNewChat}
          disabled={sessionStatus !== "ready"}
          className="flex flex-col items-center justify-center rounded-xl p-2 text-[#646987] transition hover:bg-[#5f70ff]/10 hover:text-[#5f70ff] disabled:cursor-wait disabled:opacity-40"
          title={sessionStatus === "ready" ? "New Chat" : "Preparing Tutor workspace"}
        >
          <FiPlus className="h-5 w-5" />
          <span className="mt-1 text-[10px] font-semibold">New</span>
        </button>
        <div className="my-1 h-px w-8 bg-[#dfe3ff]" />

        <button
          type="button"
          onClick={() => setActiveDrawer((d) => (d === "dashboard" ? null : "dashboard"))}
          className={`flex flex-col items-center justify-center rounded-xl p-2 transition ${activeDrawer === "dashboard" ? "bg-[#5f70ff] text-white" : "text-[#646987] hover:bg-[#5f70ff]/10 hover:text-[#5f70ff]"
            }`}
          title="Dashboard"
        >
          <FiBarChart2 className="h-5 w-5" />
          <span className="mt-1 text-[10px] font-semibold">Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDrawer((d) => (d === "sessions" ? null : "sessions"))}
          className={`flex flex-col items-center justify-center rounded-xl p-2 transition ${activeDrawer === "sessions" ? "bg-[#5f70ff] text-white" : "text-[#646987] hover:bg-[#5f70ff]/10 hover:text-[#5f70ff]"
            }`}
          title="Sessions"
        >
          <FiFolder className="h-5 w-5" />
          <span className="mt-1 text-[10px] font-semibold">Sessions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDrawer((d) => (d === "calendar" ? null : "calendar"))}
          className={`relative flex flex-col items-center justify-center rounded-xl p-2 transition ${activeDrawer === "calendar" ? "bg-[#5f70ff] text-white" : "text-[#646987] hover:bg-[#5f70ff]/10 hover:text-[#5f70ff]"
            }`}
          title="Calendar"
        >
          <FiCalendar className="h-5 w-5" />
          <span className="mt-1 text-[10px] font-semibold">Calendar</span>
          {urgentBadgeCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white">
              {urgentBadgeCount}
            </span>
          )}
        </button>

        {showNotesToggle && (
          <button
            type="button"
            onClick={() => setActiveDrawer((d) => (d === "notes" ? null : "notes"))}
            className={`flex flex-col items-center justify-center rounded-xl p-2 transition ${activeDrawer === "notes" ? "bg-[#5f70ff] text-white" : "text-[#646987] hover:bg-[#5f70ff]/10 hover:text-[#5f70ff]"
              }`}
            title="Notes"
          >
            <FiFileText className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-semibold">Notes</span>
          </button>
        )}

        {showGuideToggle && (
          <button
            type="button"
            onClick={() => {
              setTutorState((prev) => ({ ...prev, skipMode: false }));
              askLevel();
            }}
            className="flex flex-col items-center justify-center rounded-xl p-2 text-[#5f70ff] hover:bg-[#5f70ff]/10"
            title="Guide me"
          >
            <FiCompass className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-semibold">Guide</span>
          </button>
        )}
      </aside>

      {/* ── MAIN CHAT COLUMN ─────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col bg-[#f7f8ff]">
        {/* Status & Course Sub-bar */}
        {courseChip && (
          <div className="flex shrink-0 items-center justify-between border-b border-[#dfe3ff] bg-white px-5 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10b981] shadow-[0_0_6px_#10b981]" />
              <span className="font-mono text-xs font-semibold text-[#5f70ff]">{courseChip}</span>
            </div>
            {sessionId && (
              <span className="font-mono text-[11px] text-[#9398b8]">
                Session ID: {sessionId.slice(0, 8)}...
              </span>
            )}
          </div>
        )}

        {/* Breadcrumb Trail & Remaining Steps Badge */}
        {crumbTrail.length > 0 && (
          <nav className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#dfe3ff] bg-white px-5 py-2 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-1">
              {crumbTrail.map((crumb, idx) => {
                const isLast = idx === crumbTrail.length - 1;
                return (
                  <React.Fragment key={crumb.label}>
                    <button
                      type="button"
                      onClick={() => handleCrumbClick(idx)}
                      disabled={isLast}
                      className={`${isLast
                          ? "font-bold text-[#5f70ff]"
                          : "text-[#9398b8] underline decoration-[#dfe3ff] hover:text-[#5f70ff]"
                        }`}
                    >
                      {crumb.label}
                    </button>
                    {!isLast && <span className="text-[#9398b8]">›</span>}
                  </React.Fragment>
                );
              })}
            </div>
            <span className="rounded-full bg-[#eef1ff] px-2.5 py-0.5 text-[11px] font-bold text-[#5f70ff] border border-[#5f70ff]/20">
              {currentStepNum} of {totalSetupSteps} ({stepsRemaining} left)
            </span>
          </nav>
        )}

        {/* Setup Progress Meter Bar */}
        {isSetupActive && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#dfe3ff] bg-[#eef1ff] px-5 py-2">
            <div className="flex flex-1 items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#dfe3ff]">
                <div
                  className="h-full rounded-full bg-[#5f70ff] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-[#5f70ff]">
              Step {currentStepNum} of {totalSetupSteps} ({stepsRemaining} remaining)
            </span>
          </div>
        )}

        {/* Chat Thread */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "items-start"
                }`}
            >
              {msg.tag && (
                <span className="mb-1 font-mono text-[10px] font-semibold text-[#9398b8]">
                  {msg.tag}
                </span>
              )}
              {msg.kind === "material_card" && msg.material ? (
                <div className="w-full max-w-xl my-1">
                  <MaterialCardMessage label={msg.material.label} content={msg.material.content} />
                </div>
              ) : (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.sender === "user"
                      ? "rounded-br-none bg-[#5f70ff] text-white shadow-md"
                      : "rounded-bl-none border border-[#dfe3ff] bg-white text-[#242842] shadow-sm"
                    }`}
                >
                  {msg.sender === "user" ? (
                    <span className="whitespace-pre-wrap break-words">{msg.text ?? ""}</span>
                  ) : msg.kind === "source" && msg.source ? (
                    <button
                      type="button"
                      onClick={() => jumpToSource(msg.source!.sectionId)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#dfe3ff] bg-white px-2.5 py-1 text-xs font-semibold text-[#5f70ff] hover:bg-[#eef1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f70ff] focus-visible:ring-offset-2"
                    >
                      📄 {msg.source.label}
                    </button>
                  ) : msg.kind === "outline" && msg.outline ? (
                    <OutlineMessage snapshot={msg.outline} onStartQuiz={startQuiz} />
                  ) : (
                    <SafeMessageHtml html={msg.html ?? msg.text ?? ""} />
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Uploading & Indexing Loader */}
          {isUploading && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[#dfe3ff] bg-gradient-to-r from-[#f4f6ff] to-[#eef1ff] px-4 py-3 text-xs font-semibold text-[#5f70ff] shadow-sm animate-pulse">
              <FiLoader className="h-4 w-4 animate-spin text-[#5f70ff]" />
              <span>{uploadStatus || "Uploading and indexing document..."}</span>
            </div>
          )}

          {/* Live Lecture Mic Recording Banner */}
          {isMicCapturingLecture && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3 text-xs font-semibold text-red-600 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
                <FiMic className="h-4 w-4" />
                <span>Recording lecture in English - speak clearly into your microphone...</span>
              </div>
              <button
                type="button"
                onClick={toggleLectureMicCapture}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
              >
                Stop Recording
              </button>
            </div>
          )}

          {/* Streaming Indicator */}
          {isStreaming && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5f70ff] animate-pulse">
              <FiLoader className="h-4 w-4 animate-spin text-[#5f70ff]" />
              <span>AI Tutor is thinking & streaming live...</span>
            </div>
          )}

          {/* Quick Replies */}
          {quickReplies && (
            <div className={`mt-3 flex flex-wrap gap-2 ${quickReplies.row ? "flex-row" : "flex-col"}`}>
              {quickReplies.options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    clearReplies();
                    addUserMessage(opt.label);
                    opt.action();
                  }}
                  className="rounded-xl border border-[#dfe3ff] bg-white px-4 py-2.5 text-left text-xs font-semibold text-[#242842] shadow-sm transition hover:border-[#5f70ff] hover:bg-[#eef1ff] hover:text-[#5f70ff] disabled:cursor-wait disabled:opacity-50"
                >
                  <div>{opt.label}</div>
                  {opt.desc && <div className="mt-0.5 text-[11px] font-normal text-[#9398b8]">{opt.desc}</div>}
                </button>
              ))}
            </div>
          )}

          {/* Helper Row (Hint / Why / ELI6) */}
          {showHelper && (
            <div className="space-y-1.5">
              <span className="font-mono text-[11px] text-[#9398b8]">Stuck? tap one:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleHint}
                  className="inline-flex items-center gap-1 rounded-full bg-[#eef1ff] px-3 py-1.5 text-xs font-semibold text-[#5f70ff] hover:bg-[#5f70ff] hover:text-white"
                >
                  💡 Need a hint
                </button>
                <button
                  type="button"
                  onClick={handleExplain}
                  className="inline-flex items-center gap-1 rounded-full bg-[#eef1ff] px-3 py-1.5 text-xs font-semibold text-[#5f70ff] hover:bg-[#5f70ff] hover:text-white"
                >
                  🤔 Why?
                </button>
                <button
                  type="button"
                  onClick={handleEli6}
                  className="inline-flex items-center gap-1 rounded-full bg-[#eef1ff] px-3 py-1.5 text-xs font-semibold text-[#5f70ff] hover:bg-[#5f70ff] hover:text-white"
                >
                  👶 Explain like I&apos;m 6
                </button>
              </div>
            </div>
          )}

          <div />
        </div>

        {/* Modern AI Input Bar */}
        <div className="shrink-0 bg-gradient-to-t from-white via-white/90 to-transparent p-4 pt-2">
          <div className="mx-auto max-w-4xl rounded-2xl border border-[#dfe3ff] bg-white p-3 shadow-[0_8px_30px_rgba(71,83,170,0.08)] transition-all duration-200 focus-within:border-[#5f70ff] focus-within:shadow-[0_12px_35px_rgba(95,112,255,0.18)] focus-within:ring-2 focus-within:ring-[#5f70ff]/15">
            {/* Quick helper action pills */}
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5 border-b border-[#f0f2ff] pb-2 text-xs">
              <button
                type="button"
                onClick={handleHint}
                className="inline-flex items-center gap-1 rounded-full border border-[#dfe3f7] bg-[#f8f9ff] px-2.5 py-1 text-[11px] font-semibold text-[#5f6483] transition hover:border-[#5f70ff] hover:bg-[#eef1ff] hover:text-[#5f70ff]"
              >
                💡 Hint
              </button>
              <button
                type="button"
                onClick={handleExplain}
                className="inline-flex items-center gap-1 rounded-full border border-[#dfe3f7] bg-[#f8f9ff] px-2.5 py-1 text-[11px] font-semibold text-[#5f6483] transition hover:border-[#5f70ff] hover:bg-[#eef1ff] hover:text-[#5f70ff]"
              >
                🤔 Why?
              </button>
              <button
                type="button"
                onClick={handleEli6}
                className="inline-flex items-center gap-1 rounded-full border border-[#dfe3f7] bg-[#f8f9ff] px-2.5 py-1 text-[11px] font-semibold text-[#5f6483] transition hover:border-[#5f70ff] hover:bg-[#eef1ff] hover:text-[#5f70ff]"
              >
                👶 ELI6
              </button>
              <button
                type="button"
                onClick={() => askForMaterial("Course Material")}
                disabled={sessionStatus !== "ready" || isUploading}
                className="inline-flex items-center gap-1 rounded-full border border-[#dfe3f7] bg-[#f8f9ff] px-2.5 py-1 text-[11px] font-semibold text-[#5f6483] transition hover:border-[#5f70ff] hover:bg-[#eef1ff] hover:text-[#5f70ff] disabled:cursor-wait disabled:opacity-40"
              >
                <FiPaperclip className="h-3 w-3" /> Attach note
              </button>
            </div>

            {/* Input area & Controls */}
            <div className="flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Ask anything, type an answer, or get a hint..."
                className="max-h-32 min-h-[38px] flex-1 resize-none bg-transparent px-1 py-1.5 text-sm font-medium text-[#242842] placeholder-[#9398b8] outline-none"
              />

              <div className="flex items-center gap-1.5 pb-0.5">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${isListening
                      ? "border-[#ef4444] bg-[#fff4f1] text-[#ef4444] animate-pulse"
                      : "border-[#dfe3f7] bg-[#f8f9ff] text-[#646987] hover:border-[#5f70ff] hover:text-[#5f70ff]"
                    }`}
                  title="Voice Input (English STT)"
                >
                  <FiMic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isStreaming || !sessionId}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#5f70ff] to-[#4a5be6] px-4 text-xs font-semibold text-white shadow-md transition hover:opacity-95 hover:shadow-lg disabled:opacity-40 disabled:shadow-none"
                >
                  <span>Send</span>
                  <FiArrowUp className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── SLIDING DRAWERS ──────────────────────────────────── */}
      {activeDrawer && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-xs"
            onClick={() => setActiveDrawer(null)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutor-drawer-title"
            className="absolute bottom-0 right-0 top-0 z-30 flex w-full max-w-md flex-col border-l border-[#dfe3ff] bg-white p-5 shadow-2xl transition-transform duration-300"
          >
            <div className="flex items-center justify-between border-b border-[#dfe3ff] pb-3">
              <h2 id="tutor-drawer-title" className="text-base font-bold text-[#242842] capitalize">
                {activeDrawer}
              </h2>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                aria-label="Close drawer"
                className="rounded-lg p-1 text-[#9398b8] hover:bg-[#f4f6ff] hover:text-[#242842] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f70ff]"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 text-sm text-[#646987] space-y-4">
              {/* Dashboard Drawer */}
              {activeDrawer === "dashboard" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9398b8]">Due Soonest</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between rounded-xl border border-[#dfe3ff] p-3">
                        <span className="font-semibold text-[#242842]">Course Quiz</span>
                        <span className="rounded-full bg-[#ef4444] px-2.5 py-0.5 text-xs font-bold text-white">Urgent · Fri</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9398b8]">Weak Spots (All Chapters)</h3>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex justify-between rounded-lg border border-[#ffd5ce] bg-[#fff4f1] p-2.5 text-xs">
                        <span className="font-medium text-[#bd5a47]">Core Concept</span>
                        <span className="font-mono text-[#ef4444]">Ch 1</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9398b8]">Do This Next</h3>
                    <div className="mt-2 rounded-xl border border-[#dfe3ff] bg-[#f8f9ff] p-3 text-xs">
                      📌 <b>Start here:</b> Practice questions for your uploaded course material.
                    </div>
                  </div>
                </div>
              )}

              {/* Sessions Drawer */}
              {activeDrawer === "sessions" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#9398b8]">Your Active Backend Sessions</h3>
                  {backendSessions.length > 0 ? (
                    backendSessions.map((sess) => (
                      <button
                        key={sess.id}
                        type="button"
                        onClick={() => {
                          setActiveDrawer(null);
                          void loadBackendSession(sess.id).catch((error) => {
                            console.error("Failed to load Tutor session", error);
                            addBotMessage("That saved session could not be loaded.");
                          });
                        }}
                        className={`w-full text-left rounded-xl border p-3 transition ${sessionId === sess.id
                            ? "border-[#5f70ff] bg-[#eef1ff]"
                            : "border-[#dfe3ff] bg-[#f8f9ff] hover:border-[#5f70ff]"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#242842]">{sess.title}</span>
                          <span className="font-mono text-[10px] text-[#5f70ff]">ID: {sess.id.slice(0, 6)}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#9398b8]">
                          Updated {new Date(sess.updatedAt || Date.now()).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-[#9398b8]">No saved sessions found. Create a new one above!</p>
                  )}
                </div>
              )}

              {/* Calendar Drawer */}
              {activeDrawer === "calendar" && (
                <div className="space-y-4">
                  <div className="flex rounded-xl bg-[#f4f6ff] p-1 text-xs font-semibold text-[#646987]">
                    <button
                      type="button"
                      onClick={() => setCalendarTab("all")}
                      className={`flex-1 rounded-lg py-1.5 text-center transition ${calendarTab === "all" ? "bg-white text-[#5f70ff] shadow-xs" : ""}`}
                    >
                      All Courses
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-[#dfe3ff] p-3">
                      <span>Course quiz</span>
                      <span className="rounded-full bg-[#ef4444] px-2 py-0.5 text-[10px] font-bold text-white">Urgent · Fri</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Drawer */}
              {activeDrawer === "notes" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#dfe3ff] bg-[#f8f9ff] p-3 font-mono text-xs text-[#5f70ff]">
                    📖 Uploaded Material · verified
                  </div>

                  <div
                    className={`rounded-xl p-3 transition ${flashedSection === "note-overview" ? "bg-[#fef3c7] border border-[#f59e0b]" : ""
                      }`}
                  >
                    <h3 className="font-bold text-[#242842]">Course Material Overview</h3>
                    <p className="mt-1 text-xs leading-relaxed">
                      Your uploaded document text has been indexed into vector search.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={docInputRef}
        onChange={handleDocFileChange}
        accept=".pdf,.doc,.docx,.txt,image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={audioInputRef}
        onChange={handleAudioFileChange}
        accept="audio/*,video/*,.mp3,.wav,.m4a,.webm"
        className="hidden"
      />
    </div>
  );
}
