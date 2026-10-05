"use client";

import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiDownload,
  FiEdit3,
  FiFileText,
  FiList,
  FiLoader,
  FiMessageCircle,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiZap,
} from "react-icons/fi";
import {
  EXPERT_WHATSAPP_HREF,
  trackExpertWhatsAppClick,
} from "../Dashboard/ExpertHelpCard";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { getGuestUserId } from "@/app/lib/client/guestStudyLimits";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";
import { cancelJob, waitForJob } from "@/app/lib/client/jobStream";
import { countWords } from "@/app/utils/text";
import {
  buildDocxBlob,
  downloadBlob,
  sanitizeFilename,
} from "../MainTool/academicDocumentExport";
import DiscussionPostView from "./DiscussionPostView";
import DraftEditor from "./DraftEditor";
import type {
  EssayOutline,
  EssayStudioSessionData,
  EssayStudioStep,
  GradeResult,
  ThesisOption,
} from "./types";

const API = String(
  process.env.NEXT_PUBLIC_NGROX_URL || process.env.NEXT_PUBLIC_API_URL || "",
).replace(/\/$/, "");

function unwrap<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

const ACADEMIC_LEVELS = [
  { value: "undergraduate", label: "Undergraduate (online)" },
  { value: "graduate", label: "Graduate / Master's" },
  { value: "doctoral", label: "Doctoral / PhD" },
];

const ESSAY_TYPES = [
  { value: "argumentative", label: "Argumentative" },
  { value: "evidence_based", label: "Evidence-based practice" },
  { value: "reflective", label: "Reflective" },
  { value: "analytical", label: "Analytical" },
  { value: "compare_contrast", label: "Compare & contrast" },
  { value: "expository", label: "Expository" },
];

const CITATION_STYLES = [
  { value: "apa7", label: "APA 7th" },
  { value: "mla9", label: "MLA 9th" },
  { value: "chicago17", label: "Chicago 17th" },
  { value: "harvard", label: "Harvard" },
  { value: "none", label: "None" },
];

function buildDefaultTheses(topic?: string): ThesisOption[] {
  const t = topic?.trim() || "evidence-based academic research";
  return [
    {
      tag: "CLEAREST ARGUMENT",
      text: `A systematic, evidence-based approach to ${t.toLowerCase().replace(/\.$/, "")} significantly improves outcomes by establishing structured protocols and mitigating preventable risks.`,
    },
    {
      tag: "CRITICAL ANALYSIS",
      text: `${t} must be prioritized as an essential institutional standard rather than an adjustable operational measure, ensuring consistent quality and accountability.`,
    },
    {
      tag: "STRATEGIC ROI",
      text: `Institutions that proactively invest in addressing ${t.toLowerCase().replace(/\.$/, "")} achieve superior performance and long-term sustainability, far outweighing initial adoption costs.`,
    },
  ];
}

function buildDefaultOutline(topic?: string, thesisText?: string): EssayOutline {
  const t = topic?.trim() || "the Subject Area";
  const thesis =
    thesisText ||
    `A structured, evidence-based framework for ${t.toLowerCase()} improves operational reliability and overall outcomes.`;
  return {
    intro: [
      {
        text: `Contemporary literature highlights the critical importance of ${t.toLowerCase()} across modern practice.`,
      },
      {
        text: `Inconsistent execution and structural variability frequently undermine efficacy and standard adherence.`,
      },
      {
        text: `Thesis statement: ${thesis}`,
      },
    ],
    body: [
      {
        roman: "II",
        title: `Core Principles and Conceptual Framework of ${t}`,
        points: [
          {
            text: `Analysis of validated models and peer-reviewed literature applicable to ${t.toLowerCase()}.`,
          },
          {
            text: `Operational factors and systemic guidelines that drive successful daily execution.`,
          },
          {
            text: `Empirical benchmarks demonstrating direct correlations with elevated quality metrics.`,
          },
        ],
      },
      {
        roman: "III",
        title: `Implementation Strategies and Risk Mitigation`,
        points: [
          {
            text: `Identifying institutional barriers, resource allocation constraints, and compliance gaps.`,
          },
          {
            text: `Targeted interventions for interdisciplinary coordination and proactive monitoring.`,
          },
          {
            text: `Objective evaluation mechanisms to measure continuous improvement and milestones.`,
          },
        ],
      },
      {
        roman: "IV",
        title: `Strategic, Economic, and Policy Implications`,
        points: [
          {
            text: `Evaluating initial implementation investments against long-term liability reductions.`,
          },
          {
            text: `Alignment with regulatory requirements, accreditation standards, and best practices.`,
          },
          {
            text: `Sustainable organizational strategies to prevent burnout and promote retention.`,
          },
        ],
      },
    ],
    conclusion: [
      {
        text: `Restate thesis: Systematic, evidence-based protocols for ${t.toLowerCase()} deliver sustainable improvements.`,
      },
      {
        text: `Synthesize the primary evidence linking structured methodologies with high-reliability performance.`,
      },
      {
        text: `Actionable recommendations for institutional leadership, frontline practitioners, and ongoing research.`,
      },
    ],
  };
}

function buildDefaultDraft(
  topic?: string,
  thesisText?: string,
  outlineObj?: EssayOutline,
): string {
  const t = topic?.trim() || "Evidence-Based Practice and Methodological Rigor";
  const thesis =
    thesisText ||
    `A structured, evidence-based framework for ${t.toLowerCase()} improves operational reliability and overall outcomes.`;

  return `${t}

Introduction
In contemporary academic and professional discourse, the systematic examination of ${t.toLowerCase()} has emerged as an essential priority. Organizations and practitioners facing complex challenges frequently encounter performance discrepancies when relying on unstandardized or ad-hoc methodologies. To achieve dependable and sustainable progress, institutions must adopt structured, evidence-informed practices that withstand rigorous scrutiny. ${thesis} By aligning proven theoretical frameworks with everyday operations, organizations can bridge the persistent gap between established research and real-world execution.

Conceptual Foundations and Methodological Framework
The foundation of effective practice lies in a comprehensive understanding of core operational variables. Peer-reviewed literature consistently underscores that standardized protocols provide practitioners with the necessary guidance to navigate demanding tasks effectively. When operational expectations are clearly defined, ambiguity declines and fidelity to best practices rises. Empirical studies across diverse settings corroborate that organizations adhering to validated rubrics systematically outperform counterparts lacking formalized guidelines. Furthermore, regular feedback loops and peer evaluation mechanisms reinforce procedural consistency across teams.

Implementation Challenges and Risk Mitigation
Despite substantial empirical backing for standardized protocols, real-world adoption is rarely without obstacles. Institutional inertia, resource constraints, and competing administrative priorities often hinder initial compliance. Overcoming these headwinds requires active leadership commitment, targeted training initiatives, and transparent communication regarding intended benchmarks. By establishing measurable milestones and cultivating collaborative problem-solving environments, leadership can dismantle silos and cultivate a shared culture of quality. Risk mitigation strategies must also be integrated into early onboarding to prevent procedural drift over time.

Strategic, Economic, and Policy Implications
A frequent objection raised during the adoption of structured standards centers on upfront operational expenditures and administrative overhead. However, analyzing procedural reforms solely through the lens of initial cost overlooks the substantial long-term penalties associated with preventable error and non-compliance. Regulatory bodies and accreditation agencies increasingly penalize substandard outcomes while rewarding demonstrable consistency. Investing in robust infrastructure and continuous professional development yields compounding dividends in risk reduction, stakeholder satisfaction, and institutional resilience.

Conclusion
In conclusion, advancing ${t.toLowerCase()} is not merely an optional aspiration but an indispensable requirement for high-reliability performance. The synthesis of empirical evidence confirms that proactive standards protect both practitioners and the communities they serve. Decision-makers and researchers must continue collaborating to refine these guidelines, ensuring that theoretical rigor translates into durable, practical impact.`;
}

