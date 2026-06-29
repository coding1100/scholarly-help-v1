"use client";

import { ComponentType, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiFolderPlus,
  FiLink,
  FiLoader,
  FiMic,
  FiMonitor,
} from "react-icons/fi";
import {
  addStudySource,
  addStudySourceFile,
  StudySourceKind,
  updateStudySessionTitle,
} from "@/app/utils/studyApiClient";
import { startStudyRecording } from "@/app/lib/client/studyRecording";
import { validateStudyUploadFileClient } from "@/app/lib/studyUploadConstraints";

type UploadMode = "file" | "url" | "text" | "record";
type InlineTone = "success" | "error" | "info";
type InlineStatus = { tone: InlineTone; message: string };

const UPLOAD_OPTIONS: Array<{
  value: UploadMode;
  label: string;
  subLabel: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "file", label: "File", subLabel: "Upload File", icon: FiFolderPlus },
  { value: "url", label: "Link", subLabel: "Paste a Link", icon: FiLink },
  { value: "text", label: "Text", subLabel: "Paste some Text", icon: FiFolderPlus },
  // "Record" intentionally hidden per product feedback — the recording flow code
  // remains below but is not offered as a source option.
];

/**
 * Build a unique source name for an uploaded file. Keeps the original base name
 * for readability and appends a short unique token (timestamp + random) so two
 * uploads with the same filename never collide.
 */
