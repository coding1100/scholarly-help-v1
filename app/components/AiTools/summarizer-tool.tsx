"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaChevronDown,
  FaDownload,
  FaEdit,
  FaFolderOpen,
  FaFolderPlus,
  FaSave,
  FaStop,
  FaSyncAlt,
  FaTimes,
  FaVolumeUp,
} from "react-icons/fa";
import TextSummarizerInput from "./TextSummarizerInput";
import ResultDisplay from "./ResultDisplay";
import ActionButtons from "./ActionButtons";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import SummarizerChat from "@/app/components/AiTools/SummarizerChat/SummarizerChat";
import { sanitizeHtml } from "@/app/utils/sanitizeHtml";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";

type OutputType = "text_summary" | "flashcards" | "slide_deck" | "audio_summary";

type Folder = {
  _id: string;
  name: string;
  source_tool?: string;
};

type SavedDocument = {
  _id: string;
  title: string;
  content?: string;
  folder_id?: string | null;
  source_tool?: string;
  source_outputs?: string[];
  source_payload?: Record<string, any> | null;
  createdAt?: string;
  updatedAt?: string;
};

type EditableSlide = {
  title: string;
  bullets: string[];
  notes?: string;
};

type SummarizerResult = {
  summary?: string;
  flashcards?: unknown;
  slide_deck?: unknown;
  audio_summary?: unknown;
  saved_document_id?: string;
  tokens_used?: number;
};

const outputOptions: Array<{ value: OutputType; label: string }> = [
  { value: "text_summary", label: "Text" },
  { value: "flashcards", label: "Flashcards" },
  { value: "slide_deck", label: "Slide Deck" },
  { value: "audio_summary", label: "Audio" },
];

const SUMMARIZER_SOURCE_TOOL = "summarizer";

const toList = (value: unknown): any[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    if (Array.isArray(objectValue.slides)) return objectValue.slides;
    if (Array.isArray(objectValue.flashcards)) return objectValue.flashcards;
    if (Array.isArray(objectValue.cards)) return objectValue.cards;
  }
  return [];
};

const formatSlideDeck = (value: unknown) => {
  const slides = toList(value);
  if (!slides.length) return "";

  return slides
    .map((slide, index) => {
      const title = slide?.title || `Slide ${index + 1}`;
      const bullets = Array.isArray(slide?.bullets)
        ? slide.bullets
        : Array.isArray(slide?.points)
          ? slide.points
          : [];
      const notes = slide?.notes ? `\nNotes: ${slide.notes}` : "";
      const bulletText = bullets.map((bullet: unknown) => `- ${String(bullet)}`).join("\n");
      return [`### Slide ${index + 1}: ${title}`, bulletText, notes].filter(Boolean).join("\n");
    })
    .join("\n\n");
};

