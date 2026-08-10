"use client";

import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCheck, FiChevronDown, FiFileText, FiPlus, FiRefreshCw, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { getGuestUserId } from "@/app/lib/client/guestStudyLimits";
import { cancelJob, waitForJob } from "@/app/lib/client/jobStream";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";
import { countWords } from "@/app/utils/text";

type Criterion = { criterion_id: string; title: string; weight: number; score: number; rationale: string; strengths: string[]; weaknesses: string[] };
type Issue = { issue_id: string; criterion_id: string; severity: "priority" | "important" | "polish"; quote: string; start: number; end: number; title: string; explanation: string; action: string; rewrites: { label: string; text: string }[]; brainstorm: string[] };
type GradeResult = { run_id: string; revision_id: string; overall_score: number; verdict: string; summary: string; readiness: string; confidence: number; reviewer_comment: string; criteria: Criterion[]; issues: Issue[]; prompt_coverage: { requirement: string; status: "met" | "partial" | "missing"; evidence: string }[]; citation_note: string };
type Session = { session_id: string; title: string; current_revision_id: string; current_text: string; word_count: number };
type CustomCriterion = { title: string; instruction: string; weight: number };

const API = String(process.env.NEXT_PUBLIC_NGROX_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const purposes = [
  ["personal_statement", "Personal statement"], ["supplemental", "College supplemental"],
  ["scholarship", "Scholarship essay"], ["class_assignment", "Class assignment"],
];
const genres = [
  ["narrative", "Narrative"], ["expository", "Expository"], ["argumentative", "Argumentative / persuasive"],
  ["analytical", "Analytical / critical"], ["reflective", "Reflective"], ["technical", "Technical / scientific"],
];

function unwrap<T>(payload: any): T { return (payload?.data ?? payload) as T; }
function errorMessage(error: any) {
  const value = error?.response?.data?.message || error?.response?.data?.error || error?.message;
  return Array.isArray(value) ? value.join(", ") : String(value || "Something went wrong.");
}

export default function EssayGraderTool() {
  const [view, setView] = useState<"setup" | "report">("setup");
  const [text, setText] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [rubricOpen, setRubricOpen] = useState(false);
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
  const [consent, setConsent] = useState(false);
  const [criteria, setCriteria] = useState<CustomCriterion[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();
  const words = useMemo(() => countWords(text), [text]);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (activeJob) void requestHeaders().then((headers) => cancelJob(`${API}/tools/essay-grader/jobs/${activeJob}`, headers)).catch(() => undefined);
  }, [activeJob]);

  async function requestHeaders(json = true): Promise<Record<string, string>> {
    const token = await getOrRefreshAccessToken();
    return {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-User-Id": getGuestUserId(),
    };
  }

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData(); body.append("file", file);
      const response = await axios.post(`${API}/tools/essay-grader/parse-document`, body, { headers: await requestHeaders(false) });
      const parsed = unwrap<{ text: string }>(response.data);
      setText(parsed.text); toast.success("Essay imported successfully.");
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  function validateSetup() {
    if (words < 50) { toast.error("Please provide at least 50 words."); return false; }
    if (words > 3000) { toast.error("Please keep the essay at or below 3,000 words."); return false; }
    if (criteria.length && criteria.reduce((sum, item) => sum + Number(item.weight), 0) !== 100) {
      toast.error("Custom criterion weights must total 100%."); return false;
    }
    return true;
  }

  async function runGrade(existing?: Session) {
    if (!validateSetup()) return;
    setLoading(true); setProgress(2); setSelectedIssue(null);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const headers = await requestHeaders();
      let current = existing;
      if (!current) {
        const created = await axios.post(`${API}/tools/essay-grader/sessions`, {
          text, purpose, academic_level: level, genre, strictness, feedback_tone: tone,
          citation_style: citation, target_school: school || undefined, benchmark: benchmark || undefined,
          assignment_prompt: prompt || undefined, rubric_text: criteria.length ? undefined : rubricText || undefined,
          benchmark_sample: sample || undefined, improvement_consent: consent,
          custom_criteria: criteria.length ? criteria : undefined,
        }, { headers });
        current = unwrap<Session>(created.data); setSession(current); setView("report");
      }
      const queued = await axios.post(`${API}/tools/essay-grader/sessions/${current.session_id}/grade`, {}, { headers });
      const job = unwrap<{ job_id: string }>(queued.data); setActiveJob(job.job_id);
      const grade = await waitForJob<GradeResult>({
        eventsUrl: `${API}/tools/essay-grader/jobs/${job.job_id}/events`,
        pollUrl: `${API}/tools/essay-grader/jobs/${job.job_id}`,
        headers, signal: controller.signal, timeoutMs: 300_000,
        parse: (payload) => unwrap(payload), onProgress: (state) => setProgress(state.progress || 0),
      });
      setResult(grade); setProgress(100); toast.success("Your grading report is ready.");
    } catch (error: any) {
      if (error?.name !== "AbortError") toast.error(errorMessage(error));
    } finally { setLoading(false); setActiveJob(null); abortRef.current = null; }
  }

  async function saveAndRescan() {
    if (!session || !validateSetup()) return;
    setLoading(true);
    try {
      const headers = await requestHeaders();
      let current = session;
      if (text !== session.current_text) {
        const saved = await axios.patch(`${API}/tools/essay-grader/sessions/${session.session_id}/draft`, { text, expected_revision_id: session.current_revision_id }, { headers });
        current = unwrap<Session>(saved.data); setSession(current);
      }
      setLoading(false); await runGrade(current);
    } catch (error) { setLoading(false); toast.error(errorMessage(error)); }
  }

  async function applyRewrite(issue: Issue, replacement: string) {
    if (!session || !result || !replacement.trim()) return;
    try {
      const response = await axios.post(`${API}/tools/essay-grader/sessions/${session.session_id}/rewrites`, {
        run_id: result.run_id, issue_id: issue.issue_id, expected_revision_id: session.current_revision_id, replacement,
      }, { headers: await requestHeaders() });
      const updated = unwrap<Session>(response.data); setSession(updated); setText(updated.current_text);
      setSelectedIssue(null); toast.success("Rewrite applied. Rescan when you’re ready.");
    } catch (error) { toast.error(errorMessage(error)); }
  }

  function addCriterion() { setCriteria((items) => [...items, { title: "", instruction: "", weight: 0 }]); setRubricOpen(true); }

  if (view === "setup") return (
    <div className="min-h-full bg-[#f5f5f1] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7"><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6b7280]">ScholarlyHelp Grader</p><h1 className="text-3xl font-bold text-[#24251f]">Set up your essay</h1><p className="mt-2 text-sm text-gray-600">Get rubric-based scoring, exact-text feedback, and revision guidance.</p></div>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-3 flex items-center justify-between"><label className="text-sm font-bold text-[#24251f]">Your essay <span className="text-red-500">*</span></label><span className={`text-xs font-semibold ${words > 3000 ? "text-red-500" : "text-gray-500"}`}>{words.toLocaleString()} / 3,000 words</span></div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your essay here…" className="min-h-[260px] w-full resize-y rounded-xl border border-gray-200 bg-[#fbfbf8] p-4 text-[15px] leading-7 text-gray-800 outline-none transition focus:border-[#565add] focus:ring-2 focus:ring-[#565add]/10" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-gray-500">50–3,000 words · PDF, DOCX, TXT, or RTF</p><input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.rtf" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} /><button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"><FiUpload />{uploading ? "Importing…" : "Upload file"}</button></div>
        </section>

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 text-sm font-bold text-[#24251f]">Evaluation setup</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Essay purpose" value={purpose} onChange={setPurpose} options={purposes} />
            <Select label="Academic level" value={level} onChange={setLevel} options={[["high_school","High school"],["undergraduate","Undergraduate"],["graduate","Graduate"]]} />
            <Select label="Writing style & genre" value={genre} onChange={setGenre} options={genres} />
            <Pills label="Grading strictness" value={strictness} onChange={setStrictness} options={["lenient","standard","strict"]} />
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <button type="button" onClick={() => setAdvanced(!advanced)} className="flex w-full items-center justify-between p-5 text-left sm:px-7"><span><b className="text-sm text-[#24251f]">Additional options</b><small className="ml-2 text-xs text-gray-500">Prompt, target, rubric, citations, tone</small></span><FiChevronDown className={`transition ${advanced ? "rotate-180" : ""}`} /></button>
          {advanced && <div className="border-t border-gray-100 p-5 sm:p-7">
            <div className="grid gap-4 md:grid-cols-2"><Field label="Target school or scholarship" value={school} onChange={setSchool} placeholder="e.g. Yale University" /><Field label="Benchmark" value={benchmark} onChange={setBenchmark} placeholder="e.g. A-range / highly competitive" /></div>
            <Area label="Assignment prompt or question" value={prompt} onChange={setPrompt} placeholder="Paste the full prompt so coverage can be checked…" />
            <Area label="Rubric or scoring criteria" value={rubricText} onChange={setRubricText} placeholder="Paste an instructor rubric, or leave blank for the built-in rubric…" />
            <button type="button" onClick={addCriterion} className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#565add] px-4 py-2 text-sm font-semibold text-[#565add]"><FiPlus /> Build a custom criterion</button>
            {rubricOpen && criteria.length > 0 && <div className="mb-5 space-y-3 rounded-xl bg-[#f7f7fd] p-4">{criteria.map((item, index) => <div key={index} className="grid gap-2 rounded-lg border border-[#d1d1f7] bg-white p-3 md:grid-cols-[1fr_2fr_90px_auto]"><input aria-label={`Criterion ${index + 1} title`} value={item.title} onChange={(e) => setCriteria((all) => all.map((x,i) => i === index ? {...x,title:e.target.value} : x))} placeholder="Criterion title" className="rounded border border-gray-200 p-2 text-sm"/><input aria-label={`Criterion ${index + 1} instruction`} value={item.instruction} onChange={(e) => setCriteria((all) => all.map((x,i) => i === index ? {...x,instruction:e.target.value} : x))} placeholder="What should the grader assess?" className="rounded border border-gray-200 p-2 text-sm"/><input aria-label={`Criterion ${index + 1} weight`} type="number" min="1" max="100" value={item.weight || ""} onChange={(e) => setCriteria((all) => all.map((x,i) => i === index ? {...x,weight:Number(e.target.value)} : x))} placeholder="Weight" className="rounded border border-gray-200 p-2 text-sm"/><button aria-label="Remove criterion" onClick={() => setCriteria((all) => all.filter((_,i) => i !== index))} className="p-2 text-gray-400 hover:text-red-500"><FiTrash2 /></button></div>)}<p className="text-right text-xs font-semibold text-gray-600">Total weight: {criteria.reduce((sum,item) => sum + Number(item.weight),0)}%</p></div>}
            <div className="grid gap-4 md:grid-cols-2"><Select label="Citation style" value={citation} onChange={setCitation} options={[["none","Not needed"],["apa7","APA 7"],["mla9","MLA 9"],["chicago16","Chicago 16"],["harvard","Harvard"]]} /><Pills label="Feedback tone" value={tone} onChange={setTone} options={["encouraging","direct","simple"]} /></div>
            <Area label="Strong sample to benchmark against (optional)" value={sample} onChange={setSample} placeholder="Paste a sample for quality/style comparison. It will not be treated as factual source material." />
            <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 text-sm"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1"/><span><b>Help improve our AI with this essay</b><small className="mt-1 block text-gray-500">Off by default. Grading quality is the same either way.</small></span></label>
          </div>}
        </section>
        <button type="button" disabled={loading} onClick={() => guardAiClick(() => runGrade())} className="mt-6 w-full rounded-xl bg-[#2b1c50] px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#3d286f] disabled:opacity-60">{loading ? `Preparing… ${progress}%` : "Grade my essay →"}</button>
      </div><GuestAuthGateModal open={gateOpen} onClose={closeGate} heading="Create a free account to continue grading." />
    </div>
  );

  return (
    <div className="min-h-full bg-[#f5f5f1] p-4 sm:p-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><button onClick={() => setView("setup")} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#565add]"><FiArrowLeft /> Setup & criteria</button><h1 className="text-2xl font-bold text-[#24251f]">{session?.title || "Essay report"}</h1></div><button disabled={loading} onClick={() => guardAiClick(saveAndRescan)} className="inline-flex items-center gap-2 rounded-lg bg-[#24251f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"><FiRefreshCw className={loading ? "animate-spin" : ""}/>{loading ? `Grading ${progress}%` : result ? "Rescan edits" : "Run grading"}</button></div>
        {loading && <div className="mb-5 overflow-hidden rounded-full bg-gray-200"><div className="h-2 bg-[#565add] transition-all" style={{width:`${Math.max(4,progress)}%`}} /></div>}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div className="flex items-center gap-2 text-sm font-bold"><FiFileText /> Editable draft</div><span className="text-xs text-gray-500">{words.toLocaleString()} words</span></div><textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[680px] w-full resize-y p-6 font-serif text-[16px] leading-8 text-gray-800 outline-none" /></section>
          <aside className="space-y-5">
            {!result ? <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-gray-200 border-t-[#565add] animate-spin"/><h2 className="font-bold">Evaluating your essay</h2><p className="mt-2 text-sm text-gray-500">Checking the rubric, prompt coverage, evidence, and revision priorities.</p></div> : <>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-5"><Score value={result.overall_score}/><div><span className="rounded-full bg-[#e9f2ec] px-2.5 py-1 text-xs font-bold text-[#385447]">{result.verdict}</span><p className="mt-3 text-sm leading-6 text-gray-600">{result.summary}</p></div></div><p className="mt-4 rounded-lg bg-[#f7f7fd] p-3 text-xs font-semibold text-[#3f438f]">{result.readiness}</p></div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Reviewer perspective</p><p className="text-sm leading-6 text-gray-700">{result.reviewer_comment}</p></div>
              <div className="grid grid-cols-2 gap-3">{result.criteria.map((item) => <div key={item.criterion_id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><h3 className="text-xs font-bold leading-5">{item.title}</h3><b className="text-sm text-[#565add]">{item.score}</b></div><div className="mt-3 h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#7f9b89]" style={{width:`${item.score}%`}}/></div><p className="mt-3 text-xs leading-5 text-gray-500">{item.rationale}</p></div>)}</div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="mb-3 text-sm font-bold">Revision priorities</h2>{result.issues.length ? <div className="space-y-2">{result.issues.map((issue) => <button key={issue.issue_id} onClick={() => setSelectedIssue(issue)} className={`w-full rounded-lg border p-3 text-left transition hover:border-[#565add] ${selectedIssue?.issue_id === issue.issue_id ? "border-[#565add] bg-[#f7f7fd]" : "border-gray-200"}`}><div className="flex items-center justify-between gap-2"><b className="text-xs">{issue.title}</b><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${issue.severity === "priority" ? "bg-red-100 text-red-900" : issue.severity === "important" ? "bg-amber-100 text-amber-900" : "bg-gray-100 text-gray-600"}`}>{issue.severity}</span></div><p className="mt-1 line-clamp-2 text-xs text-gray-500">“{issue.quote}”</p></button>)}</div> : <p className="text-sm text-gray-500">No exact-text issues were returned.</p>}</div>
              {selectedIssue && <div className="rounded-2xl border-2 border-[#565add] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#565add]">Inspecting issue</p><h2 className="mt-1 font-bold">{selectedIssue.title}</h2></div><button onClick={() => setSelectedIssue(null)} aria-label="Close issue"><FiX /></button></div><blockquote className="mt-4 border-l-4 border-[#d6b878] bg-[#fffaf0] p-3 font-serif text-sm italic">{selectedIssue.quote}</blockquote><p className="mt-4 text-sm leading-6 text-gray-600">{selectedIssue.explanation}</p><p className="mt-3 text-sm font-semibold text-gray-800">{selectedIssue.action}</p>{selectedIssue.rewrites.map((rewrite, index) => <div key={index} className="mt-3 rounded-lg border border-gray-200 bg-[#f7f7fd] p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-[#565add]">{rewrite.label}</span><p className="mt-2 font-serif text-sm leading-6">{rewrite.text}</p><button onClick={() => void applyRewrite(selectedIssue, rewrite.text)} className="mt-3 inline-flex items-center gap-1 rounded-md bg-[#565add] px-3 py-1.5 text-xs font-bold text-white"><FiCheck /> Add to essay</button></div>)}</div>}
              {result.prompt_coverage.length > 0 && <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="mb-3 text-sm font-bold">Prompt coverage</h2>{result.prompt_coverage.map((item,index) => <div key={index} className="flex gap-3 border-t border-gray-100 py-3 first:border-0"><span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.status === "met" ? "bg-emerald-500" : item.status === "partial" ? "bg-amber-400" : "bg-red-500"}`}/><div><p className="text-xs font-semibold">{item.requirement}</p><p className="mt-1 text-xs text-gray-500">{item.evidence}</p></div></div>)}</div>}
              {result.citation_note && <div className="rounded-xl border border-gray-200 bg-white p-4 text-xs leading-5 text-gray-600"><b>Citation note:</b> {result.citation_note}</div>}
            </>}
          </aside>
        </div>
      </div><GuestAuthGateModal open={gateOpen} onClose={closeGate} heading="Create a free account to continue grading." />
    </div>
  );
}

function Field({label,value,onChange,placeholder}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string}) { return <label className="mb-4 block"><span className="mb-2 block text-xs font-bold text-gray-600">{label}</span><input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#565add]"/></label>; }
function Area(props:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string}) { return <label className="mb-4 block"><span className="mb-2 block text-xs font-bold text-gray-600">{props.label}</span><textarea value={props.value} onChange={(e)=>props.onChange(e.target.value)} placeholder={props.placeholder} className="min-h-[90px] w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#565add]"/></label>; }
function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[][]}) { return <label className="block"><span className="mb-2 block text-xs font-bold text-gray-600">{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-[#565add]">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>; }
function Pills({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}) { return <div><span className="mb-2 block text-xs font-bold text-gray-600">{label}</span><div className="flex rounded-lg border border-gray-200 p-1">{options.map((option)=><button type="button" key={option} onClick={()=>onChange(option)} className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold capitalize ${value===option?"bg-[#2b1c50] text-white":"text-gray-500 hover:bg-gray-50"}`}>{option}</button>)}</div></div>; }
function Score({value}:{value:number}) { const color=value>=85?"#567263":value>=70?"#b38836":"#b45353"; return <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{background:`conic-gradient(${color} ${value}%, #e5e7eb ${value}% 100%)`}}><div className="absolute inset-[7px] rounded-full bg-white"/><div className="relative text-center"><b className="block text-2xl">{value}</b><span className="text-[10px] text-gray-500">out of 100</span></div></div>; }
