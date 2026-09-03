"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import { FaRegCopy, FaImage, FaKeyboard, FaSuperscript } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import katex from "katex";
import "katex/dist/katex.min.css";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { sanitizeHtml } from "@/app/utils/sanitizeHtml";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { useToolDraftPersistence } from "@/app/lib/client/useToolDraftPersistence";
import { useBillingDraftStash } from "@/app/lib/client/useBillingDraftStash";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import { getAccessToken } from "@/app/lib/authSession";

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

/**
 * Formula keyboard. `insert` is the literal inserted at the cursor; `back`
 * moves the caret back into a template so the user types inside it. Symbols
 * are written in notation the solver reads reliably (^, /, √, Greek, etc.).
 */
type FormulaKey = { label: string; insert: string; back?: number };

/**
 * Formula keyboard grouped into tabs (mathgptpro-style). `insert` is the literal
 * inserted at the cursor; `back` moves the caret into a template so the user
 * types inside it. Symbols use notation the solver reads reliably.
 */
const FORMULA_TABS: { id: string; label: string; keys: FormulaKey[] }[] = [
  {
    id: "basic",
    label: "Basic",
    keys: [
      { label: "x²", insert: "^2" },
      { label: "xⁿ", insert: "^()", back: 1 },
      { label: "√", insert: "√()", back: 1 },
      { label: "ⁿ√", insert: "root()()", back: 3 },
      { label: "a/b", insert: "()/()", back: 4 },
      { label: "(", insert: "(" },
      { label: ")", insert: ")" },
      { label: "+", insert: " + " },
      { label: "−", insert: " - " },
      { label: "×", insert: " × " },
      { label: "÷", insert: " ÷ " },
      { label: "=", insert: " = " },
      { label: "±", insert: "±" },
      { label: "·", insert: "·" },
      { label: "%", insert: "%" },
    ],
  },
  {
    id: "trig",
    label: "sin cos",
    keys: [
      { label: "sin", insert: "sin()", back: 1 },
      { label: "cos", insert: "cos()", back: 1 },
      { label: "tan", insert: "tan()", back: 1 },
      { label: "cot", insert: "cot()", back: 1 },
      { label: "sec", insert: "sec()", back: 1 },
      { label: "csc", insert: "csc()", back: 1 },
      { label: "sin⁻¹", insert: "arcsin()", back: 1 },
      { label: "cos⁻¹", insert: "arccos()", back: 1 },
      { label: "tan⁻¹", insert: "arctan()", back: 1 },
      { label: "sinh", insert: "sinh()", back: 1 },
      { label: "cosh", insert: "cosh()", back: 1 },
      { label: "tanh", insert: "tanh()", back: 1 },
      { label: "log", insert: "log()", back: 1 },
      { label: "ln", insert: "ln()", back: 1 },
      { label: "logₐ", insert: "log_()", back: 1 },
    ],
  },
  {
    id: "symbols",
    label: "≥ ≠",
    keys: [
      { label: "≤", insert: "≤" },
      { label: "≥", insert: "≥" },
      { label: "≠", insert: "≠" },
      { label: "≈", insert: "≈" },
      { label: "∞", insert: "∞" },
      { label: "°", insert: "°" },
      { label: "∝", insert: "∝" },
      { label: "→", insert: " → " },
      { label: "∑", insert: "∑" },
      { label: "∏", insert: "∏" },
      { label: "∫", insert: "∫()", back: 1 },
      { label: "∂", insert: "∂" },
      { label: "∇", insert: "∇" },
      { label: "∈", insert: "∈" },
      { label: "≅", insert: "≅" },
    ],
  },
  {
    id: "greek",
    label: "αβγ",
    keys: [
      { label: "α", insert: "α" },
      { label: "β", insert: "β" },
      { label: "γ", insert: "γ" },
      { label: "δ", insert: "δ" },
      { label: "θ", insert: "θ" },
      { label: "λ", insert: "λ" },
      { label: "μ", insert: "μ" },
      { label: "π", insert: "π" },
      { label: "ρ", insert: "ρ" },
      { label: "σ", insert: "σ" },
      { label: "τ", insert: "τ" },
      { label: "φ", insert: "φ" },
      { label: "ω", insert: "ω" },
      { label: "Δ", insert: "Δ" },
      { label: "Ω", insert: "Ω" },
    ],
  },
];

