"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiEdit3,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiRotateCcw,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { getGuestUserId } from "@/app/lib/client/guestStudyLimits";
import { cancelJob, waitForJob } from "@/app/lib/client/jobStream";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";
import { countWords } from "@/app/utils/text";

type Criterion = {
  criterion_id: string;
  title: string;
  weight: number;
  score: number;
  rationale: string;
  strengths: string[];
  weaknesses: string[];
};

type Issue = {
  issue_id: string;
  criterion_id: string;
  severity: "priority" | "important" | "polish";
  quote: string;
  start: number;
  end: number;
  title: string;
  explanation: string;
  action: string;
  rewrites: { label: string; text: string }[];
  brainstorm: string[];
};

type GradeResult = {
  run_id: string;
  revision_id: string;
  overall_score: number;
  verdict: string;
  summary: string;
  readiness: string;
  confidence: number;
  reviewer_comment: string;
  criteria: Criterion[];
  issues: Issue[];
  prompt_coverage: { requirement: string; status: "met" | "partial" | "missing"; evidence: string }[];
  citation_note: string;
};

type Session = {
  session_id: string;
  title: string;
  current_revision_id: string;
  current_text: string;
  word_count: number;
  latest_run_id?: string;
  updated_at?: string;
};

type CustomCriterion = { title: string; instruction: string; weight: number };
type ViewName = "setup" | "rubrics" | "report";
type CriterionTab = "weaknesses" | "strengths";

