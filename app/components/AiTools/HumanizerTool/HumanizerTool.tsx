"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaChevronDown, FaRegCopy } from "react-icons/fa";
import TextSummarizerInput from "@/app/components/AiTools/TextSummarizerInput";
import ActionButtons from "@/app/components/AiTools/ActionButtons";
import ResultDisplay from "@/app/components/AiTools/ResultDisplay";
import { countWords } from "@/app/utils/text";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";

type HumanizerTone = "natural" | "simple" | "polished";
type VariantId = "best" | "alternate_1" | "alternate_2";

type HumanizerVariant = {
  id: VariantId;
  label: "Best" | "Alternate 1" | "Alternate 2";
  text: string;
};

type HumanizerResponse = {
  status: "success";
  original_text: string;
  selected_tone: HumanizerTone;
  humanized_text: string;
  variants: HumanizerVariant[];
  llm_used: string;
  tokens_used: number;
};

const TONE_META: Record<HumanizerTone, { label: string; description: string }> =
  {
    natural: {
      label: "Natural",
      description: "Balanced, everyday writing",
    },
    simple: {
      label: "Simple",
      description: "Easiest wording and grammar",
    },
    polished: {
      label: "Polished",
      description: "Smoother but still human and plain",
    },
  };

const HumanizerTool: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [tone, setTone] = useState<HumanizerTone>("natural");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HumanizerResponse | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<VariantId>("best");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  const wordCount = useMemo(() => countWords(text), [text]);
  const canSubmit = text.trim().length > 0 && wordCount <= 1500 && !loading;

  const selectedVariantText = useMemo(() => {
    if (!result) return "";
    if (selectedVariantId === "best") return result.humanized_text || "";
    const match = (result.variants || []).find(
      (v) => v.id === selectedVariantId,
    );
    return match?.text || result.humanized_text || "";
  }, [result, selectedVariantId]);

  const handleClear = () => {
    setText("");
    setResult(null);
    setSelectedVariantId("best");
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy.");
    }
  };

  const handleUploadDocument = async (file: File) => {
    setLoading(true);
    setResult(null);
    setSelectedVariantId("best");
    try {
      if (!token) throw new Error("Access token not found");

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/v1/tools/parse-document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const extracted = String(response.data || "").trim();
      setText(extracted);

      if (countWords(extracted) > 1500) {
        toast.error(
          "This document is over 1500 words. Please trim it before humanizing.",
        );
      } else {
        toast.success("Document text extracted.");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to parse document.";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setLoading(false);
    }
  };

  const handleHumanize = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text.");
      return;
    }
    if (wordCount > 1500) {
      toast.error("Please keep input at or under 1500 words.");
      return;
    }

    setLoading(true);
    setResult(null);
    setSelectedVariantId("best");
    trackToolGenerate({ toolName: "Humanizer Tool" });

    try {
      if (!token) throw new Error("Access token not found");

      const response = await axios.post<HumanizerResponse>(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/humanizer`,
        { text, tone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setResult(response.data);
      toast.success("Humanized successfully!");
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to humanize text.";

      if (status === 401) {
        toast.error("Session expired. Please sign in again.");
      } else if (status === 403) {
        toast.error(
          "You don’t have enough token balance, or the input exceeds limits.",
        );
      } else {
        toast.error(
          Array.isArray(message) ? message.join(", ") : String(message),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseThisVersion = () => {
    if (!selectedVariantText) return;
    setText(selectedVariantText);
    toast.success("Loaded into editor.");
  };

  const toneDescription = TONE_META[tone]?.description || "";

  return (
    <div className="container overflow-y-auto h-[90vh] mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="w-8 h-8 border-4 border-[#2b7fff] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-[#155dfc] dark:text-[#51a2ff] font-medium">
            Processing...
          </span>
        </div>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ alignItems: "stretch" }}
      >
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 h-auto flex flex-col transition-colors duration-300">
          <TextSummarizerInput
            title="AI Humanizer"
            onTextChange={(t) => setText(t)}
            onFileUpload={handleUploadDocument}
            initialText={text}
            placeholder="Paste your text here..."
            maxWords={1500}
            accept=".pdf,.docx,.txt"
          />

          <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 p-3 transition-colors duration-300">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Makes text sound more natural, removes buzzwords, and keeps
              language simple.
            </p>

            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-100">
                Tone:
              </label>
              <div className="relative w-[55%]">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as HumanizerTone)}
                  className="w-full rounded-md border border-gray-200 text-black dark:border-gray-600 p-2 pr-7 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 appearance-none"
                >
                  <option value="natural">Natural</option>
                  <option value="simple">Simple</option>
                  <option value="polished">Polished</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                  <FaChevronDown className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {TONE_META[tone]?.label}:
              </span>{" "}
              {toneDescription}
            </div>

            {wordCount > 1500 && (
              <div className="text-xs font-semibold text-[#fb2c36] dark:text-red-400">
                Word limit exceeded: {wordCount}/1500. Please trim before
                submitting.
              </div>
            )}
          </div>

          <ActionButtons
            onClear={handleClear}
            onSubmit={handleHumanize}
            submitButtonText="Humanize"
            isSubmitting={loading}
            isDisabled={!canSubmit}
          />
        </div>

        {/* Result */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 h-auto flex flex-col justify-between transition-colors duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
            <div className="flex gap-2">
              {(["best", "alternate_1", "alternate_2"] as VariantId[]).map(
                (id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedVariantId(id)}
                    disabled={!result}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors duration-300 ${
                      !result
                        ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : selectedVariantId === id
                          ? "border-[#2b7fff] text-[#2b7fff] dark:border-[#51a2ff] dark:text-[#51a2ff]"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {id === "best"
                      ? "Best"
                      : id === "alternate_1"
                        ? "Alternate 1"
                        : "Alternate 2"}
                  </button>
                ),
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleCopy(selectedVariantText)}
                disabled={!selectedVariantText}
                className={`px-3 py-2 border rounded-md flex items-center gap-2 transition-colors duration-300 ${
                  !selectedVariantText
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <FaRegCopy />
                Copy
              </button>
              <button
                type="button"
                onClick={handleUseThisVersion}
                disabled={!selectedVariantText}
                className={`px-3 py-2 rounded-md text-white transition-colors duration-300 ${
                  !selectedVariantText
                    ? "bg-primary-400/60 cursor-not-allowed"
                    : "bg-primary-400 hover:bg-primary-300"
                }`}
              >
                Use this version
              </button>
            </div>
          </div>

          <ResultDisplay
            title="Humanized Text"
            resultText={selectedVariantText}
            loading={loading}
          />

          {result && (
            <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
              LLM: <span className="font-semibold">{result.llm_used}</span> ·
              Tokens used:{" "}
              <span className="font-semibold">{result.tokens_used}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HumanizerTool;