const inputClass =
  "w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300";

/** Render a bare KaTeX string to an HTML string; falls back to the raw text. */
function renderKatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode,
      throwOnError: false,
      output: "html",
    });
  } catch {
    return tex;
  }
}

/** A pure-LaTeX expression (the schema's `math` field), rendered as block math. */
const BlockMath: FC<{ tex: string }> = ({ tex }) => (
  <div
    className="my-1 overflow-x-auto"
    dangerouslySetInnerHTML={{ __html: renderKatex(tex, true) }}
  />
);

const InlineMath: FC<{ tex: string }> = ({ tex }) => (
  <span dangerouslySetInnerHTML={{ __html: renderKatex(tex, false) }} />
);

/**
 * Render prose that may contain inline/block math in mixed delimiters. The model
 * is inconsistent — it emits $...$, $$...$$, \(...\), \[...\], and sometimes
 * escapes a literal \$. Normalize everything to $/$$ first, then split on those
 * delimiters and render the math segments with KaTeX and the rest as plain text.
 * This avoids the markdown "two stray dollars become garbled math" false positive.
 */
const LITERAL_DOLLAR = " DOLLAR ";

/**
 * Safety net for prose that contains BARE LaTeX (\sqrt{}, \text{}, ^, _, \to …)
 * not wrapped in $…$. The model is now told to always use $…$, but older or
 * lapsed responses can still leak raw commands; this wraps detected LaTeX runs
 * so KaTeX renders them instead of showing "\sqrt{75}" as literal text.
 * Brace-aware so groups containing spaces (e.g. \text{ m/s}) stay intact.
 */
function autoWrapBareLatex(s: string): string {
  if (!s || s.includes("$")) return s; // leave existing $-delimited math alone
  if (!/\\[a-zA-Z]+|[\^_]/.test(s)) return s; // no LaTeX markers at all

  const readBraces = (j: number): number => {
    let depth = 0;
    for (let k = j; k < s.length; k++) {
      if (s[k] === "{") depth++;
      else if (s[k] === "}" && --depth === 0) return k + 1;
    }
    return s.length;
  };
  const readMathToken = (j: number): number => {
    const c = s[j];
    if (c === "\\") {
      const m = /^\\[a-zA-Z]+/.exec(s.slice(j));
      if (!m) return Math.min(j + 2, s.length);
      let end = j + m[0].length;
      while (s[end] === "{") end = readBraces(end);
      return end;
    }
    if (c === "^" || c === "_") {
      const end = j + 1;
      return s[end] === "{" ? readBraces(end) : Math.min(end + 1, s.length);
    }
    return -1;
  };
  const isOperand = (c: string) => /[0-9.+\-=×*/()]/.test(c);

  let out = "";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c !== "\\" && c !== "^" && c !== "_") {
      out += c;
      i++;
      continue;
    }
    // Pull a leading numeric operand back into the run (e.g. "4.9 " before \text).
    let lead = "";
    out = out.replace(/([0-9.]+\s*)$/, (mm) => {
      lead = mm;
      return "";
    });
    let run = lead;
    let j = i;
    while (j < s.length) {
      const tEnd = readMathToken(j);
      if (tEnd > j) {
        run += s.slice(j, tEnd);
        j = tEnd;
        continue;
      }
      if (isOperand(s[j])) {
        run += s[j++];
        continue;
      }
      if (s[j] === " ") {
        let k = j;
        while (s[k] === " ") k++;
        if (readMathToken(k) > k || (s[k] && isOperand(s[k]))) {
          run += s.slice(j, k);
          j = k;
          continue;
        }
      }
      break;
    }
    out += `$${run.trim()}$`;
    i = j;
  }
  return out;
}