function uniqueFileSourceName(fileName?: string): string {
  const fallback = "Uploaded File";
  const raw = (fileName || "").trim();
  const dot = raw.lastIndexOf(".");
  const hasExt = dot > 0;
  const base = (hasExt ? raw.slice(0, dot) : raw).trim() || fallback;
  const ext = hasExt ? raw.slice(dot) : "";
  const token = `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  return `${base} (${token})${ext}`;
}

type StudySourceIngestionProps = {
  variant?: "toolbar" | "onboarding";
  onContentReady?: () => void;
};

export default function StudySourceIngestion({
  variant = "toolbar",
  onContentReady,
}: StudySourceIngestionProps) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [mode, setMode] = useState<UploadMode>("file");
  const [kind, setKind] = useState<StudySourceKind>("file");
  const [name, setName] = useState("");
  // "Name your session" (onboarding only). Applied to the active session the
  // first time the guest adds a source, so naming happens once at creation.
  const [sessionName, setSessionName] = useState("");
  const [text, setText] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState<"microphone" | "browser-tab">(
    "microphone",
  );
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [statusByMode, setStatusByMode] = useState<Record<UploadMode, InlineStatus | null>>({
    file: null,
    url: null,
    text: null,
    record: null,
  });

  const textLength = useMemo(() => text.trim().length, [text]);

  const isSourceLoading = isSubmitting || isStartingRecording;

  const setModeStatus = (targetMode: UploadMode, status: InlineStatus | null) => {
    setStatusByMode((prev) => ({ ...prev, [targetMode]: status }));
  };

  // Return to the creation/welcome view without destroying the current session.
  // The page owns the onboarding-vs-workspace decision, so we signal it via an
  // event rather than mutating session content here.
  const goBackToStart = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("study-back-to-start"));
    }
  };

  // Apply the onboarding "Name your session" value to the active session. Runs
  // once, when the guest adds their first source. Best-effort: a naming failure
  // must never block the source from being saved, so errors are swallowed.
  const applySessionNameIfProvided = async () => {
    const nextTitle = sessionName.trim();
    if (!nextTitle || !sessionId) return;
    try {
      await updateStudySessionTitle(sessionId, nextTitle.slice(0, 80));
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("study-session-changed", { detail: { sessionId } }),
        );
      }
    } catch (error) {
      console.error("Failed to apply session name", error);
    }
  };

  const startRecordingFlow = async () => {
    setModeStatus("record", null);
    if (!sessionId) {
      toast.error("Session is still loading. Please wait.");
      setModeStatus("record", {
        tone: "error",
        message: "Session is still loading. Please wait.",
      });
      return;
    }
    setIsStartingRecording(true);
    try {
      await startStudyRecording(recordType);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("study-recording-started", {
            detail: { sessionId, mode: recordType },
          }),
        );
      }
      onContentReady?.();
      setModeStatus("record", {
        tone: "success",
        message:
          recordType === "microphone"
            ? "Microphone recording started"
            : "Browser tab recording started",
      });
      toast.success(
        recordType === "microphone"
          ? "Microphone recording started"
          : "Browser tab recording started",
      );
    } catch (error) {
      console.error("Failed to start recording", error);
      const message =
        error instanceof Error ? error.message : "Could not start recording";
      toast.error(message);
      setModeStatus("record", { tone: "error", message });
    } finally {
      setIsStartingRecording(false);
    }
  };

  useEffect(() => {
    const rawName =
      typeof window !== "undefined" ? localStorage.getItem("user_name") : null;
    if (!rawName) {
      setDisplayName("");
      return;
    }
    setDisplayName(rawName.charAt(0).toUpperCase() + rawName.slice(1));
  }, []);

  const onSubmit = async (payloadOverride?: {
    nextKind?: StudySourceKind;
    nextName?: string;
    nextText?: string;
    nextFile?: File | null;
  }) => {
    const nextKind = payloadOverride?.nextKind || kind;
    const activeMode: UploadMode =
      nextKind === "url" ? "url" : nextKind === "text" ? "text" : "file";
    setModeStatus(activeMode, null);
    if (!sessionId) {
      toast.error("Session is still loading. Please retry in a moment.");
      setModeStatus(activeMode, {
        tone: "error",
        message: "Session is still loading. Please retry in a moment.",
      });
      return;
    }

    const nextNameRaw = payloadOverride?.nextName ?? name;
    const nextTextRaw = payloadOverride?.nextText ?? text;
    const nextFile = payloadOverride?.nextFile ?? file;
    const trimmedName = nextNameRaw.trim();
    const trimmedText = nextTextRaw.trim();

    if (nextKind === "file" && !nextFile) {
      toast.error("Please choose a .pdf, .txt, .doc, or .docx file (under 10 MB).");
      setModeStatus("file", {
        tone: "error",
        message: "Please choose a .pdf, .txt, .doc, or .docx file (under 10 MB).",
      });
      return;
    }
    if (nextKind === "file" && nextFile) {
      const fileErr = validateStudyUploadFileClient(nextFile);
      if (fileErr) {
        toast.error(fileErr);
        setModeStatus("file", { tone: "error", message: fileErr });
        return;
      }
    }
    if (nextKind !== "file" && nextKind !== "url" && !trimmedText) {
      toast.error("Source text is required.");
      setModeStatus("text", { tone: "error", message: "Source text is required." });
      return;
    }
    if (nextKind === "url" && !trimmedName) {
      toast.error("Source link is required.");
      setModeStatus("url", { tone: "error", message: "Source link is required." });
      return;
    }

    // The per-file title field was removed from the creation page, so files are
    // named automatically. Give every file a UNIQUE name by suffixing the base
    // filename with a short timestamp/random token, so re-uploading the same
    // file (or two files sharing a name) never collides.
    const resolvedName =
      trimmedName ||
      (nextKind === "file"
        ? uniqueFileSourceName(nextFile?.name)
        : nextKind === "text"
          ? "Pasted Text"
          : nextKind === "url"
            ? trimmedName || "Website Link"
            : "Source");

    setIsSubmitting(true);
    try {
      const source =
        nextKind === "file" && nextFile
          ? await addStudySourceFile(sessionId, {
              kind: nextKind,
              name: resolvedName,
              file: nextFile,
            })
          : await addStudySource(sessionId, {
              kind: nextKind,
              name: resolvedName,
              text: trimmedText,
            });

      toast.success(
        `Source added: ${source.name} (${source.chunkCount} chunks indexed)`,
      );
      setModeStatus(activeMode, {
        tone: "success",
        message: `Saved "${source.name}" successfully (${source.chunkCount} chunks indexed).`,
      });
      // Name the session once, at creation, before revealing the workspace.
      await applySessionNameIfProvided();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("study-source-added", { detail: { sessionId } }),
        );
      }
      onContentReady?.();
    } catch (error) {
      console.error("Failed to add source", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save source. Please try again.";
      toast.error(message);
      setModeStatus(activeMode, {
        tone: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompact = variant === "onboarding";

  const uploadForm = (
    <div className={`mx-auto ${isCompact ? "" : "rounded-[16px] bg-white p-4 sm:p-5"}`}>
      {isCompact ? (
        <div className="mb-3">
          <label
            htmlFor="study-session-name"
            className="mb-1 block text-sm font-semibold text-[#38405f]"
          >
            Name your session
          </label>
          <input
            id="study-session-name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            maxLength={80}
            placeholder="e.g. Biology Ch. 7 — Cellular Respiration"
            className="w-full rounded-lg border border-[#d6d9f8] bg-white px-3 py-2 text-sm text-[#1d2435] outline-none transition focus:border-[#6572ff] focus:ring-2 focus:ring-[#c9cffb] placeholder:text-[#a2a7bc]"
          />
        </div>
      ) : null}
      <p className={`text-center text-[#38405f] ${isCompact ? "text-sm" : "text-base"}`}>
        Select Option
      </p>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 ${isCompact ? "mt-1.5 gap-1.5" : "mt-3 gap-2"}`}
      >
        {UPLOAD_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = mode === option.value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={isSourceLoading}
              onClick={() => {
                setMode(option.value);
                if (option.value === "file") setKind("file");
                if (option.value === "url") setKind("url");
                if (option.value === "text") setKind("text");
                if (option.value === "record") setKind("youtube");
              }}
              className={`rounded-[12px] border text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isCompact ? "p-1.5" : "rounded-[16px] p-2"
              } ${
                active
                  ? "border-[#c7b8ff] bg-[#f1ecff]"
                  : "border-[#ddd4ff] bg-[#f7f6ff]"
              }`}
            >
              <div
                className={`mx-auto inline-flex items-center justify-center rounded-lg bg-[#dfe2ff] text-[#7180ff] ${
                  isCompact ? "h-7 w-7" : "h-9 w-9"
                }`}
              >
                <Icon className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"} />
              </div>
              <p
                className={`font-semibold text-[#5f70ff] ${
                  isCompact ? "mt-1 text-sm" : "mt-1.5 text-base"
                }`}
              >
                {option.label}
              </p>
              <p className={`text-[#6c74a5] ${isCompact ? "text-[10px]" : "mt-0.5 text-[11px]"}`}>
                {option.subLabel}
              </p>
            </button>
          );
        })}
      </div>

      <div
        className={`relative rounded-[14px] border border-[#7f7fff] bg-[#f1ecff] ${
          isCompact ? "mt-2 p-2" : "mt-4 p-3"
        }`}
      >
        {isSourceLoading ? (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-[14px] bg-[#f8f7ff]/92 backdrop-blur-[2px]"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Loading"
          >
            <FiLoader className="h-9 w-9 animate-spin text-[#5f70ff]" />
          </div>
        ) : null}
        {mode === "file" ? (
          <div className={isCompact ? "space-y-1.5" : "space-y-2"}>
            <label
              className={`flex w-full items-center justify-between gap-2 rounded-lg border border-[#d6d9f8] bg-white ${
                isCompact ? "px-2 py-1.5" : "gap-3 rounded-xl px-3 py-2"
              }`}
            >
              <span
                className={`inline-flex shrink-0 items-center rounded-md border border-[#b8bde9] bg-[#f3f5ff] font-medium text-[#3f4aa0] transition hover:bg-[#e8ecff] ${
                  isCompact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
                }`}
              >
                Choose file
              </span>
              <span className="min-w-0 truncate text-xs text-[#6a6f98] sm:text-sm">
                {file ? file.name : "No file chosen"}
              </span>
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="sr-only"
              />
            </label>
            <button
              type="button"
              onClick={() => onSubmit({ nextKind: "file", nextFile: file })}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              aria-label={isSubmitting ? "Loading" : "Upload File"}
              className={`inline-flex w-full items-center justify-center rounded-lg bg-[#5f70ff] text-sm font-semibold text-white disabled:opacity-60 ${
                isCompact ? "min-h-[34px] py-1.5" : "min-h-[40px] py-2"
              }`}
            >
              {isSubmitting ? (
                <FiLoader className="h-5 w-5 shrink-0 animate-spin" />
              ) : (
                "Upload File"
              )}
            </button>
            {!isCompact ? (
              <div className="mt-1 flex items-center justify-between text-sm text-[#5f6588]">
                <span>
                  {file
                    ? `${file.name} (${Math.ceil(file.size / 1024)} KB)`
                    : "No file selected"}
                </span>
                {statusByMode.file ? (
                  <span
                    className={
                      statusByMode.file.tone === "success"
                        ? "text-emerald-600"
                        : statusByMode.file.tone === "error"
                          ? "text-red-600"
                          : "text-blue-600"
                    }
                  >
                    {statusByMode.file.message}
                  </span>
                ) : null}
              </div>
            ) : statusByMode.file ? (
              <p
                className={`truncate text-xs ${
                  statusByMode.file.tone === "success"
                    ? "text-emerald-600"
                    : statusByMode.file.tone === "error"
                      ? "text-red-600"
                      : "text-blue-600"
                }`}
              >
                {statusByMode.file.message}
              </p>
            ) : null}
          </div>
        ) : null}

        {mode === "url" ? (
          <div className="space-y-2">
            <div className="flex gap-2 rounded-xl border border-[#c6cbf7] bg-white p-2">
              <input
                value={urlValue}
                onChange={(e) => {
                  setUrlValue(e.target.value);
                  setName(e.target.value);
                }}
                placeholder="https://"
                className="flex-1 rounded-lg border border-[#e0e2f5] px-3 py-2 text-base outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  onSubmit({
                    nextKind: "url",
                    nextName: urlValue,
                    nextText: "",
                  })
                }
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                aria-label={isSubmitting ? "Loading" : "Add Link"}
                className="inline-flex min-h-[40px] min-w-[120px] items-center justify-center rounded-lg bg-[#5f70ff] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmitting ? (
                  <FiLoader className="h-5 w-5 shrink-0 animate-spin" />
                ) : (
                  "Add Link"
                )}
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-[#5f6588]">
              <span>{urlValue.trim().length} URL characters</span>
              {statusByMode.url ? (
                <span
                  className={
                    statusByMode.url.tone === "success"
                      ? "text-emerald-600"
                      : statusByMode.url.tone === "error"
                        ? "text-red-600"
                        : "text-blue-600"
                  }
                >
                  {statusByMode.url.message}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {mode === "text" ? (
          <div className={isCompact ? "space-y-1.5" : "space-y-2"}>
            <div
              className={`flex gap-2 rounded-xl border border-[#c6cbf7] bg-[#d7d2ed] ${
                isCompact ? "p-1.5" : "p-2"
              }`}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={isCompact ? 2 : 4}
                placeholder="Paste text"
                className="flex-1 resize-none rounded-lg border border-[#d3d6f2] bg-white px-3 py-2 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  onSubmit({
                    nextKind: "text",
                    nextName: name || "Pasted Text",
                    nextText: text,
                  })
                }
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                aria-label={isSubmitting ? "Loading" : "Submit"}
                className="inline-flex h-fit min-h-[40px] min-w-[88px] shrink-0 items-center justify-center self-end rounded-lg bg-[#5f70ff] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmitting ? (
                  <FiLoader className="h-5 w-5 shrink-0 animate-spin" />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-[#5f6588]">
              <span>{textLength} characters</span>
              {statusByMode.text ? (
                <span
                  className={
                    statusByMode.text.tone === "success"
                      ? "text-emerald-600"
                      : statusByMode.text.tone === "error"
                        ? "text-red-600"
                        : "text-blue-600"
                  }
                >
                  {statusByMode.text.message}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {mode === "record" ? (
          <div
            className={`rounded-[14px] border border-[#7a86ff] bg-[#d7d9ef] text-center ${
              isCompact ? "p-2.5" : "p-4"
            }`}
          >
            <p className={`font-semibold text-[#3b4257] ${isCompact ? "text-base" : "text-xl"}`}>
              Choose Recording Type
            </p>
            <div
              className={`mx-auto grid max-w-[420px] grid-cols-2 gap-2 ${
                isCompact ? "mt-2" : "mt-4"
              }`}
            >
              <button
                type="button"
                onClick={() => setRecordType("microphone")}
                className={`rounded-xl border p-3 ${
                  recordType === "microphone"
                    ? "border-[#2f79ff] bg-[#eef3ff] shadow-[0_0_0_1px_rgba(47,121,255,0.25)]"
                    : "border-transparent bg-transparent text-[#4f566d]"
                }`}
              >
                <FiMic className="mx-auto h-5 w-5 text-[#4a4d61]" />
                <p className="mt-1.5 text-md font-semibold text-[#191f33]">Microphone</p>
              </button>
              <button
                type="button"
                onClick={() => setRecordType("browser-tab")}
                className={`rounded-xl border p-3 ${
                  recordType === "browser-tab"
                    ? "border-[#2f79ff] bg-[#eef3ff] shadow-[0_0_0_1px_rgba(47,121,255,0.25)]"
                    : "border-transparent bg-transparent text-[#4f566d]"
                }`}
              >
                <FiMonitor className="mx-auto h-5 w-5 text-[#4a4d61]" />
                <p className="mt-1.5 text-md font-semibold text-[#191f33]">Browser Tab</p>
              </button>
            </div>
            {!isCompact ? (
              <p className="mx-auto mt-4 max-w-xl text-md text-[#596178]">
                Record audio from your microphone with live transcription
              </p>
            ) : null}
            <button
              type="button"
              onClick={startRecordingFlow}
              disabled={isStartingRecording}
              aria-busy={isStartingRecording}
              aria-label={isStartingRecording ? "Loading" : "Start Recording"}
              className={`inline-flex items-center justify-center rounded-lg bg-[#6678f6] font-semibold text-white disabled:opacity-60 ${
                isCompact
                  ? "mt-2 min-h-[36px] min-w-[140px] px-6 py-1.5 text-sm"
                  : "mt-4 min-h-[44px] min-w-[160px] px-8 py-2 text-base"
              }`}
            >
              {isStartingRecording ? (
                <FiLoader className="h-6 w-6 shrink-0 animate-spin" />
              ) : (
                "Start Recording"
              )}
            </button>
            <div className="mt-2 flex items-center justify-between text-sm text-[#5f6588]">
              <span>
                Selected: {recordType === "microphone" ? "Microphone" : "Browser Tab"}
              </span>
              {statusByMode.record ? (
                <span
                  className={
                    statusByMode.record.tone === "success"
                      ? "text-emerald-600"
                      : statusByMode.record.tone === "error"
                        ? "text-red-600"
                        : "text-blue-600"
                  }
                >
                  {statusByMode.record.message}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

    </div>
  );

  // Top toolbar is intentionally minimal: a single "Back to start" control.
  // Session naming happens once at creation, and switching/creating sessions
  // lives in the sidebar — so the in-workspace header stays uncluttered.
  const sessionToolbar = (
    <section className="w-full px-3 pt-3 sm:px-5">
      <div className="flex items-center">
        <button
          type="button"
          onClick={goBackToStart}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d6dbff] bg-white px-3 py-2 text-sm font-semibold text-[#4b57b8] transition hover:bg-[#f3f5ff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9cffb]"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to start
        </button>
      </div>
    </section>
  );

  if (variant === "onboarding") {
    return (
      <>
        <section className="flex w-full flex-col px-2 py-6 sm:px-4 sm:py-10">
          <div className="flex w-full items-center justify-center">
            <div className="w-full max-w-[640px]">
              <div className="mb-3 px-2 text-center sm:mb-4">
                <h1 className="text-[22px] font-bold leading-tight tracking-tight text-[#1a2033] sm:text-[28px] lg:text-[32px]">
                  Welcome to AI Study Workspace
                  {displayName ? `, ${displayName}` : ""}
                </h1>
                <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#64748b] sm:text-sm">
                  Let&apos;s create your first study session together, select an option
                  below to get started.
                </p>
              </div>
              <div className="rounded-[28px] bg-white p-3 shadow-[0_8px_40px_rgba(15,23,42,0.06)] sm:rounded-[36px] sm:p-4">
                {uploadForm}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return <>{sessionToolbar}</>;
}
