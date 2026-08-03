"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiArrowLeft, FiFileText, FiPlus, FiSettings } from "react-icons/fi";
import ActionButtons from "@/app/components/AiTools/ActionButtons";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import TextSummarizerInput from "@/app/components/AiTools/TextSummarizerInput";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { countWords, looksLikeGibberish } from "@/app/utils/text";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import { getAccessToken } from "@/app/lib/authSession";
import EditorPane, { type ResolveAction } from "./EditorPane";
import GoalsModal from "./GoalsModal";
import IssuesSidebar from "./IssuesSidebar";
import ReportModal from "./ReportModal";
import ScoreDial from "./ScoreDial";
import {
  CATEGORY_META,
  DEFAULT_GOALS,
  GRAMMAR_CATEGORIES,
  MAX_GRAMMAR_WORDS,
  MIN_GRAMMAR_WORDS,
  applyFix,
  computeScores,
  deriveCorrectedText,
  sentenceAt,
  type ClientIssue,
  type GrammarCheckResponse,
  type GrammarGoals,
  type ServerIssue,
} from "./types";

const GOALS_STORAGE_KEY = "grammar_goals";
const DICTIONARY_STORAGE_KEY = "grammar_dictionary";
const DICTIONARY_SYNC_KEY = "grammar_dictionary_pending_sync";

interface CheckedDoc {
  /** Current document text — mutates only through applyFix. */
  text: string;
  issues: ClientIssue[];
  /** Complete backend correction after its internal verification rounds. */
  verifiedText?: string;
}

function changedParagraph(previous: string, next: string) {
  if (!previous || previous === next) return { text: next, start: 0, incremental: false };
  const nextParagraphs = [...next.matchAll(/(?:^|\n\s*\n)([^]*?)(?=\n\s*\n|$)/g)];
  const changed = nextParagraphs.filter((match) => !previous.includes(match[1]));
  if (changed.length !== 1) return { text: next, start: 0, incremental: false };
  const match = changed[0];
  const text = match[1].trim();
  const start = next.indexOf(text, match.index ?? 0);
  return text.length >= 10 ? { text, start, incremental: true } : { text: next, start: 0, incremental: false };
}

/** Keep only issues whose offsets still slice to their snippet (belt-and-braces). */
function toClientIssues(docText: string, issues: ServerIssue[]): ClientIssue[] {
  return issues
    .filter((i) => docText.slice(i.start, i.end) === i.original)
    .map((i) => ({ ...i, status: "open" as const }));
}

