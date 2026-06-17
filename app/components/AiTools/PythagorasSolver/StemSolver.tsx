"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import { FaRegCopy, FaImage, FaKeyboard } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import MarkDown from "@/app/components/MarkDown/MarkDown";

type Subject = "math" | "physics" | "chemistry" | "general";
type InputMode = "image" | "text";

interface StemStep {
  explanation: string;
  math: string;
}
interface StemMethod {
  name: string;
  level: "simple" | "advanced";
  steps: StemStep[];
}
interface StemDiagram {
  type: "svg";
  svg: string;
  caption: string;
}
interface StemSolution {
  subject: string;
  problem_restatement: string;
  final_answer: string;
  methods: StemMethod[];
  tutorial: string;
  common_mistakes: string[];
  diagram: StemDiagram | null;
}
interface StemResponse {
  status: string;
  solution: StemSolution;
  llm_used: string;
  tokens_used: number;
}

const SUBJECTS: { key: Subject; label: string }[] = [
  { key: "general", label: "Auto-detect" },
  { key: "math", label: "Math" },
  { key: "physics", label: "Physics" },
  { key: "chemistry", label: "Chemistry" },
];

const inputClass =
  "w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300";

/** Wrap a bare KaTeX expression as a display-math markdown block. */
const mathBlock = (m: string) => (m ? `$$${m}$$` : "");