function buildDefaultGradeResult(
  rubricText?: string,
  essayTitle?: string,
): GradeResult {
  return {
    letterGrade: "B+",
    score: 84,
    summary: `Solid foundational argumentation for "${essayTitle || "your paper"}", but secondary evidence and citation formatting need tightening to reach an A.`,
    criteria: [
      { name: "Evidence & Sources", score: 34, maxScore: 40 },
      { name: "Analysis & Synthesis", score: 26, maxScore: 30 },
      { name: "Structure & Organization", score: 17, maxScore: 20 },
      { name: "Style & Citations", score: 7, maxScore: 10 },
    ],
    topFixes: [
      {
        pointsGain: 8,
        title: "Strengthen empirical evidence in Section II.",
        instruction:
          "Integrate peer-reviewed studies from the last 5 years to substantiate core assertions.",
      },
      {
        pointsGain: 5,
        title: "Deepen counterargument analysis.",
        instruction:
          "Address opposing viewpoints and trade-offs directly before concluding.",
      },
      {
        pointsGain: 3,
        title: "Format references and in-text citations.",
        instruction:
          "Ensure all in-text citations match your reference list and include active DOIs.",
      },
    ],
  };
}

const VALID_STEPS: EssayStudioStep[] = [
  "start",
  "setup",
  "thesis",
  "outline",
  "draft",
  "grader",
  "discussion",
];

