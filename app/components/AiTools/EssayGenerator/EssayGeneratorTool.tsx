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
  const [citationOpen, setCitationOpen] = useState(false);
  const [sourceLabel, setSourceLabel] = useState("");
  const [checkPanel, setCheckPanel] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();
  const words = useMemo(() => countWords(draft), [draft]);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (activeJob) void requestHeaders().then((headers) => cancelJob(`${API}/tools/essay-generator/jobs/${activeJob}`, headers)).catch(() => undefined);
  }, [activeJob]);

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
      setSession(payload.session); setOutline(payload.outline); setStep(2); setProgress(100);
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
    setLoading(true); setProgress(4); setResult(null);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const headers = await requestHeaders();
      await axios.patch(`${API}/tools/essay-generator/sessions/${session.session_id}/outline`, { outline }, { headers });
      const queued = await axios.post(`${API}/tools/essay-generator/sessions/${session.session_id}/generate`, {
        outline, tone, custom_tone: tone === "custom" ? customTone : undefined, target_words: targetWords,
        citation_style: citationStyle, key_terms: keyTerms || undefined, avoid_phrases: avoidPhrases || undefined,
        avoid_first_person: avoidFirstPerson, block_ai_buzzwords: blockBuzzwords, include_subheadings: includeSubheadings,
      }, { headers: { ...headers, "Idempotency-Key": `essay-${crypto.randomUUID()}` } });
      const job = unwrap<{ job_id: string }>(queued.data); setActiveJob(job.job_id); setStep(4);
      const essay = await waitForJob<EssayResult>({
        eventsUrl: `${API}/tools/essay-generator/jobs/${job.job_id}/events`,
        pollUrl: `${API}/tools/essay-generator/jobs/${job.job_id}`,
        headers, signal: controller.signal, timeoutMs: 360_000,
        parse: (payload) => unwrap(payload), onProgress: (state) => setProgress(state.progress || 0),
      });
      setResult(essay); setDraft(essay.plain_text);
      setSession((current) => current ? { ...current, current_revision_id: essay.revision_id, current_text: essay.plain_text, word_count: essay.word_count } : current);
      toast.success("Essay draft generated.");
    } catch (error: any) {
      if (error?.name !== "AbortError") toast.error(errorMessage(error));
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

  return (
    <div className="min-h-full bg-[#f5f5f1] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-[#24251f]">Scholarly AI Essay Studio</h1>
          <span className="rounded-full bg-[#eeedfe] px-3 py-1 text-xs font-bold text-[#534ab7]">Step {step} of 4</span>
        </div>

        {loading && <div className="mb-5 overflow-hidden rounded-full bg-gray-200"><div className="h-2 bg-[#534ab7] transition-all" style={{ width: `${Math.max(4, progress)}%` }} /></div>}

        {step === 1 && <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold">Assignment setup</h2>
          <p className="mb-5 mt-1 text-sm text-gray-500">Tell us about the essay. The outline and draft will follow these constraints.</p>
          <Field label="Essay topic / title" value={title} onChange={setTitle} placeholder="e.g. The impact of social media on teen mental health" />
          <div className="grid gap-4 md:grid-cols-3">
            <Select label="Academic level" value={level} onChange={setLevel} options={levels} />
            <Select label="Essay type" value={essayType} onChange={setEssayType} options={essayTypes} />
            <label className="block"><span className="mb-2 block text-xs font-bold text-gray-600">Body paragraphs</span><input type="number" min={1} max={12} value={bodyParagraphs} onChange={(e) => setBodyParagraphs(Math.max(1, Math.min(12, Number(e.target.value) || 1)))} className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#534ab7]" /></label>
          </div>
          <Area label="Assignment prompt" value={assignmentPrompt} onChange={setAssignmentPrompt} placeholder="Paste the exact assignment question if you have it." />
          <Area label="Rubric / syllabus notes" value={rubricNotes} onChange={setRubricNotes} placeholder="Paste grading requirements, professor instructions, or must-cover points." />
          <label className="mb-5 flex items-start gap-3 rounded-lg border border-gray-200 p-4 text-sm"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" /><span><b>Help improve essay generation quality</b><small className="mt-1 block text-gray-500">Off by default. Output quality is the same either way.</small></span></label>
          <div className="flex justify-end"><button disabled={loading} onClick={() => guardAiClick(generateOutline)} className="inline-flex items-center gap-2 rounded-lg bg-[#534ab7] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">Generate outline <FiArrowRight /></button></div>
        </section>}

        {step === 2 && outline && <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold">Review your outline</h2>
          <p className="mb-5 mt-1 text-sm text-gray-500">Edit any point directly. Reorder body paragraphs before drafting.</p>
          <OutlineBlock title="1. Introduction" points={outline.intro} onPoint={(i, v) => editPoint("intro", i, v)} />
          <div className="space-y-3">
            {outline.body.map((section, index) => <div key={section.id || index} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <button aria-label="Move up" onClick={() => moveBody(index, -1)} className="rounded border p-1 text-gray-500 hover:bg-gray-50"><FiChevronUp /></button>
                <button aria-label="Move down" onClick={() => moveBody(index, 1)} className="rounded border p-1 text-gray-500 hover:bg-gray-50"><FiChevronDown /></button>
                <input value={section.title} onChange={(e) => editBody(index, null, e.target.value)} className="flex-1 rounded border border-gray-200 p-2 text-sm font-semibold text-[#3c3489]" />
              </div>
              {section.points.map((point, pointIndex) => <input key={pointIndex} value={point.text} onChange={(e) => editBody(index, pointIndex, e.target.value)} className="mb-2 w-full rounded border border-gray-200 p-2 text-sm" />)}
            </div>)}
          </div>
          <OutlineBlock title={`${outline.body.length + 2}. Conclusion`} points={outline.conclusion} onPoint={(i, v) => editPoint("conclusion", i, v)} />
          <div className="mt-6 flex justify-between"><button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"><FiArrowLeft /> Back</button><button onClick={() => setStep(3)} className="inline-flex items-center gap-2 rounded-lg bg-[#534ab7] px-5 py-3 text-sm font-bold text-white">Next: preferences <FiArrowRight /></button></div>
        </section>}

        {step === 3 && <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold">Essay preferences</h2>
          <p className="mb-5 mt-1 text-sm text-gray-500">Tune style, formatting, word count, and citation expectations.</p>
          <div className="grid gap-4 md:grid-cols-3">
            <Select label="Tone of voice" value={tone} onChange={setTone} options={tones} />
            <Select label="Citation style" value={citationStyle} onChange={setCitationStyle} options={citations} />
            <div><span className="mb-2 block text-xs font-bold text-gray-600">Target word count</span><div className="grid grid-cols-3 gap-2">{[500, 1000, 1500].map((count) => <button key={count} onClick={() => setTargetWords(count)} className={`rounded-lg border px-3 py-3 text-sm font-bold ${targetWords === count ? "border-[#534ab7] bg-[#534ab7] text-white" : "border-gray-200 text-gray-600"}`}>~{count}</button>)}</div></div>
          </div>
          {tone === "custom" && <Field label="Describe your custom tone" value={customTone} onChange={setCustomTone} placeholder="e.g. authoritative yet approachable" />}
          <Field label="Key terms to include" value={keyTerms} onChange={setKeyTerms} placeholder="e.g. neuroplasticity, CBT, neural pathways" />
          <Field label="Words or phrases to avoid" value={avoidPhrases} onChange={setAvoidPhrases} placeholder="e.g. delve, tapestry, moreover" />
          <div className="mb-6 flex flex-wrap gap-3">
            <Toggle checked={avoidFirstPerson} onChange={setAvoidFirstPerson} label='Avoid first person ("I", "me", "my")' />
            <Toggle checked={blockBuzzwords} onChange={setBlockBuzzwords} label="Block common AI buzzwords" />
            <Toggle checked={includeSubheadings} onChange={setIncludeSubheadings} label="Include section subheadings" />
          </div>
          <div className="flex justify-between"><button onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"><FiArrowLeft /> Back</button><button disabled={loading} onClick={() => guardAiClick(generateEssay)} className="inline-flex items-center gap-2 rounded-lg bg-[#534ab7] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><FiZap /> Generate full essay</button></div>
        </section>}

        {step === 4 && <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold"><FiArrowLeft /> Start over</button>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => void transformSelection("paraphrase")} className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold">Paraphrase</button>
              <button onClick={() => void transformSelection("expand")} className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold">Expand</button>
              <button onClick={() => void transformSelection("shorten")} className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold">Shorten</button>
              <button onClick={() => setCitationOpen(true)} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold"><FiBookOpen /> Citations</button>
              <button onClick={undoDraft} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold"><FiRotateCcw /> Undo</button>
              <button onClick={saveDraft} className="inline-flex items-center gap-2 rounded-lg bg-[#24251f] px-4 py-2 text-sm font-bold text-white"><FiCheck /> Save</button>
            </div>
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3"><span className="inline-flex items-center gap-2 text-sm font-bold"><FiEdit3 /> Editable draft</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${targetState === "On target" ? "bg-emerald-100 text-emerald-800" : targetState === "Over target" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{words.toLocaleString()} / {targetWords.toLocaleString()} words</span></div>
              <textarea ref={textRef} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={loading ? "Writing your full essay draft..." : ""} className="min-h-[680px] w-full resize-y p-8 font-serif text-[16px] leading-8 text-gray-800 outline-none" />
            </div>
            <aside className="space-y-4">
              <Panel title="Draft checks" icon={<FiFileText />}>{result ? <ul className="space-y-2 text-sm text-gray-600">{result.quality_checks.map((item, index) => <li key={index}>- {item}</li>)}</ul> : <p className="text-sm text-gray-500">Generation is running.</p>}</Panel>
              <Panel title="Next steps" icon={<FiRefreshCw />}>{result ? <ul className="space-y-2 text-sm text-gray-600">{result.next_steps.map((item, index) => <li key={index}>- {item}</li>)}</ul> : <p className="text-sm text-gray-500">Review, personalize, verify claims, and add real sources before submission.</p>}</Panel>
              {result?.citations_note && <Panel title="Citation note" icon={<FiBookOpen />}><p className="text-sm text-gray-600">{result.citations_note}</p></Panel>}
              <Panel title="Handoffs" icon={<FiUsers />}>
                <div className="space-y-2">
                  <button onClick={() => setCheckPanel("AI Detector handoff ready. Save this draft, then open AI Detector from the tools dashboard to scan it.")} className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"><FiSearch /> Check with AI Detector</button>
                  <button onClick={() => setCheckPanel("Humanizer handoff ready. Save this draft, then run it through Humanizer for sentence-level variation.")} className="flex w-full items-center gap-2 rounded-lg border border-[#534ab7] bg-[#eeedfe] px-3 py-2 text-sm font-semibold text-[#3c3489]"><FiZap /> Humanize with Humanizer</button>
                </div>
                {checkPanel && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">{checkPanel}</p>}
              </Panel>
            </aside>
          </div>
        </section>}
      </div>

      {citationOpen && <div className="fixed inset-0 z-50 flex justify-end bg-black/20"><aside className="h-full w-full max-w-sm bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><b>Add a citation</b><button onClick={() => setCitationOpen(false)} aria-label="Close citation drawer"><FiX /></button></div><Field label="Source label, URL, DOI, or filename" value={sourceLabel} onChange={setSourceLabel} placeholder="e.g. Smith, 2024 or https://doi.org/..." /><label className="mb-4 block rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500"><FiUpload className="mx-auto mb-2" /> PDF upload handoff uses the citation tool source library.</label><button onClick={insertCitation} className="w-full rounded-lg bg-[#534ab7] px-4 py-3 text-sm font-bold text-white">Insert citation marker</button></aside></div>}
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} heading="Create a free account to continue generating essays." />
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="mb-4 block"><span className="mb-2 block text-xs font-bold text-gray-600">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#534ab7]" /></label>;
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="mb-4 block"><span className="mb-2 block text-xs font-bold text-gray-600">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-[95px] w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#534ab7]" /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold text-gray-600">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-[#534ab7]">{options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}</select></label>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return <label className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}</label>;
}

function OutlineBlock({ title, points, onPoint }: { title: string; points: Point[]; onPoint: (index: number, value: string) => void }) {
  return <div className="mb-4 rounded-lg border border-gray-200 bg-[#f9fafb] p-4"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{title}</div>{points.map((point, index) => <input key={index} value={point.text} onChange={(e) => onPoint(index, e.target.value)} className="mb-2 w-full rounded border border-gray-200 bg-white p-2 text-sm" />)}</div>;
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#24251f]">{icon}{title}</h2>{children}</div>;
}