const StemSolver: FC<{ setFlag: (v: boolean) => void }> = ({ setFlag }) => {
  const [token, setToken] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [subject, setSubject] = useState<Subject>("general");
  const [problem, setProblem] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<StemSolution | null>(null);
  const [error, setError] = useState<string>("");
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const apiBase = process.env.NEXT_PUBLIC_NGROX_URL;

  const onPickImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleClear = () => {
    setProblem("");
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setResult(null);
    setError("");
  };

  const handleSolve = async () => {
    if (inputMode === "text" && !problem.trim()) {
      setError("Please enter a problem to solve.");
      toast.error("Please enter a problem.");
      return;
    }
    if (inputMode === "image" && !imageFile) {
      setError("Please upload an image of the problem.");
      toast.error("Please upload an image.");
      return;
    }

    trackToolGenerate({ toolName: "STEM Solver" });
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      let responsePayload: StemResponse;
      if (inputMode === "image") {
        const form = new FormData();
        form.append("image", imageFile as File);
        if (problem.trim()) form.append("problem", problem.trim());
        form.append("subject", subject);
        const res = await axios.post(`${apiBase}/tools/stem-solver/image`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        responsePayload = res.data?.data ?? res.data;
      } else {
        const res = await axios.post(
          `${apiBase}/tools/stem-solver/text`,
          { problem: problem.trim(), subject },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        responsePayload = res.data?.data ?? res.data;
      }

      if (responsePayload?.status === "success" && responsePayload.solution) {
        setResult(responsePayload.solution);
        setFlag(true);
        toast.success("Solved!");
      } else {
        setError("Could not solve this problem. Please try again.");
        toast.error("Could not solve this problem.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.message)
          ? err.response.data.message.join(", ")
          : err?.message) ||
        "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  // ── Diagram exports ──
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSvg = () => {
    if (!result?.diagram) return;
    downloadBlob(
      new Blob([result.diagram.svg], { type: "image/svg+xml" }),
      "diagram.svg",
    );
  };

  const svgToCanvas = (svg: string): Promise<HTMLCanvasElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const scale = 2; // crisper raster output
        const canvas = document.createElement("canvas");
        canvas.width = (img.width || 320) * scale;
        canvas.height = (img.height || 320) * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          return reject(new Error("Canvas unsupported"));
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not render SVG"));
      };
      img.src = url;
    });

  const exportPng = async () => {
    if (!result?.diagram) return;
    try {
      const canvas = await svgToCanvas(result.diagram.svg);
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, "diagram.png");
      }, "image/png");
    } catch {
      toast.error("PNG export failed.");
    }
  };

  const exportPdf = async () => {
    if (!result?.diagram) return;
    try {
      const canvas = await svgToCanvas(result.diagram.svg);
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const imgW = Math.min(pageW - 80, 400);
      const imgH = (canvas.height / canvas.width) * imgW;
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        (pageW - imgW) / 2,
        60,
        imgW,
        imgH,
      );
      if (result.diagram.caption) {
        pdf.setFontSize(11);
        pdf.text(result.diagram.caption, pageW / 2, 60 + imgH + 24, {
          align: "center",
        });
      }
      pdf.save("diagram.pdf");
    } catch {
      toast.error("PDF export failed.");
    }
  };

  // Plain-text version of the whole solution, for one-click copy.
  const solutionToText = (s: StemSolution): string => {
    const lines: string[] = [];
    lines.push(`Problem: ${s.problem_restatement}`);
    lines.push(`Final answer: ${s.final_answer}`);
    s.methods.forEach((m) => {
      lines.push(`\n${m.name} (${m.level}):`);
      m.steps.forEach((st, i) => {
        lines.push(`  ${i + 1}. ${st.explanation}${st.math ? ` [${st.math}]` : ""}`);
      });
    });
    if (s.tutorial) lines.push(`\nTutorial: ${s.tutorial}`);
    if (s.common_mistakes.length)
      lines.push(`\nCommon mistakes:\n${s.common_mistakes.map((x) => `  - ${x}`).join("\n")}`);
    return lines.join("\n");
  };

  return (
    <div>
      <ToolsApiLoader show={isSubmitting} />

      {/* Input mode toggle */}
      <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-900 mb-4">
        {(
          [
            { key: "text", label: "Type problem", icon: <FaKeyboard /> },
            { key: "image", label: "Upload photo", icon: <FaImage /> },
          ] as { key: InputMode; label: string; icon: React.ReactNode }[]
        ).map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setInputMode(m.key)}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded transition-colors duration-200 ${
              inputMode === m.key
                ? "bg-[#155dfc] text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Subject picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subject
        </label>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSubject(s.key)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                subject === s.key
                  ? "border-[#155dfc] bg-blue-50 text-[#155dfc] dark:bg-blue-900/20 dark:text-blue-300"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#2b7fff]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image upload */}
      {inputMode === "image" && (
        <div className="mb-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 text-center hover:border-[#2b7fff] transition-colors">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => onPickImage(e.target.files?.[0])}
            />
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Problem preview"
                className="max-h-64 rounded-md"
              />
            ) : (
              <>
                <FaImage className="mb-2 h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Click to upload a photo of the problem
                </span>
                <span className="mt-1 text-[11px] text-gray-400">
                  Math, physics, or chemistry — printed or handwritten (PNG, JPEG, WebP)
                </span>
              </>
            )}
          </label>
          <input
            type="text"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Optional: add any extra context"
            className={`${inputClass} mt-3`}
          />
        </div>
      )}

      {/* Text input */}
      {inputMode === "text" && (
        <div className="mb-4">
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g. A 5 kg block slides down a 30° frictionless incline. Find its acceleration."
            rows={4}
            className={inputClass}
          />
        </div>
      )}

      {error && (
        <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSolve}
          disabled={isSubmitting}
          className={`px-6 py-2.5 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-300 ${
            isSubmitting
              ? "bg-[#565add] cursor-not-allowed"
              : "bg-[#155dfc] hover:bg-[#4147fb]"
          }`}
        >
          {isSubmitting ? "Solving..." : "Solve & Explain"}
        </button>
        <button
          onClick={handleClear}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-md font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultRef} className="mt-6 space-y-5">
          {/* Restatement + final answer */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Solution{" "}
                <span className="text-sm font-normal text-gray-400 capitalize">
                  ({result.subject})
                </span>
              </h3>
              <button
                onClick={() => handleCopy(solutionToText(result))}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                title="Copy full solution"
              >
                <FaRegCopy /> Copy
              </button>
            </div>
            {result.problem_restatement && (
              <div className="text-gray-700 dark:text-gray-300 mb-2">
                <MarkDown content={result.problem_restatement} />
              </div>
            )}
            {result.final_answer && (
              <div className="mt-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-[#193cb8] p-3">
                <span className="text-sm font-semibold text-[#193cb8] dark:text-blue-300">
                  Final answer:{" "}
                </span>
                <span className="text-gray-800 dark:text-gray-100">
                  <MarkDown content={result.final_answer} />
                </span>
              </div>
            )}
          </div>

          {/* Methods */}
          {result.methods.map((m, mi) => (
            <div
              key={mi}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4"
            >
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                {m.name}
                <span
                  className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    m.level === "advanced"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  {m.level}
                </span>
              </h4>
              <div className="space-y-2">
                {m.steps.map((st, si) => (
                  <div
                    key={si}
                    className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-[#193cb8] dark:text-blue-200 text-sm font-semibold">
                      {si + 1}
                    </span>
                    <div className="flex-1 text-gray-700 dark:text-gray-300">
                      <MarkDown content={st.explanation} />
                      {st.math && <MarkDown content={mathBlock(st.math)} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tutorial */}
          {result.tutorial && (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Understanding the concept
              </h4>
              <div className="text-gray-700 dark:text-gray-300">
                <MarkDown content={result.tutorial} />
              </div>
            </div>
          )}

          {/* Common mistakes */}
          {result.common_mistakes.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-md p-4">
              <h4 className="text-base font-semibold text-amber-800 dark:text-amber-300 mb-2">
                Common mistakes to avoid
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                {result.common_mistakes.map((mk, i) => (
                  <li key={i}>{mk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Diagram + exports */}
          {result.diagram && (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                  Diagram
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportPng}
                    className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  >
                    PNG
                  </button>
                  <button
                    onClick={exportSvg}
                    className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  >
                    SVG
                  </button>
                  <button
                    onClick={exportPdf}
                    className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  >
                    PDF
                  </button>
                </div>
              </div>
              <div
                className="flex justify-center bg-white rounded-md p-3 overflow-auto"
                // The SVG is sanitized server-side (no scripts/handlers/external refs).
                dangerouslySetInnerHTML={{ __html: result.diagram.svg }}
              />
              {result.diagram.caption && (
                <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                  {result.diagram.caption}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StemSolver;
