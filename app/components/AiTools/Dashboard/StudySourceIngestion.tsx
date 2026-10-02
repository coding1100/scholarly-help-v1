"use client";

import { ComponentType, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCheck,
  FiFileText,
  FiFolderPlus,
  FiLink,
  FiLoader,
  FiMic,
  FiMonitor,
} from "react-icons/fi";
import {
  EXPERT_WHATSAPP_HREF,
  trackExpertWhatsAppClick,
} from "./ExpertHelpCard";
import {
  addStudySource,
  addStudySourceFile,
  createStudySession,
  deleteStudySession,
  setActiveStudySessionId,
  StudySourceKind,
  trackStudySessionCreated,
} from "@/app/utils/studyApiClient";
import { startStudyRecording } from "@/app/lib/client/studyRecording";
import { validateStudyUploadFileClient } from "@/app/lib/studyUploadConstraints";
import { incrementGuestSessionCount, isGuest } from "@/app/lib/client/guestStudyLimits";

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

/**
 * Auto-generate a session title from the first source, so the onboarding card
 * no longer needs a "Name your session" field. Derives something readable from
 * whatever the user actually supplied (file name, link host, or pasted text).
 */
function autoSessionTitle(
  nextKind: StudySourceKind,
  nextFile: File | null,
  trimmedName: string,
  trimmedText: string,
): string {
  if (nextKind === "file" && nextFile) {
    const raw = nextFile.name.trim();
    const dot = raw.lastIndexOf(".");
    const base = (dot > 0 ? raw.slice(0, dot) : raw).trim();
    return base.slice(0, 80) || "My Study Session";
  }
  if (nextKind === "url" && trimmedName) {
    try {
      return new URL(trimmedName).hostname.replace(/^www\./, "");
    } catch {
      return trimmedName.slice(0, 80);
    }
  }
  if (trimmedText) {
    return trimmedText.slice(0, 60).trim() || "Pasted Text";
  }
  return "My Study Session";
}

type StudySourceIngestionProps = {
  variant?: "toolbar" | "onboarding";
  experience?: "study" | "tutor";
  onContentReady?: () => void;
  /**
   * Called with the id of a session that was just created lazily (on the user's
   * first successful source add) so the page can adopt it — put it in the URL,
   * mark it active, and reveal the workspace.
   */
  onSessionCreated?: (sessionId: string) => void;
};

