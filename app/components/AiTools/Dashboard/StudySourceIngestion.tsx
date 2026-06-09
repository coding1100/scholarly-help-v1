"use client";

import { ComponentType, TouchEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiFolderPlus,
  FiLink,
  FiLoader,
  FiMic,
  FiMonitor,
  FiSend,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import {
  addStudySource,
  addStudySourceFile,
  createStudySession,
  deleteStudySession,
  listStudySessions,
  setActiveStudySessionId,
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
  { value: "record", label: "Record", subLabel: "Record Live Audio", icon: FiMic },
];

export default function StudySourceIngestion() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");
  const [sessions, setSessions] = useState<Array<{ _id: string; title: string }>>(
    [],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<UploadMode>("file");
  const [kind, setKind] = useState<StudySourceKind>("file");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState<"microphone" | "browser-tab">(
    "microphone",
  );
  const [assistantInput, setAssistantInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [isSessionCreating, setIsSessionCreating] = useState(false);
  const [isSessionListLoading, setIsSessionListLoading] = useState(false);
  const [isRenamingSession, setIsRenamingSession] = useState(false);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [isEditingSessionTitle, setIsEditingSessionTitle] = useState(false);
  const [sessionTitleInput, setSessionTitleInput] = useState("");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusByMode, setStatusByMode] = useState<Record<UploadMode, InlineStatus | null>>({
    file: null,
    url: null,
    text: null,
    record: null,
  });

  const textLength = useMemo(() => text.trim().length, [text, mode]);

  const isSourceLoading = isSubmitting || isStartingRecording;

  const setModeStatus = (targetMode: UploadMode, status: InlineStatus | null) => {
    setStatusByMode((prev) => ({ ...prev, [targetMode]: status }));
  };

  const clearAllModeStatus = () => {
    setStatusByMode({
      file: null,
      url: null,
      text: null,
      record: null,
    });
  };

  const refreshSessions = async () => {
    setIsSessionListLoading(true);
    try {
      const list = await listStudySessions();
      setSessions(list.map((item) => ({ _id: item._id, title: item.title })));
    } catch {
      // ignore list refresh errors for now
    } finally {
      setIsSessionListLoading(false);
    }
  };

  const switchSession = (nextSessionId: string) => {
    if (!nextSessionId) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("sessionId", nextSessionId);
    setActiveStudySessionId(nextSessionId);
    router.replace(`${pathname}?${nextParams.toString()}`);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("study-session-changed", {
          detail: { sessionId: nextSessionId },
        }),
      );
    }
  };

  const createAndOpenNewSession = async () => {
    setIsSessionCreating(true);
    try {
      const session = await createStudySession("My Study Session");
      await refreshSessions();
      switchSession(session._id);
      setIsOpen(true);
      clearAllModeStatus();
    } catch (error) {
      console.error("Failed to create study session", error);
      toast.error("Could not create new study session");
    } finally {
      setIsSessionCreating(false);
    }
  };

  const saveSessionTitle = async () => {
    if (!sessionId) {
      toast.error("Session is still loading. Please wait.");
      return;
    }
    const nextTitle = sessionTitleInput.trim();
    if (!nextTitle) {
      toast.error("Session title cannot be empty.");
      return;
    }
    if (nextTitle.length > 80) {
      toast.error("Session title must be 80 characters or fewer.");
      return;
    }

    setIsRenamingSession(true);
    try {
      await updateStudySessionTitle(sessionId, nextTitle);
      await refreshSessions();
      setIsEditingSessionTitle(false);
      toast.success("Session name updated");
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("study-session-changed", { detail: { sessionId } }),
        );
      }
    } catch (error) {
      console.error("Failed to rename session", error);
      toast.error("Could not update session name");
    } finally {
      setIsRenamingSession(false);
    }
  };

  const cancelSessionTitleEdit = () => {
    const activeSession = sessions.find((session) => session._id === sessionId);
    setSessionTitleInput(activeSession?.title || "");
    setIsEditingSessionTitle(false);
  };

  const confirmDeleteSession = async () => {
    if (!sessionId) {
      setShowDeleteConfirm(false);
      return;
    }
    setIsDeletingSession(true);
    try {
      await deleteStudySession(sessionId);
      const list = await listStudySessions();
      if (list.length > 0) {
        const nextSessionId = list[0]._id;
        setSessions(list.map((item) => ({ _id: item._id, title: item.title })));
        switchSession(nextSessionId);
      } else {
        const created = await createStudySession("My Study Session");
        setSessions([{ _id: created._id, title: created.title }]);
        switchSession(created._id);
      }
      setIsEditingSessionTitle(false);
      setShowDeleteConfirm(false);
      toast.success("Session deleted");
    } catch (error) {
      console.error("Failed to delete session", error);
      toast.error("Could not delete session");
    } finally {
      setIsDeletingSession(false);
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
      closeModal();
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

  const activeSessionIndex = sessions.findIndex((item) => item._id === sessionId);

  const navigateSessionByOffset = (offset: number) => {
    if (activeSessionIndex < 0) return;
    const nextIndex = activeSessionIndex + offset;
    if (nextIndex < 0 || nextIndex >= sessions.length) return;
    switchSession(sessions[nextIndex]._id);
  };

  const onSavedSessionsTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
  };

  const onSavedSessionsTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (typeof endX !== "number") {
      setTouchStartX(null);
      return;
    }
    const deltaX = endX - touchStartX;
    const swipeThreshold = 36;
    if (Math.abs(deltaX) >= swipeThreshold) {
      if (deltaX > 0) {
        navigateSessionByOffset(-1);
      } else {
        navigateSessionByOffset(1);
      }
    }
    setTouchStartX(null);
  };

  const resetModalForm = () => {
    setName("");
    setText("");
    setUrlValue("");
    setFile(null);
    clearAllModeStatus();
    setAssistantInput("");
    setRecordType("microphone");
    setMode("file");
    setKind("file");
  };

  const closeModal = () => {
    setIsOpen(false);
    resetModalForm();
  };

  const openModal = () => {
    setIsOpen(true);
    clearAllModeStatus();
  };

  useEffect(() => {
    void refreshSessions();
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setSessionTitleInput("");
      return;
    }
    const activeSession = sessions.find((session) => session._id === sessionId);
    setSessionTitleInput(activeSession?.title || "");
    setIsEditingSessionTitle(false);
  }, [sessionId, sessions]);

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

    const resolvedName =
      trimmedName ||
      (nextKind === "file"
        ? nextFile?.name || "Uploaded File"
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("study-source-added", { detail: { sessionId } }),
        );
      }
      await refreshSessions();
      setTimeout(() => {
        closeModal();
      }, 700);
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

  return (
    <>
      <section className="w-full px-3 pt-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex items-center gap-2 text-sm text-[#4f5474]"
            onTouchStart={onSavedSessionsTouchStart}
            onTouchEnd={onSavedSessionsTouchEnd}
          >
            <span className="font-semibold">Saved Sessions:</span>
            <button
              type="button"
              onClick={() => navigateSessionByOffset(-1)}
              disabled={
                isSessionListLoading || isSessionCreating || activeSessionIndex <= 0
              }
              aria-label="Go to previous session"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#ccd2ff] bg-white text-[#5f70ff] transition hover:bg-[#f3f5ff] disabled:opacity-50"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <select
              value={sessionId || ""}
              onChange={(e) => switchSession(e.target.value)}
              disabled={isSessionListLoading || isSessionCreating}
              className="rounded-md border border-[#ccd2ff] bg-white px-[10px] py-[6px] text-sm outline-none focus:border-[#5f70ff]"
            >
              {sessions.length === 0 ? <option value="">No sessions</option> : null}
              {sessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {session.title || "Untitled Session"}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => navigateSessionByOffset(1)}
              disabled={
                isSessionListLoading ||
                isSessionCreating ||
                activeSessionIndex < 0 ||
                activeSessionIndex >= sessions.length - 1
              }
              aria-label="Go to next session"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#ccd2ff] bg-white text-[#5f70ff] transition hover:bg-[#f3f5ff] disabled:opacity-50"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="relative min-w-[260px]">
              <input
                value={sessionTitleInput}
                onChange={(e) => setSessionTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isEditingSessionTitle) {
                    e.preventDefault();
                    void saveSessionTitle();
                  }
                  if (e.key === "Escape" && isEditingSessionTitle) {
                    e.preventDefault();
                    cancelSessionTitleEdit();
                  }
                }}
                readOnly={!isEditingSessionTitle}
                disabled={!sessionId || isSessionListLoading || isRenamingSession}
                placeholder="Session name"
                className="w-full rounded-md border border-[#ccd2ff] bg-white px-3 py-2 pr-24 text-sm outline-none focus:border-[#5f70ff] disabled:opacity-60"
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
                {isEditingSessionTitle ? (
                  <>
                    <button
                      type="button"
                      onClick={saveSessionTitle}
                      disabled={!sessionId || isSessionListLoading || isRenamingSession}
                      aria-label="Save session name"
                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#7b89ff] text-[#4e5ee9] transition hover:bg-[#eff2ff] disabled:opacity-60"
                    >
                      {isRenamingSession ? (
                        <span className="h-3 w-3 animate-spin rounded-full border border-[#c7d0ff] border-t-[#4e5ee9]" />
                      ) : (
                        <FiCheck className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelSessionTitleEdit}
                      disabled={isRenamingSession}
                      aria-label="Cancel session rename"
                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#ccd2ff] text-[#7a80a8] transition hover:bg-[#f3f5ff] disabled:opacity-60"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={!sessionId || isDeletingSession || isRenamingSession}
                      aria-label="Delete session"
                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#ffd1d1] text-[#d75757] transition hover:bg-[#fff1f1] disabled:opacity-60"
                    >
                      <FiTrash2 className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditingSessionTitle(true)}
                      disabled={!sessionId || isSessionListLoading || isDeletingSession}
                      aria-label="Edit session name"
                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#7b89ff] text-[#4e5ee9] transition hover:bg-[#eff2ff] disabled:opacity-60"
                    >
                      <FiEdit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={!sessionId || isSessionListLoading || isDeletingSession}
                      aria-label="Delete session"
                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#ffd1d1] text-[#d75757] transition hover:bg-[#fff1f1] disabled:opacity-60"
                    >
                      <FiTrash2 className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={createAndOpenNewSession}
            disabled={isSessionCreating}
            className="rounded-lg bg-[#5f70ff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5363ec]"
          >
            {isSessionCreating ? "Creating..." : "+ New Study Session"}
          </button>
        </div>
      </section>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1020]/55 backdrop-blur-[2px] p-4">
          <div className="relative w-full max-w-[600px] rounded-[20px] bg-[#f3f4fb] p-4 shadow-2xl">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSourceLoading}
              title={isSourceLoading ? "Please wait until upload finishes" : undefined}
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dbf7] bg-white text-[#5b6192] shadow-sm transition hover:bg-[#eef1ff] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close upload popup"
            >
              <FiX className="h-4 w-4" />
            </button>

            <h2 className="text-center text-[36px] font-semibold tracking-tight text-[#1a2033]">
              Upload
            </h2>
            <p className="mt-1 text-center text-base text-[#222739]">
              Select the type of content you&apos;d like to add to a new session.
            </p>

            <div className="mx-auto mt-4 rounded-[20px] bg-white p-4">
              <p className="text-center text-base text-[#38405f]">Select Option</p>
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
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
                      className={`rounded-[16px] border p-2 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        active
                          ? "border-[#c7b8ff] bg-[#f1ecff]"
                          : "border-[#ddd4ff] bg-[#f7f6ff]"
                      }`}
                    >
                      <div className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#dfe2ff] text-[#7180ff]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-1.5 text-base font-semibold text-[#5f70ff]">
                        {option.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#6c74a5]">{option.subLabel}</p>
                    </button>
                  );
                })}
              </div>

              <div className="relative mt-4 rounded-[16px] border border-[#7f7fff] bg-[#f1ecff] p-3">
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
                  <div className="space-y-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="File title (e.g. World War II Notes)"
                      className="w-full rounded-xl border border-[#d6d9f8] bg-white px-3 py-2 text-sm outline-none focus:border-[#6572ff]"
                    />
                    <label className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#d6d9f8] bg-white px-3 py-2">
                      <span className="inline-flex items-center rounded-md border border-[#b8bde9] bg-[#f3f5ff] px-3 py-1.5 text-sm font-medium text-[#3f4aa0] transition hover:bg-[#e8ecff]">
                        Choose file
                      </span>
                      <span className="truncate text-sm text-[#6a6f98]">
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
                      className="inline-flex min-h-[40px] w-full items-center justify-center rounded-lg bg-[#5f70ff] py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <FiLoader className="h-5 w-5 shrink-0 animate-spin" />
                      ) : (
                        "Upload File"
                      )}
                    </button>
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
                  <div className="space-y-2">
                    <div className="flex gap-2 rounded-xl border border-[#c6cbf7] bg-[#d7d2ed] p-2">
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={4}
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
                  <div className="rounded-[14px] border border-[#7a86ff] bg-[#d7d9ef] p-4 text-center">
                    <p className="text-xl font-semibold text-[#3b4257]">
                      Choose Recording Type
                    </p>
                    <div className="mx-auto mt-4 grid max-w-[420px] grid-cols-2 gap-2">
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
                    <p className="mx-auto mt-4 max-w-xl text-md text-[#596178]">
                      Record audio from your microphone with live transcription
                    </p>
                    <button
                      type="button"
                      onClick={startRecordingFlow}
                      disabled={isStartingRecording}
                      aria-busy={isStartingRecording}
                      aria-label={isStartingRecording ? "Loading" : "Start Recording"}
                      className="mt-4 inline-flex min-h-[44px] min-w-[160px] items-center justify-center rounded-lg bg-[#6678f6] px-8 py-2 text-base font-semibold text-white disabled:opacity-60"
                    >
                      {isStartingRecording ? (
                        <FiLoader className="h-6 w-6 shrink-0 animate-spin" />
                      ) : (
                        "Start Recording"
                      )}
                    </button>
                    <p className="hidden mt-3 text-md text-[#3f455b]">
                      You have 5 hours of recording credits left.
                    </p>
                    <div>
                      <button
                        type="button"
                        className="mt-2 text-base text-[#6678f6] underline"
                      >
                        Need more?
                      </button>
                    </div>
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
              <p className="mt-3 text-center text-md font-medium text-[#454b66]">
                or ask your new AI tutor!
              </p>

              <div className="mt-2 rounded-[18px] border-[3px] border-[#6376ff] bg-white p-2.5">
                <input
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Ask AI assistant..."
                  className="w-full text-md text-[#1d2435] outline-none placeholder:text-[#a2a7bc]"
                />
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8dcf7] text-[#7683d5]"
                  >
                    <FiFolderPlus className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#7480ff] px-4 py-1.5 text-base font-semibold text-[#6676ff]"
                    >
                      <FiChevronDown className="h-4 w-4" />
                      Default
                    </button>
                    <button type="button" className="text-[#4d5468]">
                      <FiMic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const input = assistantInput.trim();
                        if (!input) return;
                        setAssistantInput("");
                        toast(`Tutor prompt saved: ${input.slice(0, 40)}...`, {
                          icon: "✨",
                        });
                      }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#5f70ff] text-white"
                    >
                      <FiSend className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        </div>
      ) : null}
      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f1020]/55 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#e2e5ff] bg-white p-5 shadow-2xl">
            <p className="text-base font-semibold text-[#1f2342]">
              Are you sure to delete this session?
            </p>
            <p className="mt-2 text-sm text-[#656b91]">
              This action cannot be undone and all related content will be removed.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingSession}
                className="rounded-md border border-[#cfd5ff] px-3 py-1.5 text-sm text-[#4f577d] transition hover:bg-[#f3f5ff] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSession}
                disabled={isDeletingSession}
                className="rounded-md bg-[#d84848] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#c93d3d] disabled:opacity-60"
              >
                {isDeletingSession ? "Deleting..." : "Delete Session"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
