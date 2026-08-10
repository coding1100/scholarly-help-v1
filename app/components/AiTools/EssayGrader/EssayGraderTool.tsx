"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiEdit3,
  FiPlus,
  FiRefreshCw,
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

const criterionColors = ["#b23a2e", "#4b6358", "#3d6b96", "#b4842e", "#6d4c7d", "#7b5b36"];

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
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeJob, setActiveJob] = useState<string | null>(null);
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
  const fileRef = useRef<HTMLInputElement | null>(null);
  const inspectionRef = useRef<HTMLDivElement | null>(null);
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();

  const words = useMemo(() => countWords(text), [text]);
  const rubricWeight = useMemo(() => criteria.reduce((sum, item) => sum + Number(item.weight || 0), 0), [criteria]);
  const canUseReport = Boolean(session || result);

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
    if (activeJob) {
      void requestHeaders().then((headers) => cancelJob(`${API}/tools/essay-grader/jobs/${activeJob}`, headers)).catch(() => undefined);
    }
  }, [activeJob, requestHeaders]);

  async function loadSession(sessionId: string) {
    try {
      const response = await axios.get(`${API}/tools/essay-grader/sessions/${sessionId}`, { headers: await requestHeaders() });
      const loaded = unwrap<Session>(response.data);
      setSession(loaded);
      setText(loaded.current_text || "");
      setResult(null);
      setSelectedIssue(null);
      setView("setup");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  function startNewSession() {
    setSession(null);
    setResult(null);
    setSelectedIssue(null);
    setText("");
    setView("setup");
  }

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await axios.post(`${API}/tools/essay-grader/parse-document`, body, { headers: await requestHeaders(false) });
      const parsed = unwrap<{ text: string }>(response.data);
      setText(parsed.text);
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

  async function runGrade(existing?: Session) {
    if (!validateSetup()) return;
    setLoading(true);
    setProgress(2);
    setSelectedIssue(null);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const headers = await requestHeaders();
      let current = existing;
      if (!current) {
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
        current = unwrap<Session>(created.data);
        setSession(current);
        setView("report");
      }

      const queued = await axios.post(`${API}/tools/essay-grader/sessions/${current.session_id}/grade`, {}, {
        headers: { ...headers, "Idempotency-Key": `grade-${crypto.randomUUID()}` },
      });
      const job = unwrap<{ job_id: string }>(queued.data);
      setActiveJob(job.job_id);

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
      setProgress(100);
      await refreshSessions();
      toast.success("Grading report ready.");
    } catch (error: any) {
      if (error?.name !== "AbortError") toast.error(errorMessage(error));
    } finally {
      setLoading(false);
      setActiveJob(null);
      abortRef.current = null;
    }
  }

  async function saveAndRescan() {
    if (!session || !validateSetup()) return;
    setLoading(true);
    try {
      const headers = await requestHeaders();
      let current = session;
      if (text !== session.current_text) {
        const saved = await axios.patch(`${API}/tools/essay-grader/sessions/${session.session_id}/draft`, {
          text,
          expected_revision_id: session.current_revision_id,
        }, { headers });
        current = unwrap<Session>(saved.data);
        setSession(current);
      }
      setLoading(false);
      await runGrade(current);
    } catch (error) {
      setLoading(false);
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
    requestAnimationFrame(() => inspectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  const overall = result?.overall_score ?? 0;
  const verdictClass = overall >= 85 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : overall >= 70 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-red-200 bg-red-50 text-red-800";

  return (
    <div className="h-full bg-[#ecebe3] text-[#1d2420]">
      <div className="grid h-full min-h-[760px] lg:grid-cols-[268px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#3a4149] bg-[#20262c] text-[#c7cdd3] lg:flex lg:flex-col">
          <div className="border-b border-[#3a4149] px-5 py-5">
            <div className="flex items-baseline gap-2 font-serif text-lg font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-[#b23a2e]" />
              ScholarlyHelp <small className="font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-[#7e8891]">Grader</small>
            </div>
          </div>
          <button onClick={startNewSession} className="mx-5 mt-4 rounded-lg bg-[#b23a2e] px-4 py-2.5 text-sm font-bold text-white">New essay review</button>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <div className="px-2 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7e8891]">Recent sessions</div>
            {sessions.length === 0 ? <p className="px-2 py-3 text-xs leading-5 text-[#7e8891]">Your graded essays will appear here after the first run.</p> : sessions.map((item) => (
              <button key={item.session_id} onClick={() => void loadSession(item.session_id)} className={`mb-2 w-full rounded-lg border bg-[#2a313a] p-3 text-left transition hover:border-[#566170] ${session?.session_id === item.session_id ? "border-[#b23a2e] shadow-[inset_0_0_0_1px_#b23a2e]" : "border-[#3a4149]"}`}>
                <span className="mb-2 block line-clamp-2 text-[13px] font-semibold text-white">{item.title}</span>
                <span className="inline-flex rounded-md bg-[#4b635840] px-2 py-1 font-mono text-[10px] font-semibold text-[#9dc4ac]">{item.word_count || 0} words</span>
              </button>
            ))}
          </div>
          <div className="border-t border-[#3a4149] px-5 py-4 text-[11px] leading-5 text-[#7e8891]">Use the setup, rubrics, and report tabs like a review desk. Reports stay tied to each essay session.</div>
        </aside>

        <main className="min-w-0 overflow-y-auto">
          <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[#d7d4c7] bg-[#ecebe3]/95 px-4 py-3 backdrop-blur sm:px-8">
            <div className="text-sm text-[#565f58]">
              Essay Grader <span className="px-1 text-[#9b978a]">/</span> <b className="text-[#1d2420]">{session?.title || "New evaluation"}</b>
            </div>
            <div className="flex rounded-lg border border-[#d7d4c7] bg-[#f5f4ee] p-1">
              <TabButton active={view === "setup"} onClick={() => setView("setup")}>Setup</TabButton>
              <TabButton active={view === "rubrics"} onClick={() => setView("rubrics")}>Custom rubrics</TabButton>
              <TabButton active={view === "report"} disabled={!canUseReport} onClick={() => canUseReport && setView("report")}>Report</TabButton>
            </div>
          </div>

          {loading && <div className="sticky top-[57px] z-10 h-1 bg-[#d7d4c7]"><div className="h-full bg-[#b23a2e] transition-all" style={{ width: `${Math.max(5, progress)}%` }} /></div>}

          {view === "setup" && (
            <section className="mx-auto max-w-[960px] px-4 py-8 sm:px-8">
              <h1 className="font-serif text-3xl font-semibold text-[#1d2420]">Set up your essay</h1>
              <p className="mt-1 max-w-2xl text-sm text-[#565f58]">Get rubric-based scoring, exact-text feedback, and a guided revision workspace.</p>

              <Card className="mt-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="text-sm font-bold">Essay text <span className="text-[#b23a2e]">*</span></label>
                  <span className={`font-mono text-xs font-semibold ${words > 3000 ? "text-[#b23a2e]" : "text-[#565f58]"}`}>{words.toLocaleString()} / 3,000</span>
                </div>
                <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste your essay here..." className="min-h-[340px] w-full resize-y rounded-lg border border-[#d7d4c7] bg-white p-5 font-serif text-[16px] leading-8 outline-none transition focus:border-[#b23a2e] focus:ring-2 focus:ring-[#b23a2e1a]" />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-[#565f58]">50-3,000 words. PDF, DOCX, TXT, or RTF.</p>
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.rtf" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
                  <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-[#d7d4c7] bg-white px-4 py-2 text-sm font-bold hover:bg-[#f5f4ee] disabled:opacity-50"><FiUpload /> {uploading ? "Importing..." : "Upload file"}</button>
                </div>
              </Card>

              <Card>
                <div className="mb-5 text-sm font-bold">Evaluation setup</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Select label="Essay purpose" value={purpose} onChange={setPurpose} options={purposes} />
                  <Select label="Academic level" value={level} onChange={setLevel} options={[["high_school", "High school"], ["undergraduate", "Undergraduate"], ["graduate", "Graduate"]]} />
                  <Select label="Writing style & genre" value={genre} onChange={setGenre} options={genres} />
                  <Pills label="Grading strictness" value={strictness} onChange={setStrictness} options={["lenient", "standard", "strict"]} />
                </div>
              </Card>

              <div className="overflow-hidden rounded-[10px] border border-[#d7d4c7] bg-[#f5f4ee]">
                <button type="button" onClick={() => setAdvanced(!advanced)} className="flex w-full items-center justify-between px-6 py-4 text-left">
                  <span><b className="text-sm">Additional options</b><span className="ml-2 text-sm font-normal text-[#565f58]">Prompt, target, rubric, citations, tone</span></span>
                  <FiChevronDown className={`transition ${advanced ? "rotate-180" : ""}`} />
                </button>
                {advanced && (
                  <div className="border-t border-[#d7d4c7] bg-white px-6 py-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Target school or scholarship" value={school} onChange={setSchool} placeholder="e.g. Yale University" />
                      <Field label="Benchmark" value={benchmark} onChange={setBenchmark} placeholder="e.g. top-tier admissions benchmark" />
                    </div>
                    <Area label="Assignment prompt or question" value={prompt} onChange={setPrompt} placeholder="Paste the full prompt so coverage can be checked." />
                    <Area label="Rubric or scoring criteria" value={rubricText} onChange={setRubricText} placeholder="Paste an instructor rubric, or build criteria in the Custom rubrics tab." />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Select label="Citation style" value={citation} onChange={setCitation} options={[["none", "Not needed"], ["apa7", "APA 7"], ["mla9", "MLA 9"], ["chicago16", "Chicago 16"], ["harvard", "Harvard"]]} />
                      <Pills label="Feedback tone" value={tone} onChange={setTone} options={["encouraging", "direct", "simple"]} />
                    </div>
                    <Area label="Strong sample to benchmark against" value={sample} onChange={setSample} placeholder="Optional. It will not be treated as factual source material." />
                    <Field label="Deadline" value={deadline} onChange={setDeadline} type="datetime-local" />
                    <label className="flex items-start gap-3 rounded-lg border border-[#d7d4c7] bg-[#f5f4ee] p-4 text-sm">
                      <Switch checked={consent} onChange={setConsent} />
                      <span><b className="block">Help improve our AI with this essay</b><small className="mt-1 block text-[#565f58]">Off by default. Grading quality is the same either way.</small></span>
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr]">
                <button type="button" onClick={() => setView("rubrics")} className="rounded-lg border-2 border-[#1d2420] bg-white px-5 py-3 text-sm font-bold">Build custom rubric</button>
                <button type="button" disabled={loading} onClick={() => guardAiClick(() => runGrade())} className="rounded-lg bg-[#b23a2e] px-5 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-60">{loading ? `Grading... ${progress}%` : "Grade my essay"}</button>
              </div>
            </section>
          )}

          {view === "rubrics" && (
            <section className="mx-auto max-w-[960px] px-4 py-8 sm:px-8">
              <h1 className="font-serif text-3xl font-semibold">Custom rubrics</h1>
              <p className="mt-1 max-w-2xl text-sm text-[#565f58]">Add scoring criteria only when the pasted rubric is not enough. Weights must total 100% before grading.</p>
              <Card className="mt-6">
                <div className="grid gap-4 md:grid-cols-[1fr_1.7fr_110px]">
                  <Field label="Criterion title" value={draftCriterion.title} onChange={(value) => setDraftCriterion((item) => ({ ...item, title: value }))} placeholder="e.g. Thesis clarity" />
                  <Field label="Instructions" value={draftCriterion.instruction} onChange={(value) => setDraftCriterion((item) => ({ ...item, instruction: value }))} placeholder="What should the grader assess?" />
                  <Field label="Weight" value={String(draftCriterion.weight || "")} onChange={(value) => setDraftCriterion((item) => ({ ...item, weight: Number(value) }))} type="number" />
                </div>
                <button type="button" onClick={addCriterion} className="inline-flex items-center gap-2 rounded-md bg-[#1d2420] px-4 py-2 text-sm font-bold text-white"><FiPlus /> Add criterion</button>
              </Card>
              <div className="mb-4 flex items-center justify-between rounded-lg border border-[#d7d4c7] bg-white px-5 py-3">
                <b className="text-sm">Criteria list</b>
                <span className={`font-mono text-xs font-bold ${rubricWeight === 100 || rubricWeight === 0 ? "text-[#4b6358]" : "text-[#b23a2e]"}`}>{rubricWeight}% total</span>
              </div>
              {criteria.length === 0 ? <Card><p className="text-sm text-[#565f58]">No custom criteria yet. If you leave this empty, the grader uses the built-in rubric or the pasted rubric text.</p></Card> : criteria.map((item, index) => (
                <div key={`${item.title}-${index}`} className="mb-3 flex items-start justify-between gap-4 rounded-lg border border-[#d7d4c7] bg-white p-4">
                  <div><b className="text-sm">{item.title} <span className="rounded bg-[#ecebe3] px-2 py-0.5 font-mono text-[11px] text-[#565f58]">{item.weight}%</span></b><p className="mt-1 text-sm leading-6 text-[#565f58]">{item.instruction}</p></div>
                  <button type="button" onClick={() => setCriteria((all) => all.filter((_, i) => i !== index))} className="rounded-full border border-[#d7d4c7] px-3 py-1 text-xs font-bold hover:border-[#b23a2e] hover:text-[#b23a2e]"><FiTrash2 /></button>
                </div>
              ))}
              <div className="mt-5 flex flex-wrap justify-between gap-3">
                <button onClick={() => setView("setup")} className="inline-flex items-center gap-2 rounded-lg border border-[#d7d4c7] bg-white px-4 py-2 text-sm font-bold"><FiArrowLeft /> Back to setup</button>
                <button disabled={loading} onClick={() => guardAiClick(() => runGrade())} className="rounded-lg bg-[#b23a2e] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">Grade with this rubric</button>
              </div>
            </section>
          )}

          {view === "report" && (
            <section className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="font-serif text-3xl font-semibold">{session?.title || "Essay report"}</h1>
                  <p className="mt-1 text-sm text-[#565f58]">{labelFromValue(purpose)} lens. {labelFromValue(strictness)} grading. {words.toLocaleString()} words.</p>
                </div>
                <button disabled={loading || !session} onClick={() => guardAiClick(saveAndRescan)} className="inline-flex items-center gap-2 rounded-lg bg-[#1d2420] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"><FiRefreshCw className={loading ? "animate-spin" : ""} /> {loading ? `Rescanning ${progress}%` : "Rescan essay"}</button>
              </div>

              {!result ? (
                <Card>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-[#d7d4c7] border-t-[#b23a2e] animate-spin" />
                    <div><h2 className="font-serif text-xl font-semibold">{loading ? "Evaluating your essay" : "No report yet"}</h2><p className="mt-1 text-sm text-[#565f58]">{loading ? "Checking rubric categories, exact text evidence, and revision priorities." : "Run grading from Setup to generate the report workspace."}</p></div>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="mb-4 rounded-lg border border-[#d7d4c7] bg-white p-4">
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#565f58]">Evaluation scope</div>
                    <div className="flex flex-wrap gap-2">
                      {[labelFromValue(purpose), labelFromValue(genre), `${labelFromValue(level)} level`, citation === "none" ? "No citation scoring" : `${citation.toUpperCase()} citation check`].map((item) => <span key={item} className="rounded-md bg-[#4b63581a] px-2.5 py-1 text-xs font-bold text-[#4b6358]"><FiCheck className="mr-1 inline" />{item}</span>)}
                    </div>
                  </div>

                  <div className="mb-5 flex flex-col gap-5 rounded-[10px] border border-[#d7d4c7] bg-white p-5 md:flex-row md:items-center">
                    <ScoreRing value={result.overall_score} />
                    <div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em] ${verdictClass}`}>{result.verdict}</span>
                      <h2 className="mt-3 font-serif text-xl font-semibold">Overall evaluation</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#565f58]">{result.summary}</p>
                      <p className="mt-3 text-sm font-semibold text-[#1d2420]">{result.readiness}</p>
                    </div>
                  </div>

                  <div className="mb-5 rounded-lg bg-[#20262c] p-5 text-[#f5f4ee]">
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#e0ac55]">Reviewer perspective</div>
                    <p className="font-serif text-[15px] italic leading-7">{result.reviewer_comment}</p>
                  </div>

                  <div className="mb-5 grid gap-3 md:grid-cols-2">
                    {result.criteria.map((item, index) => {
                      const color = criterionColors[index % criterionColors.length];
                      return <CriterionCard key={item.criterion_id} criterion={item} color={color} issueCount={result.issues.filter((issue) => issue.criterion_id === item.criterion_id).length} onInspect={() => {
                        const issue = result.issues.find((entry) => entry.criterion_id === item.criterion_id);
                        if (issue) inspect(issue);
                      }} />;
                    })}
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,.75fr)]">
                    <div className="rounded-lg border border-[#d7d4c7] bg-white p-6">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#565f58]">Essay under review</h3>
                        <span className="rounded-full bg-[#ecebe3] px-3 py-1 text-xs text-[#565f58]">Editable. Save then rescan.</span>
                      </div>
                      <textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-[680px] w-full resize-y border-0 bg-white font-serif text-[16px] leading-8 text-[#1d2420] outline-none" />
                    </div>

                    <aside ref={inspectionRef} className="sticky top-20 max-h-[calc(100vh-105px)] overflow-y-auto rounded-lg border border-[#d7d4c7] bg-white p-5">
                      {!selectedIssue ? (
                        <div className="py-12 text-center">
                          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#ecebe3]"><FiEdit3 /></div>
                          <h3 className="font-serif text-lg font-semibold">Inspection panel</h3>
                          <p className="mt-2 text-sm leading-6 text-[#565f58]">Choose a rubric flag below, or click a category with an issue, to see the exact quote, reasoning, rewrite options, and stuck ideas.</p>
                        </div>
                      ) : (
                        <IssueInspector issue={selectedIssue} onClose={() => setSelectedIssue(null)} onApply={(replacement) => void applyRewrite(selectedIssue, replacement)} />
                      )}
                    </aside>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <Card>
                      <h3 className="mb-3 text-sm font-bold">Revision priorities</h3>
                      {result.issues.length === 0 ? <p className="text-sm text-[#565f58]">No exact-text revision flags were returned.</p> : result.issues.map((issue) => (
                        <button key={issue.issue_id} onClick={() => inspect(issue)} className="mb-2 w-full rounded-lg border-l-4 border-[#b23a2e] bg-[#ecebe3] p-3 text-left transition hover:bg-[#b23a2e1a]">
                          <span className="flex items-center justify-between gap-3"><b className="text-xs uppercase tracking-[0.04em] text-[#b23a2e]">{issue.severity}</b><span className="text-xs font-bold text-[#565f58]">Inspect</span></span>
                          <span className="mt-1 block text-sm font-semibold">{issue.title}</span>
                          <span className="mt-1 line-clamp-2 block font-serif text-sm text-[#565f58]">"{issue.quote}"</span>
                        </button>
                      ))}
                    </Card>
                    <Card>
                      <h3 className="mb-3 text-sm font-bold">Prompt and citation checks</h3>
                      {result.prompt_coverage.length ? result.prompt_coverage.map((item, index) => (
                        <div key={`${item.requirement}-${index}`} className="flex gap-3 border-t border-[#d7d4c7] py-3 first:border-0">
                          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.status === "met" ? "bg-[#4b6358]" : item.status === "partial" ? "bg-[#b4842e]" : "bg-[#b23a2e]"}`} />
                          <div><p className="text-sm font-semibold">{item.requirement}</p><p className="mt-1 text-xs leading-5 text-[#565f58]">{item.evidence}</p></div>
                        </div>
                      )) : <p className="text-sm text-[#565f58]">Add an assignment prompt in Setup to unlock prompt coverage checks.</p>}
                      {result.citation_note && <p className="mt-3 rounded-lg bg-[#ecebe3] p-3 text-xs leading-5 text-[#565f58]"><b>Citation note:</b> {result.citation_note}</p>}
                    </Card>
                  </div>
                </>
              )}
            </section>
          )}
        </main>
      </div>
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} heading="Create a free account to continue grading." />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-5 rounded-[10px] border border-[#d7d4c7] bg-[#f5f4ee] p-6 shadow-sm ${className}`}>{children}</div>;
}

function TabButton({ children, active, disabled, onClick }: { children: React.ReactNode; active: boolean; disabled?: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-md px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${active ? "bg-[#1d2420] text-white" : "text-[#565f58] hover:bg-white"}`}>{children}</button>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="mb-4 block"><span className="mb-2 block text-xs font-bold text-[#3f4943]">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-md border border-[#d7d4c7] bg-white p-3 text-sm outline-none focus:border-[#b23a2e]" /></label>;
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="mb-4 block"><span className="mb-2 block text-xs font-bold text-[#3f4943]">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-[88px] w-full rounded-md border border-[#d7d4c7] bg-white p-3 text-sm outline-none focus:border-[#b23a2e]" /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold text-[#3f4943]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-[#d7d4c7] bg-white p-3 text-sm outline-none focus:border-[#b23a2e]">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>;
}

function Pills({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <div><span className="mb-2 block text-xs font-bold text-[#3f4943]">{label}</span><div className="flex gap-2">{options.map((option) => <button type="button" key={option} onClick={() => onChange(option)} className={`flex-1 rounded-md border px-3 py-2 text-xs font-bold capitalize ${value === option ? "border-[#1d2420] bg-[#1d2420] text-white" : "border-[#d7d4c7] bg-white text-[#565f58]"}`}>{option}</button>)}</div></div>;
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" aria-pressed={checked} onClick={() => onChange(!checked)} className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-[#4b6358]" : "bg-[#d7d4c7]"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? "left-[18px]" : "left-0.5"}`} /></button>;
}

function ScoreRing({ value }: { value: number }) {
  const color = value >= 85 ? "#4b6358" : value >= 70 ? "#b4842e" : "#b23a2e";
  return <div className="flex shrink-0 flex-col items-center gap-2"><div className="relative grid h-24 w-24 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${value}%, #d7d4c7 ${value}% 100%)` }}><div className="absolute inset-[9px] rounded-full bg-white" /><div className="relative text-center"><b className="block font-serif text-2xl">{value}</b><span className="text-[10px] text-[#565f58]">out of 100</span></div></div><span className="rounded-full bg-[#ecebe3] px-2.5 py-1 text-[10px] font-bold text-[#565f58]">Target: 90+</span></div>;
}

function CriterionCard({ criterion, color, issueCount, onInspect }: { criterion: Criterion; color: string; issueCount: number; onInspect: () => void }) {
  return (
    <button type="button" onClick={onInspect} className="rounded-lg border border-[#d7d4c7] bg-[#f5f4ee] p-4 text-left transition hover:bg-white">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-bold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />{criterion.title}</span>
        <span className="font-mono text-sm font-semibold text-[#565f58]">{criterion.score}/100</span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#d7d4c7]"><span className="block h-full rounded-full" style={{ width: `${criterion.score}%`, background: color }} /></div>
      <p className="line-clamp-3 text-xs leading-5 text-[#565f58]">{criterion.rationale}</p>
      <div className="mt-3 flex items-center justify-between text-xs font-bold"><span className={issueCount ? "text-[#b23a2e]" : "text-[#4b6358]"}>{issueCount ? `${issueCount} flag${issueCount === 1 ? "" : "s"}` : "No flags"}</span><span className="text-[#565f58]">Inspect</span></div>
    </button>
  );
}

function IssueInspector({ issue, onClose, onApply }: { issue: Issue; onClose: () => void; onApply: (replacement: string) => void }) {
  const [custom, setCustom] = useState("");
  return (
    <div>
      <button onClick={onClose} className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-[#3d6b96]"><FiX /> Close inspection</button>
      <div className="mb-4">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#565f58]">Highlighted text</div>
        <div className="rounded-md bg-[#ecebe3] p-3 font-serif text-sm font-semibold leading-6">"{issue.quote}"</div>
      </div>
      <div className="mb-4 rounded-md border border-[#e8d2a0] bg-[#b4842e22] p-3">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#565f58]">Why this matters</div>
        <p className="text-sm leading-6">{issue.explanation}</p>
      </div>
      <div className="mb-4 rounded-md border border-[#bfd1c7] bg-[#4b63581a] p-3">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#565f58]">What to fix</div>
        <p className="text-sm leading-6">{issue.action}</p>
      </div>
      <div className="mb-4">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#565f58]">Rewrite options</div>
        {issue.rewrites.length ? issue.rewrites.map((rewrite, index) => (
          <div key={`${rewrite.label}-${index}`} className="mb-2 rounded-md border border-[#c7d6ea] bg-[#f0f4fa] p-3">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#3d6b96]">{rewrite.label}</span>
            <p className="font-serif text-sm leading-6">{rewrite.text}</p>
            <button onClick={() => onApply(rewrite.text)} className="mt-2 rounded-md bg-[#b23a2e] px-3 py-1.5 text-xs font-bold text-white">Add to essay</button>
          </div>
        )) : <p className="text-sm text-[#565f58]">No generated rewrite options for this flag.</p>}
      </div>
      {issue.brainstorm.length > 0 && <div className="mb-4 rounded-md border border-dashed border-[#d7d4c7] bg-[#f5f4ee] p-3"><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em]">If you are stuck</div><ul className="space-y-1 text-xs leading-5 text-[#565f58]">{issue.brainstorm.map((item, index) => <li key={index}>- {item}</li>)}</ul></div>}
      <div className="border-t border-[#d7d4c7] pt-4">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#565f58]">Write your own replacement</label>
        <textarea value={custom} onChange={(event) => setCustom(event.target.value)} className="mb-2 min-h-[74px] w-full rounded-md border border-[#d7d4c7] p-3 text-sm outline-none focus:border-[#b23a2e]" />
        <button onClick={() => onApply(custom)} className="rounded-md border border-[#1d2420] bg-white px-3 py-2 text-xs font-bold">Apply custom rewrite</button>
      </div>
    </div>
  );
}