function normalizeMathDelimiters(input: string): string {
  const withDelims = input
    .replace(/\\\$/g, LITERAL_DOLLAR)
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, x) => `$$${x}$$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_m, x) => `$${x}$`);
  return autoWrapBareLatex(withDelims);
}

const MathProse: FC<{ text: string; className?: string }> = ({ text, className }) => {
  const normalized = normalizeMathDelimiters(text || "");
  // Split on $$...$$ (block) and $...$ (inline), keeping the delimiters.
  const parts = normalized.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return <BlockMath key={i} tex={part.slice(2, -2)} />;
        }
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          return <InlineMath key={i} tex={part.slice(1, -1)} />;
        }
        // Restore any protected literal dollar signs.
        return <span key={i}>{part.split(LITERAL_DOLLAR).join("$")}</span>;
      })}
    </span>
  );
};

/**
 * Convert pasted LaTeX-formatted text into clean, readable plain text for the
 * input box (a textarea can't render math, so raw "$20\text{ m/s}$" looks bad).
 * The solver still understands the cleaned text. Conservative — only common
 * constructs; anything unrecognized is left as-is minus the $ delimiters.
 */
function latexToReadable(input: string): string {
  let s = input;
  // Common symbol/command replacements.
  const REPLACEMENTS: [RegExp, string][] = [
    [/\\text\s*\{([^{}]*)\}/g, "$1"], // \text{ m/s} -> m/s
    [/\\mathrm\s*\{([^{}]*)\}/g, "$1"],
    [/\\sqrt\s*\{([^{}]*)\}/g, "√($1)"], // \sqrt{2} -> √(2)
    [/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1)/($2)"],
    [/\^\s*\{\s*\\circ\s*\}/g, "°"], // 30^{\circ} -> 30°
    [/\^\s*\\circ/g, "°"], // 30^\circ -> 30°
    [/\\circ/g, "°"],
    [/\\times/g, "×"],
    [/\\cdot/g, "·"],
    [/\\div/g, "÷"],
    [/\\pm/g, "±"],
    [/\\leq/g, "≤"],
    [/\\geq/g, "≥"],
    [/\\neq/g, "≠"],
    [/\\approx/g, "≈"],
    [/\\infty/g, "∞"],
    [/\\to/g, "→"],
    [/\\rightarrow/g, "→"],
    [/\\pi/g, "π"],
    [/\\theta/g, "θ"],
    [/\\alpha/g, "α"],
    [/\\beta/g, "β"],
    [/\\mu/g, "μ"],
    [/\\lambda/g, "λ"],
    [/\\Delta/g, "Δ"],
    [/\\degree/g, "°"],
    [/\\,/g, " "], // thin space
    [/\\;/g, " "],
    [/\\!/g, ""],
  ];
  for (const [re, rep] of REPLACEMENTS) s = s.replace(re, rep);
  // Strip remaining $/$$ delimiters and superscript/subscript braces.
  s = s.replace(/\$\$?/g, "");
  s = s.replace(/\^\{([^{}]*)\}/g, "^$1").replace(/_\{([^{}]*)\}/g, "_$1");
  // Drop any leftover backslash-commands we didn't map, keeping their text.
  s = s.replace(/\\([a-zA-Z]+)/g, "$1");
  // Strip stray braces left over from unmatched/odd LaTeX groups.
  s = s.replace(/[{}]/g, "");
  // Collapse the extra spaces those edits can leave behind.
  return s.replace(/[ \t]{2,}/g, " ");
}

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
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [keyboardTab, setKeyboardTab] = useState<string>("basic");
  type StemSolverDraft = { problem: string; subject: Subject };

  const { stashDraft } = useToolDraftPersistence<StemSolverDraft>(
    "math-solver",
    (draft) => {
      if (draft.problem) setProblem(draft.problem);
      if (draft.subject) setSubject(draft.subject);
    },
  );

  useBillingDraftStash<StemSolverDraft>("math-solver", () => ({ problem, subject }));

  const { gateOpen, closeGate, guardAiClick } = useGuestGate<StemSolverDraft>({
    getDraft: () => ({ problem, subject }),
    stashDraft,
  });
  const resultRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLTextAreaElement>(null);

  /** Insert a symbol/snippet at the textarea cursor; `caretBack` re-positions
   * the caret inside a template (e.g. between fraction braces). */
  const insertSymbol = (snippet: string, caretBack = 0) => {
    const el = problemRef.current;
    const start = el ? el.selectionStart : problem.length;
    const end = el ? el.selectionEnd : problem.length;
    const next = problem.slice(0, start) + snippet + problem.slice(end);
    setProblem(next);
    const caret = start + snippet.length - caretBack;
    requestAnimationFrame(() => {
      if (!problemRef.current) return;
      problemRef.current.focus();
      problemRef.current.setSelectionRange(caret, caret);
    });
  };

  /**
   * Clean pasted LaTeX into readable text. Only intercepts when the clipboard
   * actually contains LaTeX markers ($, \cmd, ^, _) — ordinary text pastes
   * through untouched. Works for both the textarea and the context input.
   */
  const handleLatexPaste = (
    e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const pasted = e.clipboardData.getData("text");
    if (!pasted || !/\$|\\[a-zA-Z]+|[\^_]/.test(pasted)) return; // no LaTeX → default paste
    e.preventDefault();
    const cleaned = latexToReadable(pasted);
    const el = e.currentTarget;
    const start = el.selectionStart ?? problem.length;
    const end = el.selectionEnd ?? problem.length;
    const next = problem.slice(0, start) + cleaned + problem.slice(end);
    setProblem(next);
    const caret = start + cleaned.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(getAccessToken());
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

    // Guests get a small number of free AI actions across all tools; the gate
    // opens instead of calling the AI once the allowance is used up.
    guardAiClick(async () => {
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
    });
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
            onPaste={handleLatexPaste}
            placeholder="Optional: add any extra context"
            className={`${inputClass} mt-3`}
          />
        </div>
      )}

      {/* Text input */}
      {inputMode === "text" && (
        <div className="mb-4">
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowKeyboard((v) => !v)}
              aria-pressed={showKeyboard}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                showKeyboard
                  ? "border-[#155dfc] bg-blue-50 text-[#155dfc] dark:bg-blue-900/20 dark:text-blue-300"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#2b7fff]"
              }`}
            >
              <FaSuperscript className="h-3 w-3" />
              Symbols
            </button>
          </div>
          <textarea
            ref={problemRef}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            onPaste={handleLatexPaste}
            placeholder="e.g. A 5 kg block slides down a 30° frictionless incline. Find its acceleration."
            rows={4}
            className={inputClass}
          />
          {showKeyboard && (
            <div className="mt-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-2">
              {/* Category tabs */}
              <div className="mb-2 flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700 pb-2">
                {FORMULA_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setKeyboardTab(tab.id)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      keyboardTab === tab.id
                        ? "bg-[#155dfc] text-white"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Keys for the active tab */}
              <div className="flex flex-wrap gap-1.5">
                {(FORMULA_TABS.find((t) => t.id === keyboardTab) ?? FORMULA_TABS[0]).keys.map(
                  (k) => (
                    <button
                      key={k.label}
                      type="button"
                      onClick={() => insertSymbol(k.insert, k.back ?? 0)}
                      className="min-w-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:border-[#2b7fff] hover:text-[#2b7fff] transition-colors"
                      title={`Insert ${k.label}`}
                    >
                      {k.label}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
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
              <MathProse
                text={result.problem_restatement}
                className="block text-gray-700 dark:text-gray-300 mb-2 leading-relaxed"
              />
            )}
            {result.final_answer && (
              <div className="mt-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-[#193cb8] p-3">
                <span className="text-sm font-semibold text-[#193cb8] dark:text-blue-300">
                  Final answer:{" "}
                </span>
                <MathProse
                  text={result.final_answer}
                  className="text-gray-800 dark:text-gray-100 font-medium"
                />
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
                      {st.explanation && (
                        <MathProse text={st.explanation} className="block leading-relaxed" />
                      )}
                      {st.math && <BlockMath tex={st.math} />}
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
              <MathProse
                text={result.tutorial}
                className="block text-gray-700 dark:text-gray-300 leading-relaxed"
              />
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
                  <li key={i}>
                    <MathProse text={mk} />
                  </li>
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
                // Sanitized client-side (SVG profile) before injection.
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(result.diagram.svg),
                }}
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
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default StemSolver;
