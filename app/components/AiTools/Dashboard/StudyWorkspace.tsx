"use client";

import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckSquare,
  FiClock,
  FiFileText,
  FiHelpCircle,
  FiImage,
  FiLayers,
  FiLoader,
  FiMic,
  FiPlus,
  FiSend,
  FiX,
  FiZap,
} from "react-icons/fi";
import {
  detectStudyChatIntent,
  intentTargetTab,
} from "@/app/lib/client/studyIntent";
import {
  addStudySource,
  generateStudyArtifact,
  getStudySessionDetails,
  streamStudyTutor,
  StudyArtifactType,
  TutorAttachmentInput,
  TutorMessageDto,
} from "@/app/utils/studyApiClient";
import {
  hasReachedGuestQueryLimit,
  incrementGuestQueryCount,
  isGuest,
} from "@/app/lib/client/guestStudyLimits";
import {
  getStudyRecordingSnapshot,
  onStudyRecordingChange,
  stopStudyRecording,
  StudyRecordingResult,
  StudyRecordingSnapshot,
} from "@/app/lib/client/studyRecording";
import StudyQuizPanel from "@/app/components/AiTools/Dashboard/StudyQuizPanel";

// Learning modes were removed from the UI; generation/tutor now always run in
// the default "research" mode (the backend still accepts a mode param).
const STUDY_MODE = "research" as const;

type WorkspaceTab = "original" | "notes" | "summary" | "flashcards" | "quizzes";

const TABS: Array<{ id: WorkspaceTab; label: string }> = [
  { id: "original", label: "Original Content" },
  { id: "notes", label: "AI Notes" },
  { id: "summary", label: "AI Summary" },
  { id: "flashcards", label: "AI Flashcards" },
  { id: "quizzes", label: "AI Quizzes" },
];

const TAB_ICON: Record<WorkspaceTab, ReactNode> = {
  original: <FiBookOpen className="h-3.5 w-3.5" />,
  notes: <FiFileText className="h-3.5 w-3.5" />,
  summary: <FiFileText className="h-3.5 w-3.5" />,
  flashcards: <FiLayers className="h-3.5 w-3.5" />,
  quizzes: <FiCheckSquare className="h-3.5 w-3.5" />,
};

const GENERATION_TABS: WorkspaceTab[] = [
  "notes",
  "summary",
  "flashcards",
  "quizzes",
];

function isGenerationTab(tab: WorkspaceTab): tab is StudyArtifactType {
  return GENERATION_TABS.includes(tab);
}

function formatDuration(totalSeconds: number) {
  const safe = Math.max(totalSeconds, 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function formatDateLabel(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString();
}

function decodeHtmlEntities(input: string): string {
  if (!input) return input;
  let out = input;
  let prev = "";
  for (let pass = 0; pass < 8 && out !== prev; pass++) {
    prev = out;
    out = out
      .replace(/&#x([0-9a-fA-F]{1,6});/gi, (m, hex: string) => {
        const cp = parseInt(hex, 16);
        if (!Number.isFinite(cp)) return m;
        try {
          return String.fromCodePoint(cp);
        } catch {
          return m;
        }
      })
      .replace(/&#(\d{1,7});/g, (m, dec: string) => {
        const cp = parseInt(dec, 10);
        if (!Number.isFinite(cp)) return m;
        try {
          return String.fromCodePoint(cp);
        } catch {
          return m;
        }
      })
      .replace(/&nbsp;/gi, "\u00a0")
      .replace(/&ndash;/gi, "\u2013")
      .replace(/&mdash;/gi, "\u2014")
      .replace(/&lsquo;/gi, "\u2018")
      .replace(/&rsquo;/gi, "\u2019")
      .replace(/&ldquo;/gi, "\u201c")
      .replace(/&rdquo;/gi, "\u201d")
      .replace(/&bull;/gi, "\u2022")
      .replace(/&hellip;/gi, "\u2026")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
  }
  return out;
}

type UserTutorImagePreview =
  | { kind: "image"; dataUrl: string; name: string }
  | { kind: "placeholder"; name: string };

function userTutorMessageDisplay(item: TutorMessageDto): {
  body: string;
  images: UserTutorImagePreview[];
} {
  const fromDto = (item.attachments || []).filter(
    (a) => a?.dataUrl && /^data:image\//i.test(a.dataUrl),
  );

  if (fromDto.length > 0) {
    return {
      body: item.message.trim(),
      images: fromDto.map((a) => ({
        kind: "image" as const,
        dataUrl: a.dataUrl,
        name: a.name || "Image",
      })),
    };
  }

  let body = item.message;
  const images: UserTutorImagePreview[] = [];
  body = body.replace(/\n?\[Attached image:\s*([^\]]+)\]/gi, (_m, name: string) => {
    images.push({ kind: "placeholder", name: String(name).trim() || "Image" });
    return "";
  });
  const blockMatch = body.match(/\n\nAttached images:\n([\s\S]*)$/m);
  if (blockMatch && blockMatch.index !== undefined) {
    body = body.slice(0, blockMatch.index).trimEnd();
    const lines = blockMatch[1].split("\n").filter(Boolean);
    for (const line of lines) {
      const m = line.match(/Image\s+\d+:\s*(.+?)\s+\([^)]+\)\s*$/);
      if (m) images.push({ kind: "placeholder", name: m[1].trim() });
    }
  }
  return { body: body.trim(), images };
}

function TutorUserMessageBody({ item }: { item: TutorMessageDto }) {
  const { body, images } = userTutorMessageDisplay(item);
  return (
    <div className="space-y-2">
      {images.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {images.map((img, idx) =>
            img.kind === "image" ? (
              <a
                key={`${item._id}-img-${idx}`}
                href={img.dataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block max-w-[200px] shrink-0"
              >
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="aspect-video max-h-32 w-full rounded-lg border border-[#c9cef5] object-cover object-center shadow-sm"
                />
                <span className="mt-1 block truncate text-[11px] text-[#4e5385]">{img.name}</span>
              </a>
            ) : (
              <div
                key={`${item._id}-ph-${idx}`}
                className="flex h-28 w-[160px] shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-[#b8c0ea] bg-[#f5f6fd] p-2 text-center"
              >
                <FiImage className="h-8 w-8 text-[#7a82b8]" aria-hidden />
                <span className="mt-1 line-clamp-2 max-w-full text-[11px] text-[#4e5385]">
                  {img.name}
                </span>
              </div>
            ),
          )}
        </div>
      ) : null}
      {body ? (
        <p className="whitespace-pre-wrap break-words">{decodeHtmlEntities(body)}</p>
      ) : null}
    </div>
  );
}

