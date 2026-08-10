"use client";

import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiDownload, FiExternalLink, FiFileText, FiRefreshCw, FiSettings, FiUpload } from "react-icons/fi";
import { getAccessToken } from "@/app/lib/authSession";
import { countWords } from "@/app/utils/text";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import styles from "./PlagiarismCheckerTool.module.css";
import type { PlagiarismScan, ScanSettings, SimilarityMatch } from "./types";

type View = "input" | "progress" | "results";
type SideView = "overview" | "focus" | "ignore" | "log";
const API = `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/plagiarism-check`;
const MAX_WORDS = 10_000;
const DEFAULT_SETTINGS: ScanSettings = {
  exclude_bibliography: true,
  exclude_quotes: true,
  compare_past_scans: true,
  contribute_to_database: false,
};

function unwrap<T>(response: any): T {
  return (response?.data?.data ?? response?.data) as T;
}

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function errorMessage(error: any): string {
  const value = error?.response?.data?.message || error?.response?.data?.error || error?.message;
  return Array.isArray(value) ? value.join(", ") : String(value || "The scan could not be completed.");
}

export default function PlagiarismCheckerTool() {
  const [token, setToken] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("Pasted text");
  const [view, setView] = useState<View>("input");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsUsedOpen, setSettingsUsedOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [scan, setScan] = useState<PlagiarismScan | null>(null);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState<"all" | "flagged">("all");
  const [sideView, setSideView] = useState<SideView>("overview");
  const [focused, setFocused] = useState<SimilarityMatch | null>(null);
  const [rewrite, setRewrite] = useState("");
  const [ignored, setIgnored] = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [ignoreReason, setIgnoreReason] = useState<"common" | "own">("common");
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [revisionVisible, setRevisionVisible] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const alive = useRef(true);

  useEffect(() => {
    setToken(getAccessToken());
    return () => { alive.current = false; };
  }, []);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const words = useMemo(() => countWords(text), [text]);
  const result = scan?.result;
  const activeMatches = useMemo(
    () => (result?.matches || []).filter((match) => !ignored.has(match.id)),
    [result, ignored],
  );
  const visibleScore = useMemo(() => {
    if (!result) return 0;
    const ignoredShare = (result.matches || []).filter((match) => ignored.has(match.id))
      .reduce((sum, match) => sum + match.token_count, 0) / Math.max(1, result.word_count) * 100;
    return Math.max(0, Math.round(result.score - ignoredShare));
  }, [result, ignored]);
  const dirty = Object.keys(edits).length > 0;

  const addLog = (message: string) => setLog((items) => [`${timestamp()} — ${message}`, ...items]);
  const updateSetting = (key: keyof ScanSettings) =>
    setSettings((current) => ({ ...current, [key]: !current[key] }));

  const poll = async (scanId: string) => {
    for (let attempt = 0; attempt < 120 && alive.current; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const response = await axios.get(`${API}/${scanId}`, { headers });
      const next = unwrap<PlagiarismScan>(response);
      if (!alive.current) return;
      setProgress(next.progress || 0);
      setScan(next);
      if (next.status === "completed" && next.result) {
        setView("results");
        setProgress(100);
        setRevisionVisible(true);
        return;
      }
      if (next.status === "failed") throw new Error(next.error || "The scan failed.");
    }
    throw new Error("The scan is taking longer than expected. Please try again.");
  };

  const runScan = async (input: string, isRescan = false) => {
    const count = countWords(input);
    if (count < 20) return toast.error("Please provide at least 20 words.");
    if (count > MAX_WORDS) return toast.error(`Please keep the document under ${MAX_WORDS.toLocaleString()} words.`);
    setError(""); setView("progress"); setProgress(3); setSideView("overview");
    try {
      const response = await axios.post(API, { text: input, title, options: settings }, {
        headers: { ...headers, "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
      });
      const created = unwrap<PlagiarismScan>(response);
      setScan(created);
      trackToolGenerate({ toolName: "Plagiarism Checker" });
      if (isRescan) addLog("Document rechecked against Quetext sources");
      await poll(created.scan_id);
    } catch (cause) {
      const message = errorMessage(cause);
      setError(message); setView("input"); toast.error(message);
    }
  };

  const uploadFile = async (file?: File) => {
    if (!file) return;
    if (!/\.(pdf|docx|txt|rtf)$/i.test(file.name)) return toast.error("Upload a PDF, DOCX, TXT, or RTF file.");
    setUploading(true); setError("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await axios.post(`${API}/extract`, form, { headers: { ...headers, "Content-Type": "multipart/form-data" } });
      const data = unwrap<{ text: string; title: string; word_count: number }>(response);
      setText(data.text); setTitle(data.title); toast.success("Document text extracted.");
    } catch (cause) { toast.error(errorMessage(cause)); }
    finally { setUploading(false); }
  };

  const reset = async () => {
    if (scan?.scan_id) void axios.delete(`${API}/${scan.scan_id}`, { headers }).catch(() => undefined);
    setText(""); setTitle("Pasted text"); setView("input"); setScan(null); setProgress(0);
    setIgnored(new Set()); setEdits({}); setLog([]); setFocused(null); setError("");
  };

  const selectMatch = (match: SimilarityMatch) => {
    setFocused(match); setRewrite(edits[match.id] ?? match.text); setSideView("focus");
  };

  const applyRewrite = () => {
    if (!focused || !rewrite.trim()) return;
    setEdits((current) => ({ ...current, [focused.id]: rewrite.trim() }));
    setSideView("overview"); addLog("Applied a rewrite to a matching passage");
  };

  const ignoreMatch = () => {
    if (!focused) return;
    setIgnored((current) => new Set(current).add(focused.id));
    setSideView("overview");
    addLog(`Excluded a match: ${ignoreReason === "own" ? "own previous work" : "common phrasing"}`);
  };

  const rebuiltText = () => {
    if (!result) return text;
    let rebuilt = text;
    [...result.matches].sort((a, b) => b.start - a.start).forEach((match) => {
      const replacement = edits[match.id];
      if (replacement !== undefined) rebuilt = rebuilt.slice(0, match.start) + replacement + rebuilt.slice(match.end);
    });
    return rebuilt;
  };

  const rescan = () => {
    const rebuilt = rebuiltText(); setText(rebuilt); setEdits({}); setIgnored(new Set());
    void runScan(rebuilt, true);
  };

  const download = async () => {
    if (!scan) return;
    setDownloading(true);
    try {
      const response = await axios.post(`${API}/report/pdf`, { scan_id: scan.scan_id, text }, {
        headers: { ...headers, "Content-Type": "application/json" }, responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a"); link.href = url; link.download = "similarity-report.pdf"; link.click();
      URL.revokeObjectURL(url); addLog("Downloaded the similarity report");
    } catch (cause) { toast.error(errorMessage(cause)); }
    finally { setDownloading(false); }
  };

  const copyMatches = async () => {
    await navigator.clipboard.writeText(activeMatches.map((match) => edits[match.id] ?? match.text).join("\n\n"));
    toast.success("Flagged passages copied."); addLog("Copied all flagged passages");
  };

  const renderDocument = () => {
    if (!result?.matches.length) return <span>{text}</span>;
    const nodes: React.ReactNode[] = []; let cursor = 0;
    result.matches.forEach((match, index) => {
      if (match.start < cursor || match.start > text.length) return;
      nodes.push(<span key={`plain-${index}`}>{text.slice(cursor, match.start)}</span>);
      const cleared = ignored.has(match.id) || edits[match.id] !== undefined;
      nodes.push(
        <button type="button" key={match.id} onClick={() => selectMatch(match)}
          className={`${styles.segment} ${cleared ? styles.cleared : styles[match.tier]}`}>
          {edits[match.id] ?? text.slice(match.start, match.end)}
        </button>,
      );
      cursor = match.end;
    });
    nodes.push(<span key="tail">{text.slice(cursor)}</span>);
    return nodes;
  };

  const progressStep = progress < 28 ? 0 : progress < 55 ? 1 : progress < 82 ? 2 : 3;
  const settingSummary = `${settings.exclude_bibliography ? "Bibliography excluded" : "Bibliography included"}, ${settings.exclude_quotes ? "quotes excluded" : "quotes included"}, ${settings.compare_past_scans ? "past scans compared" : "past scans skipped"}, ${settings.contribute_to_database ? "saved to shared database" : "not saved to database"}`;

  return (
    <section className={styles.shell}>
      {error && <div className={styles.error}>{error}</div>}
      {view === "input" && <div className={styles.card}>
        <h2>Check your document</h2>
        <p className={styles.sub}>Upload a file or paste text below. We&apos;ll check it against the open web and academic sources.</p>
        <input ref={fileInput} type="file" hidden accept=".pdf,.docx,.txt,.rtf" onChange={(event) => void uploadFile(event.target.files?.[0])}/>
        <div role="button" tabIndex={0} className={`${styles.dropzone} ${dragging ? styles.dragging : ""}`}
          onClick={() => fileInput.current?.click()} onKeyDown={(event) => event.key === "Enter" && fileInput.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); void uploadFile(event.dataTransfer.files?.[0]); }}>
          <FiUpload className={styles.dropIcon}/><br/>
          {uploading ? "Extracting document…" : <>Drag and drop a .docx, .pdf, .txt or .rtf file, or <span className={styles.browse}>browse your computer</span></>}
        </div>
        <textarea className={styles.textarea} value={text} onChange={(event) => { setText(event.target.value); if (title !== "Pasted text") setTitle("Pasted text"); }} placeholder="Paste your essay, assignment, or research paper here…"/>
        <button type="button" className={`${styles.settingsButton} ${settingsOpen ? styles.open : ""}`} onClick={() => setSettingsOpen(!settingsOpen)}>
          <FiSettings/> Scan settings <span className={styles.settingsSummary}>{settingSummary}</span><span className={styles.chevron}>⌄</span>
        </button>
        {settingsOpen && <div className={styles.settingsBody}>
          {([
            ["exclude_bibliography", "Exclude references and bibliography", "Don&apos;t check the citation list at the end of your paper."],
            ["exclude_quotes", "Exclude direct quotes", "Skip text inside quotation marks."],
            ["compare_past_scans", "Compare against my past scans", "Detect overlap with drafts you checked before."],
            ["contribute_to_database", "Contribute this paper to ScholarlyHelp&apos;s database", "Opt in to future shared-database matching."],
          ] as const).map(([key, label, description]) => <div className={styles.toggleRow} key={key}><div><div className={styles.label}>{label}</div><div className={styles.desc} dangerouslySetInnerHTML={{ __html: description }}/>{key === "contribute_to_database" && <div className={styles.note}>Off by default. Raw paper text is not stored by ScholarlyHelp.</div>}</div><label className={styles.switch}><input type="checkbox" checked={settings[key]} onChange={() => updateSetting(key)}/><span className={styles.slider}/></label></div>)}
        </div>}
        <div className={styles.meta}>{words.toLocaleString()} / {MAX_WORDS.toLocaleString()} words · {title}</div>
        <button className={styles.scanButton} disabled={uploading || words < 20 || words > MAX_WORDS} onClick={() => void runScan(text)}>Check for plagiarism</button>
      </div>}

      {view === "progress" && <div className={styles.progressCard}>
        <h2>Scanning &quot;{title}&quot;</h2><div className={styles.track}><div className={styles.fill} style={{ width: `${Math.max(4, progress)}%` }}/></div>
        <div className={styles.steps}>{["Checking web index", "Cross-referencing academic sources", "Running similarity analysis", "Consolidating sources"].map((label, index) => <div key={label} className={`${styles.step} ${index < progressStep ? styles.done : index === progressStep ? styles.active : ""}`}>{index < progressStep ? "✓ " : ""}{label}</div>)}</div>
      </div>}

      {view === "results" && result && <>
        {scan?.revision && revisionVisible && <div className={styles.banner}><span><b>Revision detected.</b> This document overlaps {scan.revision.similarity_percent}% with &quot;{scan.revision.title}&quot;.</span><button className={styles.smallButton} onClick={() => { setRevisionVisible(false); addLog("Excluded the previous draft comparison"); }}>Exclude past draft</button></div>}
        {dirty && <div className={styles.banner}><span>You&apos;ve made changes. Recheck to update your score.</span><button className={`${styles.smallButton} ${styles.brand}`} onClick={rescan}><FiRefreshCw/> Recheck now</button></div>}
        <div className={styles.settingsLine}><button className={styles.linkButton} onClick={() => setSettingsUsedOpen(!settingsUsedOpen)}>⚙ Scan settings used ⌄</button>{settingsUsedOpen && <div className={styles.settingsChips}>{settingSummary.split(", ").map((item) => <span key={item} className={styles.settingsChip}>{item}</span>)}</div>}</div>
        <div className={styles.toolbar}><div className={styles.chipRow}><button className={`${styles.chip} ${filter === "all" ? styles.selected : ""}`} onClick={() => setFilter("all")}>All text</button><button className={`${styles.chip} ${filter === "flagged" ? styles.selected : ""}`} onClick={() => setFilter("flagged")}>Flagged only</button></div><button className={styles.linkButton} onClick={() => setSideView("log")}>View activity log</button></div>
        {filter === "flagged" && <div className={styles.copyPanel}><div className={styles.copyHead}><span>Showing: flagged text · {activeMatches.length} passages</span><button className={`${styles.smallButton} ${styles.brand}`} onClick={() => void copyMatches()}>Copy all</button></div><div className={styles.copyBody}>{activeMatches.map((match) => <details className={styles.copyItem} key={match.id}><summary className={styles.copyPreview}>{(edits[match.id] ?? match.text).slice(0, 90)}{match.text.length > 90 ? "…" : ""}</summary><p className={styles.copyFull}>{edits[match.id] ?? match.text}</p><div className={styles.sourceMeta}>{match.percent_similar}% match · {match.tier_label}</div><button className={`${styles.smallButton} ${styles.brand}`} onClick={() => selectMatch(match)}>Open in editor</button></details>)}</div></div>}
        <div className={styles.layout}><div className={styles.docPanel}><div className={styles.hint}>💡 Click any highlighted passage for details. Sources appear on the right.</div><div className={styles.docText}>{renderDocument()}</div></div><aside>
          {sideView === "overview" && <><div className={`${styles.sideCard} ${styles.scoreCard}`}><div className={styles.scoreLabel}>Overall similarity</div><div className={styles.score}>{visibleScore}%</div><div className={styles.scoreSub}>{visibleScore < 15 ? "Low similarity" : visibleScore < 35 ? "Review recommended" : "Needs attention"} · Quetext similarity score</div><div className={styles.breakdown}>{[["Likely copied", result.breakdown.copied, styles.dotHigh], ["Likely paraphrased", result.breakdown.paraphrased, styles.dotMedium], ["Common phrasing", result.breakdown.common, styles.dotLow]].map(([label, value, dot]) => <div className={styles.breakdownRow} key={String(label)}><span className={styles.breakdownLabel}><span className={`${styles.dot} ${dot}`}/>{label}</span><span>{value}%</span></div>)}<div className={styles.breakdownRow}><span className={styles.breakdownLabel}><span className={`${styles.dot} ${styles.dotCited}`}/>Quotes/references</span><span>{settings.exclude_quotes || settings.exclude_bibliography ? "Excluded" : "Included"}</span></div></div></div>
          <div className={styles.sideCard}><div className={styles.cardTitle}>Sources</div>{result.sources.length ? result.sources.map((source, index) => <div className={styles.sourceCard} key={source.id || source.url}><div className={styles.sourceTop}><span>{index + 1}&nbsp; <a className={styles.external} href={source.url} target="_blank" rel="noopener noreferrer">{source.domain}<FiExternalLink style={{display:"inline"}}/></a></span><span>{Math.round(source.percent)}%</span></div><div className={styles.sourceMeta}>{source.match_count} matching passage{source.match_count === 1 ? "" : "s"}</div></div>) : <div className={styles.empty}>No matching source URLs found.</div>}</div>
          <div className={styles.sideCard}><button className={`${styles.smallButton} ${styles.fullButton}`} disabled={downloading || dirty} onClick={() => void download()}><FiDownload/> {downloading ? "Preparing report…" : "Download report"}</button><button className={`${styles.smallButton} ${styles.fullButton}`} onClick={() => { void navigator.clipboard.writeText(window.location.href); toast.success("Private tool link copied."); }}>🔗 Share tool link</button><button className={`${styles.smallButton} ${styles.fullButton}`} onClick={() => void reset()}>New scan</button></div></>}
          {sideView === "focus" && focused && <div className={styles.sideCard}><button className={styles.back} onClick={() => setSideView("overview")}>← Back to overview</button><div className={styles.focusLabel}>Selected passage</div><div className={styles.focusBox}>{focused.text}</div><div className={`${styles.badge} ${focused.tier === "high" ? styles.badgeHigh : focused.tier === "medium" ? styles.badgeMedium : styles.badgeLow}`}>{focused.percent_similar}% match · {focused.tier_label}</div>{focused.source?.url && <div className={styles.sourceMeta}>Source: <a className={styles.external} href={focused.source.url} target="_blank" rel="noopener noreferrer">{focused.source.url}</a></div>}<div className={styles.focusLabel} style={{marginTop:12}}>Rewrite passage</div><textarea className={styles.rewrite} rows={4} value={rewrite} onChange={(event) => setRewrite(event.target.value)}/><button className={`${styles.smallButton} ${styles.brand} ${styles.fullButton}`} onClick={applyRewrite}>Apply rewrite to document</button><button className={`${styles.smallButton} ${styles.fullButton}`} onClick={() => setSideView("ignore")}>× Exclude match</button></div>}
          {sideView === "ignore" && focused && <div className={styles.sideCard}><button className={styles.back} onClick={() => setSideView("focus")}>← Back</button><div className={styles.cardTitle}>Why are you excluding this match?</div><label className={styles.radio}><input type="radio" checked={ignoreReason === "common"} onChange={() => setIgnoreReason("common")}/>Common or generic phrasing</label><label className={styles.radio}><input type="radio" checked={ignoreReason === "own"} onChange={() => setIgnoreReason("own")}/>This is my own previously published work</label><button className={`${styles.smallButton} ${styles.filled} ${styles.fullButton}`} onClick={ignoreMatch}>Submit and recalculate</button></div>}
          {sideView === "log" && <div className={styles.sideCard}><button className={styles.back} onClick={() => setSideView("overview")}>← Back to overview</button><div className={styles.cardTitle}>Activity log</div>{log.length ? log.map((entry) => <div className={styles.logEntry} key={entry}>{entry}</div>) : <div className={styles.empty}>No activity yet.</div>}</div>}
        </aside></div>
      </>}
    </section>
  );
}