const GrammarCheckerTool: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<CheckedDoc | null>(null);
  const [goals, setGoals] = useState<GrammarGoals>(DEFAULT_GOALS);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [showRecheckNote, setShowRecheckNote] = useState(false);
  const [copied, setCopied] = useState(false);
  /**
   * Convergence memory for the current document lineage (survives
   * "Edit & re-check", resets on Clear):
   * - settled: wording the user already decided on (accepted suggestions and
   *   dismissed originals). Sent with every check so the model never
   *   re-litigates it — without this, each re-check invents a fresh round of
   *   nitpicks on its own previous fixes and the tool never converges.
   * - seenIssueIds: every issue id ever shown, so a re-check can't resurface
   *   an issue the user dismissed.
   */
  const [settled, setSettled] = useState<string[]>([]);
  const [seenIssueIds, setSeenIssueIds] = useState<string[]>([]);

  const { gateOpen, closeGate, guardAiClick } = useGuestGate();
  const requestControllerRef = useRef<AbortController | null>(null);
  const lastCheckedTextRef = useRef("");
  useEffect(() => () => requestControllerRef.current?.abort(), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = getAccessToken();
    setToken(storedToken);
    try {
      const storedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
      if (storedGoals)
        setGoals({ ...DEFAULT_GOALS, ...JSON.parse(storedGoals) });
      const storedWords = localStorage.getItem(DICTIONARY_STORAGE_KEY);
      if (storedWords) setDictionary(JSON.parse(storedWords));
    } catch {
      /* corrupted local settings — fall back to defaults */
    }
    // Signed-in users: the account copy of the dictionary wins over the device copy.
    if (storedToken) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/grammar-check/dictionary`,
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          },
        )
        .then((response) => {
          const words = (response.data?.data ?? response.data)?.words;
          if (Array.isArray(words) && words.length > 0) {
            setDictionary(words);
            localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(words));
          }
        })
        .catch(() => {
          /* dictionary sync is best-effort; the device copy still applies */
        });
    }
  }, []);

  const wordCount = useMemo(() => countWords(text), [text]);
  const scores = useMemo(
    () => computeScores(doc?.issues ?? [], countWords(doc?.text ?? "")),
    [doc?.issues, doc?.text],
  );
  const correctedText = useMemo(
    () =>
      doc
        ? (doc.verifiedText ?? deriveCorrectedText(doc.text, doc.issues))
        : "",
    [doc],
  );

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const persistDictionary = (words: string[]) => {
    setDictionary(words);
    if (typeof window !== "undefined") {
      localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(words));
    }
    if (token) {
      axios
        .put(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/grammar-check/dictionary`,
          { words },
          { headers: authHeaders },
        )
        .then(() => localStorage.removeItem(DICTIONARY_SYNC_KEY))
        .catch(() => localStorage.setItem(DICTIONARY_SYNC_KEY, JSON.stringify(words)));
    }
  };

  useEffect(() => {
    if (!token) return;
    const flush = () => {
      try {
        const pending = JSON.parse(localStorage.getItem(DICTIONARY_SYNC_KEY) || "null");
        if (!Array.isArray(pending)) return;
        void axios.put(`${process.env.NEXT_PUBLIC_NGROX_URL}/tools/grammar-check/dictionary`, { words: pending }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
          .then(() => localStorage.removeItem(DICTIONARY_SYNC_KEY)).catch(() => undefined);
      } catch { localStorage.removeItem(DICTIONARY_SYNC_KEY); }
    };
    flush(); window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [token]);

  const showApiError = (err: any, fallback: string) => {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      fallback;
    if (status === 401) {
      toast.error("Session expired. Please sign in again.");
    } else if (status === 403) {
      toast.error(
        "You don't have enough token balance, or the input exceeds limits.",
      );
    } else if (status === 429) {
      toast.error("Too many requests — please wait a moment and try again.");
    } else {
      toast.error(
        Array.isArray(message) ? message.join(", ") : String(message),
      );
    }
  };

  const validate = (input: string): boolean => {
    const words = countWords(input);
    if (!input.trim()) {
      toast.error("Please enter some text.");
      return false;
    }
    if (words < MIN_GRAMMAR_WORDS) {
      toast.error(
        `Please provide at least ${MIN_GRAMMAR_WORDS} words to check.`,
      );
      return false;
    }
    if (words > MAX_GRAMMAR_WORDS) {
      toast.error(`Please keep input at or under ${MAX_GRAMMAR_WORDS} words.`);
      return false;
    }
    if (looksLikeGibberish(input)) {
      toast.error(
        "This doesn't look like readable text. Please enter meaningful content to check.",
      );
      return false;
    }
    return true;
  };

  const handleCheck = () => {
    if (!validate(text)) return;
    guardAiClick(async () => {
      trackToolGenerate({ toolName: "Grammar Checker" });
      setLoading(true);
      setShowRecheckNote(false);
      try {
        requestControllerRef.current?.abort();
        const controller = new AbortController(); requestControllerRef.current = controller;
        const requestSlice = changedParagraph(lastCheckedTextRef.current, text);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/grammar-check`,
          {
            text: requestSlice.text,
            ...(requestSlice.incremental ? { scope: "paragraph", document_offset: requestSlice.start } : {}),
            ...goals,
            dictionary,
            settled_phrases: settled.slice(-100),
            known_issue_keys: seenIssueIds.slice(-500),
          },
          { headers: authHeaders, signal: controller.signal },
        );
        const data = (response.data?.data ??
          response.data) as GrammarCheckResponse;
        const issues = toClientIssues(requestSlice.text, data.issues ?? []).map((issue) => ({ ...issue, start: issue.start + requestSlice.start, end: issue.end + requestSlice.start }));
        lastCheckedTextRef.current = text;
        setDoc({
          text,
          issues,
          verifiedText: !requestSlice.incremental &&
            typeof data.corrected_text === "string"
              ? data.corrected_text
              : undefined,
        });
        setSeenIssueIds((prev) => [
          ...prev,
          ...issues.map((i) => i.id).filter((id) => !prev.includes(id)),
        ]);
        if (
          issues.length === 0 &&
          typeof data.corrected_text === "string" &&
          data.corrected_text !== text
        ) {
          toast.success("A verified correction is ready to apply.");
        } else if (issues.length === 0) {
          toast.success("No issues found — nice work!");
        }
      } catch (err: any) {
        showApiError(err, "Failed to check your writing.");
      } finally {
        setLoading(false);
      }
    });
  };

  /**
   * After an accepted fix, silently re-check just the edited sentence so a fix
   * that introduces a follow-up problem (e.g. tense fix making a time phrase
   * redundant) is caught immediately. Hard-capped at ONE follow-up round:
   * issues found here are marked isNew, and accepting an isNew issue never
   * triggers another re-check — so a fix chain is original → follow-up → done,
   * never an endless loop of new suggestions. Best-effort: failures stay silent.
   */
  const recheckSentence = async (
    nextDoc: CheckedDoc,
    editStart: number,
    settledNow: string[],
  ) => {
    const sentence = sentenceAt(nextDoc.text, editStart);
    if (countWords(sentence.text) < 3) return;
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/grammar-check`,
        {
          text: sentence.text,
          ...goals,
          dictionary,
          scope: "sentence",
          known_issue_keys: nextDoc.issues.map((i) => i.id),
          settled_phrases: settledNow.slice(-100),
        },
        { headers: authHeaders },
      );
      const data = (response.data?.data ??
        response.data) as GrammarCheckResponse;
      // Anchor against the snapshot we posted, not live state — pure derivation.
      const fresh: ClientIssue[] = [];
      for (const raw of data.issues ?? []) {
        const start = raw.start + sentence.start;
        const end = raw.end + sentence.start;
        if (nextDoc.text.slice(start, end) !== raw.original) continue;
        const collides = nextDoc.issues.some(
          (i) => start < i.end && end > i.start,
        );
        const duplicate = nextDoc.issues.some(
          (i) => i.category === raw.category && i.original === raw.original,
        );
        if (collides || duplicate) continue;
        fresh.push({ ...raw, start, end, status: "open", isNew: true });
      }
      if (fresh.length === 0) return;
      // Only merge if the doc hasn't changed since this re-check was requested.
      setDoc((current) =>
        current && current.text === nextDoc.text
          ? { ...current, issues: [...current.issues, ...fresh] }
          : current,
      );
      setSeenIssueIds((prev) => [
        ...prev,
        ...fresh.map((i) => i.id).filter((id) => !prev.includes(id)),
      ]);
      setShowRecheckNote(true);
    } catch {
      /* re-check is a bonus pass — never surface its errors */
    }
  };

  /** Record wording the user decided on; returns the updated list synchronously. */
  const addSettled = (phrase: string): string[] => {
    const clean = phrase.trim();
    if (
      clean.length <= 1 ||
      settled.some((s) => s.toLowerCase() === clean.toLowerCase())
    ) {
      return settled;
    }
    const next = [...settled, clean];
    setSettled(next);
    return next;
  };

  const handleResolve = (issueId: string, action: ResolveAction) => {
    if (!doc) return;
    const issue = doc.issues.find((i) => i.id === issueId);
    if (!issue || issue.status !== "open") return;

    if (action === "accepted") {
      const result = applyFix(doc.text, doc.issues, issueId);
      if (!result) return;
      const nextDoc = { text: result.text, issues: result.issues };
      setDoc(nextDoc);
      const settledNow = addSettled(issue.suggestion);
      toast.success("Fixed");
      // Follow-up re-check only for FIRST-round issues; accepting a follow-up
      // (isNew) issue ends the chain — this is the "max 2 tries" guarantee.
      if (!issue.isNew) {
        void recheckSentence(nextDoc, result.editedRange.start, settledNow);
      }
      return;
    }

    setDoc({
      ...doc,
      verifiedText: undefined,
      issues: doc.issues.map((i) =>
        i.id === issueId ? { ...i, status: action } : i,
      ),
    });
    addSettled(issue.original);

    if (action === "dictionary") {
      const word = issue.original.trim();
      if (!dictionary.some((w) => w.toLowerCase() === word.toLowerCase())) {
        persistDictionary([...dictionary, word]);
      }
      toast.success("Added to your dictionary");
    } else {
      toast.success("Dismissed");
    }
  };

  const handleUploadDocument = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/parse-document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const extracted = String(
        response.data?.data ?? response.data ?? "",
      ).trim();
      setText(extracted);
      if (countWords(extracted) > MAX_GRAMMAR_WORDS) {
        toast.error(
          `This document is over ${MAX_GRAMMAR_WORDS} words. Please trim it before checking.`,
        );
      } else {
        toast.success("Document text extracted.");
      }
    } catch (err: any) {
      showApiError(err, "Failed to parse document.");
    } finally {
      setLoading(false);
    }
  };

  /** Backend-rendered PDF, downloaded as a file (same flow as the AI Detector). */
  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/grammar-check/report`,
        {
          text: doc?.text ?? text,
          score_grammar: scores.grammar,
          score_tense: scores.tense,
          score_clarity: scores.clarity,
          score_tone: scores.tone,
          score_overall: scores.overall,
        },
        { headers: authHeaders, responseType: "blob" },
      );
      const url = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "grammar-report.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to generate the report. Please try again.");
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleCopyCorrected = async () => {
    try {
      await navigator.clipboard.writeText(correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Couldn't copy — please select and copy manually.");
    }
  };

  const handleApplyAll = () => {
    if (!doc || correctedText === doc.text) return;
    setDoc({ text: correctedText, issues: [] });
    setText(correctedText);
    setShowRecheckNote(false);
    toast.success("All corrections applied");
  };

  const handleClear = () => {
    setText("");
    setDoc(null);
    setShowRecheckNote(false);
    // New document, new lineage — forget the convergence memory.
    setSettled([]);
    setSeenIssueIds([]);
    lastCheckedTextRef.current = "";
  };

  /** Back to the input view, carrying the edited document along. */
  const handleNewCheck = () => {
    if (doc) setText(doc.text);
    setDoc(null);
    setShowRecheckNote(false);
  };

  return (
    <div className="container relative mx-auto max-w-[840px] px-3 py-4 sm:px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <ToolsApiLoader show={loading} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Grammar Checker
        </h1>
        <div className="flex gap-2">
          {doc && (
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-primary-400 transition-colors hover:bg-primary-100 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <FiFileText size={14} /> Report
            </button>
          )}
          <button
            onClick={() => setGoalsOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-primary-400 transition-colors hover:bg-primary-100 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <FiSettings size={14} /> Set goals
          </button>
        </div>
      </div>

      {!doc ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <TextSummarizerInput
            title="Paste your text, then run a check"
            onTextChange={setText}
            initialText={text}
            maxWords={MAX_GRAMMAR_WORDS}
            accept=".pdf,.doc,.docx,.txt"
            onFileUpload={handleUploadDocument}
            placeholder="Paste your essay, discussion post, or paragraph here..."
            scrollable
          />
          <ActionButtons
            onClear={handleClear}
            onSubmit={handleCheck}
            submitButtonText="Check my grammar"
            isSubmitting={loading}
            isDisabled={!text.trim() || wordCount > MAX_GRAMMAR_WORDS}
          />
        </div>
      ) : (
        <div>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="flex gap-4">
              {GRAMMAR_CATEGORIES.map((cat) => (
                <ScoreDial
                  key={cat}
                  score={scores[cat]}
                  color={CATEGORY_META[cat].dialColor}
                  label={CATEGORY_META[cat].label}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNewCheck}
                className="flex items-center gap-1.5 rounded-lg border border-primary-400 bg-white px-3 py-1.5 text-sm font-medium text-primary-400 transition-colors hover:bg-primary-100 dark:bg-gray-900 dark:text-[#8b8ff0] dark:hover:bg-gray-800"
              >
                <FiArrowLeft size={14} /> Back to editor
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 rounded-lg bg-primary-400 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-300 active:bg-primary-500"
              >
                <FiPlus size={14} /> New check
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <IssuesSidebar
              issues={doc.issues}
              onResolve={handleResolve}
              correctedText={correctedText}
              onCopyCorrected={handleCopyCorrected}
              copied={copied}
              onApplyAll={handleApplyAll}
              canApplyAll={correctedText !== doc.text}
            />
            <EditorPane
              text={doc.text}
              issues={doc.issues}
              onResolve={handleResolve}
              showRecheckNote={showRecheckNote}
            />
          </div>
        </div>
      )}

      <GoalsModal
        open={goalsOpen}
        onClose={() => setGoalsOpen(false)}
        goals={goals}
        dictionary={dictionary}
        isSignedIn={Boolean(token)}
        onApply={(nextGoals, nextWords) => {
          setGoals(nextGoals);
          if (typeof window !== "undefined") {
            localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(nextGoals));
          }
          persistDictionary(nextWords);
          setGoalsOpen(false);
          toast.success("Goals saved");
        }}
      />
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        text={doc?.text ?? text}
        scores={scores}
        onDownloadPdf={handleDownloadReport}
        downloading={downloadingReport}
      />
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default GrammarCheckerTool;