export default function EssayStudio({
  embedded = false,
  initialStep = "start",
}: {
  embedded?: boolean;
  initialStep?: EssayStudioStep;
}) {
  const searchParams = useSearchParams();
  const queryStep = searchParams?.get("step") as EssayStudioStep | null;
  const resolvedStep =
    queryStep && VALID_STEPS.includes(queryStep) ? queryStep : initialStep;

  const [step, setStep] = useState<EssayStudioStep>(resolvedStep);

  useEffect(() => {
    if (queryStep && VALID_STEPS.includes(queryStep)) {
      setStep(queryStep);
    }
  }, [queryStep]);

  // Project state - clean defaults
  const [title, setTitle] = useState("");
  const [topicPrompt, setTopicPrompt] = useState("");
  const [assignmentPrompt, setAssignmentPrompt] = useState("");
  const [hasRubric, setHasRubric] = useState(false);
  const [academicLevel, setAcademicLevel] = useState<
    "undergraduate" | "graduate" | "doctoral"
  >("undergraduate");
  const [essayType, setEssayType] = useState("argumentative");
  const [targetWords, setTargetWords] = useState(1350);
  const [citationStyle, setCitationStyle] = useState<
    "apa7" | "mla9" | "chicago17" | "harvard" | "none"
  >("apa7");
  const [sourcesCount, setSourcesCount] = useState(3);

  // Thesis Step State
  const [researchQuestion, setResearchQuestion] = useState("");
  const [thesisOptions, setThesisOptions] = useState<ThesisOption[]>(() =>
    buildDefaultTheses(""),
  );
  const [selectedThesisIndex, setSelectedThesisIndex] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);

  // Outline Step State
  const [outline, setOutline] = useState<EssayOutline>(() =>
    buildDefaultOutline(""),
  );
  const [isEditingOutline, setIsEditingOutline] = useState(false);
  const [outlineTone, setOutlineTone] = useState("formal_academic");

  // Draft Step State
  const [draft, setDraft] = useState("");
  const [aiScore, setAiScore] = useState(84);
  const [aiSkipped, setAiSkipped] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  // Grader Step State
  const [graderRubricMode, setGraderRubricMode] = useState<"prof" | "std">(
    "prof",
  );
  const [graderStrictness, setGraderStrictness] = useState<
    "lenient" | "standard" | "strict"
  >("standard");
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(() =>
    buildDefaultGradeResult("", ""),
  );

  // Recent Session Persistence - starts false, only true if an actual session is saved in localStorage
  const [hasRecent, setHasRecent] = useState(false);
  const [recentSession, setRecentSession] =
    useState<Partial<EssayStudioSessionData> | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const { gateOpen, closeGate, guardAiClick } = useGuestGate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const words = useMemo(() => countWords(draft), [draft]);

  // Load saved session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("scholarly_essay_studio_session");
      if (saved) {
        const parsed: Partial<EssayStudioSessionData> = JSON.parse(saved);
        if (parsed?.title && parsed.title.trim()) {
          setRecentSession(parsed);
          setHasRecent(true);
        } else {
          setHasRecent(false);
        }
      } else {
        setHasRecent(false);
      }
    } catch {
      setHasRecent(false);
    }
  }, []);

  const handleResumeSession = () => {
    try {
      const saved = localStorage.getItem("scholarly_essay_studio_session");
      if (!saved) return;
      const parsed: Partial<EssayStudioSessionData> = JSON.parse(saved);

      if (parsed.title) setTitle(parsed.title);
      if (parsed.topic) setTopicPrompt(parsed.topic);
      if (parsed.assignmentPrompt) {
        setAssignmentPrompt(parsed.assignmentPrompt);
        setHasRubric(Boolean(parsed.assignmentPrompt.trim()));
      }
      if (parsed.academicLevel) setAcademicLevel(parsed.academicLevel);
      if (parsed.essayType) setEssayType(parsed.essayType);
      if (parsed.targetWords) setTargetWords(parsed.targetWords);
      if (parsed.citationStyle) setCitationStyle(parsed.citationStyle);
      if (parsed.sourcesCount) setSourcesCount(parsed.sourcesCount);
      if (parsed.researchQuestion) setResearchQuestion(parsed.researchQuestion);
      if (parsed.thesisOptions && parsed.thesisOptions.length > 0) {
        setThesisOptions(parsed.thesisOptions);
      }
      if (typeof parsed.selectedThesisIndex === "number") {
        setSelectedThesisIndex(parsed.selectedThesisIndex);
      }
      if (parsed.outline) setOutline(parsed.outline);
      if (parsed.draft) setDraft(parsed.draft);
      if (typeof parsed.aiScore === "number") setAiScore(parsed.aiScore);
      if (typeof parsed.aiSkipped === "boolean") setAiSkipped(parsed.aiSkipped);

      const targetStep = parsed.stoppedAtStep || "setup";
      setStep(targetStep);
      toast.success(`Resumed: ${parsed.title || "saved essay"}`);
    } catch {
      toast.error("Could not load saved session.");
    }
  };

  const handleClearRecentSession = () => {
    try {
      localStorage.removeItem("scholarly_essay_studio_session");
    } catch {}
    setRecentSession(null);
    setHasRecent(false);
    toast.success("Cleared saved session. Ready for a new essay!");
  };

  const saveRecentSession = (nextStep: EssayStudioStep) => {
    try {
      const activeTitle =
        title.trim() || topicPrompt.trim() || "Untitled Essay";
      const data: Partial<EssayStudioSessionData> = {
        title: activeTitle,
        topic: topicPrompt || title,
        assignmentPrompt,
        academicLevel,
        essayType,
        targetWords,
        citationStyle,
        sourcesCount,
        researchQuestion,
        selectedThesisIndex,
        thesisOptions,
        outline,
        draft,
        aiScore,
        aiSkipped,
        stoppedAtStep: nextStep,
        lastUpdated: "Just now",
      };
      localStorage.setItem(
        "scholarly_essay_studio_session",
        JSON.stringify(data),
      );
      setRecentSession(data);
      setHasRecent(true);
    } catch {}
  };

  const handleStartFromHero = () => {
    const text = topicPrompt.trim();
    if (!text) {
      toast.error("Please enter your essay topic or paste the assignment.");
      return;
    }
    // If long assignment text was pasted, extract title and keep instructions
    let parsedTitle = "";
    if (text.length > 80) {
      setAssignmentPrompt(text);
      setHasRubric(true);
      const firstLine = text.split("\n")[0].slice(0, 75);
      parsedTitle = firstLine || "Evidence-based research paper";
    } else {
      parsedTitle = text;
    }

    setTitle(parsedTitle);
    const rq = `How does ${parsedTitle.toLowerCase().replace(/\.$/, "")} impact modern outcomes and professional practice?`;
    setResearchQuestion(rq);
    const newTheses = buildDefaultTheses(parsedTitle);
    setThesisOptions(newTheses);
    const newOutline = buildDefaultOutline(parsedTitle, newTheses[0]?.text);
    setOutline(newOutline);
    const newDraft = buildDefaultDraft(
      parsedTitle,
      newTheses[0]?.text,
      newOutline,
    );
    setDraft(newDraft);

    try {
      const data: Partial<EssayStudioSessionData> = {
        title: parsedTitle,
        topic: text,
        assignmentPrompt: text.length > 80 ? text : "",
        academicLevel,
        essayType,
        targetWords,
        citationStyle,
        sourcesCount,
        researchQuestion: rq,
        thesisOptions: newTheses,
        selectedThesisIndex: 0,
        outline: newOutline,
        draft: newDraft,
        aiScore: 84,
        aiSkipped: false,
        stoppedAtStep: "setup",
        lastUpdated: "Just now",
      };
      localStorage.setItem(
        "scholarly_essay_studio_session",
        JSON.stringify(data),
      );
      setRecentSession(data);
      setHasRecent(true);
    } catch {}

    setStep("setup");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.replace(/\.[^/.]+$/, "");
    setTitle(name);
    setAssignmentPrompt(`Uploaded syllabus / instructions: ${file.name}`);
    setHasRubric(true);
    const rq = `What are the key requirements and critical factors in ${name}?`;
    setResearchQuestion(rq);
    const newTheses = buildDefaultTheses(name);
    setThesisOptions(newTheses);
    const newOutline = buildDefaultOutline(name, newTheses[0]?.text);
    setOutline(newOutline);
    const newDraft = buildDefaultDraft(name, newTheses[0]?.text, newOutline);
    setDraft(newDraft);
    toast.success(`Loaded assignment file: ${file.name}`);
    saveRecentSession("setup");
    setStep("setup");
  };

  const handleRegenerateThesis = () => {
    guardAiClick(async () => {
      setLoadingAction("thesis");
      await new Promise((r) => setTimeout(r, 800));
      setLoadingAction(null);
      const curTopic =
        title.trim() || topicPrompt.trim() || "evidence-based practice";
      setThesisOptions([
        {
          tag: "PRACTICE-FOCUSED",
          text: `Implementing evidence-based protocols for ${curTopic.toLowerCase().replace(/\.$/, "")} significantly improves outcomes by providing practitioners with actionable frameworks, rapid escalation pathways, and structured interventions.`,
        },
        {
          tag: "SYSTEMIC IMPACT",
          text: `Establishing enforceable standards across ${curTopic.toLowerCase().replace(/\.$/, "")} directly bolsters operational benchmarks, demonstrating that consistent quality requires institutional accountability.`,
        },
        {
          tag: "ORGANIZATIONAL ROI",
          text: `Strategic investments into ${curTopic.toLowerCase().replace(/\.$/, "")} reduce long-term compliance liabilities and adverse events, generating durable cost savings that exceed initial adoption expenses.`,
        },
      ]);
      toast.success("Generated fresh thesis variations!");
    });
  };

  const handleThesisAdjust = (
    style: "specific" | "shorter" | "counter" | "own",
  ) => {
    if (style === "own") {
      const custom = window.prompt(
        "Enter your custom thesis statement:",
        thesisOptions[selectedThesisIndex]?.text || "",
      );
      if (custom?.trim()) {
        const next = [...thesisOptions];
        next[selectedThesisIndex] = {
          tag: "CUSTOM THESIS",
          text: custom.trim(),
        };
        setThesisOptions(next);
        toast.success("Custom thesis applied!");
      }
      return;
    }
    guardAiClick(async () => {
      setLoadingAction("adjust");
      await new Promise((r) => setTimeout(r, 600));
      setLoadingAction(null);
      const curr = thesisOptions[selectedThesisIndex]?.text || "";
      let newText = curr;
      if (style === "specific") {
        newText = `${curr.replace(/\.$/, "")} specifically across operational and clinical benchmarks.`;
      } else if (style === "shorter") {
        newText = `A structured approach to ${title || "the subject"} directly enhances performance outcomes and standardizes operational reliability.`;
      } else if (style === "counter") {
        newText = `Although critics cite initial transition costs against standardizing ${title || "these procedures"}, the long-term reduction in systemic errors far outweighs operational expenditures.`;
      }
      const next = [...thesisOptions];
      next[selectedThesisIndex] = {
        tag: `${style.toUpperCase()} VERSION`,
        text: newText,
      };
      setThesisOptions(next);
      toast.success(`Thesis adjusted (${style})!`);
    });
  };

  const handleCopyOutline = () => {
    let text = `THESIS: ${thesisOptions[selectedThesisIndex]?.text || ""}\n\n`;
    text += `I. Introduction\n${outline.intro.map((p) => `  - ${p.text}`).join("\n")}\n\n`;
    outline.body.forEach((b) => {
      text += `${b.roman || "II"}. ${b.title}\n${b.points.map((p) => `  - ${p.text}`).join("\n")}\n\n`;
    });
    text += `V. Conclusion\n${outline.conclusion.map((p) => `  - ${p.text}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    toast.success("Outline copied to clipboard!");
  };

  const handleGenerateDraft = () => {
    guardAiClick(async () => {
      setLoadingAction("draft");
      await new Promise((r) => setTimeout(r, 1400));
      setLoadingAction(null);
      const curTopic = title.trim() || topicPrompt.trim();
      const chosenThesis = thesisOptions[selectedThesisIndex]?.text;
      setDraft(buildDefaultDraft(curTopic, chosenThesis, outline));
      saveRecentSession("draft");
      setStep("draft");
      toast.success("Draft generated from your outline!");
    });
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draft);
    setCopiedDraft(true);
    toast.success("Draft copied to clipboard!");
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleDownloadDocx = async () => {
    setDownloadingDocx(true);
    try {
      const escaped = draft
        .split(/\n{2,}/)
        .map(
          (para) =>
            `<p>${para
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/\n/g, "<br/>")}</p>`,
        )
        .join("");
      const blob = await buildDocxBlob(escaped, title);
      downloadBlob(blob, `${sanitizeFilename(title || "essay-draft")}.docx`);
      toast.success("Word document downloaded!");
    } catch {
      toast.error("Failed to generate .docx");
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleGradeDraft = () => {
    guardAiClick(async () => {
      setIsGrading(true);
      await new Promise((r) => setTimeout(r, 1200));
      setIsGrading(false);
      setGradeResult(buildDefaultGradeResult(assignmentPrompt, title));
      setStep("grader");
      toast.success("Essay graded against your rubric!");
    });
  };

  // Render Stepper in Wizard View
  const renderStepper = () => {
    const stepsConfig = [
      { id: "setup", num: 1, label: "Setup" },
      { id: "thesis", num: 2, label: "Thesis", sub: "optional" },
      { id: "outline", num: 3, label: "Outline" },
      { id: "draft", num: 4, label: "Draft" },
      { id: "grader", num: 5, label: "Check", alert: aiScore > 50 },
    ];
    return (
      <div className="grid grid-cols-5 gap-2 rounded-2xl border border-[#E4E5EE] bg-white p-1.5 shadow-sm">
        {stepsConfig.map((s) => {
          const isActive = step === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                saveRecentSession(s.id as EssayStudioStep);
                setStep(s.id as EssayStudioStep);
              }}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "text-[#3F4357] hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  isActive
                    ? "bg-white text-[#4F46E5]"
                    : s.alert
                      ? "bg-[#C2410C] text-white"
                      : "border border-[#B9BDCB] text-[#3F4357]"
                }`}
              >
                {s.alert && !isActive ? "!" : s.num}
              </span>
              <span>{s.label}</span>
              {s.sub && !isActive && (
                <span className="hidden text-[10px] font-normal text-[#5B6072] md:inline">
                  {s.sub}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Sidebars
  const renderDoneForYouCard = (
    customHeadline?: string,
    customBody?: string,
  ) => (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#171A2B] p-5 text-white shadow-md">
      <span className="self-start rounded-full bg-[#262A44] px-3 py-1 text-xs font-semibold text-[#C7C9FF]">
        Done-for-you
      </span>
      <h3 className="text-base font-bold leading-snug">
        {customHeadline || "No time to write it at all?"}
      </h3>
      <p className="text-xs leading-relaxed text-[#D5D7E3]">
        {customBody ||
          "A writer in your field can take the whole paper, built to your rubric and on time."}
      </p>
      <div className="flex items-center gap-2 text-xs text-[#D5D7E3]">
        <FiCheck className="h-4 w-4 text-emerald-400" /> Free quote, no
        commitment
      </div>
      <a
        href={EXPERT_WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackExpertWhatsAppClick("essay_studio")}
        className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#15803D] text-xs font-semibold text-white shadow-sm transition hover:bg-[#166534]"
      >
        <FiMessageCircle className="h-4 w-4" /> Get a quote on WhatsApp
      </a>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-6 pb-16 font-poppins text-[#171A2B]">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.docx,.txt"
        className="hidden"
      />

      {/* ========================================================
          SCREEN 0: START SCREEN
      ======================================================== */}
      {step === "start" && (
        <div className="flex flex-col lg:flex-row items-start gap-7">
          {/* Main Hero Form */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
            {/* Resume Ongoing Session Banner - shown only if an active session is saved in localStorage */}
            {hasRecent && recentSession && (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E4E5EE] bg-white p-4 shadow-sm transition hover:border-[#CBD5E1]">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FF] text-[#4F46E5]">
                    <FiFileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#171A2B] truncate">
                      Continue: {recentSession.title || "Your saved essay"}
                    </h4>
                    <span className="text-xs text-[#5B6072] block truncate">
                      Saved in Essay Studio {recentSession.stoppedAtStep ? `· Step: ${recentSession.stoppedAtStep}` : ""} · Resume anytime
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleClearRecentSession}
                    className="flex h-10 items-center rounded-xl border border-[#E4E5EE] px-3 text-xs font-medium text-[#5B6072] hover:bg-gray-50 transition"
                    title="Dismiss"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={handleResumeSession}
                    className="flex h-10 items-center rounded-xl bg-[#4F46E5] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#3730A3] transition"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Headline */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#171A2B] md:text-3xl">
                Write your essay without staring at a blank page
              </h1>
              <p className="mt-1.5 text-sm text-[#3F4357]">
                Paste your assignment or just type your topic. We&apos;ll handle
                the rest, step by step.
              </p>
            </div>

            {/* Big Prompt Card */}
            <div className="flex flex-col gap-3 rounded-2xl border-2 border-[#C7CBF5] bg-white p-5 shadow-lg shadow-indigo-100/50">
              <textarea
                rows={5}
                value={topicPrompt}
                onChange={(e) => setTopicPrompt(e.target.value)}
                placeholder="e.g. Impact of telemedicine on rural healthcare, or paste the full assignment instructions from Canvas or Blackboard…"
                className="w-full resize-none border-0 text-base leading-relaxed text-[#171A2B] placeholder:text-gray-400 focus:outline-none"
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[#EEF0F5] pt-3.5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-3.5 text-xs font-medium text-[#171A2B] hover:bg-gray-50 transition"
                  >
                    <FiUpload className="h-4 w-4" /> Upload assignment
                  </button>
                  <span className="hidden xl:inline-block text-xs leading-snug text-[#5B6072] max-w-[280px]">
                    Pasting the full assignment? We pick up word count, citation
                    style and sources for you.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleStartFromHero}
                  className="flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-xl bg-[#4F46E5] px-7 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-[#3730A3]"
                >
                  Write my essay <FiArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick shortcuts: "Only need part of it?" */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[#3F4357]">
                Only need part of it?
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!title) {
                      const def = "Evidence-based practice in healthcare";
                      setTitle(def);
                      setResearchQuestion(`How does ${def.toLowerCase()} impact professional outcomes?`);
                      const th = buildDefaultTheses(def);
                      setThesisOptions(th);
                      setOutline(buildDefaultOutline(def, th[0]?.text));
                    }
                    setStep("outline");
                  }}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#D9DCE6] bg-white p-4 text-left shadow-sm transition hover:border-[#4F46E5]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FF] text-[#4F46E5]">
                      <FiList className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#171A2B] truncate">
                        Just an outline
                      </h4>
                      <span className="text-[11px] text-[#5B6072] block truncate">
                        Editable, ready in seconds
                      </span>
                    </div>
                  </div>
                  <FiArrowRight className="h-4 w-4 shrink-0 text-[#4F46E5]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!title) {
                      const def = "Evidence-based practice in healthcare";
                      setTitle(def);
                      setResearchQuestion(`How does ${def.toLowerCase()} impact professional outcomes?`);
                      setThesisOptions(buildDefaultTheses(def));
                    }
                    setStep("thesis");
                  }}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#D9DCE6] bg-white p-4 text-left shadow-sm transition hover:border-[#4F46E5]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FF] text-[#4F46E5]">
                      <FiEdit3 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#171A2B] truncate">
                        Thesis or title
                      </h4>
                      <span className="text-[11px] text-[#5B6072] block truncate">
                        3 options to pick from
                      </span>
                    </div>
                  </div>
                  <FiArrowRight className="h-4 w-4 shrink-0 text-[#4F46E5]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!draft) {
                      const def = title || "Evidence-based practice in healthcare";
                      setDraft(buildDefaultDraft(def));
                    }
                    setStep("grader");
                  }}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#D9DCE6] bg-white p-4 text-left shadow-sm transition hover:border-[#4F46E5]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#C2410C]">
                      <FiZap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#171A2B] truncate">
                        Check my draft
                      </h4>
                      <span className="text-[11px] text-[#5B6072] block truncate">
                        AI score and rubric grade
                      </span>
                    </div>
                  </div>
                  <FiArrowRight className="h-4 w-4 shrink-0 text-[#4F46E5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
            {renderDoneForYouCard()}

            {/* Discussion Post Banner in sidebar for perfect balance */}
            <div className="flex flex-col gap-2.5 rounded-2xl border border-[#E4E5EE] bg-[#F8F9FC] p-4 text-left shadow-sm">
              <div className="flex items-center gap-2.5 text-[#4F46E5]">
                <FiMessageCircle className="h-5 w-5 shrink-0" />
                <span className="text-xs font-bold text-[#171A2B]">Discussion Post Tool</span>
              </div>
              <p className="text-xs text-[#5B6072] leading-relaxed">
                Need this week&apos;s discussion board post &amp; 2 classmate replies?
              </p>
              <button
                type="button"
                onClick={() => setStep("discussion")}
                className="mt-1 flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#4F46E5] hover:bg-gray-50 transition shadow-sm"
              >
                Open Discussion Tool &rarr;
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================
          SCREEN 1: SETUP STEP
      ======================================================== */}
      {step === "setup" && (
        <div className="flex flex-col gap-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-[#5B6072]">
                <button
                  onClick={() => setStep("start")}
                  className="hover:underline"
                >
                  Essay Studio
                </button>{" "}
                / New essay · saved automatically
              </span>
              <h2 className="text-xl font-bold text-[#171A2B]">
                {title || "New Essay Project"}
              </h2>
            </div>
          </div>

          {renderStepper()}

          <div className="flex flex-col lg:flex-row items-start gap-7">
            <div className="flex-1 min-w-0 flex flex-col gap-5 w-full">
              <div className="flex flex-col gap-4 rounded-2xl border border-[#E4E5EE] bg-white p-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-[#171A2B]">
                    Assignment setup
                  </h3>
                  <p className="text-xs text-[#5B6072]">
                    Only the topic is required. Everything else is already filled
                    in. Change anything.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#171A2B]">
                    Essay topic or title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Impact of telemedicine on rural healthcare access"
                    className="w-full rounded-xl border border-[#CBD5E1] p-3 text-sm text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#171A2B]">
                      Assignment instructions or rubric{" "}
                      <span className="font-normal text-[#5B6072]">
                        (paste or upload)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs text-[#4F46E5] hover:underline"
                    >
                      <FiUpload className="h-3 w-3" /> Upload syllabus/rubric
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={assignmentPrompt}
                    onChange={(e) => {
                      setAssignmentPrompt(e.target.value);
                      setHasRubric(Boolean(e.target.value.trim()));
                    }}
                    placeholder="Paste your rubric, assignment requirements, or prompt instructions here..."
                    className="w-full rounded-xl border border-[#CBD5E1] p-3 text-xs leading-relaxed text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#171A2B]">
                      Academic level
                    </label>
                    <select
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value as any)}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white p-3 text-xs text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    >
                      {ACADEMIC_LEVELS.map((lvl) => (
                        <option key={lvl.value} value={lvl.value}>
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#171A2B]">
                      Essay type
                    </label>
                    <select
                      value={essayType}
                      onChange={(e) => setEssayType(e.target.value)}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white p-3 text-xs text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    >
                      {ESSAY_TYPES.map((et) => (
                        <option key={et.value} value={et.value}>
                          {et.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <label className="text-xs font-semibold text-[#171A2B]">
                        Length
                      </label>
                      {hasRubric && (
                        <span className="rounded bg-[#F0FDF4] px-1.5 py-0.5 text-[10px] font-semibold text-[#15803D]">
                          From instructions
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={targetWords}
                        onChange={(e) => setTargetWords(Number(e.target.value))}
                        className="w-full rounded-xl border border-[#CBD5E1] p-3 text-xs text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                      />
                      <span className="absolute right-3 top-3 text-xs text-[#5B6072]">
                        words
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <label className="text-xs font-semibold text-[#171A2B]">
                        Citation style
                      </label>
                      {hasRubric && (
                        <span className="rounded bg-[#F0FDF4] px-1.5 py-0.5 text-[10px] font-semibold text-[#15803D]">
                          From instructions
                        </span>
                      )}
                    </div>
                    <select
                      value={citationStyle}
                      onChange={(e) => setCitationStyle(e.target.value as any)}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white p-3 text-xs text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    >
                      {CITATION_STYLES.map((cs) => (
                        <option key={cs.value} value={cs.value}>
                          {cs.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <label className="text-xs font-semibold text-[#171A2B]">
                        Sources
                      </label>
                      {hasRubric && (
                        <span className="rounded bg-[#F0FDF4] px-1.5 py-0.5 text-[10px] font-semibold text-[#15803D]">
                          From instructions
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      value={sourcesCount}
                      onChange={(e) => setSourcesCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#CBD5E1] p-3 text-xs text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#EEF0F5] pt-4">
                  <button
                    type="button"
                    onClick={() => setStep("start")}
                    className="text-xs font-medium text-[#5B6072] hover:underline"
                  >
                    Back to start
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const curTopic = title.trim() || topicPrompt.trim();
                        if (curTopic && (!outline || !outline.body?.length)) {
                          setOutline(
                            buildDefaultOutline(
                              curTopic,
                              thesisOptions[selectedThesisIndex]?.text,
                            ),
                          );
                        }
                        saveRecentSession("outline");
                        setStep("outline");
                      }}
                      className="text-xs font-semibold text-[#4F46E5] hover:underline"
                    >
                      Skip to outline
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const curTopic = title.trim() || topicPrompt.trim();
                        if (
                          curTopic &&
                          (!thesisOptions.length || thesisOptions.length === 0)
                        ) {
                          setThesisOptions(buildDefaultTheses(curTopic));
                        }
                        if (curTopic && !researchQuestion) {
                          setResearchQuestion(
                            `How does ${curTopic.toLowerCase().replace(/\.$/, "")} impact modern outcomes and practice?`,
                          );
                        }
                        saveRecentSession("thesis");
                        setStep("thesis");
                      }}
                      className="flex h-11 items-center gap-2 rounded-xl bg-[#4F46E5] px-6 text-xs font-semibold text-white shadow-sm hover:bg-[#3730A3]"
                    >
                      Next: write thesis &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
              <div className="rounded-2xl border border-[#E4E5EE] bg-white p-5 shadow-sm">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#5B6072]">
                  Your requirements
                </h4>
                <div className="flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between border-b border-[#F5F5FA] pb-2">
                    <span className="text-[#5B6072]">Length</span>
                    <span className="font-semibold text-[#171A2B]">
                      {targetWords} words
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#F5F5FA] pb-2">
                    <span className="text-[#5B6072]">Format</span>
                    <span className="font-semibold text-[#171A2B]">
                      {citationStyle.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#F5F5FA] pb-2">
                    <span className="text-[#5B6072]">Sources</span>
                    <span className="font-semibold text-[#171A2B]">
                      {sourcesCount}+ peer-reviewed
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6072]">Rubric standard</span>
                    <span className="font-semibold text-[#171A2B]">
                      {hasRubric ? "Custom rubric" : "Academic standard"}
                    </span>
                  </div>
                </div>
              </div>
              {renderDoneForYouCard()}
            </aside>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 2: THESIS & TITLE STEP
      ======================================================== */}
      {step === "thesis" && (
        <div className="flex flex-col gap-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B6072]">
              <button
                onClick={() => setStep("setup")}
                className="hover:underline"
              >
                Essay Studio
              </button>{" "}
              / Thesis · saved automatically
            </span>
          </div>

          {renderStepper()}

          <div className="flex flex-col lg:flex-row items-start gap-7">
            <div className="flex-1 min-w-0 flex flex-col gap-5 w-full">
              {/* Title & Question Header Bar */}
              <div className="rounded-2xl border border-[#E4E5EE] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 border-b border-[#EEF0F5] pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-[#5B6072]">
                      YOUR TITLE
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(!isEditingTitle)}
                      className="text-xs font-semibold text-[#4F46E5] hover:underline"
                    >
                      {isEditingTitle ? "Done" : "Change"}
                    </button>
                  </div>
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter essay title"
                      className="rounded-lg border border-[#CBD5E1] p-2 text-sm text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-[#171A2B]">
                      {title || "Untitled Essay"}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-[#5B6072]">
                      RESEARCH QUESTION
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingQuestion(!isEditingQuestion)}
                      className="text-xs font-semibold text-[#4F46E5] hover:underline"
                    >
                      {isEditingQuestion ? "Done" : "Change"}
                    </button>
                  </div>
                  {isEditingQuestion ? (
                    <input
                      type="text"
                      value={researchQuestion}
                      onChange={(e) => setResearchQuestion(e.target.value)}
                      placeholder="Enter research question"
                      className="rounded-lg border border-[#CBD5E1] p-2 text-sm text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-[#171A2B]">
                      {researchQuestion ||
                        (title
                          ? `How does ${title.toLowerCase()} impact modern outcomes?`
                          : "Define your core research question")}
                    </p>
                  )}
                </div>
              </div>

              {/* 3 Thesis Options Card */}
              <div className="flex flex-col gap-4 rounded-2xl border border-[#E4E5EE] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#171A2B]">
                      We wrote 3 thesis statements for your topic
                    </h3>
                    <p className="text-xs text-[#5B6072]">
                      Pick the one you like. Each directly answers your research
                      question.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateThesis}
                    disabled={loadingAction === "thesis"}
                    className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-medium text-[#3F4357] hover:bg-gray-50"
                  >
                    <FiRefreshCw
                      className={`h-3.5 w-3.5 ${loadingAction === "thesis" ? "animate-spin" : ""}`}
                    />
                    New options
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {thesisOptions.map((opt, i) => {
                    const isSelected = selectedThesisIndex === i;
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedThesisIndex(i)}
                        className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-[#4F46E5] bg-[#EEF0FF]/40 shadow-sm"
                            : "border-[#E4E5EE] bg-white hover:border-[#CBD5E1]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="thesis"
                            checked={isSelected}
                            onChange={() => setSelectedThesisIndex(i)}
                            className="mt-1 h-4 w-4 text-[#4F46E5] focus:ring-0"
                          />
                          <div className="flex flex-col gap-1.5">
                            <span className="self-start rounded-md bg-[#EEF0FF] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#3730A3]">
                              {opt.tag}
                            </span>
                            <p className="text-sm leading-relaxed text-[#171A2B]">
                              {opt.text}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(opt.text);
                            toast.success("Thesis copied!");
                          }}
                          className="flex shrink-0 items-center gap-1 rounded-lg border border-[#D9DCE6] bg-white px-2.5 py-1 text-[11px] font-medium text-[#3F4357] hover:bg-gray-50"
                        >
                          <FiCopy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Adjust Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-[#5B6072]">Adjust:</span>
                  <button
                    type="button"
                    onClick={() => handleThesisAdjust("specific")}
                    className="rounded-full border border-[#E4E5EE] bg-white px-3 py-1 text-xs text-[#3F4357] hover:border-[#CBD5E1]"
                  >
                    More specific
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThesisAdjust("shorter")}
                    className="rounded-full border border-[#E4E5EE] bg-white px-3 py-1 text-xs text-[#3F4357] hover:border-[#CBD5E1]"
                  >
                    Shorter
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThesisAdjust("counter")}
                    className="rounded-full border border-[#E4E5EE] bg-white px-3 py-1 text-xs text-[#3F4357] hover:border-[#CBD5E1]"
                  >
                    Add a counterargument
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThesisAdjust("own")}
                    className="rounded-full border border-[#E4E5EE] bg-white px-3 py-1 text-xs text-[#3F4357] hover:border-[#CBD5E1]"
                  >
                    Write my own
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#EEF0F5] pt-4">
                  <button
                    type="button"
                    onClick={() => setStep("setup")}
                    className="text-xs font-medium text-[#5B6072] hover:underline"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const curTopic = title.trim() || topicPrompt.trim();
                      const chosenThesis =
                        thesisOptions[selectedThesisIndex]?.text;
                      setOutline(buildDefaultOutline(curTopic, chosenThesis));
                      saveRecentSession("outline");
                      setStep("outline");
                    }}
                    className="flex h-11 items-center gap-2 rounded-xl bg-[#4F46E5] px-6 text-xs font-semibold text-white shadow-sm hover:bg-[#3730A3]"
                  >
                    Next: build my outline &rarr;
                  </button>
                </div>
              </div>
            </div>

            <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
              <div className="rounded-2xl border border-[#E4E5EE] bg-white p-5 shadow-sm">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#5B6072]">
                  Your requirements
                </h4>
                <div className="flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between border-b border-[#F5F5FA] pb-2">
                    <span className="text-[#5B6072]">Length</span>
                    <span className="font-semibold text-[#171A2B]">
                      {targetWords} words
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#F5F5FA] pb-2">
                    <span className="text-[#5B6072]">Format</span>
                    <span className="font-semibold text-[#171A2B]">
                      {citationStyle.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#F5F5FA] pb-2">
                    <span className="text-[#5B6072]">Sources</span>
                    <span className="font-semibold text-[#171A2B]">
                      {sourcesCount}+ peer-reviewed
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6072]">Rubric standard</span>
                    <span className="font-semibold text-[#171A2B]">
                      {hasRubric ? "Custom rubric" : "Academic standard"}
                    </span>
                  </div>
                </div>
              </div>
              {renderDoneForYouCard(
                "Rather hand off the rest?",
                "We already have your brief, title and thesis. A professional academic writer can finish the paper from here.",
              )}
            </aside>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 3: OUTLINE STEP
      ======================================================== */}
      {step === "outline" && (
        <div className="flex flex-col gap-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B6072]">
              <button
                onClick={() => setStep("thesis")}
                className="hover:underline"
              >
                Essay Studio
              </button>{" "}
              / Outline · saved automatically
            </span>
          </div>

          {renderStepper()}

          <div className="flex flex-col lg:flex-row items-start gap-7">
            <div className="flex-1 min-w-0 flex flex-col gap-5 w-full">
              <div className="flex flex-col gap-5 rounded-2xl border border-[#E4E5EE] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#171A2B]">
                    Your outline is ready
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toast.success("Outline refreshed!")}
                      className="text-xs text-[#3F4357] hover:underline"
                    >
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingOutline(!isEditingOutline)}
                      className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#4F46E5] hover:bg-gray-50"
                    >
                      {isEditingOutline ? "Done editing" : "Edit outline"}
                    </button>
                  </div>
                </div>

                {/* Thesis Display Banner */}
                <div className="flex items-center justify-between gap-4 rounded-xl bg-[#F5F5FA] p-3.5 text-xs">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-[#3730A3]">THESIS:</span>
                    <span className="text-[#171A2B]">
                      {thesisOptions[selectedThesisIndex]?.text ||
                        (title
                          ? `A structured, evidence-based approach to ${title.toLowerCase()} improves outcomes and compliance.`
                          : "A systematic, evidence-based methodology provides the structure necessary to optimize measurable outcomes.")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("thesis")}
                    className="shrink-0 font-semibold text-[#4F46E5] hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Outline Tree */}
                <div className="flex flex-col gap-5 text-sm">
                  {/* I. Introduction */}
                  <div className="flex flex-col gap-1.5">
                    <h4 className="font-bold text-[#171A2B]">I. Introduction</h4>
                    <ul className="flex list-disc flex-col gap-1 pl-6 text-xs leading-relaxed text-[#2B2E40]">
                      {outline.intro.map((p, idx) => (
                        <li key={idx}>{p.text}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Body Sections */}
                  {outline.body.map((sec, bIdx) => (
                    <div key={bIdx} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[#171A2B]">
                          {sec.roman || `Section ${bIdx + 2}`}. {sec.title}
                        </h4>
                        {isEditingOutline && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (bIdx === 0) return;
                                const next = [...outline.body];
                                [next[bIdx - 1], next[bIdx]] = [
                                  next[bIdx],
                                  next[bIdx - 1],
                                ];
                                setOutline({ ...outline, body: next });
                              }}
                              className="rounded p-1 hover:bg-gray-100"
                            >
                              <FiChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (bIdx === outline.body.length - 1) return;
                                const next = [...outline.body];
                                [next[bIdx + 1], next[bIdx]] = [
                                  next[bIdx],
                                  next[bIdx + 1],
                                ];
                                setOutline({ ...outline, body: next });
                              }}
                              className="rounded p-1 hover:bg-gray-100"
                            >
                              <FiChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <ul className="flex list-disc flex-col gap-1 pl-6 text-xs leading-relaxed text-[#2B2E40]">
                        {sec.points.map((p, pIdx) => (
                          <li key={pIdx}>{p.text}</li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Conclusion */}
                  <div className="flex flex-col gap-1.5">
                    <h4 className="font-bold text-[#171A2B]">V. Conclusion</h4>
                    <ul className="flex list-disc flex-col gap-1 pl-6 text-xs leading-relaxed text-[#2B2E40]">
                      {outline.conclusion.map((p, idx) => (
                        <li key={idx}>{p.text}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Draft Preferences Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF0F5] pt-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B6072]">
                    <span className="font-semibold text-[#171A2B]">
                      Draft settings:
                    </span>
                    <span>{targetWords} words</span>
                    <span>·</span>
                    <span>{citationStyle.toUpperCase()} format</span>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setStep("setup")}
                      className="font-medium text-[#4F46E5] hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopyOutline}
                      className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-semibold text-[#3F4357] hover:bg-gray-50"
                    >
                      Copy outline
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateDraft}
                      disabled={loadingAction === "draft"}
                      className="flex h-11 items-center gap-2 rounded-xl bg-[#4F46E5] px-6 text-xs font-semibold text-white shadow-sm hover:bg-[#3730A3]"
                    >
                      {loadingAction === "draft" ? (
                        <>
                          <FiLoader className="h-4 w-4 animate-spin" /> Drafting
                          essay…
                        </>
                      ) : (
                        <>Generate full draft &rarr;</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
              {renderDoneForYouCard(
                "Rather have a writer finish it?",
                "Send this outline and our professional academic writers produce the complete paper with real sources and proper citations.",
              )}
            </aside>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 4: DRAFT & CHECK STEP
      ======================================================== */}
      {step === "draft" && (
        <div className="flex flex-col gap-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B6072]">
              <button
                onClick={() => setStep("outline")}
                className="hover:underline"
              >
                Essay Studio
              </button>{" "}
              / Draft · saved automatically
            </span>
          </div>

          {renderStepper()}

          <div className="flex flex-col lg:flex-row items-start gap-7">
            <div className="flex-1 min-w-0 flex flex-col gap-4 w-full">
              <div className="flex flex-col rounded-2xl border border-[#E4E5EE] bg-white shadow-sm">
                {/* Draft Top Action Bar */}
                <div className="flex items-center justify-between border-b border-[#EEF0F5] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-[#171A2B]">
                      Draft
                    </span>
                    <span className="rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-semibold text-[#15803D]">
                      {words} words · on target
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyDraft}
                      className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-medium text-[#3F4357] hover:bg-gray-50"
                    >
                      {copiedDraft ? (
                        <FiCheck className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <FiCopy className="h-3.5 w-3.5" />
                      )}
                      {copiedDraft ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadDocx}
                      disabled={downloadingDocx}
                      className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-medium text-[#3F4357] hover:bg-gray-50"
                    >
                      <FiDownload className="h-3.5 w-3.5" />
                      {downloadingDocx ? "Exporting…" : "Download .docx"}
                    </button>
                  </div>
                </div>

                {/* Inline AI Writing Check Alert */}
                {!aiSkipped ? (
                  <div className="mx-6 mt-4 flex items-center justify-between gap-4 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4 text-xs text-[#7C2D12]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#C2410C] bg-white font-bold text-[#9A3412]">
                        {aiScore}%
                      </div>
                      <div>
                        <h4 className="font-bold text-[#7C2D12]">
                          This draft reads as AI-written
                        </h4>
                        <p className="text-[11px] text-[#7C2D12]/90">
                          We checked it automatically. Highlighted sentences
                          scored highest. Rewrite them in your own voice before
                          you submit.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAiSkipped(true)}
                        className="text-xs font-medium text-[#7C2D12] underline hover:no-underline"
                      >
                        Skip for now
                      </button>
                      <a
                        href="/tools/humanizer-tool"
                        className="flex items-center gap-1.5 rounded-lg bg-[#D2440F] px-3.5 py-2 font-semibold text-white shadow-sm hover:bg-[#b5370a]"
                      >
                        Humanize draft{" "}
                        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#9A3412]">
                          PRO
                        </span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mx-6 mt-4 flex items-center justify-between rounded-xl border border-[#E4E5EE] bg-[#F5F5FA] px-4 py-2.5 text-xs text-[#3F4357]">
                    <span>
                      <strong className="text-[#9A3412]">AI score {aiScore}%:</strong> You skipped
                      humanizing. You can still do it anytime before you submit.
                    </span>
                    <button
                      type="button"
                      onClick={() => setAiSkipped(false)}
                      className="font-semibold text-[#9A3412] underline"
                    >
                      Humanize anyway
                    </button>
                  </div>
                )}

                {/* Formatted Draft Content with Inline Ghost Autocomplete */}
                <div className="p-6">
                  <DraftEditor
                    initialContent={draft}
                    topic={title}
                    headings={outline?.body?.map((b) => b.title) || []}
                    onChange={(newDraft) => setDraft(newDraft)}
                    guardAiClick={guardAiClick}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar: Before You Submit Checklist */}
            <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
              <div className="flex flex-col gap-4 rounded-2xl border border-[#E4E5EE] bg-white p-5 shadow-sm">
                <h4 className="text-sm font-bold text-[#171A2B]">
                  Before you submit
                </h4>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white">
                    <FiCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#171A2B]">
                      Draft written
                    </h5>
                    <span className="text-[11px] text-[#5B6072]">
                      {words} words, matches your brief
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C2410C] font-bold text-white text-xs">
                    !
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#171A2B]">
                      AI check: {aiScore}%
                    </h5>
                    <span className="text-[11px] text-[#5B6072]">
                      Needs rewriting before you submit
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#4F46E5] text-xs font-bold text-[#4F46E5]">
                    3
                  </div>
                  <div className="flex flex-col gap-1">
                    <h5 className="text-xs font-bold text-[#171A2B]">
                      Humanize in your voice
                    </h5>
                    <div className="flex items-center gap-3 text-xs">
                      <a
                        href="/tools/humanizer-tool"
                        className="font-semibold text-[#9A3412] hover:underline"
                      >
                        Unlock with Pro
                      </a>
                      <button
                        type="button"
                        onClick={() => setAiSkipped(true)}
                        className="text-[#5B6072] underline hover:no-underline"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#B9BDCB] text-xs font-bold text-[#3F4357]">
                    4
                  </div>
                  <div className="flex flex-col gap-1">
                    <h5 className="text-xs font-bold text-[#171A2B]">
                      Download your essay
                    </h5>
                    <button
                      type="button"
                      onClick={handleDownloadDocx}
                      className="text-left text-xs font-semibold text-[#4F46E5] hover:underline"
                    >
                      Download .docx
                    </button>
                  </div>
                </div>

                <div className="mt-2 border-t border-[#EEF0F5] pt-3">
                  <button
                    type="button"
                    onClick={handleGradeDraft}
                    disabled={isGrading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#4F46E5] text-xs font-semibold text-white shadow-sm hover:bg-[#3730A3]"
                  >
                    {isGrading ? (
                      <>
                        <FiLoader className="h-4 w-4 animate-spin" /> Evaluating
                        grade…
                      </>
                    ) : (
                      <>Grade my essay in Essay Grader &rarr;</>
                    )}
                  </button>
                </div>
              </div>

              {renderDoneForYouCard()}
            </aside>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 5 & 6: INTEGRATED ESSAY GRADER
      ======================================================== */}
      {step === "grader" && (
        <div className="flex flex-col gap-5 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep("draft")}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              <FiArrowLeft className="h-3.5 w-3.5" /> Back to Essay Studio
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B6072]">
              Rubric Grade Evaluation
            </span>
          </div>

          {renderStepper()}

          {/* Connected alert */}
          <div className="flex items-center justify-between rounded-xl bg-[#EEF0FF] p-3.5 text-xs text-[#3730A3]">
            <span>
              <strong>Loaded from Essay Studio:</strong> your{" "}
              {title || "essay"} draft and your professor&apos;s rubric.
            </span>
            <button
              onClick={() => handleGradeDraft()}
              className="font-bold underline"
            >
              Re-grade
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-7">
            {/* Grade breakdown */}
            <div className="flex-1 min-w-0 flex flex-col gap-5 w-full">
              {gradeResult && (
                <div className="flex flex-col gap-5 rounded-2xl border border-[#E4E5EE] bg-white p-6 shadow-sm">
                  {/* Top Grade Circle */}
                  <div className="flex items-center gap-5 border-b border-[#EEF0F5] pb-5">
                    <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full bg-[#FFF7ED] border-4 border-[#C2410C]">
                      <span className="text-2xl font-black text-[#9A3412]">
                        {gradeResult.letterGrade}
                      </span>
                      <span className="text-[11px] font-bold text-[#7C2D12]">
                        {gradeResult.score} / 100
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#171A2B]">
                        Estimated grade: {gradeResult.letterGrade}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#3F4357]">
                        {gradeResult.summary}
                      </p>
                      <span className="mt-1 block text-[11px] text-[#5B6072]">
                        An estimate based on your rubric. Your instructor&apos;s
                        grade may differ.
                      </span>
                    </div>
                  </div>

                  {/* Score by Rubric Criterion */}
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#5B6072]">
                      Score by rubric criterion
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {gradeResult.criteria.map((crit, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-[#E4E5EE] bg-[#F5F5FA] p-3 text-xs"
                        >
                          <span className="font-semibold text-[#171A2B]">
                            {crit.name}
                          </span>
                          <span className="rounded bg-white px-2 py-0.5 font-bold text-[#4F46E5] shadow-xs">
                            {crit.score} / {crit.maxScore}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top 3 Fixes */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B6072]">
                        Top 3 fixes
                      </h4>
                      <span className="text-[11px] text-[#5B6072]">
                        Biggest grade gain first
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {gradeResult.topFixes.map((fix, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-xl border border-[#E4E5EE] bg-white p-3.5 shadow-xs"
                        >
                          <span className="shrink-0 rounded-md bg-[#F0FDF4] px-2 py-1 text-xs font-bold text-[#15803D]">
                            +{fix.pointsGain} pts
                          </span>
                          <div className="flex flex-col gap-1">
                            <h5 className="text-xs font-bold text-[#171A2B]">
                              {fix.title}
                            </h5>
                            <p className="text-[11px] text-[#5B6072]">
                              {fix.instruction}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions bottom */}
                  <div className="flex items-center justify-between border-t border-[#EEF0F5] pt-4">
                    <button
                      type="button"
                      onClick={() => setStep("draft")}
                      className="flex h-11 items-center gap-2 rounded-xl bg-[#4F46E5] px-6 text-xs font-semibold text-white shadow-sm hover:bg-[#3730A3]"
                    >
                      <FiEdit3 className="h-4 w-4" /> Fix it myself in Essay
                      Studio
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGradeDraft()}
                      className="text-xs font-semibold text-[#3F4357] hover:underline"
                    >
                      Re-grade after edits
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Done for you */}
            <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
              {renderDoneForYouCard(
                "No time to fix all 3 before it's due?",
                "Send us this essay and your grade report. A writer in your field revises it to your rubric with real peer-reviewed sources and verified APA citations.",
              )}
            </aside>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN: DISCUSSION POST VIEW
      ======================================================== */}
      {step === "discussion" && (
        <div className="py-4">
          <DiscussionPostView
            onBackToStudio={() => setStep("start")}
            guardAiClick={guardAiClick}
          />
        </div>
      )}

      {/* Guest Authentication Gate Modal */}
      <GuestAuthGateModal
        open={gateOpen}
        onClose={closeGate}
        heading="You've reached your free action limit. Sign up to continue generating with Essay Studio."
      />
    </div>
  );
}