export default function StudySourceIngestion({
  variant = "toolbar",
  experience = "study",
  onContentReady,
  onSessionCreated,
}: StudySourceIngestionProps) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [mode, setMode] = useState<UploadMode>("file");
  const [kind, setKind] = useState<StudySourceKind>("file");
  const [name, setName] = useState("");
  // Onboarding (creation page) vs the in-workspace toolbar variant.
  const isCompact = variant === "onboarding";
  const [text, setText] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState<"microphone" | "browser-tab">(
    "microphone",
  );
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [showToolbarUpload, setShowToolbarUpload] = useState(false);
  const [onboardingTab, setOnboardingTab] = useState<"file" | "text">("file");
  const [isDragging, setIsDragging] = useState(false);
  const [statusByMode, setStatusByMode] = useState<Record<UploadMode, InlineStatus | null>>({
    file: null,
    url: null,
    text: null,
    record: null,
  });

  const textLength = useMemo(() => text.trim().length, [text]);

  const startChatWithoutMaterial = async () => {
    if (!onSessionCreated) return;
    setIsStartingChat(true);
    try {
      const created = await createStudySession("Open tutor chat");
      if (isGuest()) incrementGuestSessionCount();
      onSessionCreated(created._id);
    } catch (error) {
      console.error("Failed to start tutor chat", error);
      toast.error("Could not start a tutor chat");
    } finally {
      setIsStartingChat(false);
    }
  };

  const isSourceLoading = isSubmitting || isStartingRecording;

  // Submit buttons stay DISABLED until the user has actually supplied what the
  // submission needs. Previously they were always clickable, so a click with an
  // empty form ran onSubmit, failed validation, and showed an error toast — and
  // (before the lazy-create fix) still tripped analytics. Gating the button means
  // the create-session + add-source path can only ever start from a valid form.
  //
  // A chosen-but-invalid file (wrong type / too large) must ALSO keep the button
  // disabled — otherwise clicking it just produces the error toast we're trying
  // to eliminate. Surface the reason inline instead.
  const fileError = useMemo(
    () => (file ? validateStudyUploadFileClient(file) : null),
    [file],
  );
  const canSubmitFile = !!file && !fileError;
  const canSubmitUrl = urlValue.trim().length > 0;
  const canSubmitText = textLength > 0;

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
      setShowToolbarUpload(false);
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
    // NOTE: a missing sessionId is NOT an error here. The session is created
    // lazily below, only once this submission has passed validation — visiting
    // the page must not create one.

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
    // Track a session we create in THIS submission, so a failed source add can
    // roll it back instead of leaving an empty orphan session behind.
    let createdSessionId: string | null = null;
    try {
      // Create the session on first real intent (a validated source), not on
      // page load. The title is auto-generated from whatever was supplied
      // (file name / link host / pasted text) since there's no name field.
      let targetSessionId = sessionId;
      if (!targetSessionId) {
        const created = await createStudySession(
          autoSessionTitle(nextKind, nextFile, trimmedName, trimmedText),
        );
        targetSessionId = created._id;
        createdSessionId = created._id;
        if (isGuest()) incrementGuestSessionCount();
        setActiveStudySessionId(created._id);
      }

      const source =
        nextKind === "file" && nextFile
          ? await addStudySourceFile(targetSessionId, {
              kind: nextKind,
              name: resolvedName,
              file: nextFile,
            })
          : await addStudySource(targetSessionId, {
              kind: nextKind,
              name: resolvedName,
              text: trimmedText,
            });

      // Past this point the source is genuinely saved (addStudySource* throws
      // otherwise), so the session truly exists with content.
      toast.success(
        `Source added: ${source.name} (${source.chunkCount} chunks indexed)`,
      );
      setModeStatus(activeMode, {
        tone: "success",
        message: `Saved "${source.name}" successfully (${source.chunkCount} chunks indexed).`,
      });
      // Fire the GTM event ONLY here: the session was created in this
      // submission AND its first source saved successfully. Never on an error
      // path, and never for a session that gets rolled back below.
      if (createdSessionId) {
        trackStudySessionCreated({
          sessionId: createdSessionId,
          sourceKind: nextKind,
        });
      }
      // Hand a lazily-created session to the page so it lands in the URL and the
      // workspace mounts against it.
      if (createdSessionId) {
        onSessionCreated?.(createdSessionId);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("study-source-added", {
            detail: { sessionId: targetSessionId },
          }),
        );
      }
      onContentReady?.();
      setShowToolbarUpload(false);
    } catch (error) {
      console.error("Failed to add source", error);
      // The source failed, so the session we just created for it has no content
      // and no reason to exist. Remove it (best-effort) so the user isn't left
      // with an empty session — and so a retry starts clean.
      if (createdSessionId) {
        try {
          await deleteStudySession(createdSessionId);
        } catch (cleanupError) {
          console.error("Failed to roll back empty session", cleanupError);
        }
      }
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

  const uploadForm = (
    <div className={`mx-auto ${isCompact ? "" : "rounded-[16px] bg-white p-4 sm:p-5"}`}>
      <p className={`text-center text-[#38405f] ${isCompact ? "text-sm" : "text-base"}`}>
        Select Option
      </p>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 ${isCompact ? "mt-3 gap-3" : "mt-3 gap-2"}`}
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
              className={`rounded-[16px] border text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isCompact ? "p-3" : "p-2"
              } ${
                active
                  ? "border-[#c7b8ff] bg-[#f1ecff]"
                  : "border-[#ddd4ff] bg-[#f7f6ff]"
              }`}
            >
              <div
                className={`mx-auto inline-flex items-center justify-center rounded-lg bg-[#dfe2ff] text-[#7180ff] ${
                  isCompact ? "h-9 w-9" : "h-9 w-9"
                }`}
              >
                <Icon className={isCompact ? "h-4 w-4" : "h-4 w-4"} />
              </div>
              <p
                className={`font-semibold text-[#5f70ff] ${
                  isCompact ? "mt-1.5 text-base" : "mt-1.5 text-base"
                }`}
              >
                {option.label}
              </p>
              <p className={`text-[#6c74a5] ${isCompact ? "text-xs" : "mt-0.5 text-[11px]"}`}>
                {option.subLabel}
              </p>
            </button>
          );
        })}
      </div>

      <div
        className={`relative rounded-[20px] border border-[#7f7fff] bg-[#f1ecff] ${
          isCompact ? "mt-4 flex min-h-[260px] flex-col p-4" : "mt-4 p-3"
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
          <div
            className={isCompact ? "flex flex-1 flex-col gap-1.5" : "space-y-2"}
          >
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
              disabled={isSubmitting || !canSubmitFile}
              aria-busy={isSubmitting}
              aria-label={
                isSubmitting
                  ? "Loading"
                  : isCompact
                    ? "Create My Study Pack"
                    : "Upload File"
              }
              title={
                canSubmitFile
                  ? undefined
                  : fileError || "Choose a file first"
              }
              className={`inline-flex w-full items-center justify-center rounded-lg bg-[#5f70ff] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                isCompact
                  ? "mt-auto min-h-[48px] py-3 text-base"
                  : "min-h-[40px] py-2"
              }`}
            >
              {isSubmitting ? (
                <FiLoader className="h-5 w-5 shrink-0 animate-spin" />
              ) : isCompact ? (
                "Create My Study Pack"
              ) : (
                "Upload File"
              )}
            </button>
            {fileError ? (
              <p className="text-xs text-red-600" role="alert">
                {fileError}
              </p>
            ) : null}
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
                disabled={isSubmitting || !canSubmitUrl}
                aria-busy={isSubmitting}
                aria-label={
                  isSubmitting
                    ? "Loading"
                    : isCompact
                      ? "Create My Study Pack"
                      : "Add Link"
                }
                title={!canSubmitUrl ? "Enter a link first" : undefined}
                className="inline-flex min-h-[40px] min-w-[120px] items-center justify-center rounded-lg bg-[#5f70ff] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <FiLoader className="h-5 w-5 shrink-0 animate-spin" />
                ) : isCompact ? (
                  "Create My Study Pack"
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
                disabled={isSubmitting || !canSubmitText}
                aria-busy={isSubmitting}
                aria-label={
                  isSubmitting
                    ? "Loading"
                    : isCompact
                      ? "Create My Study Pack"
                      : "Submit"
                }
                title={!canSubmitText ? "Paste some text first" : undefined}
                className="inline-flex h-fit min-h-[40px] min-w-[88px] shrink-0 items-center justify-center self-end rounded-lg bg-[#5f70ff] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <FiLoader className="h-5 w-5 shrink-0 animate-spin" />
                ) : isCompact ? (
                  "Create My Study Pack"
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
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={goBackToStart}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d6dbff] bg-white px-3 py-2 text-sm font-semibold text-[#4b57b8] transition hover:bg-[#f3f5ff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9cffb]"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to start
        </button>
        <button
          type="button"
          onClick={() => setShowToolbarUpload((value) => !value)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#5f70ff] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#4f60eb]"
        >
          <FiFolderPlus className="h-4 w-4" />
          {showToolbarUpload ? "Close material panel" : "Add course material"}
        </button>
      </div>
    </section>
  );

  if (variant === "onboarding") {
    if (experience === "tutor") {
      return (
        <section className="flex w-full flex-col px-2 py-6 sm:px-4 sm:py-10">
          <div className="flex w-full items-center justify-center">
            <div className="w-full max-w-[640px]">
              <div className="mb-3 px-2 text-center sm:mb-4">
                <h1 className="text-[22px] font-bold leading-tight tracking-tight text-[#1a2033] sm:text-[28px] lg:text-[32px]">
                  Welcome to your AI Tutor
                  {displayName ? `, ${displayName}` : ""}
                </h1>
                <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#64748b] sm:text-sm">
                  Ask anything, or add course material for source-grounded tutoring and personalized practice.
                </p>
              </div>
              <div className="rounded-[28px] bg-white p-3 shadow-[0_8px_40px_rgba(15,23,42,0.06)] sm:rounded-[36px] sm:p-4">
                {uploadForm}
                <div className="mt-3 border-t border-[#eceefa] pt-3 text-center">
                  <button
                    type="button"
                    onClick={startChatWithoutMaterial}
                    disabled={isStartingChat}
                    className="rounded-lg border border-[#cfd5ff] bg-[#f7f8ff] px-4 py-2 text-sm font-semibold text-[#4f5dcc] transition hover:bg-[#eef1ff] disabled:opacity-60"
                  >
                    {isStartingChat ? "Starting chat…" : "Just chat — no material needed"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="flex w-full flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Top Tag Pill */}
        <div className="mb-4 inline-flex items-center rounded-full border border-gray-200/90 bg-white px-4 py-1 text-xs font-medium text-gray-700 shadow-xs sm:text-sm">
          For working professionals earning their degree online
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl lg:text-[40px] leading-tight">
            What are you studying this week?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
            Upload your readings, lecture or assignment. Get notes, flashcards and a quiz, plus a tutor that knows your material.
          </p>
        </div>

        {/* Two-Card Section */}
        <div className="mt-8 grid w-full max-w-[960px] grid-cols-1 items-stretch gap-6 lg:grid-cols-12 text-left">
          {/* Left Card: Upload file / Paste text */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] sm:p-6 lg:col-span-7">
            <div>
              {/* Tab Switcher */}
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-[#F1F3F9] p-1.5">
                <button
                  type="button"
                  onClick={() => setOnboardingTab("file")}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                    onboardingTab === "file"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Upload file
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingTab("text")}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                    onboardingTab === "text"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Paste text
                </button>
              </div>

              {/* Tab Content */}
              {onboardingTab === "file" ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const dropped = e.dataTransfer.files?.[0];
                    if (dropped) setFile(dropped);
                  }}
                  className={`relative flex min-h-[190px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-7 ${
                    isDragging
                      ? "border-[#4F46E5] bg-[#EEF2FF]/40"
                      : "border-[#C7D2FE] bg-white hover:border-[#818CF8]"
                  }`}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                        <FiFileText className="h-6 w-6" />
                      </div>
                      <p className="max-w-[260px] truncate text-sm font-semibold text-gray-900 sm:text-base">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="mt-1 text-xs font-semibold text-red-500 hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 sm:text-base">
                        Drop a PDF, Word doc, slides or a photo of your notes
                      </p>
                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        or{" "}
                        <label className="cursor-pointer font-medium text-[#4F46E5] underline hover:text-[#4338CA]">
                          browse files
                          <input
                            type="file"
                            accept=".pdf,.txt,.doc,.docx,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                            className="sr-only"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                          />
                        </label>
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="min-h-[190px]">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your readings, lecture notes, syllabus, or assignment text here..."
                    rows={6}
                    className="w-full h-[190px] resize-none rounded-2xl border border-gray-200 p-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                  />
                </div>
              )}
            </div>

            {/* Bottom Button */}
            <button
              type="button"
              onClick={() => {
                if (onboardingTab === "file") {
                  if (!file) {
                    toast.error("Please choose or drop a file first.");
                    return;
                  }
                  onSubmit({ nextKind: "file", nextFile: file });
                } else {
                  if (!text.trim()) {
                    toast.error("Please paste some text first.");
                    return;
                  }
                  onSubmit({ nextKind: "text", nextText: text });
                }
              }}
              disabled={isSubmitting || (onboardingTab === "file" ? !file : !text.trim())}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4F46E5] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="h-5 w-5 animate-spin" />
                  <span>Starting study session...</span>
                </>
              ) : (
                <>
                  <span>Start studying</span>
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </div>

          {/* Right Card: Done-for-you Dark Card */}
          <div className="flex flex-col justify-between rounded-3xl bg-[#0F172A] p-6 text-white shadow-[0_4px_30px_rgba(15,23,42,0.15)] sm:p-7 lg:col-span-5">
            <div>
              <span className="mb-4 inline-flex items-center rounded-full bg-[#1E293B] px-3 py-1 text-xs font-semibold text-gray-300">
                Done-for-you
              </span>
              <h2 className="mb-3 text-xl font-bold leading-snug text-white sm:text-2xl">
                No time to study at all this week?
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-400">
                Our experts can take a class off your plate so you keep your GPA, and your evenings.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-300 sm:text-sm">
                <FiCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Free quote, no commitment</span>
              </div>
            </div>

            <a
              href={EXPERT_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackExpertWhatsAppClick("study_workspace_onboarding")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#16A34A] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#15803D] sm:text-base"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 shrink-0"
              >
                <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7c1.7.9 3.6 1.4 5.6 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3ZM12 21.5c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.6 9.6 0 1 1 8.4 4.7Zm5.3-7.1c-.3-.1-1.7-.850-2-.95-.3-.1-.5-.1-.7.15-.2.3-.75.95-.9 1.15-.2.2-.35.2-.65.05-1.75-.85-2.9-1.55-4.05-3.5-.3-.55.3-.5.9-1.65.1-.2.05-.35 0-.5s-.7-1.6-.9-2.2c-.25-.6-.5-.5-.7-.5h-.6c-.2 0-.5.05-.8.35-.3.3-1.05 1-1.05 2.5s1.1 2.9 1.25 3.1c.15.2 2.15 3.3 5.2 4.6 2 .85 2.75.95 3.75.8.6-.1 1.7-.7 1.95-1.35.25-.65.25-1.2.15-1.35-.05-.1-.25-.2-.55-.3Z" />
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {sessionToolbar}
      {showToolbarUpload ? (
        <section className="mx-3 mt-3 rounded-2xl border border-[#dfe3ff] bg-white p-3 shadow-lg sm:mx-5 sm:p-4">
          {uploadForm}
        </section>
      ) : null}
    </>
  );
}