const API = String(process.env.NEXT_PUBLIC_NGROX_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const purposes = [
  ["personal_statement", "Personal statement"],
  ["supplemental", "College supplemental"],
  ["scholarship", "Scholarship essay"],
  ["class_assignment", "Class assignment"],
];

const genres = [
  ["narrative", "Narrative"],
  ["expository", "Expository"],
  ["argumentative", "Argumentative / persuasive"],
  ["analytical", "Analytical / critical"],
  ["reflective", "Reflective"],
  ["technical", "Technical / scientific"],
];

const criterionAccent = ["#565add", "#10b981", "#f59e0b", "#2b7fff", "#ff641a", "#6b7280"];

function unwrap<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

function errorMessage(error: any) {
  const value = error?.response?.data?.message || error?.response?.data?.error || error?.message;
  return Array.isArray(value) ? value.join(", ") : String(value || "Something went wrong.");
}

function labelFromValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function EssayGraderTool() {
  const [view, setView] = useState<ViewName>("setup");
  const [text, setText] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);
  const [criterionTab, setCriterionTab] = useState<CriterionTab>("weaknesses");
  const [advanced, setAdvanced] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [purpose, setPurpose] = useState("personal_statement");
  const [level, setLevel] = useState("high_school");
  const [genre, setGenre] = useState("narrative");
  const [strictness, setStrictness] = useState("standard");
  const [tone, setTone] = useState("direct");
  const [citation, setCitation] = useState("none");
  const [school, setSchool] = useState("");
  const [benchmark, setBenchmark] = useState("");
  const [prompt, setPrompt] = useState("");
  const [rubricText, setRubricText] = useState("");
  const [sample, setSample] = useState("");
  const [deadline, setDeadline] = useState("");
  const [consent, setConsent] = useState(false);
  const [criteria, setCriteria] = useState<CustomCriterion[]>([]);
  const [draftCriterion, setDraftCriterion] = useState<CustomCriterion>({ title: "", instruction: "", weight: 25 });
  const abortRef = useRef<AbortController | null>(null);
  const activeJobRef = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const inspectorRef = useRef<HTMLDivElement | null>(null);
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();

  const words = useMemo(() => countWords(text), [text]);
  const rubricWeight = useMemo(() => criteria.reduce((sum, item) => sum + Number(item.weight || 0), 0), [criteria]);
  const canUseReport = Boolean(session || result);
  const selectedCriterion = result?.criteria.find((criterion) => criterion.criterion_id === expandedCriterion) || result?.criteria[0] || null;

  const requestHeaders = useCallback(async (json = true): Promise<Record<string, string>> => {
    const token = await getOrRefreshAccessToken();
    return {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-User-Id": getGuestUserId(),
    };
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/tools/essay-grader/sessions`, { headers: await requestHeaders() });
      setSessions(unwrap<Session[]>(response.data));
    } catch {
      setSessions([]);
    }
  }, [requestHeaders]);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  useEffect(() => () => {
    abortRef.current?.abort();
    const jobId = activeJobRef.current;
    if (jobId) {
      void requestHeaders().then((headers) => cancelJob(`${API}/tools/essay-grader/jobs/${jobId}`, headers)).catch(() => undefined);
    }
  }, [requestHeaders]);

  async function loadSession(sessionId: string) {
    try {
      const response = await axios.get(`${API}/tools/essay-grader/sessions/${sessionId}`, { headers: await requestHeaders() });
      const loaded = unwrap<Session>(response.data);
      setSession(loaded);
      setText(loaded.current_text || "");
      setResult(null);
      setSelectedIssue(null);
      setView("setup");
      toast.success("Session loaded.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  function startNewSession() {
    abortRef.current?.abort();
    setText("");
    setSession(null);
    setResult(null);
    setSelectedIssue(null);
    setExpandedCriterion(null);
    setView("setup");
  }

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await axios.post(`${API}/tools/essay-grader/parse-document`, body, { headers: await requestHeaders(false) });
      setText(unwrap<{ text: string }>(response.data).text);
      toast.success("Essay imported.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function validateSetup() {
    if (words < 50) {
      toast.error("Please provide at least 50 words.");
      return false;
    }
    if (words > 3000) {
      toast.error("Please keep the essay at or below 3,000 words.");
      return false;
    }
    if (criteria.length && rubricWeight !== 100) {
      toast.error("Custom criterion weights must total 100%.");
      setView("rubrics");
      return false;
    }
    return true;
  }

  async function saveDraftIfNeeded(current: Session, headers: Record<string, string>) {
    if (!current.current_revision_id || text === current.current_text) return current;
    const saved = await axios.patch(`${API}/tools/essay-grader/sessions/${current.session_id}/draft`, {
      text,
      expected_revision_id: current.current_revision_id,
    }, { headers });
    const updated = unwrap<Session>(saved.data);
    setSession(updated);
    return updated;
  }

  async function createSession(headers: Record<string, string>) {
    const created = await axios.post(`${API}/tools/essay-grader/sessions`, {
      text,
      title: school || undefined,
      purpose,
      academic_level: level,
      genre,
      strictness,
      feedback_tone: tone,
      citation_style: citation,
      target_school: school || undefined,
      benchmark: benchmark || undefined,
      assignment_prompt: prompt || undefined,
      rubric_text: criteria.length ? undefined : rubricText || undefined,
      benchmark_sample: sample || undefined,
      deadline: deadline || undefined,
      improvement_consent: consent,
      custom_criteria: criteria.length ? criteria : undefined,
    }, { headers });
    const current = unwrap<Session>(created.data);
    setSession(current);
    return current;
  }

  async function runGrade(existing?: Session) {
    if (!validateSetup()) return;
    setLoading(true);
    setProgress(3);
    setSelectedIssue(null);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const headers = await requestHeaders();
      let current = existing || session;
      current = current ? await saveDraftIfNeeded(current, headers) : await createSession(headers);
      setView("report");

      const queued = await axios.post(`${API}/tools/essay-grader/sessions/${current.session_id}/grade`, {}, {
        headers: { ...headers, "Idempotency-Key": `grade-${crypto.randomUUID()}` },
      });
      const job = unwrap<{ job_id: string }>(queued.data);
      activeJobRef.current = job.job_id;

      const grade = await waitForJob<GradeResult>({
        eventsUrl: `${API}/tools/essay-grader/jobs/${job.job_id}/events`,
        pollUrl: `${API}/tools/essay-grader/jobs/${job.job_id}`,
        headers,
        signal: controller.signal,
        timeoutMs: 300_000,
        parse: (payload) => unwrap(payload),
        onProgress: (state) => setProgress(state.progress || 0),
      });
      setResult(grade);
      setExpandedCriterion(grade.criteria[0]?.criterion_id || null);
      setProgress(100);
      await refreshSessions();
      toast.success("Grading report ready.");
    } catch (error: any) {
      if (error?.name !== "AbortError") toast.error(errorMessage(error));
    } finally {
      setLoading(false);
      activeJobRef.current = null;
      abortRef.current = null;
    }
  }

  async function undoDraft() {
    if (!session?.current_revision_id) return;
    try {
      const response = await axios.post(`${API}/tools/essay-grader/sessions/${session.session_id}/undo`, {
        expected_revision_id: session.current_revision_id,
      }, { headers: await requestHeaders() });
      const updated = unwrap<Session>(response.data);
      setSession(updated);
      setText(updated.current_text || "");
      setSelectedIssue(null);
      toast.success("Last rewrite reverted.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function applyRewrite(issue: Issue, replacement: string) {
    if (!session || !result || !replacement.trim()) return;
    try {
      const response = await axios.post(`${API}/tools/essay-grader/sessions/${session.session_id}/rewrites`, {
        run_id: result.run_id,
        issue_id: issue.issue_id,
        expected_revision_id: session.current_revision_id,
        replacement,
      }, { headers: await requestHeaders() });
      const updated = unwrap<Session>(response.data);
      setSession(updated);
      setText(updated.current_text);
      setSelectedIssue(null);
      toast.success("Rewrite applied. Rescan when ready.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  function addCriterion() {
    if (!draftCriterion.title.trim() || !draftCriterion.instruction.trim()) {
      toast.error("Add a criterion title and instructions first.");
      return;
    }
    setCriteria((items) => [...items, { ...draftCriterion, weight: Number(draftCriterion.weight) || 1 }]);
    setDraftCriterion({ title: "", instruction: "", weight: Math.max(1, 100 - rubricWeight) });
  }

  function inspect(issue: Issue) {
    setSelectedIssue(issue);
    requestAnimationFrame(() => inspectorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  const score = result?.overall_score || 0;
  const scoreTone = score >= 85 ? "emerald" : score >= 70 ? "amber" : "red";

  return (
    <div className="min-h-full bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Essay Grader / <span className="font-semibold text-gray-800 dark:text-gray-200">{session?.title || "New evaluation"}</span></p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">Set up, grade, and revise your essay</h1>
          </div>
          <div className="flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900 lg:w-auto">
            <TabButton active={view === "setup"} onClick={() => setView("setup")}>Setup</TabButton>
            <TabButton active={view === "rubrics"} onClick={() => setView("rubrics")}>Custom rubrics</TabButton>
            <TabButton active={view === "report"} disabled={!canUseReport} onClick={() => canUseReport && setView("report")}>Report</TabButton>
          </div>
        </div>
      </div>

      {loading && (
        <div className="h-1 bg-primary-200">
          <div className="h-full bg-primary-400 transition-all" style={{ width: `${Math.max(5, progress)}%` }} />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <SessionStrip
          open={sessionsOpen}
          sessions={sessions}
          activeId={session?.session_id}
          onToggle={() => setSessionsOpen((value) => !value)}
          onNew={startNewSession}
          onLoad={(id) => void loadSession(id)}
        />

        {view === "setup" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-5">
              <Panel>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Essay text <span className="text-red-500">*</span></label>
                  <span className={`font-mono text-xs font-semibold ${words > 3000 ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>{words.toLocaleString()} / 3,000</span>
                </div>
                <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste your essay here..." className="min-h-[430px] w-full resize-y rounded-lg border border-gray-300 bg-white p-5 text-[15px] leading-7 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">50-3,000 words. PDF, DOCX, TXT, or RTF.</p>
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.rtf" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
                  <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"><FiUpload />{uploading ? "Importing..." : "Upload file"}</button>
                </div>
              </Panel>

              <Panel>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Evaluation setup</h2>
                  <button type="button" onClick={() => setAdvanced((value) => !value)} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-400"><FiChevronDown className={`transition ${advanced ? "rotate-180" : ""}`} /> Additional options</button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Select label="Essay purpose" value={purpose} onChange={setPurpose} options={purposes} />
                  <Select label="Academic level" value={level} onChange={setLevel} options={[["high_school", "High school"], ["undergraduate", "Undergraduate"], ["graduate", "Graduate"]]} />
                  <Select label="Writing style & genre" value={genre} onChange={setGenre} options={genres} />
                  <Pills label="Grading strictness" value={strictness} onChange={setStrictness} options={["lenient", "standard", "strict"]} />
                </div>
                {advanced && (
                  <div className="mt-5 space-y-5 border-t border-gray-200 pt-5 dark:border-gray-700">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Target school or scholarship" value={school} onChange={setSchool} placeholder="e.g. Yale University" />
                      <Field label="Benchmark" value={benchmark} onChange={setBenchmark} placeholder="e.g. top-tier admissions benchmark" />
                    </div>
                    <Area label="Assignment prompt or question" value={prompt} onChange={setPrompt} placeholder="Paste the full prompt so coverage can be checked." />
                    <Area label="Rubric or scoring criteria" value={rubricText} onChange={setRubricText} placeholder="Paste an instructor rubric, or build criteria in Custom rubrics." />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Select label="Citation style" value={citation} onChange={setCitation} options={[["none", "Not needed"], ["apa7", "APA 7"], ["mla9", "MLA 9"], ["chicago16", "Chicago 16"], ["harvard", "Harvard"]]} />
                      <Pills label="Feedback tone" value={tone} onChange={setTone} options={["encouraging", "direct", "simple"]} />
                    </div>
                    <Area label="Strong sample to benchmark against" value={sample} onChange={setSample} placeholder="Optional. It will not be treated as factual source material." />
                    <Field label="Deadline" value={deadline} onChange={setDeadline} type="datetime-local" />
                    <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-900">
                      <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-primary-400" />
                      <span><b className="block">Help improve grading quality</b><small className="mt-1 block text-gray-500 dark:text-gray-400">Off by default. Grading quality is the same either way.</small></span>
                    </label>
                  </div>
                )}
              </Panel>
            </section>

            <aside className="space-y-5">
              <Panel>
                <h2 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">Ready to evaluate?</h2>
                <p className="mb-4 text-sm leading-6 text-gray-500 dark:text-gray-400">The grader checks rubric fit, prompt coverage, exact-text revision opportunities, citation expectations, and reviewer-style feedback.</p>
                <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  <Stat label="Words" value={words.toLocaleString()} />
                  <Stat label="Rubric" value={criteria.length ? `${rubricWeight}%` : "Built-in"} />
                </div>
                <button type="button" disabled={loading} onClick={() => guardAiClick(() => runGrade())} className="w-full rounded-lg bg-primary-400 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-300 active:bg-primary-500 disabled:opacity-60">{loading ? `Grading... ${progress}%` : "Grade my essay"}</button>
                <button type="button" onClick={() => setView("rubrics")} className="mt-3 w-full rounded-lg border border-primary-400 px-5 py-3 text-sm font-bold text-primary-400 transition hover:bg-primary-100">Build custom rubric</button>
              </Panel>
              <Panel>
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Prototype functionality included</h3>
                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li>- Upload or paste essay</li>
                  <li>- Purpose, level, genre, strictness</li>
                  <li>- Prompt, benchmark, rubric, citations, tone</li>
                  <li>- Custom weighted criteria</li>
                  <li>- Report, inspection, rewrite, undo, rescan</li>
                </ul>
              </Panel>
            </aside>
          </div>
        )}

        {view === "rubrics" && (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Panel>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Custom rubrics</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Use this when the pasted rubric needs precise criteria. Weights must total 100%.</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr_110px]">
                <Field label="Criterion title" value={draftCriterion.title} onChange={(value) => setDraftCriterion((item) => ({ ...item, title: value }))} placeholder="e.g. Thesis clarity" />
                <Field label="Instructions" value={draftCriterion.instruction} onChange={(value) => setDraftCriterion((item) => ({ ...item, instruction: value }))} placeholder="What should the grader assess?" />
                <Field label="Weight" value={String(draftCriterion.weight || "")} onChange={(value) => setDraftCriterion((item) => ({ ...item, weight: Number(value) }))} type="number" />
              </div>
              <button type="button" onClick={addCriterion} className="inline-flex items-center gap-2 rounded-lg bg-primary-400 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-300"><FiPlus /> Add criterion</button>
              <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                  <h3 className="text-sm font-semibold">Criteria list</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rubricWeight === 100 || rubricWeight === 0 ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>{rubricWeight}% total</span>
                </div>
                {criteria.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No custom criteria yet. Leave this empty to use the built-in rubric or pasted rubric text.</p>
                ) : criteria.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex items-start justify-between gap-4 border-t border-gray-100 p-4 first:border-t-0 dark:border-gray-700">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{item.title} <span className="ml-2 rounded bg-primary-100 px-2 py-0.5 text-xs text-primary-400">{item.weight}%</span></p>
                      <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{item.instruction}</p>
                    </div>
                    <button type="button" onClick={() => setCriteria((all) => all.filter((_, i) => i !== index))} className="rounded-md p-2 text-gray-400 transition hover:bg-red-100 hover:text-red-500"><FiTrash2 /></button>
                  </div>
                ))}
              </div>
            </Panel>
            <aside className="space-y-5">
              <Panel>
                <h3 className="mb-2 text-base font-semibold">Rubric status</h3>
                <p className="mb-4 text-sm leading-6 text-gray-500 dark:text-gray-400">Custom rubrics override the pasted rubric text. The total must be exactly 100% to run grading.</p>
                <button disabled={loading} onClick={() => guardAiClick(() => runGrade())} className="w-full rounded-lg bg-primary-400 px-5 py-3 text-sm font-bold text-white hover:bg-primary-300 disabled:opacity-60">Grade with this rubric</button>
                <button onClick={() => setView("setup")} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold dark:border-gray-700"><FiArrowLeft /> Back to setup</button>
              </Panel>
            </aside>
          </section>
        )}

        {view === "report" && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{session?.title || "Essay report"}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{labelFromValue(purpose)} lens. {labelFromValue(strictness)} grading. {words.toLocaleString()} words.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button disabled={!session?.current_revision_id} onClick={undoDraft} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"><FiRotateCcw /> Undo</button>
                <button disabled={loading || !session} onClick={() => guardAiClick(() => runGrade(session || undefined))} className="inline-flex items-center gap-2 rounded-lg bg-primary-400 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-300 disabled:opacity-60"><FiRefreshCw className={loading ? "animate-spin" : ""} /> {loading ? `Rescanning ${progress}%` : "Rescan essay"}</button>
              </div>
            </div>

            {!result ? (
              <Panel>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-400 animate-spin" />
                  <div>
                    <h3 className="text-lg font-semibold">{loading ? "Evaluating your essay" : "No report yet"}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{loading ? "Checking rubric categories, prompt coverage, evidence, and revision priorities." : "Run grading from Setup to generate a report."}</p>
                  </div>
                </div>
              </Panel>
            ) : (
              <>
                <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                  <Panel>
                    <ScoreRing value={result.overall_score} tone={scoreTone} />
                    <div className="mt-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${scoreTone === "emerald" ? "bg-emerald-100 text-emerald-900" : scoreTone === "amber" ? "bg-amber-100 text-amber-900" : "bg-red-100 text-red-900"}`}>{result.verdict}</span>
                      <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">{result.summary}</p>
                      <p className="mt-4 rounded-lg bg-primary-100 p-3 text-sm font-semibold text-primary-500">{result.readiness}</p>
                    </div>
                  </Panel>
                  <Panel>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Reviewer perspective</h3>
                    <p className="text-base leading-7 text-gray-700 dark:text-gray-200">{result.reviewer_comment}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {[labelFromValue(purpose), labelFromValue(genre), `${labelFromValue(level)} level`, citation === "none" ? "No citation scoring" : `${citation.toUpperCase()} citation check`].map((item) => <span key={item} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-900 dark:text-gray-300"><FiCheck className="mr-1 inline" />{item}</span>)}
                    </div>
                  </Panel>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      {result.criteria.map((criterion, index) => (
                        <CriterionCard
                          key={criterion.criterion_id}
                          criterion={criterion}
                          color={criterionAccent[index % criterionAccent.length]}
                          active={expandedCriterion === criterion.criterion_id}
                          issueCount={result.issues.filter((issue) => issue.criterion_id === criterion.criterion_id).length}
                          onClick={() => {
                            setExpandedCriterion(criterion.criterion_id);
                            setCriterionTab("weaknesses");
                          }}
                        />
                      ))}
                    </div>

                    {selectedCriterion && (
                      <Panel>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-base font-semibold">{selectedCriterion.title}</h3>
                          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
                            <MiniTab active={criterionTab === "weaknesses"} onClick={() => setCriterionTab("weaknesses")}>Weaknesses</MiniTab>
                            <MiniTab active={criterionTab === "strengths"} onClick={() => setCriterionTab("strengths")}>Strengths</MiniTab>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(criterionTab === "weaknesses" ? selectedCriterion.weaknesses : selectedCriterion.strengths).map((item, index) => (
                            <div key={`${criterionTab}-${index}`} className={`rounded-lg border-l-4 p-3 text-sm leading-6 ${criterionTab === "weaknesses" ? "border-amber-400 bg-amber-50 text-amber-950" : "border-emerald-400 bg-emerald-100 text-emerald-900"}`}>{item}</div>
                          ))}
                          {(criterionTab === "weaknesses" ? selectedCriterion.weaknesses : selectedCriterion.strengths).length === 0 && <p className="text-sm text-gray-500">No {criterionTab} returned for this criterion.</p>}
                        </div>
                      </Panel>
                    )}

                    <Panel>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Essay under review</h3>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-900">Editable. Save happens before rescan.</span>
                      </div>
                      <textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-[620px] w-full resize-y rounded-lg border border-gray-200 bg-white p-5 text-[15px] leading-7 text-gray-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
                    </Panel>
                  </div>

                  <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start" ref={inspectorRef}>
                    <Panel>
                      <h3 className="mb-3 text-base font-semibold">Revision priorities</h3>
                      {result.issues.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No exact-text revision flags were returned.</p> : result.issues.map((issue) => (
                        <button key={issue.issue_id} onClick={() => inspect(issue)} className={`mb-2 w-full rounded-lg border p-3 text-left transition hover:border-primary-400 hover:bg-primary-100 ${selectedIssue?.issue_id === issue.issue_id ? "border-primary-400 bg-primary-100" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"}`}>
                          <span className="flex items-center justify-between gap-2">
                            <b className="text-xs uppercase tracking-wide text-primary-400">{issue.severity}</b>
                            <span className="text-xs font-semibold text-gray-500">Inspect</span>
                          </span>
                          <span className="mt-1 block text-sm font-semibold text-gray-900 dark:text-white">{issue.title}</span>
                          <span className="mt-1 line-clamp-2 block text-xs text-gray-500 dark:text-gray-400">"{issue.quote}"</span>
                        </button>
                      ))}
                    </Panel>

                    <Panel>
                      {!selectedIssue ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-400"><FiEdit3 /></div>
                          <h3 className="font-semibold">Inspection panel</h3>
                          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">Select a revision priority to see exact text, reasoning, rewrite options, and stuck ideas.</p>
                        </div>
                      ) : (
                        <IssueInspector issue={selectedIssue} onClose={() => setSelectedIssue(null)} onApply={(replacement) => void applyRewrite(selectedIssue, replacement)} />
                      )}
                    </Panel>

                    <Panel>
                      <h3 className="mb-3 text-base font-semibold">Prompt and citation checks</h3>
                      {result.prompt_coverage.length ? result.prompt_coverage.map((item, index) => (
                        <div key={`${item.requirement}-${index}`} className="flex gap-3 border-t border-gray-100 py-3 first:border-0 dark:border-gray-700">
                          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.status === "met" ? "bg-emerald-500" : item.status === "partial" ? "bg-amber-400" : "bg-red-500"}`} />
                          <div><p className="text-sm font-semibold">{item.requirement}</p><p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{item.evidence}</p></div>
                        </div>
                      )) : <p className="text-sm text-gray-500 dark:text-gray-400">Add an assignment prompt in Setup to unlock prompt coverage checks.</p>}
                      {result.citation_note && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600 dark:bg-gray-900 dark:text-gray-300"><b>Citation note:</b> {result.citation_note}</p>}
                    </Panel>
                  </aside>
                </div>
              </>
            )}
          </section>
        )}
      </div>

      <GuestAuthGateModal open={gateOpen} onClose={closeGate} heading="Create a free account to continue grading." />
    </div>
  );
}

function SessionStrip({ open, sessions, activeId, onToggle, onNew, onLoad }: { open: boolean; sessions: Session[]; activeId?: string; onToggle: () => void; onNew: () => void; onLoad: (id: string) => void }) {
  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="flex items-center gap-2 text-sm font-semibold"><FiClock /> Recent essay reviews</span>
        <FiChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-gray-100 p-4 dark:border-gray-700">
          <div className="flex gap-3 overflow-x-auto pb-1">
            <button type="button" onClick={onNew} className="min-w-[180px] rounded-lg border border-primary-400 bg-primary-100 px-4 py-3 text-left text-sm font-semibold text-primary-400 transition hover:bg-primary-200"><FiPlus className="mb-2" /> New essay review</button>
            {sessions.length === 0 ? <p className="flex min-h-[88px] items-center text-sm text-gray-500 dark:text-gray-400">Your graded essays will appear here after the first run.</p> : sessions.map((session) => (
              <button key={session.session_id} onClick={() => onLoad(session.session_id)} className={`min-w-[230px] rounded-lg border px-4 py-3 text-left transition ${activeId === session.session_id ? "border-primary-400 bg-primary-100" : "border-gray-200 bg-white hover:border-primary-300 dark:border-gray-700 dark:bg-gray-900"}`}>
                <span className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">{session.title}</span>
                <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-800">{session.word_count || 0} words</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">{children}</div>;
}

function TabButton({ children, active, disabled, onClick }: { children: React.ReactNode; active: boolean; disabled?: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none ${active ? "bg-primary-400 text-white shadow-sm" : "text-gray-600 hover:bg-white dark:text-gray-300 dark:hover:bg-gray-800"}`}>{children}</button>;
}

function MiniTab({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${active ? "bg-primary-400 text-white" : "text-gray-500 hover:bg-white dark:hover:bg-gray-800"}`}>{children}</button>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" /></label>;
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-[92px] w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>;
}

function Pills({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <div><span className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span><div className="grid grid-cols-3 gap-2">{options.map((option) => <button type="button" key={option} onClick={() => onChange(option)} className={`rounded-lg border px-3 py-3 text-xs font-semibold capitalize transition ${value === option ? "border-primary-400 bg-primary-400 text-white" : "border-gray-300 bg-white text-gray-600 hover:border-primary-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"}`}>{option}</button>)}</div></div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900"><span className="block text-xs font-medium text-gray-500">{label}</span><b className="mt-1 block text-gray-900 dark:text-white">{value}</b></div>;
}

function ScoreRing({ value, tone }: { value: number; tone: "emerald" | "amber" | "red" }) {
  const color = tone === "emerald" ? "#10b981" : tone === "amber" ? "#f59e0b" : "#ef4444";
  return <div className="mx-auto grid place-items-center text-center"><div className="relative grid h-32 w-32 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${value}%, #e5e7eb ${value}% 100%)` }}><div className="absolute inset-[10px] rounded-full bg-white dark:bg-gray-800" /><div className="relative"><b className="block text-3xl font-bold">{value}</b><span className="text-xs text-gray-500">out of 100</span></div></div></div>;
}

function CriterionCard({ criterion, color, active, issueCount, onClick }: { criterion: Criterion; color: string; active: boolean; issueCount: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-xl border p-4 text-left transition hover:border-primary-400 hover:shadow-sm ${active ? "border-primary-400 bg-primary-100" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />{criterion.title}</span>
        <span className="text-sm font-bold text-primary-400">{criterion.score}</span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-200"><span className="block h-full rounded-full" style={{ width: `${criterion.score}%`, background: color }} /></div>
      <p className="line-clamp-3 text-xs leading-5 text-gray-500 dark:text-gray-400">{criterion.rationale}</p>
      <div className="mt-3 flex items-center justify-between text-xs font-semibold"><span className={issueCount ? "text-amber-800" : "text-emerald-900"}>{issueCount ? `${issueCount} flag${issueCount === 1 ? "" : "s"}` : "No flags"}</span><span className="text-primary-400">Review</span></div>
    </button>
  );
}

function IssueInspector({ issue, onClose, onApply }: { issue: Issue; onClose: () => void; onApply: (replacement: string) => void }) {
  const [custom, setCustom] = useState("");
  return (
    <div>
      <button onClick={onClose} className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-primary-400"><FiX /> Close inspection</button>
      <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Highlighted text</div>
        <p className="text-sm leading-6 text-gray-800 dark:text-gray-100">"{issue.quote}"</p>
      </div>
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide">Why this matters</div>
        <p className="text-sm leading-6">{issue.explanation}</p>
      </div>
      <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-100 p-3 text-emerald-900">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide">What to fix</div>
        <p className="text-sm leading-6">{issue.action}</p>
      </div>
      <div className="mb-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Rewrite options</div>
        {issue.rewrites.length ? issue.rewrites.map((rewrite, index) => (
          <div key={`${rewrite.label}-${index}`} className="mb-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
            <span className="mb-1 block text-xs font-semibold text-primary-400">{rewrite.label}</span>
            <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">{rewrite.text}</p>
            <button onClick={() => onApply(rewrite.text)} className="mt-2 rounded-md bg-primary-400 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-300">Add to essay</button>
          </div>
        )) : <p className="text-sm text-gray-500">No generated rewrite options for this flag.</p>}
      </div>
      {issue.brainstorm.length > 0 && <div className="mb-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"><div className="mb-2 text-xs font-semibold uppercase tracking-wide">If you are stuck</div><ul className="space-y-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{issue.brainstorm.map((item, index) => <li key={index}>- {item}</li>)}</ul></div>}
      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Write your own replacement</label>
        <textarea value={custom} onChange={(event) => setCustom(event.target.value)} className="mb-2 min-h-[82px] w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 dark:border-gray-700 dark:bg-gray-900" />
        <button onClick={() => onApply(custom)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">Apply custom rewrite</button>
      </div>
    </div>
  );
}
