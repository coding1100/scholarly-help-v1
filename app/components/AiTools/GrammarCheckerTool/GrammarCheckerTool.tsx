"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiFileText, FiSettings } from "react-icons/fi";
import ActionButtons from "@/app/components/AiTools/ActionButtons";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import TextSummarizerInput from "@/app/components/AiTools/TextSummarizerInput";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { countWords, looksLikeGibberish } from "@/app/utils/text";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
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

interface CheckedDoc {
  /** Current document text — mutates only through applyFix. */
  text: string;
  issues: ClientIssue[];
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
  const [showRecheckNote, setShowRecheckNote] = useState(false);
  const [copied, setCopied] = useState(false);

  const { gateOpen, closeGate, guardAiClick } = useGuestGate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("access_token");
    setToken(storedToken);
    try {
      const storedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
      if (storedGoals) setGoals({ ...DEFAULT_GOALS, ...JSON.parse(storedGoals) });
      const storedWords = localStorage.getItem(DICTIONARY_STORAGE_KEY);
      if (storedWords) setDictionary(JSON.parse(storedWords));
    } catch {
      /* corrupted local settings — fall back to defaults */
    }
    // Signed-in users: the account copy of the dictionary wins over the device copy.
    if (storedToken) {
      axios
        .get(`${process.env.NEXT_PUBLIC_NGROX_URL}/tools/grammar-check/dictionary`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
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
    () => computeScores(doc?.issues ?? []),
    [doc?.issues],
  );
  const correctedText = useMemo(
    () => (doc ? deriveCorrectedText(doc.text, doc.issues) : ""),
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
        .catch(() => {
          /* best-effort account sync; localStorage remains the fallback */
        });
    }
  };

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
      toast.error("You don't have enough token balance, or the input exceeds limits.");
    } else if (status === 429) {
      toast.error("Too many requests — please wait a moment and try again.");
    } else {
      toast.error(Array.isArray(message) ? message.join(", ") : String(message));
    }
  };

  const validate = (input: string): boolean => {
    const words = countWords(input);
    if (!input.trim()) {
      toast.error("Please enter some text.");
      return false;
    }
    if (words < MIN_GRAMMAR_WORDS) {
      toast.error(`Please provide at least ${MIN_GRAMMAR_WORDS} words to check.`);
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
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/grammar-check`,
          { text, ...goals, dictionary },
          { headers: authHeaders },
        );
        const data = (response.data?.data ?? response.data) as GrammarCheckResponse;
        setDoc({ text, issues: toClientIssues(text, data.issues ?? []) });
        if ((data.issues ?? []).length === 0) {
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
   * redundant) is caught immediately. Best-effort: failures stay silent.
   */
  const recheckSentence = async (nextDoc: CheckedDoc, editStart: number) => {
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
        },
        { headers: authHeaders },
      );
      const data = (response.data?.data ?? response.data) as GrammarCheckResponse;
      // Anchor against the snapshot we posted, not live state — pure derivation.
      const fresh: ClientIssue[] = [];
      for (const raw of data.issues ?? []) {
        const start = raw.start + sentence.start;
        const end = raw.end + sentence.start;
        if (nextDoc.text.slice(start, end) !== raw.original) continue;
        const collides = nextDoc.issues.some((i) => start < i.end && end > i.start);
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
      setShowRecheckNote(true);
    } catch {
      /* re-check is a bonus pass — never surface its errors */
    }
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
      toast.success("Fixed");
      void recheckSentence(nextDoc, result.editedRange.start);
      return;
    }

    setDoc({
      ...doc,
      issues: doc.issues.map((i) =>
        i.id === issueId ? { ...i, status: action } : i,
      ),
    });

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
      const extracted = String(response.data?.data ?? response.data ?? "").trim();
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

  const handleCopyCorrected = async () => {
    try {
      await navigator.clipboard.writeText(correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Couldn't copy — please select and copy manually.");
    }
  };

  const handleClear = () => {
    setText("");
    setDoc(null);
    setShowRecheckNote(false);
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
            <button
              onClick={handleNewCheck}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Edit &amp; re-check
            </button>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <IssuesSidebar
              issues={doc.issues}
              onResolve={handleResolve}
              correctedText={correctedText}
              onCopyCorrected={handleCopyCorrected}
              copied={copied}
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
      />
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default GrammarCheckerTool;
