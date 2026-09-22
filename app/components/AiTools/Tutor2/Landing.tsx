"use client";

import { FC, useRef, useState } from "react";
import { FiUploadCloud, FiFileText } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  addStudySource,
  addStudySourceFile,
  createStudySession,
  trackStudySessionCreated,
} from "./tutorApi";

interface LandingProps {
  onReady: (sessionId: string) => void;
}

const sourceLabel = (file: File) => file.name;

/**
 * Zero-friction entry: a single drag-and-drop zone (PDF/DOCX/images/notes) or
 * a text box to start typing directly. On drop/paste, creates a new session
 * and attaches the source — the session is then locked to this one document
 * (TutorWorkspace hides this screen once a source exists).
 */
const Landing: FC<LandingProps> = ({ onReady }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const ingest = async (input: { kind: "file"; file: File } | { kind: "text"; text: string }) => {
    setBusy(true);
    try {
      const sessionTitle =
        input.kind === "file" ? sourceLabel(input.file) : input.text.slice(0, 60) || "New session";
      const session = await createStudySession(sessionTitle);
      const sessionId = session._id;

      if (input.kind === "file") {
        await addStudySourceFile(sessionId, { name: input.file.name, file: input.file });
      } else {
        await addStudySource(sessionId, { kind: "text", name: "Pasted notes", text: input.text });
      }

      trackStudySessionCreated({ sessionId, sourceKind: input.kind });
      onReady(sessionId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start this session. Please retry.");
    } finally {
      setBusy(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void ingest({ kind: "file", file });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void ingest({ kind: "file", file });
  };

  const handleStartTyping = () => {
    if (!pastedText.trim()) return;
    void ingest({ kind: "text", text: pastedText.trim() });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-800">Start a study session</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your material or paste it below — everything in this session stays scoped to it.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex w-full max-w-lg cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors duration-300 ${
          isDraggingOver ? "border-primary-400 bg-primary-100" : "border-gray-300 bg-gray-50"
        } ${busy ? "pointer-events-none opacity-50" : ""}`}
      >
        <FiUploadCloud className="h-10 w-10 text-primary-400" />
        <p className="text-sm font-semibold text-gray-800">
          Drag & drop a file, or click to browse
        </p>
        <p className="text-xs text-gray-500">PDF, DOCX, images, or notes</p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
        />
      </div>

      <div className="flex w-full max-w-lg items-center gap-3 text-xs text-gray-500">
        <div className="h-px flex-1 bg-gray-200" />
        or type directly
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="w-full max-w-lg">
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste your notes or assignment text here…"
          className="h-28 w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-800 outline-none transition-colors duration-300 focus:border-primary-400"
        />
        <button
          type="button"
          onClick={handleStartTyping}
          disabled={busy || !pastedText.trim()}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-300 active:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiFileText className="h-4 w-4" />
          {busy ? "Starting…" : "Start with this text"}
        </button>
      </div>
    </div>
  );
};

export default Landing;
