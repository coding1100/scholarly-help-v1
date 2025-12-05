"use client";

import React, { FC, useEffect, useState } from "react";
import TextSummarizerInput from "./TextSummarizerInput";
import ResultDisplay from "./ResultDisplay";
import ActionButtons from "./ActionButtons";
import axios from "axios";

type ResData = {
  data: {
    client: string;
    error: any;
    llm_used: string;
    original_text: string;
    paraphrased_text: string;
    status: string;
    style: string;
  };
};

interface AIParaphraserProp {
  setFlag: (value: boolean) => void;
}

const AIParaphraser: FC<AIParaphraserProp> = ({ setFlag }) => {
  const [token, setToken] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [resultText, setResultText] = useState<string>("");
  const [style, setStyle] = useState("Standard");
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [isPdfProcessed, setIsPdfProcessed] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pdfData, setPdfData] = useState<any>(null);
  const [wordLimitExceeded, setWordLimitExceeded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);
  const [resData, setResData] = useState<ResData>({
    data: {
      client: "",
      error: null,
      llm_used: "",
      original_text: "",
      paraphrased_text: "",
      status: "",
      style: "",
    },
  });
  /* ---------- handlers ---------- */
  const handleClear = () => {
    setInputText("");
    setResultText("");
    // here are change inam
    setPdfData(null);
    setFile(null);
  };

  const processinput = async () => {
    if (!inputText || !inputText.trim()) return;

    if (isPdfProcessed) {
      setIsPdfProcessed(false);
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/paraphrase`,
        {
          text: inputText,
          style: style,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response: ", response.data);

      setResultText(response.data.paraphrased_text);
      setFlag(true);
    } catch (error: any) {
      setResultText(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-process PDF when selected
  useEffect(() => {
    const processPdf = async () => {
      if (!file) return;
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
          }
        );

        const result = response.data;
        console.log("result: ", result);
        setInputText(result);
      } catch (err: any) {
        setResultText(
          err?.response?.data?.message || "Failed to extract text from PDF."
        );
      } finally {
        setSubmitting(false);
      }
    };

    processPdf();
  }, [file, token]);
  const handleParaphrase = async () => {
    if (wordLimitExceeded) {
      setResultText("Text exceeds 200-word limit. Please shorten your input.");
      return;
    }
    await processinput();
  };

  return (
    <div className="container overflow-y-auto h-[90vh] mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <div className="bg-white border  overflow-hidden">
        {/* ---------- main two‑column layout ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* --- left column : input --- */}

          <div className="border-r">
            <TextSummarizerInput
              title="AI Paraphraser"
              initialText={inputText}
              onTextChange={setInputText}
              onPdfUpload={setFile}
              onWordLimitExceeded={setWordLimitExceeded}
            />

            <div className="px-2 md:px-4 py-4 flex items-center justify-between space-x-3 border-b">
              <label htmlFor="style" className="font-medium text-gray-700">
                Paraphrase Style:
              </label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="p-1 border w-[50%] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer "
              >
                <option>Standard</option>
                <option>Creative</option>
                <option>Formal</option>
                <option>Casual</option>
              </select>
            </div>
            {/* reusable action buttons */}
            <ActionButtons
              submitButtonText="Paraphrase"
              onSubmit={handleParaphrase}
              onClear={handleClear}
              isSubmitting={isSubmitting}
              isDisabled={!inputText.trim() || wordLimitExceeded}
            />
          </div>

          {/* --- right column : result --- */}
          <ResultDisplay
            resultText={resultText}
            title="Result"
            onCopy={(txt) => navigator.clipboard.writeText(txt)}
            loading={isSubmitting}
          />
        </div>
      </div>
      <div className="text-sm font-serif  text-center pt-8 text-gray-500">
        <q>
          Finding it hard to rephrase your ideas effectively? ScholarlyHelp
          offers a powerful AI-driven paraphrasing tool designed to rewrite your
          academic content with clarity, coherence, and originality—helping you
          express your thoughts more clearly and confidently.{" "}
        </q>
      </div>
    </div>
  );
};

export default AIParaphraser;