function StudyTutorMarkdown({ content }: { content: string }) {
  return (
    <div className="tutor-md max-w-full break-words text-[13px] leading-relaxed text-[#424660]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm as never]}
        components={{
          h1: ({ children }) => (
            <h3 className="mb-2 mt-3 border-b border-[#e3e7ff] pb-1 text-[15px] font-semibold text-[#1f2138] first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-2 mt-3 text-[14px] font-semibold text-[#242746] first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mb-1.5 mt-2.5 text-[13px] font-semibold text-[#2f3250] first:mt-0">
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h4 className="mb-1.5 mt-2 text-[12px] font-semibold text-[#3a3d5c] first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-2 list-disc space-y-1 pl-4 marker:text-[#6c7aff]">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 list-decimal space-y-1 pl-4 marker:font-medium marker:text-[#6c7aff]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[#1f2138]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-[#4a4f72]">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-[3px] border-[#b8c4ff] bg-[#f7f8ff] py-1.5 pl-3 pr-2 text-[#5a5f82]">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-[#e3e7ff]" />,
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#4f5dff] underline decoration-[#c9d1ff] underline-offset-2 hover:text-[#3d49e6]"
              {...props}
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className);
            if (!isBlock) {
              return (
                <code
                  className="rounded bg-[#e8ebff] px-1 py-0.5 font-mono text-[0.85em] text-[#2a2d4a]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-2 max-w-full overflow-x-auto rounded-lg bg-[#1a1d33] p-3 text-[12px] text-[#e8e9f5]">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="my-2 max-w-full overflow-x-auto rounded-lg border border-[#e3e7ff]">
              <table className="w-full min-w-[200px] border-collapse text-left text-[12px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#eef1ff]">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-[#dfe4ff] px-2 py-1.5 font-semibold text-[#2f3250]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[#f0f2fc] px-2 py-1.5 align-top text-[#424660]">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Full-page Markdown renderer for the AI Summary tab. Unlike the compact tutor
// chat styling, this uses a real heading hierarchy, generous spacing, and
// left-aligned text so headings, bullets, and paragraphs read as a polished,
// scannable document.
function StudySummaryMarkdown({ content }: { content: string }) {
  return (
    <div className="summary-md max-w-none break-words text-left text-[15px] leading-7 text-[#3a3f5c]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm as never]}
        components={{
          h1: ({ children }) => (
            <h2 className="mb-3 mt-6 border-b border-[#e3e7ff] pb-2 text-[22px] font-bold leading-snug text-[#1c2138] first:mt-0">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="mb-2.5 mt-6 text-[18px] font-bold leading-snug text-[#2a2d4a] first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mb-2 mt-5 text-[16px] font-semibold leading-snug text-[#3a3d5c] first:mt-0">
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h5 className="mb-1.5 mt-4 text-[14px] font-semibold uppercase tracking-wide text-[#5f70ff] first:mt-0">
              {children}
            </h5>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-7 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 ml-1 list-disc space-y-2 pl-5 marker:text-[#6c7aff]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-1 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-[#6c7aff]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[#1c2138]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-[#4a4f72]">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-[#b8c4ff] bg-[#f7f8ff] py-2 pl-4 pr-3 text-[#5a5f82]">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-[#e3e7ff]" />,
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#4f5dff] underline decoration-[#c9d1ff] underline-offset-2 hover:text-[#3d49e6]"
              {...props}
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className);
            if (!isBlock) {
              return (
                <code
                  className="rounded bg-[#eef1ff] px-1.5 py-0.5 font-mono text-[0.85em] text-[#2a2d4a]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-4 max-w-full overflow-x-auto rounded-lg bg-[#1a1d33] p-4 text-[13px] text-[#e8e9f5]">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="my-4 max-w-full overflow-x-auto rounded-lg border border-[#e3e7ff]">
              <table className="w-full min-w-[300px] border-collapse text-left text-[14px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#eef1ff]">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-[#dfe4ff] px-3 py-2 font-semibold text-[#2f3250]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[#f0f2fc] px-3 py-2 align-top text-[#424660]">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

type SavedRecording = {
  id: string;
  mode: "microphone" | "browser-tab";
  capturedAt: string;
  durationMs: number;
  mediaUrl: string | null;
  transcript: string;
  fileName: string;
};

type ProcessingStep = {
  id: string;
  label: string;
};

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: "uploading", label: "Uploading Item" },
  { id: "analyzing", label: "Analyzing Content" },
  { id: "extracting", label: "Extracting Key Points" },
  { id: "mapping", label: "Mapping Concepts" },
  { id: "updating", label: "Updating Knowledgebase" },
  { id: "finishing", label: "Finishing Up" },
];

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEvent = {
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
    length: number;
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export default function StudyWorkspace() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("original");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionHydrating, setIsSessionHydrating] = useState(true);
  const [artifacts, setArtifacts] = useState<Record<string, unknown>>({});
  const [tutorMessages, setTutorMessages] = useState<TutorMessageDto[]>([]);
  const [sourceText, setSourceText] = useState("");
  const [sourceTitle, setSourceTitle] = useState("Session Source");
  const [tutorInput, setTutorInput] = useState("");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [quizSelections, setQuizSelections] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [recordingSnapshot, setRecordingSnapshot] = useState<StudyRecordingSnapshot>(
    getStudyRecordingSnapshot(),
  );
  const [recordingNowTick, setRecordingNowTick] = useState(Date.now());
  const [isPersistingRecording, setIsPersistingRecording] = useState(false);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [isTutorResponding, setIsTutorResponding] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<TutorAttachmentInput | null>(null);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const handledRecordingResultIds = useRef<Set<string>>(new Set());
  // Tracks which session the in-state `savedRecordings` were loaded for. The
  // persist effect must only write back for THAT session — otherwise, when
  // sessionId changes (e.g. after deleting a session), the persist effect can
  // run with the previous session's recordings still in state and leak them
  // into the new session's storage key before the load effect resets them.
  const loadedRecordingsSessionRef = useRef<string | null>(null);
  // Guards against re-submitting an onboarding-handed tutor question more than
  // once (the consuming effect can re-run on hydration/session changes).
  const consumedPendingQuestionRef = useRef<string | null>(null);
  const livePreviewRef = useRef<HTMLVideoElement | null>(null);
  const tutorMessagesScrollRef = useRef<HTMLDivElement | null>(null);
  const tutorAttachmentInputRef = useRef<HTMLInputElement | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);


  useEffect(() => {
    if (!sessionId) {
      setIsSessionHydrating(true);
      return;
    }
    let active = true;
    const resolvedSessionId = sessionId;

    async function hydrateSession() {
      setIsSessionHydrating(true);
      try {
        const details = await getStudySessionDetails(resolvedSessionId);
        if (!active) return;

        const nextArtifacts = details.artifacts.reduce<Record<string, unknown>>(
          (acc, item) => {
            acc[item.type] = item.content;
            return acc;
          },
          {},
        );

        setArtifacts(nextArtifacts);
        setTutorMessages(details.tutorMessages);
        if (details.sources.length > 0) {
          setSourceTitle(details.sources[0].name || "Session Source");
          setSourceText(details.sources.map((item) => item.text).join("\n\n"));
        } else {
          setSourceTitle("Session Source");
          setSourceText("");
        }
      } catch (error) {
        console.error("Failed to hydrate study session", error);
      } finally {
        if (active) {
          setIsSessionHydrating(false);
        }
      }
    }

    hydrateSession();
    return () => {
      active = false;
    };
  }, [refreshTick, sessionId]);

  useEffect(() => {
    const onSourceAdded = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string }>).detail;
      if (!detail?.sessionId || detail.sessionId !== sessionId) return;
      setActiveTab("original");
      setRefreshTick((prev) => prev + 1);
    };
    const onSessionChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string }>).detail;
      if (!detail?.sessionId || detail.sessionId !== sessionId) return;
      setActiveTab("original");
      setRefreshTick((prev) => prev + 1);
    };
    const onRecordingStarted = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string }>).detail;
      if (!detail?.sessionId || detail.sessionId !== sessionId) return;
      setActiveTab("original");
    };

    window.addEventListener("study-source-added", onSourceAdded);
    window.addEventListener("study-session-changed", onSessionChanged);
    window.addEventListener("study-recording-started", onRecordingStarted);
    return () => {
      window.removeEventListener("study-source-added", onSourceAdded);
      window.removeEventListener("study-session-changed", onSessionChanged);
      window.removeEventListener("study-recording-started", onRecordingStarted);
    };
  }, [sessionId]);

  useEffect(() => {
    setRecordingSnapshot(getStudyRecordingSnapshot());
    const unsubscribe = onStudyRecordingChange((snapshot) => {
      setRecordingSnapshot(snapshot);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (recordingSnapshot.status !== "recording") return;
    const intervalId = window.setInterval(() => {
      setRecordingNowTick(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [recordingSnapshot.status]);

  const summaryContent = (artifacts.summary || {}) as {
    short?: string;
    detailed?: string;
  };

  const notesContent = (artifacts.notes || {}) as {
    title?: string;
    mode?: string;
    examTips?: string[];
    sections?: Array<{
      heading?: string;
      priority?: string;
      bullets?: string[];
    }>;
  };

  const flashcardsContent = (artifacts.flashcards || []) as Array<{
    id: string;
    front: string;
    back: string;
  }>;

  const quizzesContent = (artifacts.quizzes || []) as Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    difficulty?: string;
    questionType?: string;
  }>;

  useEffect(() => {
    setFlashcardIndex(0);
    setFlashcardFlipped(false);
  }, [artifacts.flashcards]);

  useEffect(() => {
    setQuizSelections({});
    setQuizSubmitted(false);
    setQuizQuestionIndex(0);
  }, [artifacts.quizzes]);

  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`study_workspace_state_${sessionId}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        flashcardIndex?: number;
        flashcardFlipped?: boolean;
        quizSelections?: Record<string, number>;
        quizSubmitted?: boolean;
      };
      if (typeof parsed.flashcardIndex === "number") {
        setFlashcardIndex(Math.max(parsed.flashcardIndex, 0));
      }
      if (typeof parsed.flashcardFlipped === "boolean") {
        setFlashcardFlipped(parsed.flashcardFlipped);
      }
      if (parsed.quizSelections && typeof parsed.quizSelections === "object") {
        setQuizSelections(parsed.quizSelections);
      }
      if (typeof parsed.quizSubmitted === "boolean") {
        setQuizSubmitted(parsed.quizSubmitted);
      }
    } catch {
      // ignore invalid local state
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;
    // Mark that the in-state recordings now belong to this session BEFORE we set
    // them, so the persist effect (which also reacts to sessionId) won't write
    // the previous session's recordings under this session's key.
    loadedRecordingsSessionRef.current = sessionId;
    try {
      const raw = window.localStorage.getItem(`study_saved_recordings_${sessionId}`);
      if (!raw) {
        setSavedRecordings([]);
        setActiveRecordingId(null);
        return;
      }
      const parsed = JSON.parse(raw) as SavedRecording[];
      if (!Array.isArray(parsed)) {
        setSavedRecordings([]);
        setActiveRecordingId(null);
        return;
      }
      setSavedRecordings(parsed);
      setActiveRecordingId(parsed[0]?.id || null);
    } catch {
      setSavedRecordings([]);
      setActiveRecordingId(null);
    }
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Persist reacts ONLY to savedRecordings changes — never to sessionId. This
    // is critical: on a sessionId switch the load effect runs in the same commit
    // and resets savedRecordings, but state updates are async, so a sessionId-
    // triggered persist would still see the PREVIOUS session's recordings in its
    // closure and write them under the NEW session's key (the reported leak).
    // We write under the session those recordings were loaded for (the ref),
    // which the load effect sets synchronously before any user mutation.
    const ownerSession = loadedRecordingsSessionRef.current;
    if (!ownerSession) return;
    window.localStorage.setItem(
      `study_saved_recordings_${ownerSession}`,
      JSON.stringify(savedRecordings),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedRecordings]);

  useEffect(() => {
    const stream = recordingSnapshot.previewStream;
    const el = livePreviewRef.current;
    if (!el) return;
    if (stream && recordingSnapshot.status !== "idle") {
      el.srcObject = stream;
      void el.play().catch(() => undefined);
    } else {
      el.srcObject = null;
    }
  }, [recordingSnapshot.previewStream, recordingSnapshot.status]);

  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;
    const payload = {
      flashcardIndex,
      flashcardFlipped,
      quizSelections,
      quizSubmitted,
    };
    window.localStorage.setItem(
      `study_workspace_state_${sessionId}`,
      JSON.stringify(payload),
    );
  }, [
    flashcardFlipped,
    flashcardIndex,
    quizSelections,
    quizSubmitted,
    sessionId,
  ]);

  const activeFlashcard =
    flashcardsContent.length > 0 ? flashcardsContent[flashcardIndex] : null;
  const answeredCount = Object.keys(quizSelections).length;
  const quizScore = quizzesContent.reduce((score, quiz) => {
    const selected = quizSelections[quiz.id];
    return selected === quiz.correctAnswerIndex ? score + 1 : score;
  }, 0);
  const recordingElapsedSeconds =
    recordingSnapshot.startedAt && recordingSnapshot.status !== "idle"
      ? Math.floor((recordingNowTick - recordingSnapshot.startedAt) / 1000)
      : 0;
  const recordingWordCount = recordingSnapshot.transcript
    ? recordingSnapshot.transcript.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const activeSavedRecording =
    savedRecordings.find((item) => item.id === activeRecordingId) || savedRecordings[0] || null;
  const processingPercent = Math.min(
    Math.round(((processingIndex + 1) / PROCESSING_STEPS.length) * 100),
    100,
  );

  const simulateProcessingFlow = async () => {
    setIsProcessingRecording(true);
    setProcessingIndex(0);
    for (let index = 0; index < PROCESSING_STEPS.length; index += 1) {
      setProcessingIndex(index);
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, index === 0 ? 500 : 650);
      });
    }
    setIsProcessingRecording(false);
  };

  const persistRecordingResult = async (result: StudyRecordingResult) => {
    if (!sessionId) return;
    const recordingName =
      result.mode === "microphone"
        ? `Microphone Recording ${new Date(result.capturedAt).toLocaleString()}`
        : `Browser Tab Recording ${new Date(result.capturedAt).toLocaleString()}`;
    const summaryText = [
      `Recording Mode: ${result.mode === "microphone" ? "Microphone" : "Browser Tab"}`,
      `Duration: ${formatDuration(Math.floor(result.durationMs / 1000))}`,
      `Captured At: ${new Date(result.capturedAt).toLocaleString()}`,
      "",
      result.transcript?.trim()
        ? `Transcript:\n${result.transcript.trim()}`
        : "Transcript unavailable. Recording captured successfully.",
    ].join("\n");
    await addStudySource(sessionId, {
      kind: "text",
      name: recordingName,
      text: summaryText,
    });
    setSavedRecordings((prev) => {
      const next: SavedRecording[] = [
        {
          id: result.id,
          mode: result.mode,
          capturedAt: result.capturedAt,
          durationMs: result.durationMs,
          mediaUrl: result.mediaUrl,
          transcript: result.transcript || "",
          fileName: result.fileName,
        },
        ...prev.filter((item) => item.id !== result.id),
      ];
      return next.slice(0, 10);
    });
    setActiveRecordingId(result.id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("study-source-added", { detail: { sessionId } }),
      );
    }
    toast.success("Recording saved to Original Content");
  };

  const stopAndSaveRecording = async () => {
    if (recordingSnapshot.status === "idle") return;
    try {
      setIsPersistingRecording(true);
      const result = await stopStudyRecording();
      if (!result) return;
      if (handledRecordingResultIds.current.has(result.id)) return;
      handledRecordingResultIds.current.add(result.id);
      await simulateProcessingFlow();
      await persistRecordingResult(result);
    } catch (error) {
      console.error("Failed to stop/save recording", error);
      toast.error("Could not save recording");
    } finally {
      setIsPersistingRecording(false);
    }
  };

  const runGeneration = async (type: StudyArtifactType) => {
    if (!sessionId) {
      toast.error("Session is still loading. Please wait.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateStudyArtifact(sessionId, type, {
        mode: STUDY_MODE,
        examTopics: [],
      });
      setArtifacts((prev) => ({
        ...prev,
        [type]: result.content,
      }));
      const labels: Record<StudyArtifactType, string> = {
        notes: "Study notes",
        summary: "Summary",
        flashcards: "Flashcards",
        quizzes: "Quiz",
      };
      toast.success(`${labels[type]} ready`);
    } catch (error) {
      console.error(`Failed to generate ${type}`, error);
      toast.error(`Failed to generate ${type}`);
    } finally {
      setIsLoading(false);
    }
  };

  const requestGenerate = (type: StudyArtifactType) => {
    void runGeneration(type);
  };

  const clearPendingAttachment = () => {
    setPendingAttachment(null);
    if (tutorAttachmentInputRef.current) {
      tutorAttachmentInputRef.current.value = "";
    }
  };

  const onSelectTutorAttachment = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported for tutor attachments");
      event.target.value = "";
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("Image must be 5MB or smaller");
      event.target.value = "";
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read selected image"));
      reader.readAsDataURL(file);
    }).catch((error) => {
      console.error("Failed to read tutor attachment", error);
      return "";
    });
    if (!dataUrl) {
      toast.error("Could not load selected image");
      event.target.value = "";
      return;
    }
    setPendingAttachment({
      type: "image",
      name: file.name,
      mimeType: file.type || "image/*",
      dataUrl,
    });
    toast.success("Image attached");
  };

  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    if (isMicListening) {
      speechRecognitionRef.current?.stop();
      return;
    }
    const windowAny = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Recognition =
      windowAny.SpeechRecognition || windowAny.webkitSpeechRecognition;
    if (!Recognition) {
      toast.error("Voice input is not supported in this browser");
      return;
    }
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      if (transcript) {
        setTutorInput((prev) => [prev, transcript].filter(Boolean).join(" ").trim());
      }
    };
    recognition.onerror = () => {
      setIsMicListening(false);
      toast.error("Voice recognition failed");
    };
    recognition.onend = () => {
      setIsMicListening(false);
      speechRecognitionRef.current = null;
    };
    speechRecognitionRef.current = recognition;
    setIsMicListening(true);
    recognition.start();
  };

  const submitTutorQuestion = async (explicitMessage?: string) => {
    if (!sessionId) {
      toast.error("Session is still loading. Please wait.");
      return;
    }
    // Allow an explicit message (e.g. the question typed on the onboarding
    // screen) so we don't depend on the async tutorInput state being set yet.
    const message = (explicitMessage ?? tutorInput).trim();
    if (!message) return;

    // Guests get 3 free questions; the 4th opens the email gate instead of sending.
    if (hasReachedGuestQueryLimit()) {
      window.dispatchEvent(
        new CustomEvent("study:auth-gate", { detail: { reason: "query" } }),
      );
      return;
    }

    const intent = detectStudyChatIntent(message);
    const targetTab = intentTargetTab(intent);
    if (targetTab) {
      setActiveTab(targetTab);
      if (intent.type === "generate_quiz" || intent.type === "generate_questions") {
        toast("Use Generate in the Quizzes tab for practice questions.");
      }
    }

    const attachments = pendingAttachment ? [pendingAttachment] : undefined;

    const optimisticUser: TutorMessageDto = {
      _id: `temp-user-${Date.now()}`,
      sessionId,
      role: "user",
      message,
      citations: [],
      createdAt: new Date().toISOString(),
      ...(attachments?.length
        ? {
            attachments: attachments.map((a) => ({
              name: a.name,
              mimeType: a.mimeType,
              dataUrl: a.dataUrl,
            })),
          }
        : {}),
    };
    setTutorMessages((prev) => [...prev, optimisticUser]);
    setTutorInput("");
    clearPendingAttachment();
    setIsTutorResponding(true);
    const assistantMessageId = `temp-assistant-${Date.now()}`;

    try {
      const assistantMessage: TutorMessageDto = {
        _id: assistantMessageId,
        sessionId,
        role: "assistant",
        message: "",
        citations: [],
        createdAt: new Date().toISOString(),
      };
      setTutorMessages((prev) => [...prev, assistantMessage]);
      let streamedText = "";
      await streamStudyTutor(
        sessionId,
        message,
        attachments,
        { mode: STUDY_MODE, examTopics: [] },
        {
        onChunk: (chunk) => {
          streamedText += chunk;
          setTutorMessages((prev) =>
            prev.map((item) =>
              item._id === assistantMessageId
                ? { ...item, message: decodeHtmlEntities(streamedText) }
                : item,
            ),
          );
        },
        onError: (errorMessage) => {
          setTutorMessages((prev) =>
            prev.map((item) =>
              item._id === assistantMessageId
                ? {
                    ...item,
                    message:
                      item.message.trim() ||
                      `Tutor could not respond right now: ${errorMessage}`,
                  }
                : item,
            ),
          );
        },
        onDone: ({ citations, provenance }) => {
          // Count successful guest questions toward the free allowance.
          if (isGuest()) incrementGuestQueryCount();
          setTutorMessages((prev) =>
            prev.map((item) =>
              item._id === assistantMessageId
                ? {
                    ...item,
                    citations,
                    provenance:
                      provenance || (citations.length > 0 ? "source" : "general"),
                  }
                : item,
            ),
          );
        },
      },
      );
    } catch (error) {
      console.error("Failed to get tutor reply", error);
      const reason =
        error instanceof Error ? error.message : "Tutor request failed";
      setTutorMessages((prev) =>
        prev.map((item) =>
          item._id === assistantMessageId
            ? { ...item, message: `Tutor could not respond right now: ${reason}` }
            : item,
        ),
      );
      toast.error(reason);
    } finally {
      setIsTutorResponding(false);
    }
  };

  useEffect(() => {
    const result = recordingSnapshot.lastResult;
    if (!result || !sessionId) return;
    if (handledRecordingResultIds.current.has(result.id)) return;

    let cancelled = false;
    const persist = async () => {
      try {
        setIsPersistingRecording(true);
        handledRecordingResultIds.current.add(result.id);
        await simulateProcessingFlow();
        await persistRecordingResult(result);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to auto-save recording", error);
          toast.error("Recording ended but could not be saved");
        }
      } finally {
        if (!cancelled) {
          setIsPersistingRecording(false);
        }
      }
    };
    void persist();
    return () => {
      cancelled = true;
    };
  }, [recordingSnapshot.lastResult, sessionId]);

  useEffect(() => {
    const container = tutorMessagesScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [tutorMessages]);

  // Consume a question typed on the onboarding "Ask AI assistant" chat. It is
  // stashed in sessionStorage because the tutor only mounts once the workspace
  // is visible. Run after hydration so the submit has a ready session.
  useEffect(() => {
    if (!sessionId || isSessionHydrating || typeof window === "undefined") return;
    const key = `study_pending_tutor_question_${sessionId}`;
    const pending = window.sessionStorage.getItem(key);
    if (!pending) return;
    if (consumedPendingQuestionRef.current === key) return;
    consumedPendingQuestionRef.current = key;
    window.sessionStorage.removeItem(key);
    setTutorInput(pending);
    void submitTutorQuestion(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isSessionHydrating]);

  useEffect(() => {
    return () => {
      speechRecognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditable =
        tag === "input" || tag === "textarea" || target?.isContentEditable;
      if (isEditable) return;

      if (activeTab === "flashcards") {
        if (event.key === "ArrowLeft") {
          setFlashcardIndex((prev) => Math.max(prev - 1, 0));
          setFlashcardFlipped(false);
        }
        if (event.key === "ArrowRight") {
          setFlashcardIndex((prev) =>
            Math.min(prev + 1, Math.max(flashcardsContent.length - 1, 0)),
          );
          setFlashcardFlipped(false);
        }
        if (event.key.toLowerCase() === "f") {
          setFlashcardFlipped((prev) => !prev);
        }
      }

      if (activeTab === "quizzes") {
        if (event.key.toLowerCase() === "s" && !quizSubmitted) {
          setQuizSubmitted(true);
        }
        if (event.key.toLowerCase() === "r") {
          setQuizSelections({});
          setQuizSubmitted(false);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeTab, flashcardsContent.length, quizSubmitted]);

  const tutorHasChat = tutorMessages.length > 0;

  return (
    <section className="w-full px-3 pt-4 sm:px-5">
      <div
        className={`grid gap-4 lg:grid-cols-[1fr_500px] lg:items-stretch ${
          tutorHasChat ? "lg:h-[calc(100dvh-5.5rem)] lg:min-h-0" : ""
        }`}
      >
        <div
          className={`rounded-2xl border border-[#dfe4ff] bg-gradient-to-b from-[#fbfbff] to-[#f6f8ff] shadow-[0_2px_8px_rgba(95,112,255,0.08)] ${
            tutorHasChat ? "flex min-h-0 flex-col lg:h-full lg:min-h-0" : ""
          }`}
        >
          <div className="shrink-0 border-b border-[#e3e7ff] bg-gradient-to-r from-[#f4f6ff] to-[#eef1ff] px-3 py-2 rounded-tr-[15px] rounded-tl-[15px]">
            <div className="flex flex-wrap gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-base font-medium transition ${
                    activeTab === tab.id
                      ? "bg-white text-[#202447] shadow-sm ring-1 ring-[#cfd6ff]"
                      : "text-[#5f6178] hover:bg-white/70 hover:text-[#2e335f]"
                  }`}
                >
                  <span
                    className={
                      activeTab === tab.id ? "text-[#5f70ff]" : "text-[#8b90b8]"
                    }
                  >
                    {TAB_ICON[tab.id]}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="shrink-0 border-b border-[#ececf7] px-3 py-2">
            <span className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#5f70ff] to-[#6d57ff] px-3 py-1.5 text-sm font-semibold text-white shadow-sm">
              <FiBookOpen className="h-4 w-4" />
              {decodeHtmlEntities(sourceTitle)}
            </span>
          </div>

          <div
            className={`study-scroll overflow-y-auto p-5 ${
              tutorHasChat
                ? "min-h-0 flex-1 lg:max-h-none"
                : "max-h-[70vh] lg:max-h-[76vh]"
            }`}
          >
            {isSessionHydrating ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-[#e3e7ff] bg-white/80">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d7dcff] border-t-[#5f70ff]" />
                <p className="text-sm font-medium text-[#5f6490]">
                  Loading session...
                </p>
              </div>
            ) : null}
            {!isSessionHydrating && activeTab === "original" ? (
              <div className="rounded-xl border border-[#e3e4f3] bg-white p-4">
                {recordingSnapshot.status !== "idle" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[#6070ff]">
                      <span className="text-4xl font-semibold">
                        {formatDuration(recordingElapsedSeconds)}
                      </span>
                      <span className="text-2xl font-semibold">
                        Words: {recordingWordCount}
                      </span>
                    </div>
                    {!recordingSnapshot.liveTranscriptCapable ? (
                      <p className="text-center text-xs text-amber-900">
                        This browser does not support live transcription (no Speech Recognition).
                      </p>
                    ) : recordingSnapshot.mode === "browser-tab" ? (
                      <p className="text-center text-xs leading-snug text-[#6b7199]">
                        Live transcript follows your{" "}
                        <span className="font-semibold text-[#454b74]">microphone</span>, not
                        sound from the tab. Narrate or ask questions while recording to see text
                        here.
                      </p>
                    ) : null}
                    <div className="rounded-lg border border-[#e3e7ff] bg-[#fbfcff] p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b73ab]">
                        Live transcript
                      </p>
                      <p className="mt-2 max-h-36 overflow-y-auto whitespace-pre-wrap text-sm text-[#3f4468]">
                        {recordingSnapshot.transcript.trim()
                          ? recordingSnapshot.transcript
                          : recordingSnapshot.liveTranscriptCapable
                            ? "Listening…"
                            : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#d9defb] bg-[#fbfcff] p-6">
                      <div className="mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-[#d8defd] bg-black">
                        <video
                          ref={livePreviewRef}
                          autoPlay
                          muted
                          playsInline
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="mx-auto mt-4 flex w-full max-w-md items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={stopAndSaveRecording}
                          disabled={
                            isPersistingRecording || recordingSnapshot.status === "stopping"
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#5f70ff] to-[#6f7fff] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          <FiClock className="h-4 w-4" />
                          {recordingSnapshot.status === "stopping" || isPersistingRecording
                            ? "Saving..."
                            : "Stop Recording"}
                        </button>
                      </div>
                    </div>
                    <p className="text-center text-sm text-[#606481]">
                      Make sure you click stop recording when finished to save your
                      recording and use AI tools.
                    </p>
                  </div>
                ) : (
                  <>
                    {savedRecordings.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#ccd2ff] bg-white text-[#5f70ff]"
                            aria-label="Add new source"
                          >
                            <FiPlus className="h-4 w-4" />
                          </button>
                          {savedRecordings.map((recording) => (
                            <button
                              key={recording.id}
                              type="button"
                              onClick={() => setActiveRecordingId(recording.id)}
                              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                                activeSavedRecording?.id === recording.id
                                  ? "bg-[#5f70ff] text-white"
                                  : "bg-[#e8ebff] text-[#4b57b8]"
                              }`}
                            >
                              Saved Recording {formatDateLabel(recording.capturedAt)}
                            </button>
                          ))}
                        </div>
                        {activeSavedRecording?.mediaUrl ? (
                          <div className="overflow-hidden rounded-xl border border-[#d8defd] bg-[#f7f8ff] p-3">
                            <video
                              controls
                              className="aspect-video w-full rounded-lg bg-black"
                              src={activeSavedRecording.mediaUrl}
                            />
                            <p className="mt-3 text-xs text-[#6d7294]">
                              {activeSavedRecording.fileName} ·{" "}
                              {formatDuration(
                                Math.floor(activeSavedRecording.durationMs / 1000),
                              )}
                            </p>
                          </div>
                        ) : null}
                        <div className="rounded-md border border-[#e3e7ff] bg-[#fbfcff] p-3 text-sm text-[#3f4468]">
                          <p className="font-semibold">Transcript</p>
                          <p className="mt-2 whitespace-pre-wrap text-[#555b80]">
                            {activeSavedRecording?.transcript?.trim()
                              ? decodeHtmlEntities(activeSavedRecording.transcript)
                              : "No transcript available"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 text-base leading-8 text-[#30324a]">
                        {sourceText ? (
                          <p className="whitespace-pre-wrap">
                            {decodeHtmlEntities(sourceText)}
                          </p>
                        ) : (
                          <p className="text-center text-[#7a7d96]">
                            No source uploaded yet.
                          </p>
                        )}
                      </div>
                    )}
                    {isPersistingRecording ? (
                      <p className="mt-3 text-center text-sm text-[#6f74a0]">
                        Saving recording to your session...
                      </p>
                    ) : null}
                    {sourceText && savedRecordings.length > 0 ? (
                      <div className="mt-4 rounded-md border border-[#eceffd] bg-[#f9faff] p-3">
                        <p className="text-xs font-semibold text-[#5b6087]">Related Notes</p>
                        <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-xs text-[#6c7196]">
                          {decodeHtmlEntities(sourceText)}
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}

            {!isSessionHydrating && activeTab === "original" && isProcessingRecording ? (
              <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[#11132a]/35 px-4">
                <div className="w-full max-w-xl rounded-xl border border-[#e4e6ff] bg-white p-6 shadow-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-3xl font-semibold text-[#1c2142]">
                        Processing Your Content
                      </p>
                      <p className="mt-1 text-sm text-[#6f7497]">
                        Hold tight, your content is being analyzed by our AI.
                      </p>
                    </div>
                    <FiLoader className="mt-1 h-5 w-5 animate-spin text-[#5f70ff]" />
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm font-medium text-[#53597f]">
                      <span>Overall Progress</span>
                      <span>{processingPercent}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#eceffd]">
                      <div
                        className="h-full bg-gradient-to-r from-[#6070ff] to-[#6c7bff]"
                        style={{ width: `${processingPercent}%` }}
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      {PROCESSING_STEPS.map((step, index) => (
                        <div
                          key={step.id}
                          className={`flex items-center gap-2 text-sm ${
                            index <= processingIndex ? "text-[#3d4270]" : "text-[#9aa0be]"
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 rounded-full border ${
                              index < processingIndex
                                ? "border-[#6070ff] bg-[#6070ff]"
                                : index === processingIndex
                                  ? "border-[#6070ff] bg-white"
                                  : "border-[#d7dced] bg-white"
                            }`}
                          />
                          {step.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {!isSessionHydrating && activeTab === "notes" ? (
              <TabCard
                title="AI Notes"
                subtitle="Generate detailed notes covering the important information in your original content"
                onGenerate={() => requestGenerate("notes")}
                isLoading={isLoading}
              >
                {notesContent.sections?.length ? (
                  <div className="mt-5 space-y-3 text-left">
                    {notesContent.examTips && notesContent.examTips.length > 0 ? (
                      <div className="rounded-lg border border-[#c9d1ff] bg-[#f5f7ff] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#5f70ff]">
                          Exam tips
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#4c4e66]">
                          {notesContent.examTips.map((tip, i) => (
                            <li key={`exam-tip-${i}`}>{decodeHtmlEntities(tip)}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {notesContent.sections.map((section, index) => (
                      <div
                        key={`note-section-${index}`}
                        className="rounded-lg border border-[#e3e4f3] p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[#27283b]">
                            {decodeHtmlEntities(section.heading || "Section")}
                          </p>
                          {section.priority === "must-know" ? (
                            <span className="rounded-full bg-[#ffe8e8] px-2 py-0.5 text-[10px] font-bold uppercase text-[#b42318]">
                              Must know
                            </span>
                          ) : null}
                        </div>
                        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#4c4e66]">
                          {(section.bullets || []).map((bullet, bulletIdx) => (
                            <li key={`bullet-${index}-${bulletIdx}`}>
                              {decodeHtmlEntities(String(bullet))}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : null}
              </TabCard>
            ) : null}

            {!isSessionHydrating && activeTab === "summary" ? (
              <TabCard
                title="AI Summary"
                subtitle="Create a clear and easy-to-understand summary of your content"
                onGenerate={() => requestGenerate("summary")}
                isLoading={isLoading}
              >
                {summaryContent.short || summaryContent.detailed ? (
                  <div className="mt-6 space-y-4 text-left">
                    {summaryContent.short ? (
                      <div className="rounded-xl border border-[#c9d1ff] bg-[#f5f7ff] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5f70ff]">
                          TL;DR
                        </p>
                        <p className="mt-1.5 text-[15px] leading-7 text-[#40435d]">
                          {decodeHtmlEntities(summaryContent.short)}
                        </p>
                      </div>
                    ) : null}
                    {summaryContent.detailed ? (
                      <div className="rounded-xl border border-[#e3e4f3] bg-white p-5 sm:p-6">
                        <StudySummaryMarkdown
                          content={decodeHtmlEntities(summaryContent.detailed)}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </TabCard>
            ) : null}

            {!isSessionHydrating && activeTab === "flashcards" ? (
              <div className="rounded-xl border border-[#e3e4f3] bg-white p-4 text-center">
                {activeFlashcard ? (
                  <>
                    <h3 className="text-3xl font-semibold tracking-tight text-[#1f2033]">
                      AI Flashcards
                    </h3>
                    <div className="flashcard-scene mx-auto mt-4 max-w-xl">
                      <button
                        type="button"
                        onClick={() => setFlashcardFlipped((prev) => !prev)}
                        className={`flashcard-inner h-[240px] w-full rounded-xl focus:outline-none ${
                          flashcardFlipped ? "is-flipped" : ""
                        }`}
                        aria-label="Flip flashcard"
                      >
                        <div className="flashcard-face flashcard-front rounded-xl border border-[#7480e8] bg-white p-6">
                          <p className="text-center text-xs text-[#8a8db0]">Question</p>
                          <div className="study-scroll mt-4 flex-1 overflow-y-auto">
                            <p className="whitespace-pre-wrap break-words px-2 text-center text-2xl font-semibold leading-10 text-[#202238]">
                              {decodeHtmlEntities(activeFlashcard.front)}
                            </p>
                          </div>
                          <span className="mt-4 inline-block text-center text-xs text-[#7a7db1]">
                            Click to Flip
                          </span>
                        </div>
                        <div className="flashcard-face flashcard-back rounded-xl border border-[#7480e8] bg-[#f8f9ff] p-6">
                          <p className="text-center text-xs text-[#8a8db0]">Answer</p>
                          <div className="study-scroll mt-4 flex-1 overflow-y-auto">
                            <p className="whitespace-pre-wrap break-words px-2 text-center text-2xl font-semibold leading-10 text-[#202238]">
                              {decodeHtmlEntities(activeFlashcard.back)}
                            </p>
                          </div>
                          <span className="mt-4 inline-block text-center text-xs text-[#7a7db1]">
                            Click to Flip Back
                          </span>
                        </div>
                      </button>
                    </div>
                    <div className="mx-auto mt-4 flex max-w-xs items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setFlashcardIndex((prev) => Math.max(prev - 1, 0));
                          setFlashcardFlipped(false);
                        }}
                        disabled={flashcardIndex === 0}
                        className="rounded-md border border-[#ced1ef] px-3 py-1 text-sm disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <p className="text-sm text-[#5d6080]">
                        {flashcardIndex + 1} of {flashcardsContent.length}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFlashcardIndex((prev) =>
                            Math.min(prev + 1, flashcardsContent.length - 1),
                          );
                          setFlashcardFlipped(false);
                        }}
                        disabled={flashcardIndex >= flashcardsContent.length - 1}
                        className="rounded-md border border-[#ced1ef] px-3 py-1 text-sm disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <TabCard
                    title="AI Flashcards"
                    subtitle="Create active-recall flashcards from your content"
                    onGenerate={() => requestGenerate("flashcards")}
                    isLoading={isLoading}
                  />
                )}
              </div>
            ) : null}

            {!isSessionHydrating && activeTab === "quizzes" ? (
              <div className="rounded-xl border border-[#e3e4f3] bg-white p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1e1f32]">Your Quizzes</h3>
                  {quizzesContent.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setQuizSubmitted((prev) => !prev)}
                      className="rounded-md bg-[#5f70ff] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      {quizSubmitted ? "Back to practice" : "View all answers"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => requestGenerate("quizzes")}
                      className="rounded-md bg-[#5f70ff] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      {isLoading ? "Creating..." : "Create Quiz"}
                    </button>
                  )}
                </div>

                <StudyQuizPanel
                  quizzes={quizzesContent}
                  quizQuestionIndex={quizQuestionIndex}
                  setQuizQuestionIndex={setQuizQuestionIndex}
                  quizSelections={quizSelections}
                  setQuizSelections={setQuizSelections}
                  quizSubmitted={quizSubmitted}
                  setQuizSubmitted={setQuizSubmitted}
                  answeredCount={answeredCount}
                  quizScore={quizScore}
                />
              </div>
            ) : null}
          </div>
        </div>

        <aside
          className={`rounded-2xl border border-[#dfe3ff] bg-gradient-to-b from-[#fbfbff] to-[#f6f8ff] p-4 shadow-[0_2px_10px_rgba(95,112,255,0.08)] ${
            tutorHasChat ? "flex min-h-0 flex-col lg:h-full lg:min-h-0" : ""
          }`}
        >
          <p className="mb-3 inline-flex shrink-0 items-center gap-1.5 text-base font-semibold text-[#545775]">
            <FiHelpCircle className="h-4 w-4 text-[#5f70ff]" />
            AI Tutor
          </p>
          <div className="grid shrink-0 grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("flashcards")}
              className="rounded-xl border border-[#e6e8f6] bg-white p-3 text-left transition hover:border-[#cfd6ff] hover:bg-[#f9faff]"
            >
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-[#2f3250]">
                <FiLayers className="h-3.5 w-3.5 text-[#6c7aff]" />
                Flashcards
              </p>
              <p className="text-xs text-[#7b7fa2]">Study with active recall</p>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quizzes")}
              className="rounded-xl border border-[#e6e8f6] bg-white p-3 text-left transition hover:border-[#cfd6ff] hover:bg-[#f9faff]"
            >
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-[#2f3250]">
                <FiCheckSquare className="h-3.5 w-3.5 text-[#6c7aff]" />
                Quizzes
              </p>
              <p className="text-xs text-[#7b7fa2]">Test your knowledge</p>
            </button>
          </div>

          {!isSessionHydrating && tutorMessages.length === 0 ? (
            <>
              <div className="my-8 flex shrink-0 justify-center">
                <Image
                  src="/videos/icon.gif"
                  alt=""
                  width={112}
                  height={112}
                  unoptimized
                  className="h-28 w-28 object-contain"
                  aria-hidden
                />
              </div>

              <div className="shrink-0 px-3 text-center">
                <p className="font-semibold text-[#292b42]">Have a Question about your import?</p>
                <p className="mt-2 text-sm text-[#7f829d]">
                  You can ask questions about your imported content, and your answers will
                  appear here
                </p>
              </div>

              <div className="mt-4 flex shrink-0 flex-wrap gap-2">
                {["Write a paragraph...", "Explain concept...", "Compare with..."].map(
                  (chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setTutorInput(chip)}
                      className="rounded-md border border-[#dcdff2] bg-white px-3 py-1.5 text-sm text-[#616484] transition hover:border-[#c9d1ff] hover:bg-[#f7f9ff]"
                    >
                      {chip}
                    </button>
                  ),
                )}
              </div>
            </>
          ) : null}

          <div
            ref={tutorMessagesScrollRef}
            className={`study-scroll mt-4 overflow-y-auto rounded-xl border border-[#e6e8f7] bg-white p-3 ${
              tutorHasChat
                ? "min-h-[min(480px,calc(100dvh-13rem))] flex-1 basis-0 lg:min-h-0"
                : "max-h-[28vh] lg:max-h-[34vh]"
            }`}
          >
            {isSessionHydrating ? (
              <div className="flex min-h-[120px] items-center justify-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d7dcff] border-t-[#5f70ff]" />
                <span className="text-sm text-[#7e83aa]">Loading tutor...</span>
              </div>
            ) : tutorMessages.length === 0 ? (
              <p className="text-sm text-[#8286a6]">No tutor messages yet.</p>
            ) : (
              <div className="space-y-2">
                {tutorMessages.slice(-6).map((item) => (
                  <div
                    key={item._id}
                    className={`rounded-md px-2.5 py-2 text-sm ${
                      item.role === "user"
                        ? "bg-[#edf0ff] text-[#353b89]"
                        : "bg-[#f5f6fc] text-[#424660]"
                    }`}
                  >
                    {item.role === "assistant" && item.provenance ? (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#6b73ab]">
                        {item.provenance === "source"
                          ? "Source-backed"
                          : item.provenance === "image"
                            ? "Image analysis"
                            : "Not from source"}
                      </p>
                    ) : null}
                    {item.role === "assistant" && !item.message.trim() ? (
                      <span className="inline-flex items-center gap-2 text-[#636a90]">
                        <span className="thinking-dot" />
                        <span className="thinking-dot" />
                        <span className="thinking-dot" />
                        <span className="text-xs">Thinking...</span>
                      </span>
                    ) : item.role === "assistant" ? (
                      <StudyTutorMarkdown content={decodeHtmlEntities(item.message)} />
                    ) : (
                      <TutorUserMessageBody item={item} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 shrink-0 rounded-2xl border border-[#7480e8] bg-white p-3 shadow-[0_0_0_2px_rgba(116,128,232,0.08)]">
            {pendingAttachment ? (
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#dbe0ff] bg-[#f5f7ff] px-3 py-1 text-xs text-[#48508f]">
                <FiImage className="h-3.5 w-3.5 text-[#5f70ff]" />
                <span className="max-w-[220px] truncate">{pendingAttachment.name}</span>
                <button
                  type="button"
                  onClick={clearPendingAttachment}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#6f76a8] hover:bg-[#e9edff]"
                  aria-label="Remove attachment"
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <input
                ref={tutorAttachmentInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={onSelectTutorAttachment}
              />
              <button
                type="button"
                onClick={() => tutorAttachmentInputRef.current?.click()}
                disabled={isTutorResponding || isSessionHydrating}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6470af] transition hover:bg-[#eef1ff] disabled:opacity-60"
                aria-label="Attach image"
                title="Attach image"
              >
                <FiImage className="h-4 w-4 text-[#5f70ff]" />
              </button>
              <input
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                placeholder="Ask AI assistant..."
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#a0a4bf]"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void submitTutorQuestion();
                  }
                }}
              />
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isTutorResponding || isSessionHydrating}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition disabled:opacity-60 ${
                  isMicListening
                    ? "bg-[#5f70ff] text-white shadow-[0_0_0_4px_rgba(95,112,255,0.16)]"
                    : "text-[#6470af] hover:bg-[#eef1ff]"
                }`}
                aria-label={isMicListening ? "Stop voice input" : "Start voice input"}
              >
                <FiMic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => void submitTutorQuestion()}
                disabled={isTutorResponding || isSessionHydrating}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#5f70ff] text-white disabled:opacity-60"
              >
                {isTutorResponding ? (
                  <FiLoader className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FiSend className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </aside>
      </div>
      <style jsx global>{`
        .study-scroll {
          scrollbar-width: thin;
          scrollbar-color: #96a4ff #eef1ff;
        }
        .study-scroll::-webkit-scrollbar {
          width: 9px;
          height: 9px;
        }
        .study-scroll::-webkit-scrollbar-track {
          background: #eef1ff;
          border-radius: 9999px;
        }
        .study-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #7c8cff 0%, #6274ff 100%);
          border-radius: 9999px;
          border: 2px solid #eef1ff;
        }
        .study-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #6f80ff 0%, #5367ff 100%);
        }
        .flashcard-scene {
          perspective: 1200px;
        }
        .flashcard-inner {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 520ms cubic-bezier(0.2, 0.6, 0.2, 1);
        }
        .flashcard-inner.is-flipped {
          transform: rotateY(180deg);
        }
        .flashcard-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
          box-shadow: 0 10px 30px rgba(95, 112, 255, 0.08);
        }
        .flashcard-back {
          transform: rotateY(180deg);
        }
        .thinking-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #6672b8;
          opacity: 0.45;
          animation: tutor-thinking 1s infinite ease-in-out;
        }
        .thinking-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .thinking-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes tutor-thinking {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .flashcard-inner {
            transition: none;
          }
          .thinking-dot {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

function TabCard({
  title,
  subtitle,
  onGenerate,
  isLoading,
  children,
}: {
  title: string;
  subtitle: string;
  onGenerate: () => void;
  isLoading: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e3e4f3] bg-white p-5 text-center shadow-[inset_0_0_0_1px_rgba(95,112,255,0.04)]">
      <p className="text-[34px] font-semibold tracking-tight text-[#1f2138]">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm text-[#6d7191]">{subtitle}</p>
      {!children ? (
        <div className="mt-6 inline-flex items-center gap-1 rounded-full bg-[#f2f4ff] px-3 py-1 text-[11px] text-[#6d7191]">
          <FiZap className="h-3 w-3 text-[#6070ff]" />
          AI generation uses your imported source only
        </div>
      ) : null}
      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#6070ff] to-[#6e5cff] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Generating..." : "Generate"}
        <FiArrowRight className="h-3.5 w-3.5" />
      </button>
      {children}
      
    </div>
  );
}
