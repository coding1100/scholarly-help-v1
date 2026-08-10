"use client";

import axios from "axios";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiEdit3,
  FiFileText,
  FiRefreshCw,
  FiRotateCcw,
  FiSearch,
  FiUpload,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { getGuestUserId } from "@/app/lib/client/guestStudyLimits";
import { cancelJob, waitForJob } from "@/app/lib/client/jobStream";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";
import { countWords } from "@/app/utils/text";

type Point = { text: string };
type BodySection = { id?: string; title: string; points: Point[] };
type Outline = { intro: Point[]; body: BodySection[]; conclusion: Point[] };
type Session = { session_id: string; title: string; outline?: Outline | null; current_revision_id?: string | null; current_text?: string; word_count: number };
type EssayResult = { run_id: string; revision_id: string; title: string; plain_text: string; sections: { heading: string; paragraphs: string[] }[]; word_count: number; citations_note: string; quality_checks: string[]; next_steps: string[] };

const API = String(process.env.NEXT_PUBLIC_NGROX_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function unwrap<T>(payload: any): T { return (payload?.data ?? payload) as T; }
function errorMessage(error: any) {
  const value = error?.response?.data?.message || error?.response?.data?.error || error?.message;
  return Array.isArray(value) ? value.join(", ") : String(value || "Something went wrong.");
}

const levels = [["high_school", "High school"], ["undergraduate", "Undergraduate"], ["graduate", "Graduate / Master's"], ["doctoral", "Doctoral / PhD"]];
const essayTypes = [["argumentative", "Argumentative"], ["analytical", "Analytical"], ["expository", "Expository"], ["persuasive", "Persuasive"], ["descriptive", "Descriptive"], ["narrative", "Narrative"], ["compare_contrast", "Compare & contrast"], ["cause_effect", "Cause & effect"]];
const tones = [["formal_academic", "Formal academic"], ["conversational", "Conversational & engaging"], ["objective", "Objective & neutral"], ["persuasive", "Direct & persuasive"], ["custom", "Custom tone"]];
const citations = [["apa7", "APA 7th edition"], ["mla9", "MLA 9th edition"], ["chicago17", "Chicago 17th edition"], ["harvard", "Harvard"], ["none", "No citations"]];
const wizardSteps = ["Setup", "Outline", "Preferences", "Draft"];

function cleanOutlineForApi(outline: Outline): Outline {
  return {
    intro: outline.intro.map((point) => ({ text: point.text })),
    body: outline.body.map((section) => ({
      title: section.title,
      points: section.points.map((point) => ({ text: point.text })),
    })),
    conclusion: outline.conclusion.map((point) => ({ text: point.text })),
  };
}

export default function EssayGeneratorTool() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [session, setSession] = useState<Session | null>(null);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("undergraduate");
  const [essayType, setEssayType] = useState("argumentative");
  const [bodyParagraphs, setBodyParagraphs] = useState(3);
  const [rubricNotes, setRubricNotes] = useState("");
  const [assignmentPrompt, setAssignmentPrompt] = useState("");
  const [outline, setOutline] = useState<Outline | null>(null);
  const [tone, setTone] = useState("formal_academic");
  const [customTone, setCustomTone] = useState("");
  const [targetWords, setTargetWords] = useState(1000);
  const [citationStyle, setCitationStyle] = useState("apa7");
  const [keyTerms, setKeyTerms] = useState("");
  const [avoidPhrases, setAvoidPhrases] = useState("");
  const [avoidFirstPerson, setAvoidFirstPerson] = useState(true);
  const [blockBuzzwords, setBlockBuzzwords] = useState(true);
  const [includeSubheadings, setIncludeSubheadings] = useState(true);
  const [consent, setConsent] = useState(false);
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<EssayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeJob, setActiveJob] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState("");
  const [citationOpen, setCitationOpen] = useState(false);
  const [sourceLabel, setSourceLabel] = useState("");
  const [checkPanel, setCheckPanel] = useState<string | null>(null);
  const wizardTopRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();
  const words = useMemo(() => countWords(draft), [draft]);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (activeJob) void requestHeaders().then((headers) => cancelJob(`${API}/tools/essay-generator/jobs/${activeJob}`, headers)).catch(() => undefined);
  }, [activeJob]);

  useEffect(() => {
    wizardTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function goToStep(nextStep: 1 | 2 | 3 | 4) {
    setStep(nextStep);
  }

  async function requestHeaders(json = true): Promise<Record<string, string>> {
    const token = await getOrRefreshAccessToken();
    return { ...(json ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), "X-User-Id": getGuestUserId() };
  }

  async function generateOutline() {
    if (title.trim().length < 3) { toast.error("Enter an essay topic first."); return; }
    setLoading(true); setProgress(15);
    try {
      const headers = await requestHeaders();
      const created = await axios.post(`${API}/tools/essay-generator/sessions`, {
        title, academic_level: level, essay_type: essayType, body_paragraphs: bodyParagraphs,
        rubric_notes: rubricNotes || undefined, assignment_prompt: assignmentPrompt || undefined,
        improvement_consent: consent,
      }, { headers });
      const current = unwrap<Session>(created.data);
      setSession(current); setProgress(45);
      const response = await axios.post(`${API}/tools/essay-generator/sessions/${current.session_id}/outline`, {}, { headers: { ...headers, "Idempotency-Key": `outline-${crypto.randomUUID()}` } });
      const payload = unwrap<{ session: Session; outline: Outline }>(response.data);
      setSession(payload.session); setOutline(payload.outline); goToStep(2); setProgress(100);
      toast.success("Outline ready to review.");
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setLoading(false); setProgress(0); }
  }

  function editPoint(section: "intro" | "conclusion", index: number, value: string) {
    setOutline((current) => current && { ...current, [section]: current[section].map((point, i) => i === index ? { text: value } : point) });
  }

  function editBody(sectionIndex: number, pointIndex: number | null, value: string) {
    setOutline((current) => {
      if (!current) return current;
      return { ...current, body: current.body.map((section, i) => {
        if (i !== sectionIndex) return section;
        if (pointIndex === null) return { ...section, title: value };
        return { ...section, points: section.points.map((point, p) => p === pointIndex ? { text: value } : point) };
      }) };
    });
  }

  function moveBody(index: number, direction: -1 | 1) {
    setOutline((current) => {
      if (!current) return current;
      const next = [...current.body];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, body: next };
    });
  }

  async function generateEssay() {
    if (!session || !outline) return;
    setLoading(true); setProgress(4); setResult(null); setDraft(""); setGenerationError("");
    goToStep(4);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const headers = await requestHeaders();
      const apiOutline = cleanOutlineForApi(outline);
      setProgress(10);
      await axios.patch(`${API}/tools/essay-generator/sessions/${session.session_id}/outline`, { outline: apiOutline }, { headers });
      setProgress(18);
      const queued = await axios.post(`${API}/tools/essay-generator/sessions/${session.session_id}/generate`, {
        outline: apiOutline, tone, custom_tone: tone === "custom" ? customTone : undefined, target_words: targetWords,
        citation_style: citationStyle, key_terms: keyTerms || undefined, avoid_phrases: avoidPhrases || undefined,
        avoid_first_person: avoidFirstPerson, block_ai_buzzwords: blockBuzzwords, include_subheadings: includeSubheadings,
      }, { headers: { ...headers, "Idempotency-Key": `essay-${crypto.randomUUID()}` } });
      const job = unwrap<{ job_id: string }>(queued.data); setActiveJob(job.job_id); setProgress(24);
      const essay = await waitForJob<EssayResult>({
        eventsUrl: `${API}/tools/essay-generator/jobs/${job.job_id}/events`,
        pollUrl: `${API}/tools/essay-generator/jobs/${job.job_id}`,
        headers, signal: controller.signal, timeoutMs: 360_000,
        parse: (payload) => unwrap(payload), onProgress: (state) => setProgress(Math.max(8, state.progress || 0)),
      });
      setProgress(100); setResult(essay); setDraft(essay.plain_text);
      setSession((current) => current ? { ...current, current_revision_id: essay.revision_id, current_text: essay.plain_text, word_count: essay.word_count } : current);
      toast.success("Essay draft generated.");
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        const message = errorMessage(error);
        setGenerationError(message);
        toast.error(message);
      }
    } finally { setLoading(false); setActiveJob(null); abortRef.current = null; }
  }

  async function saveDraft() {
    if (!session?.current_revision_id || !draft.trim()) return;
    try {
      const response = await axios.patch(`${API}/tools/essay-generator/sessions/${session.session_id}/draft`, { text: draft, expected_revision_id: session.current_revision_id }, { headers: await requestHeaders() });
      const updated = unwrap<Session>(response.data); setSession(updated); setDraft(updated.current_text || draft);
      toast.success("Draft saved.");
    } catch (error) { toast.error(errorMessage(error)); }
  }

  async function undoDraft() {
    if (!session?.current_revision_id) return;
    try {
      const response = await axios.post(`${API}/tools/essay-generator/sessions/${session.session_id}/undo`, { expected_revision_id: session.current_revision_id }, { headers: await requestHeaders() });
      const updated = unwrap<Session>(response.data); setSession(updated); setDraft(updated.current_text || "");
      toast.success("Undo applied.");
    } catch (error) { toast.error(errorMessage(error)); }
  }

  async function transformSelection(action: "paraphrase" | "expand" | "shorten") {
    if (!session) return;
    const area = textRef.current;
    if (!area || area.selectionStart === area.selectionEnd) { toast.error("Select text in the draft first."); return; }
    const start = area.selectionStart; const end = area.selectionEnd;
    const selection = draft.slice(start, end);
    try {
      const response = await axios.post(`${API}/tools/essay-generator/sessions/${session.session_id}/transform`, {
        action, selection, surrounding_text: draft.slice(Math.max(0, start - 500), Math.min(draft.length, end + 500)), tone, custom_tone: customTone || undefined,
      }, { headers: { ...(await requestHeaders()), "Idempotency-Key": `transform-${crypto.randomUUID()}` } });
      const payload = unwrap<{ text: string; note: string }>(response.data);
      setDraft(draft.slice(0, start) + payload.text + draft.slice(end));
      toast.success(payload.note || "Selection updated.");
    } catch (error) { toast.error(errorMessage(error)); }
  }

  function insertCitation() {
    const label = sourceLabel.trim();
    if (!label) { toast.error("Add a source label, URL, DOI, or filename first."); return; }
    const area = textRef.current;
    const insertion = citationStyle === "mla9" ? ` (${label})` : ` (${label})`;
    if (area) {
      const position = area.selectionEnd || draft.length;
      setDraft(draft.slice(0, position) + insertion + draft.slice(position));
    } else setDraft(`${draft}${insertion}`);
    setSourceLabel(""); setCitationOpen(false);
  }

  const targetState = words < targetWords * 0.92 ? "Below target" : words > targetWords * 1.12 ? "Over target" : "On target";
  const draftPending = step === 4 && loading && !result;
  const draftReady = Boolean(result && draft.trim());

  return (
    <div className="min-h-full bg-[#f5f5f1] px-4 py-6 text-[#24251f] sm:px-6 lg:px-8">
      <div ref={wizardTopRef} className="mx-auto max-w-6xl scroll-mt-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Essay Generator / <span className="font-semibold text-[#24251f]">{session?.title || "New draft"}</span></p>
            <h1 className="mt-1 text-2xl font-bold">Scholarly AI Essay Studio</h1>
          </div>
          <span className="w-fit rounded-full bg-[#eeedfe] px-3 py-1 text-xs font-bold text-[#534ab7]">Step {step} of 4</span>
        </div>

        <Stepper step={step} loading={loading} progress={progress} />

        {step === 1 && <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold">Assignment setup</h2>
            <p className="mt-1 text-sm text-gray-500">Tell us about the essay. The outline and draft will follow these constraints.</p>
          </div>
          <div className="space-y-5">
          <Field label="Essay topic / title" value={title} onChange={setTitle} placeholder="e.g. The impact of social media on teen mental health" />
          <div className="grid gap-4 md:grid-cols-3">
            <Select label="Academic level" value={level} onChange={setLevel} options={levels} />
            <Select label="Essay type" value={essayType} onChange={setEssayType} options={essayTypes} />
            <label className="block"><span className="mb-2 block text-xs font-bold text-gray-600">Body paragraphs</span><input type="number" min={1} max={12} value={bodyParagraphs} onChange={(e) => setBodyParagraphs(Math.max(1, Math.min(12, Number(e.target.value) || 1)))} className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#534ab7]" /></label>
          </div>
          <Area label="Assignment prompt" value={assignmentPrompt} onChange={setAssignmentPrompt} placeholder="Paste the exact assignment question if you have it." />
          <Area label="Rubric / syllabus notes" value={rubricNotes} onChange={setRubricNotes} placeholder="Paste grading requirements, professor instructions, or must-cover points." />
          <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" /><span><b>Help improve essay generation quality</b><small className="mt-1 block text-gray-500">Off by default. Output quality is the same either way.</small></span></label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={loading} onClick={() => guardAiClick(generateOutline)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#534ab7] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#44399f] disabled:opacity-60 sm:w-auto">Generate outline <FiArrowRight /></button></div>
          </div>
        </section>}

        {step === 2 && outline && <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold">Review your outline</h2>
            <p className="mt-1 text-sm text-gray-500">Edit any point directly. Reorder body paragraphs before drafting.</p>
          </div>
          <OutlineBlock title="1. Introduction" points={outline.intro} onPoint={(i, v) => editPoint("intro", i, v)} />
          <div className="space-y-3">
            {outline.body.map((section, index) => <div key={section.id || index} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex gap-2">
                <button type="button" aria-label="Move up" onClick={() => moveBody(index, -1)} className="rounded border p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40" disabled={index === 0}><FiChevronUp /></button>
                <button type="button" aria-label="Move down" onClick={() => moveBody(index, 1)} className="rounded border p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40" disabled={index === outline.body.length - 1}><FiChevronDown /></button>
                </div>
                <input value={section.title} onChange={(e) => editBody(index, null, e.target.value)} className="flex-1 rounded border border-gray-200 p-2 text-sm font-semibold text-[#3c3489]" />
              </div>
              <div className="space-y-2">{section.points.map((point, pointIndex) => <input key={pointIndex} value={point.text} onChange={(e) => editBody(index, pointIndex, e.target.value)} className="w-full rounded border border-gray-200 p-2 text-sm" />)}</div>
            </div>)}
          </div>
          <OutlineBlock title={`${outline.body.length + 2}. Conclusion`} points={outline.conclusion} onPoint={(i, v) => editPoint("conclusion", i, v)} />
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={() => goToStep(1)} className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"><FiArrowLeft /> Back</button><button type="button" onClick={() => goToStep(3)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#534ab7] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#44399f]">Next: preferences <FiArrowRight /></button></div>
        </section>}

        {step === 3 && <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold">Essay preferences</h2>
            <p className="mt-1 text-sm text-gray-500">Tune style, formatting, word count, and citation expectations.</p>
          </div>
          <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_390px]">
            <Select label="Tone of voice" value={tone} onChange={setTone} options={tones} />
            <Select label="Citation style" value={citationStyle} onChange={setCitationStyle} options={citations} />
            <div><span className="mb-2 block text-xs font-bold text-gray-600">Target word count</span><div className="grid grid-cols-3 gap-2">{[500, 1000, 1500].map((count) => <button type="button" key={count} onClick={() => setTargetWords(count)} className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${targetWords === count ? "border-[#534ab7] bg-[#534ab7] text-white" : "border-gray-200 text-gray-600 hover:border-[#534ab7]"}`}>~{count}</button>)}</div></div>
          </div>
          {tone === "custom" && <Field label="Describe your custom tone" value={customTone} onChange={setCustomTone} placeholder="e.g. authoritative yet approachable" />}
          <Field label="Key terms to include" value={keyTerms} onChange={setKeyTerms} placeholder="e.g. neuroplasticity, CBT, neural pathways" />
          <Field label="Words or phrases to avoid" value={avoidPhrases} onChange={setAvoidPhrases} placeholder="e.g. delve, tapestry, moreover" />
          <div className="flex flex-wrap gap-3">
            <Toggle checked={avoidFirstPerson} onChange={setAvoidFirstPerson} label='Avoid first person ("I", "me", "my")' />
            <Toggle checked={blockBuzzwords} onChange={setBlockBuzzwords} label="Block common AI buzzwords" />
            <Toggle checked={includeSubheadings} onChange={setIncludeSubheadings} label="Include section subheadings" />
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between"><button type="button" onClick={() => goToStep(2)} className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"><FiArrowLeft /> Back</button><button type="button" disabled={loading} onClick={() => guardAiClick(generateEssay)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#534ab7] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#44399f] disabled:opacity-60"><FiZap /> Generate full essay</button></div>
          </div>
        </section>}

        {step === 4 && <section>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <button type="button" onClick={() => goToStep(1)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold lg:w-auto"><FiArrowLeft /> Start over</button>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <button type="button" disabled={!draftReady || loading} onClick={() => void transformSelection("paraphrase")} className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45">Paraphrase</button>
              <button type="button" disabled={!draftReady || loading} onClick={() => void transformSelection("expand")} className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45">Expand</button>
              <button type="button" disabled={!draftReady || loading} onClick={() => void transformSelection("shorten")} className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45">Shorten</button>
              <button type="button" disabled={!draftReady || loading} onClick={() => setCitationOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"><FiBookOpen /> Citations</button>
              <button type="button" disabled={!draftReady || loading} onClick={undoDraft} className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"><FiRotateCcw /> Undo</button>
              <button type="button" disabled={!draftReady || loading} onClick={saveDraft} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#24251f] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"><FiCheck /> Save</button>
            </div>
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-2 text-sm font-bold"><FiEdit3 /> Editable draft</span><span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${targetState === "On target" ? "bg-emerald-100 text-emerald-800" : targetState === "Over target" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{words.toLocaleString()} / {targetWords.toLocaleString()} words</span></div>
              <div className="relative">
                <textarea ref={textRef} disabled={draftPending} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={generationError ? "Generation did not complete. Go back to preferences and try again." : draftPending ? "Writing your full essay draft..." : ""} className="min-h-[520px] w-full resize-y p-5 font-serif text-[16px] leading-8 text-gray-800 outline-none disabled:resize-none disabled:bg-white sm:min-h-[680px] sm:p-8" />
                {draftPending && <div className="absolute inset-0 grid place-items-center bg-white/90 p-6 text-center">
                  <div className="max-w-sm">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#eeedfe] border-t-[#534ab7]" />
                    <h3 className="text-base font-bold text-[#24251f]">Generating your essay draft</h3>
                    <p className="mt-2 text-sm text-gray-500">Keep this screen open. We are polling the job status and will place the draft here as soon as it completes.</p>
                    <div className="mt-4 overflow-hidden rounded-full bg-gray-200"><div className="h-2 rounded-full bg-[#534ab7] transition-all duration-500" style={{ width: `${Math.max(8, progress)}%` }} /></div>
                    <p className="mt-2 text-xs font-semibold text-[#534ab7]">{Math.max(8, progress)}% complete</p>
                  </div>
                </div>}
                {!loading && !draftReady && generationError && <div className="absolute inset-0 grid place-items-center bg-white/95 p-6 text-center">
                  <div className="max-w-sm rounded-xl border border-red-100 bg-red-50 p-5">
                    <h3 className="text-base font-bold text-red-900">Generation stopped</h3>
                    <p className="mt-2 text-sm text-red-700">{generationError}</p>
                    <button type="button" onClick={() => goToStep(3)} className="mt-4 rounded-lg bg-[#534ab7] px-4 py-2 text-sm font-bold text-white">Back to preferences</button>
                  </div>
                </div>}
              </div>
            </div>
            <aside className="space-y-4">
              <Panel title="Draft checks" icon={<FiFileText />}>{result ? <ul className="space-y-2 text-sm text-gray-600">{result.quality_checks.map((item, index) => <li key={index}>- {item}</li>)}</ul> : <p className="text-sm text-gray-500">{draftPending ? `Generation is running (${Math.max(8, progress)}%).` : generationError ? "Generation did not complete." : "No draft generated yet."}</p>}</Panel>
              <Panel title="Next steps" icon={<FiRefreshCw />}>{result ? <ul className="space-y-2 text-sm text-gray-600">{result.next_steps.map((item, index) => <li key={index}>- {item}</li>)}</ul> : <p className="text-sm text-gray-500">{draftPending ? "Please wait until the draft appears before editing, saving, or using handoffs." : "Go back to preferences and try generation again."}</p>}</Panel>
              {result?.citations_note && <Panel title="Citation note" icon={<FiBookOpen />}><p className="text-sm text-gray-600">{result.citations_note}</p></Panel>}
              <Panel title="Handoffs" icon={<FiUsers />}>
                <div className="space-y-2">
                  <button type="button" onClick={() => setCheckPanel("AI Detector handoff ready. Save this draft, then open AI Detector from the tools dashboard to scan it.")} className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"><FiSearch /> Check with AI Detector</button>
                  <button type="button" onClick={() => setCheckPanel("Humanizer handoff ready. Save this draft, then run it through Humanizer for sentence-level variation.")} className="flex w-full items-center gap-2 rounded-lg border border-[#534ab7] bg-[#eeedfe] px-3 py-2 text-sm font-semibold text-[#3c3489]"><FiZap /> Humanize with Humanizer</button>
                </div>
                {checkPanel && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">{checkPanel}</p>}
              </Panel>
            </aside>
          </div>
        </section>}
      </div>

      {citationOpen && <div className="fixed inset-0 z-50 flex justify-end bg-black/20"><aside className="h-full w-full max-w-sm bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><b>Add a citation</b><button type="button" onClick={() => setCitationOpen(false)} aria-label="Close citation drawer"><FiX /></button></div><div className="space-y-5"><Field label="Source label, URL, DOI, or filename" value={sourceLabel} onChange={setSourceLabel} placeholder="e.g. Smith, 2024 or https://doi.org/..." /><label className="block rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500"><FiUpload className="mx-auto mb-2" /> PDF upload handoff uses the citation tool source library.</label><button type="button" onClick={insertCitation} className="w-full rounded-lg bg-[#534ab7] px-4 py-3 text-sm font-bold text-white">Insert citation marker</button></div></aside></div>}
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} heading="Create a free account to continue generating essays." />
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold text-gray-600">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none transition focus:border-[#534ab7] focus:ring-2 focus:ring-[#534ab7]/15" /></label>;
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold text-gray-600">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-[95px] w-full rounded-lg border border-gray-200 p-3 text-sm outline-none transition focus:border-[#534ab7] focus:ring-2 focus:ring-[#534ab7]/15" /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold text-gray-600">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-[#534ab7] focus:ring-2 focus:ring-[#534ab7]/15">{options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}</select></label>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return <label className="flex w-full items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold sm:w-auto"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}</label>;
}

function OutlineBlock({ title, points, onPoint }: { title: string; points: Point[]; onPoint: (index: number, value: string) => void }) {
  return <div className="my-4 rounded-lg border border-gray-200 bg-[#f9fafb] p-4"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{title}</div><div className="space-y-2">{points.map((point, index) => <input key={index} value={point.text} onChange={(e) => onPoint(index, e.target.value)} className="w-full rounded border border-gray-200 bg-white p-2 text-sm" />)}</div></div>;
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#24251f]">{icon}{title}</h2>{children}</div>;
}

function Stepper({ step, loading, progress }: { step: number; loading: boolean; progress: number }) {
  const barWidth = loading ? Math.max(((step - 1) / 3) * 100, Math.min(100, progress)) : ((step - 1) / 3) * 100;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="relative">
        <div className="absolute left-0 right-0 top-4 hidden h-1 rounded-full bg-gray-200 sm:block" />
        <div className="absolute left-0 top-4 hidden h-1 rounded-full bg-[#534ab7] transition-all duration-500 sm:block" style={{ width: `${barWidth}%` }} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {wizardSteps.map((label, index) => {
            const itemStep = index + 1;
            const done = itemStep < step;
            const active = itemStep === step;
            return (
              <div key={label} className="relative z-10 flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-2 sm:flex-col sm:border-0 sm:p-0">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition ${done || active ? "bg-[#534ab7] text-white" : "bg-gray-200 text-gray-500"}`}>{done ? <FiCheck /> : itemStep}</span>
                <span className={`text-xs font-bold ${active ? "text-[#534ab7]" : done ? "text-[#24251f]" : "text-gray-400"}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
      {loading && <div className="mt-4 overflow-hidden rounded-full bg-gray-200"><div className="h-2 rounded-full bg-[#534ab7] transition-all duration-500" style={{ width: `${Math.max(6, progress)}%` }} /></div>}
    </div>
  );
}
