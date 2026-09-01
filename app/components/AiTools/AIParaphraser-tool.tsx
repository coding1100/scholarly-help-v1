"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import TextSummarizerInput from "./TextSummarizerInput";
import ResultDisplay from "./ResultDisplay";
import ActionButtons from "./ActionButtons";
import axios from "axios";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { useToolDraftPersistence } from "@/app/lib/client/useToolDraftPersistence";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import { getAccessToken } from "@/app/lib/authSession";
import { useLatestAbortController } from "@/app/lib/client/toolOptimization";

interface AIParaphraserProp {
  setFlag: (value: boolean) => void;
  /**
   * "landing" renders the same tool as a rounded, shadowed hero card (used on
   * the /ai-paraphraser landing page); the default keeps the /tools styling.
   */
  variant?: "default" | "landing";
}

const AIParaphraser: FC<AIParaphraserProp> = ({ setFlag, variant = "default" }) => {
  const isLanding = variant === "landing";
  const [token, setToken] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [resultText, setResultText] = useState<string>("");
  const [toneMode, setToneMode] = useState("standard");
  const [customToneInstructions, setCustomToneInstructions] = useState("");
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [wordLimitExceeded, setWordLimitExceeded] = useState(false);
  type ParaphraserDraft = {
    inputText: string;
    toneMode: string;
    customToneInstructions: string;
  };

  const { stashDraft } = useToolDraftPersistence<ParaphraserDraft>(
    "paraphraser",
    (draft) => {
      if (draft.inputText) setInputText(draft.inputText);
      if (draft.toneMode) setToneMode(draft.toneMode);
      if (draft.customToneInstructions) setCustomToneInstructions(draft.customToneInstructions);
    },
  );

  const { gateOpen, closeGate, guardAiClick } = useGuestGate<ParaphraserDraft>({
    getDraft: () => ({ inputText, toneMode, customToneInstructions }),
    stashDraft,
  });
  const nextController = useLatestAbortController();
  const comparison = useMemo(() => {
    const words = (value: string) => new Set(value.toLowerCase().match(/[a-z0-9']+/g) || []);
    const before = words(inputText); const after = words(resultText);
    if (!resultText || before.size === 0) return null;
    const overlap = [...before].filter((word) => after.has(word)).length;
    const union = new Set([...before, ...after]).size || 1;
    return { retained: Math.round((overlap / union) * 100), changed: Math.round((1 - overlap / Math.max(1, before.size)) * 100) };
  }, [inputText, resultText]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(getAccessToken());
    }
  }, []);
  /* ---------- handlers ---------- */
  const handleClear = () => {
    setInputText("");
    setResultText("");
    setToneMode("standard");
    setCustomToneInstructions("");
    setFile(null);
  };

  const processinput = async () => {
    if (!inputText || !inputText.trim()) return;

    // Clear any prior result so stale output isn't shown during/after a new run.
    setResultText("");
    setSubmitting(true);
    const controller = nextController();

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/paraphrase`,
        {
          text: inputText,
          tone_mode: toneMode,
          ...(toneMode === "custom"
            ? { custom_tone_instructions: customToneInstructions.trim() }
            : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        },
      );
      const paraphrased = response.data?.data?.paraphrased_text ?? "";
      if (!paraphrased) {
        throw new Error("No paraphrased text was returned.");
      }
      setResultText(paraphrased);
      toast.success(response.data?.message || "Text paraphrased successfully!");
      setFlag(true);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-process PDF when selected
  useEffect(() => {
    if (!file) return;
    // Guard against a slower earlier parse overwriting a newer file (or running
    // after unmount). The controller also aborts the in-flight request.
    let cancelled = false;
    const controller = new AbortController();

    const processPdf = async () => {
      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/parse-document`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );

        if (cancelled) return;

        // parse-document returns the extracted text as a plain string inside the
        // standard envelope: { success, message, data: "<text>" }.
        const extracted = response.data?.data;
        const text = typeof extracted === "string" ? extracted : extracted?.text ?? "";
        if (!text) {
          throw new Error("No text could be extracted from the document.");
        }
        setInputText(text);
        toast.success("Document extracted successfully!");
      } catch (err: any) {
        if (cancelled || axios.isCancel?.(err)) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to extract text from PDF.";
        toast.error(msg);
      } finally {
        if (!cancelled) setSubmitting(false);
      }
    };

    processPdf();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [file, token]);
  const handleParaphrase = async () => {
    if (wordLimitExceeded) {
      toast.error("Text exceeds 200-word limit. Please shorten your input.");
      return;
    }
    if (toneMode === "custom" && !customToneInstructions.trim()) {
      toast.error("Please add custom tone instructions.");
      return;
    }
    // Guests get a small number of free AI actions across all tools; the gate
    // opens instead of calling the AI once the allowance is used up.
    guardAiClick(async () => {
      trackToolGenerate({ toolName: "Paraphraser Tool" });
      await processinput();
    });
  };

  return (
    <div
      className={
        isLanding
          ? "relative w-full"
          : "container relative mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl"
      }
    >
      <ToolsApiLoader show={isSubmitting} />
      <div
        className={`bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300 ${
          isLanding
            ? "rounded-2xl shadow-[0_30px_70px_-20px_rgba(43,28,80,0.35)] text-left"
            : "border dark:border-gray-700"
        }`}
      >
        {/* ---------- main two‑column layout ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* --- left column : input --- */}

          <div className="border-r dark:border-gray-700">
            <TextSummarizerInput
              title="AI Paraphraser"
              initialText={inputText}
              onTextChange={setInputText}
              onPdfUpload={setFile}
              onWordLimitExceeded={setWordLimitExceeded}
            />

            <div className="px-2 md:px-4 py-4 flex items-center justify-between space-x-3 border-b dark:border-gray-700">
              <label
                htmlFor="toneMode"
                className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
              >
                Tone Mode:
              </label>
              <div className="relative w-[50%]">
                <select
                  id="toneMode"
                  value={toneMode}
                  onChange={(e) => setToneMode(e.target.value)}
                  className="p-1 pr-7 border w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                >
                  <option value="standard">Standard</option>
                  <option value="academic">Academic</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="creative">Creative</option>
                  <option value="professional">Professional</option>
                  <option value="persuasive">Persuasive</option>
                  <option value="simple">Simple</option>
                  <option value="custom">Custom</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                  <FaChevronDown className="w-3 h-3" />
                </span>
              </div>
            </div>
            {toneMode === "custom" && (
              <div className="px-2 md:px-4 pb-4 border-b dark:border-gray-700">
                <label
                  htmlFor="customToneInstructions"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Custom tone instructions
                </label>
                <textarea
                  id="customToneInstructions"
                  value={customToneInstructions}
                  onChange={(e) => setCustomToneInstructions(e.target.value)}
                  placeholder="Write 3-4 lines describing the tone you want..."
                  className="w-full h-24 p-3 rounded-md focus:outline-none resize-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300"
                />
              </div>
            )}
            <div className="mx-2 md:mx-4 my-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100 font-semibold">
              This tool is designed to enhance your writing style. Please remember
              that AI detection is not 100% accurate; use this as a creative
              assistant for drafting and refining your work.
            </div>
            {/* reusable action buttons */}
            <ActionButtons
              submitButtonText="Paraphrase"
              onSubmit={handleParaphrase}
              onClear={handleClear}
              isSubmitting={isSubmitting}
              isDisabled={
                !inputText.trim() ||
                wordLimitExceeded ||
                (toneMode === "custom" && !customToneInstructions.trim())
              }
              {...(isLanding
                ? {
                    containerClassName: "!bg-primary-200/60",
                    submitColorClassName:
                      "bg-[#F56200] hover:bg-[#ff7a24] active:bg-[#d95700]",
                  }
                : {})}
            />
          </div>

          {/* --- right column : result --- */}
          <div className="min-w-0">
            {comparison && <div className="mx-4 mt-3 flex gap-2 text-xs" aria-label="Paraphrase comparison">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Semantic overlap {comparison.retained}%</span>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">Vocabulary changed {comparison.changed}%</span>
            </div>}
            <ResultDisplay resultText={resultText} title="Result" onCopy={(txt) => navigator.clipboard.writeText(txt).then(() => toast.success("Copied to clipboard!")).catch(() => toast.error("Failed to copy."))} loading={isSubmitting} />
          </div>
        </div>
      </div>
      {!isLanding && (
        <div className="text-sm font-serif text-center pt-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
          <q>
            Finding it hard to rephrase your ideas effectively? ScholarlyHelp
            offers a powerful AI-driven paraphrasing tool designed to rewrite
            your academic content with clarity, coherence, and
            originality—helping you express your thoughts more clearly and
            confidently.{" "}
          </q>
        </div>
      )}
      <GuestAuthGateModal
        open={gateOpen}
        onClose={closeGate}
        {...(isLanding
          ? { heading: "Unlock your full paraphrased text — it's free" }
          : {})}
      />
    </div>
  );
};

export default AIParaphraser;