const formatFlashcards = (value: unknown) => {
  const flashcards = toList(value);
  if (!flashcards.length) return "";

  return flashcards
    .map((card, index) => {
      const question = card?.question || card?.front || card?.term || `Card ${index + 1}`;
      const answer = card?.answer || card?.back || card?.definition || "";
      return [`### Card ${index + 1}`, `**Q:** ${question}`, answer ? `**A:** ${answer}` : ""]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
};

const formatStructuredFallback = (label: string, value: unknown) => {
  if (typeof value === "string") return `${label}\n${value}`;
  return `${label}\n${JSON.stringify(value, null, 2)}`;
};

const getAudioSummaryText = (value: unknown) =>
  value && typeof value === "object" && "text" in value
    ? String((value as { text?: unknown }).text || "")
    : "";

const isAudioOnlyDocument = (doc: SavedDocument) =>
  doc.source_outputs?.length === 1 && doc.source_outputs[0] === "audio_summary";

const isAudioOnlyResult = (result: SummarizerResult) =>
  Boolean(result.audio_summary) &&
  !result.summary &&
  !result.flashcards &&
  !result.slide_deck;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildSlideDeckHtml = (slides: EditableSlide[]) =>
  `<h2>Slide Deck</h2>${slides
    .map((slide, index) => {
      const bullets = slide.bullets.filter((bullet) => bullet.trim());
      return `<section><h3>Slide ${index + 1}: ${escapeHtml(
        slide.title || `Slide ${index + 1}`,
      )}</h3>${
        bullets.length
          ? `<ul>${bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`
          : ""
      }${slide.notes ? `<p><strong>Notes:</strong> ${escapeHtml(slide.notes)}</p>` : ""}</section>`;
    })
    .join("\n")}`;

const normalizeSlides = (value: unknown): EditableSlide[] => {
  const slides = toList(value);
  return slides.map((slide, index) => ({
    title: String(slide?.title || `Slide ${index + 1}`),
    bullets: Array.isArray(slide?.bullets)
      ? slide.bullets.map((bullet: unknown) => String(bullet))
      : Array.isArray(slide?.points)
        ? slide.points.map((point: unknown) => String(point))
        : [],
    notes: slide?.notes ? String(slide.notes) : "",
  }));
};

const parseSlidesFromLegacyContent = (content?: string): EditableSlide[] => {
  if (!content) return [];
  const preMatch = content.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  if (preMatch) {
    const jsonText = preMatch[1]
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
    try {
      return normalizeSlides(JSON.parse(jsonText));
    } catch {
      return [];
    }
  }
  return [];
};

// Interactive flashcard: shows the question; the answer is hidden until the
// user clicks to reveal it (and can be hidden again).
const FlashcardItem = ({
  index,
  question,
  answer,
}: {
  index: number;
  question: string;
  answer: string;
}) => {
  const [revealed, setRevealed] = useState(false);
  const canReveal = Boolean(answer);

  return (
    <article className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm dark:border-emerald-900/60 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
          Card {index + 1}
        </span>
        {canReveal && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="text-xs font-semibold text-emerald-700 hover:underline focus:outline-none dark:text-emerald-300"
            aria-expanded={revealed}
          >
            {revealed ? "Hide answer" : "Show answer"}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => canReveal && setRevealed((v) => !v)}
        className="w-full cursor-pointer text-left"
        aria-label={revealed ? "Hide answer" : "Reveal answer"}
      >
        <p className="text-sm font-semibold leading-6 text-gray-950 dark:text-gray-50">
          {question}
        </p>
      </button>

      {canReveal ? (
        revealed ? (
          <p className="mt-3 rounded-md bg-emerald-50 p-3 text-sm leading-6 text-gray-700 dark:bg-emerald-950/30 dark:text-gray-200">
            {answer}
          </p>
        ) : (
          <p className="mt-3 select-none rounded-md border border-dashed border-emerald-200 bg-emerald-50/40 p-3 text-center text-xs font-medium text-emerald-700/70 dark:border-emerald-900/60 dark:bg-emerald-950/10 dark:text-emerald-300/70">
            Click to reveal the answer
          </p>
        )
      ) : null}
    </article>
  );
};

const StructuredResultView = ({ result }: { result: SummarizerResult }) => {
  const slides = toList(result.slide_deck);
  const flashcards = toList(result.flashcards);
  const audioText = getAudioSummaryText(result.audio_summary);
  const visibleSummary = result.summary || audioText;

  return (
    <div className="h-full overflow-y-auto pr-1 scrollbar-hide">
      <div className="space-y-4">
        {visibleSummary && (
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {result.summary ? "Summary" : "Audio Summary"}
              </h3>
            </div>
            <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-800 dark:text-gray-100">
              {visibleSummary}
            </p>
          </section>
        )}

        {slides.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Slide Deck
              </h3>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200">
                {slides.length} slides
              </span>
            </div>
            <div className="space-y-3">
              {slides.map((slide, index) => {
                const bullets = Array.isArray(slide?.bullets)
                  ? slide.bullets
                  : Array.isArray(slide?.points)
                    ? slide.points
                    : [];

                return (
                  <article
                    key={`${slide?.title || "slide"}-${index}`}
                    className="rounded-lg border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/60 p-4 shadow-sm dark:border-indigo-900/60 dark:from-gray-900 dark:to-indigo-950/20"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <h4 className="pt-1 text-base font-semibold leading-6 text-gray-950 dark:text-gray-50">
                        {slide?.title || `Slide ${index + 1}`}
                      </h4>
                    </div>
                    {bullets.length > 0 && (
                      <ul className="space-y-2 pl-11">
                        {bullets.map((bullet: unknown, bulletIndex: number) => (
                          <li
                            key={`${index}-${bulletIndex}`}
                            className="relative text-sm leading-6 text-gray-700 before:absolute before:-left-4 before:top-2.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-indigo-400 dark:text-gray-200"
                          >
                            {String(bullet)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {slide?.notes && (
                      <p className="mt-3 rounded-md bg-white/70 p-3 text-sm leading-6 text-gray-600 dark:bg-gray-950/40 dark:text-gray-300">
                        {slide.notes}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {flashcards.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Flashcards
              </h3>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200">
                {flashcards.length} cards
              </span>
            </div>
            <div className="grid gap-3">
              {flashcards.map((card, index) => {
                const question =
                  card?.question || card?.front || card?.term || `Card ${index + 1}`;
                const answer = card?.answer || card?.back || card?.definition || "";

                return (
                  <FlashcardItem
                    key={`${question}-${index}`}
                    index={index}
                    question={question}
                    answer={answer}
                  />
                );
              })}
            </div>
          </section>
        )}

        {result.saved_document_id && !isAudioOnlyResult(result) && (
          <section className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            Saved document: {result.saved_document_id}
          </section>
        )}
      </div>
    </div>
  );
};

// Maximum input the summarizer accepts (words). Mirrors the backend
// SUMMARIZER_MAX_INPUT_WORDS guard.
const MAX_INPUT_WORDS = 20000;

const SummarizerTool: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [currentInputText, setCurrentInputText] = useState("");
  const [summaryStyle, setSummaryStyle] = useState("Paragraph");
  const [inputWordsExceeded, setInputWordsExceeded] = useState(false);
  const [detailLevel, setDetailLevel] = useState("standard");
  const [outputs, setOutputs] = useState<OutputType[]>(["text_summary"]);
  const [result, setResult] = useState<SummarizerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jobMessage, setJobMessage] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [browseFolderId, setBrowseFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [saveToDocument, setSaveToDocument] = useState(false);
  const [isFolderPanelOpen, setIsFolderPanelOpen] = useState(false);
  const [isFetchingDocuments, setIsFetchingDocuments] = useState(false);
  const [editingDocument, setEditingDocument] = useState<SavedDocument | null>(null);
  const [editingSlides, setEditingSlides] = useState<EditableSlide[] | null>(null);
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();
  const editorRef = useRef<HTMLDivElement | null>(null);
  // Tracks the job currently being polled. A new submit or unmount changes this
  // so stale polls stop updating state / clobbering newer results.
  const activeJobRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      activeJobRef.current = null;
    };
  }, []);

  const baseUrl =
    process.env.NEXT_PUBLIC_NGROX_URL || process.env.NEXT_PUBLIC_BASE_URL || "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  // Warm up the speech-synthesis voice list. In Chrome getVoices() is empty
  // until the async 'voiceschanged' event fires; touching it here ensures a
  // preferred voice is available by the time the user plays the audio summary.
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.addEventListener?.("voiceschanged", warm);
    return () =>
      window.speechSynthesis.removeEventListener?.("voiceschanged", warm);
  }, []);

  // Cancel any in-progress speech when the component unmounts.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchFolders();
  }, [baseUrl, token]);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  const fetchFolders = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${baseUrl}/documents/folders`, {
        headers: authHeaders,
        params: { source_tool: SUMMARIZER_SOURCE_TOOL },
      });
      setFolders(response.data?.data || []);
    } catch {
      undefined;
    }
  };

  const fetchDocuments = async () => {
    if (!token) return;
    setIsFetchingDocuments(true);
    try {
      const response = await axios.get(`${baseUrl}/documents`, {
        headers: authHeaders,
        params: { source_tool: SUMMARIZER_SOURCE_TOOL },
      });
      setDocuments(response.data?.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load saved documents.");
    } finally {
      setIsFetchingDocuments(false);
    }
  };

  const openFolderPanel = async () => {
    setIsFolderPanelOpen((current) => !current);
    if (!isFolderPanelOpen) {
      await Promise.all([fetchFolders(), fetchDocuments()]);
    }
  };

  const resultText = useMemo(() => {
    if (!result) return "";
    const parts: string[] = [];
    if (result.summary) parts.push(result.summary);
    if (!result.summary && getAudioSummaryText(result.audio_summary)) {
      parts.push(getAudioSummaryText(result.audio_summary));
    }
    if (result.flashcards) {
      parts.push(
        `## Flashcards\n\n${
          formatFlashcards(result.flashcards) ||
          formatStructuredFallback("Flashcards", result.flashcards)
        }`,
      );
    }
    if (result.slide_deck) {
      parts.push(
        `## Slide Deck\n\n${
          formatSlideDeck(result.slide_deck) ||
          formatStructuredFallback("Slide Deck", result.slide_deck)
        }`,
      );
    }
    if (result.saved_document_id) {
      parts.push(`Saved document: ${result.saved_document_id}`);
    }
    return parts.join("\n\n");
  }, [result]);

  const pickPrettyVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const preferredNames = [
      "Google UK English Female",
      "Microsoft Jenny",
      "Microsoft Aria",
      "Samantha",
      "Karen",
      "Moira",
      "Google US English",
    ];
    return (
      preferredNames
        .map((name) => voices.find((voice) => voice.name.includes(name)))
        .find(Boolean) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en") && /female|jenny|aria|samantha|karen|moira/i.test(voice.name)) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ||
      voices[0] ||
      null
    );
  };

  const speakAudioSummary = () => {
    const text =
      typeof result?.audio_summary === "object" &&
      result.audio_summary &&
      "text" in result.audio_summary
        ? String((result.audio_summary as any).text || "")
        : "";
    if (!text || typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Audio summary is not available in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickPrettyVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopAudioSummary = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleOutput = (output: OutputType) => {
    setOutputs((current) => {
      if (current.includes(output)) {
        const next = current.filter((item) => item !== output);
        return next.length ? next : ["text_summary"];
      }
      return [...current, output];
    });
  };

  const createFolder = async () => {
    if (!newFolderName.trim() || !token) return;
    try {
      const response = await axios.post(
        `${baseUrl}/documents/folders`,
        { name: newFolderName.trim(), source_tool: SUMMARIZER_SOURCE_TOOL },
        { headers: authHeaders },
      );
      const folder = response.data?.data;
      if (folder?._id) {
        setFolders((current) => [folder, ...current]);
        setSelectedFolderId(folder._id);
        setBrowseFolderId(folder._id);
      }
      setNewFolderName("");
      toast.success("Folder created.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create folder.");
    }
  };

  const handleFileUpload = async (nextFile: File) => {
    // Guests may upload a document to summarize; parsing is guest-allowed on the
    // backend and the summarize action itself is gated by the click limit.
    const formData = new FormData();
    formData.append("file", nextFile);

    setIsLoading(true);
    setJobMessage("Reading document");
    try {
      const response = await axios.post(`${baseUrl}/tools/summarizer/parse-document`, formData, {
        headers: {
          ...authHeaders,
          "Content-Type": "multipart/form-data",
        },
      });
      const payload = response.data?.data;
      const parsedText =
        typeof payload === "string"
          ? payload
          : payload?.text || payload?.content || "";
      if (!parsedText.trim()) {
        toast.error("No readable text found in this document.");
        return;
      }
      setCurrentInputText(parsedText);
      toast.success("Document text loaded.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to read document.");
    } finally {
      setIsLoading(false);
      setJobMessage("");
    }
  };

  const pollJob = async (jobId: string | undefined) => {
    if (!jobId) {
      throw new Error("Server did not return a job id.");
    }
    // Mark this as the active job; supersedes any earlier in-flight poll.
    activeJobRef.current = jobId;

    for (let attempt = 0; attempt < 120; attempt += 1) {
      // Stop if the component unmounted or a newer job took over.
      if (!isMountedRef.current || activeJobRef.current !== jobId) return;

      const response = await axios.get(
        `${baseUrl}/tools/summarizer/jobs/${jobId}`,
        { headers: authHeaders },
      );

      if (!isMountedRef.current || activeJobRef.current !== jobId) return;

      const job = response.data?.data;
      if (!job) {
        throw new Error("Invalid job response from server.");
      }
      setJobMessage(`${job.status} (${job.progress || 0}%)`);
      if (job.status === "completed") {
        setResult(job.result);
        if (job.result?.saved_document_id && !isAudioOnlyResult(job.result)) {
          await fetchDocuments();
          setIsFolderPanelOpen(true);
        }
        toast.success("Summary generated successfully!");
        activeJobRef.current = null;
        return;
      }
      if (job.status === "failed") {
        throw new Error(job.error || "Summarizer job failed.");
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    throw new Error("Summary job timed out.");
  };

  const handleSummarize = async () => {
    // Guests (no token) are allowed — the backend accepts guest requests and
    // the click gate below enforces the free allowance. Do NOT block on token.
    if (!currentInputText.trim()) {
      toast.error("Please enter text to summarize.");
      return;
    }
    if (inputWordsExceeded) {
      toast.error(
        `Input exceeds the ${MAX_INPUT_WORDS.toLocaleString()}-word limit. Please shorten it.`,
      );
      return;
    }

    // Guests get a small number of free AI actions across all tools; the gate
    // opens instead of calling the AI once the allowance is used up.
    guardAiClick(async () => {
      trackToolGenerate({ toolName: "Summarizer Tool" });
      // Invalidate any previous in-flight poll so it can't clobber this run.
      activeJobRef.current = null;
      setIsLoading(true);
      setResult(null);
      setJobMessage("");

      try {
        const commonPayload = {
          format: summaryStyle,
          detail_level: detailLevel,
          outputs,
          save_to_document: saveToDocument,
          ...(selectedFolderId ? { folder_id: selectedFolderId } : {}),
        };

        if (currentInputText.length < 14000) {
          const response = await axios.post(
            `${baseUrl}/tools/summarizer`,
            { text: currentInputText, ...commonPayload },
            {
              headers: {
                ...authHeaders,
                "Content-Type": "application/json",
              },
            },
          );
          const data = response.data?.data;
          setResult(data);
          if (data?.saved_document_id && !isAudioOnlyResult(data)) {
            await fetchDocuments();
            setIsFolderPanelOpen(true);
          }
          toast.success(response.data?.message || "Summary generated successfully!");
          return;
        }

        const formData = new FormData();
        formData.append("source_type", "text");
        formData.append("format", summaryStyle);
        formData.append("detail_level", detailLevel);
        formData.append("outputs", outputs.join(","));
        formData.append("save_to_document", String(saveToDocument));
        if (selectedFolderId) formData.append("folder_id", selectedFolderId);
        formData.append("text", currentInputText);

        const response = await axios.post(`${baseUrl}/tools/summarizer/jobs`, formData, {
          headers: {
            ...authHeaders,
            "Content-Type": "multipart/form-data",
          },
        });
        await pollJob(response.data?.data?.id);
      } catch (error: any) {
        const msg = error?.response?.data?.message || error?.message || "Failed to summarize.";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleClearAllInputs = () => {
    stopAudioSummary();
    setCurrentInputText("");
    setResult(null);
    setJobMessage("");
  };

  const openDocumentEditor = async (documentId: string) => {
    try {
      const response = await axios.get(`${baseUrl}/documents/${documentId}`, {
        headers: authHeaders,
      });
      const doc = response.data?.data as SavedDocument;
      const slides =
        normalizeSlides(doc.source_payload?.slide_deck).length > 0
          ? normalizeSlides(doc.source_payload?.slide_deck)
          : parseSlidesFromLegacyContent(doc.content);
      setEditingSlides(slides.length ? slides : null);
      setEditingDocument(doc);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to open document.");
    }
  };

  const saveEditedDocument = async () => {
    if (!editingDocument) return;
    const content = editingSlides
      ? buildSlideDeckHtml(editingSlides)
      : editorRef.current?.innerHTML.trim() || "";
    if (!content) {
      toast.error("Document content cannot be empty.");
      return;
    }

    setIsSavingDocument(true);
    try {
      const sourceOutputs = editingSlides
        ? Array.from(new Set([...(editingDocument.source_outputs || []), "slide_deck"]))
        : editingDocument.source_outputs;
      const response = await axios.patch(
        `${baseUrl}/documents/${editingDocument._id}/content`,
        {
          content,
          ...(editingSlides
            ? {
                source_outputs: sourceOutputs,
                source_payload: {
                  ...(editingDocument.source_payload || {}),
                  slide_deck: { slides: editingSlides },
                },
              }
            : {}),
        },
        { headers: authHeaders },
      );
      const updatedDoc = response.data?.data;
      setEditingDocument(updatedDoc);
      if (editingSlides) {
        setEditingSlides(normalizeSlides(updatedDoc?.source_payload?.slide_deck));
      }
      await fetchDocuments();
      toast.success("Document updated.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save document.");
    } finally {
      setIsSavingDocument(false);
    }
  };

  const downloadDocument = async (documentId: string) => {
    try {
      const response = await axios.get(`${baseUrl}/documents/${documentId}/export?format=docx`, {
        headers: authHeaders,
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "summary.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to download document.");
    }
  };

  const visibleDocuments = useMemo(() => {
    const nonAudioDocuments = documents.filter((doc) => !isAudioOnlyDocument(doc));
    if (!browseFolderId) return nonAudioDocuments;
    return nonAudioDocuments.filter((doc) => doc.folder_id === browseFolderId);
  }, [browseFolderId, documents]);

  return (
    <div className="container relative overflow-y-auto scrollbar-hide h-[calc(100vh-8vh)] mx-auto max-w-[1040px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <ToolsApiLoader show={isLoading} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm h-full flex flex-col overflow-hidden transition-colors duration-300">
          <TextSummarizerInput
            title="AI Summarizer"
            onTextChange={setCurrentInputText}
            onFileUpload={handleFileUpload}
            initialText={currentInputText}
            placeholder="Enter long text for summarization, or upload a document..."
            accept=".pdf,.docx,.txt"
            uploadButtonText="Upload Document"
            showWordLimit
            maxWords={MAX_INPUT_WORDS}
            onWordLimitExceeded={setInputWordsExceeded}
          />

          {/* On mobile the action buttons render before this block (see order
              classes) so Summarize stays above the fold. */}
          <div className="order-3 md:order-none space-y-4 border-t md:border-t-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-4 transition-colors duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Summary Style
                <span className="relative mt-1 block">
                  <select
                    value={summaryStyle}
                    onChange={(e) => setSummaryStyle(e.target.value)}
                    className="w-full rounded-md border border-gray-200 text-black dark:border-gray-600 bg-white p-2 pr-7 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-gray-900 dark:text-gray-100 appearance-none"
                  >
                    <option value="Paragraph">Paragraph</option>
                    <option value="Bullet Points">Bullet Points</option>
                    <option value="Numbered List">Numbered List</option>
                    <option value="Study Notes">Study Notes</option>
                  </select>
                  <FaChevronDown className="pointer-events-none absolute right-2 top-3 w-3 h-3 text-gray-500" />
                </span>
              </label>
            </div>

            <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Detail Level
              <select
                value={detailLevel}
                onChange={(e) => setDetailLevel(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 text-black dark:border-gray-600 bg-white p-2 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="brief">Brief</option>
                <option value="standard">Standard</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </label>

            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Output
              </p>
              <div className="grid grid-cols-2 gap-2">
                {outputOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={outputs.includes(option.value)}
                      onChange={() => toggleOutput(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
              <button
                type="button"
                onClick={openFolderPanel}
                className="flex w-full items-center justify-between gap-3 p-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700/40"
              >
                <span className="flex items-center gap-2">
                  <FaFolderOpen className="text-primary-400" />
                  Saved folders
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {isFolderPanelOpen ? "Hide" : "Open"}
                </span>
              </button>

              {isFolderPanelOpen && (
                <div className="space-y-3 border-t border-gray-200 p-3 dark:border-gray-700">
                  <div className="flex gap-2">
                    <select
                      value={browseFolderId}
                      onChange={(e) => setBrowseFolderId(e.target.value)}
                      className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white p-2 text-sm text-black dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    >
                      <option value="">All documents</option>
                      {folders.map((folder) => (
                        <option key={folder._id} value={folder._id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={fetchDocuments}
                      disabled={isFetchingDocuments}
                      title="Refresh documents"
                      className="rounded-md border border-gray-300 px-3 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaSyncAlt className={isFetchingDocuments ? "animate-spin" : ""} />
                    </button>
                  </div>

                  <div className="max-h-44 space-y-2 overflow-y-auto pr-1 scrollbar-hide">
                    {visibleDocuments.length === 0 ? (
                      <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                        No saved documents in this folder yet.
                      </div>
                    ) : (
                      visibleDocuments.map((doc) => (
                        <div
                          key={doc._id}
                          className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {doc.title || "Untitled document"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {doc.updatedAt
                                  ? new Date(doc.updatedAt).toLocaleString()
                                  : "Saved document"}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openDocumentEditor(doc._id)}
                                title="Edit document"
                                className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                              >
                                <FaEdit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadDocument(doc._id)}
                                title="Download DOCX"
                                className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                              >
                                <FaDownload className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-md border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <input
                  type="checkbox"
                  checked={saveToDocument}
                  onChange={(e) => setSaveToDocument(e.target.checked)}
                />
                Save in folder
              </label>
              {saveToDocument && (
                <div className="mt-3 space-y-2">
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="w-full rounded-md border border-gray-200 text-black dark:border-gray-600 p-2 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="">No folder</option>
                    {folders.map((folder) => (
                      <option key={folder._id} value={folder._id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="New folder name"
                      className="min-w-0 flex-1 rounded-md border border-gray-200 text-black dark:border-gray-600 p-2 dark:bg-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={createFolder}
                      type="button"
                      className="px-3 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100"
                      title="Create folder"
                    >
                      <FaFolderPlus />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="order-2 md:order-none">
            <ActionButtons
              onClear={handleClearAllInputs}
              onSubmit={handleSummarize}
              submitButtonText="Summarize"
              isSubmitting={isLoading}
              isDisabled={isLoading || !currentInputText.trim() || inputWordsExceeded}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm h-full flex flex-col overflow-hidden transition-colors duration-300">
          {Boolean(
            result?.audio_summary &&
              typeof result.audio_summary === "object" &&
              (result.audio_summary as any).text,
          ) && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 bg-indigo-50 px-3 py-2 dark:border-indigo-900/60 dark:bg-indigo-950/30">
              <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                Audio summary is ready
              </span>
              <div className="flex items-center gap-2">
              <button
                onClick={speakAudioSummary}
                disabled={isSpeaking}
                className="px-3 py-2 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-md flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50"
              >
                <FaVolumeUp />
                Play Audio
              </button>
              <button
                onClick={stopAudioSummary}
                disabled={!isSpeaking}
                className="px-3 py-2 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-md flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50"
              >
                <FaStop />
                Stop
              </button>
              </div>
            </div>
          )}
          <ResultDisplay
            title={jobMessage ? `Result - ${jobMessage}` : "Result"}
            resultText={isLoading && !resultText ? "Generating summary..." : resultText}
            customBody={
              result ? <StructuredResultView result={result} /> : undefined
            }
          />
        </div>
      </div>

      {editingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingDocument.title || "Saved summary"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Summarizer document
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingDocument(null)}
                className="rounded-md border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950">
              {editingSlides ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Slide Deck Preview
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSlides((current) => [
                          ...(current || []),
                          { title: `Slide ${(current?.length || 0) + 1}`, bullets: [""] },
                        ])
                      }
                      className="rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-900 dark:text-indigo-200 dark:hover:bg-indigo-950/50"
                    >
                      Add slide
                    </button>
                  </div>

                  {editingSlides.map((slide, slideIndex) => (
                    <article
                      key={`edit-slide-${slideIndex}`}
                      className="rounded-lg border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/60 p-4 shadow-sm dark:border-indigo-900/60 dark:from-gray-900 dark:to-indigo-950/20"
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-sm font-semibold text-white">
                          {slideIndex + 1}
                        </span>
                        <input
                          value={slide.title}
                          onChange={(event) =>
                            setEditingSlides((current) =>
                              (current || []).map((item, index) =>
                                index === slideIndex
                                  ? { ...item, title: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          className="min-w-0 flex-1 rounded-md border border-indigo-100 bg-white px-3 py-2 text-base font-semibold text-gray-950 outline-none focus:ring-2 focus:ring-indigo-400 dark:border-indigo-900 dark:bg-gray-950 dark:text-gray-50"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingSlides((current) =>
                              (current || []).filter((_, index) => index !== slideIndex),
                            )
                          }
                          className="rounded-md border border-gray-300 bg-white px-2 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-2 pl-11">
                        {slide.bullets.map((bullet, bulletIndex) => (
                          <div key={`edit-slide-${slideIndex}-bullet-${bulletIndex}`} className="flex gap-2">
                            <span className="pt-2 text-indigo-500">•</span>
                            <textarea
                              value={bullet}
                              rows={2}
                              onChange={(event) =>
                                setEditingSlides((current) =>
                                  (current || []).map((item, index) =>
                                    index === slideIndex
                                      ? {
                                          ...item,
                                          bullets: item.bullets.map((existingBullet, existingIndex) =>
                                            existingIndex === bulletIndex
                                              ? event.target.value
                                              : existingBullet,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                              className="min-h-[44px] flex-1 resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-700 outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setEditingSlides((current) =>
                                  (current || []).map((item, index) =>
                                    index === slideIndex
                                      ? {
                                          ...item,
                                          bullets: item.bullets.filter((_, existingIndex) => existingIndex !== bulletIndex),
                                        }
                                      : item,
                                  ),
                                )
                              }
                              className="h-10 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setEditingSlides((current) =>
                              (current || []).map((item, index) =>
                                index === slideIndex
                                  ? { ...item, bullets: [...item.bullets, ""] }
                                  : item,
                              ),
                            )
                          }
                          className="rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-900 dark:text-indigo-200 dark:hover:bg-indigo-950/50"
                        >
                          Add bullet
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-[420px] rounded-lg border border-gray-200 bg-white p-5 text-sm leading-7 text-gray-900 outline-none focus:ring-2 focus:ring-primary-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 [&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(editingDocument.content || ""),
                  }}
                />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => setEditingDocument(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => downloadDocument(editingDocument._id)}
                className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                <FaDownload />
                DOCX
              </button>
              <button
                type="button"
                onClick={saveEditedDocument}
                disabled={isSavingDocument}
                className="flex items-center gap-2 rounded-md bg-primary-400 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-500 disabled:opacity-60"
              >
                <FaSave />
                {isSavingDocument ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NotebookLM-style assistant: answers strictly from the pasted content.
          Hidden until the user has entered content to ground against. */}
      <SummarizerChat context={currentInputText} />

      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default SummarizerTool;
