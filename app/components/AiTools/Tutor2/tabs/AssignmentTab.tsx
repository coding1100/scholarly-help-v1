"use client";

import { FC, useEffect, useState } from "react";
import { FiArrowUp, FiBookmark } from "react-icons/fi";
import toast from "react-hot-toast";
import ChatMessage from "../ChatMessage";
import { useTutorChat } from "../useTutorChat";
import { saveTutorItem } from "../tutorApi";
import type { SaveHandler } from "../TutorWorkspace";

interface AssignmentTabProps {
  sessionId: string | null;
  active: boolean;
  onRegisterSaveHandler?: (handler: SaveHandler) => void;
}

/**
 * Solve Assignment — Socratic Co-Pilot. Asks guiding questions and gives
 * progressive hints (assignment-mode system prompt enforces this
 * server-side) rather than dumping flat answers.
 */
const AssignmentTab: FC<AssignmentTabProps> = ({ sessionId, active, onRegisterSaveHandler }) => {
  const { messages, isStreaming, error, send, sendActionChip } = useTutorChat({
    sessionId,
    mode: "assignment",
  });
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    void send(text);
  };

  const buildTranscript = () =>
    messages
      .map((m) => `**${m.role === "user" ? "You" : "Tutor"}:** ${m.text}`)
      .join("\n\n");

  const handleSaveProgress = async () => {
    if (messages.length === 0) return;
    setSaving(true);
    try {
      const firstUserMessage = messages.find((m) => m.role === "user")?.text || "Assignment progress";
      await saveTutorItem({
        folder: "Solved Homeworks",
        title: firstUserMessage.slice(0, 80).replace(/\s+/g, " ").trim(),
        content: buildTranscript(),
      });
      toast.success("Saved to Solved Homeworks");
    } catch {
      toast.error("Could not save your progress. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!onRegisterSaveHandler) return;
    onRegisterSaveHandler({
      hasContent: messages.length > 0,
      save: async (projectLabel?: string) => {
        if (messages.length === 0) return;
        const firstUserMessage = messages.find((m) => m.role === "user")?.text || "Assignment progress";
        await saveTutorItem({
          folder: "Solved Homeworks",
          title: projectLabel
            ? `${projectLabel} — Assignment`
            : firstUserMessage.slice(0, 80).replace(/\s+/g, " ").trim(),
          content: buildTranscript(),
        });
      },
    });
  }, [messages, onRegisterSaveHandler]);

  return (
    <div className={`flex h-full flex-col ${active ? "" : "hidden"}`}>
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <p className="text-xs font-semibold text-gray-500">
          Socratic mode: I'll guide you with questions and hints, not flat answers.
        </p>
        <button
          type="button"
          onClick={handleSaveProgress}
          disabled={saving || messages.length === 0}
          className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 transition-colors hover:text-primary-400 disabled:opacity-50"
        >
          <FiBookmark className="h-3 w-3" />
          {saving ? "Saving…" : "Save Progress"}
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            Paste your assignment question — I'll walk you through it step by step.
          </p>
        ) : null}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            chipsDisabled={isStreaming}
            onActionChip={sendActionChip}
          />
        ))}
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
      </div>

      <div className="flex items-center gap-2 border-t border-gray-200 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="What are you working on?"
          className="h-10 flex-1 rounded-lg border border-gray-300 px-3 text-sm text-gray-800 outline-none transition-colors duration-300 focus:border-primary-400"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isStreaming || !sessionId}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-400 text-white shadow-sm transition-colors hover:bg-primary-300 active:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AssignmentTab;
