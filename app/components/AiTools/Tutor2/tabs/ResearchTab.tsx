"use client";

import { FC, useState } from "react";
import { FiArrowUp, FiBookmark } from "react-icons/fi";
import toast from "react-hot-toast";
import ChatMessage from "../ChatMessage";
import { useTutorChat } from "../useTutorChat";
import { saveTutorItem } from "../tutorApi";

interface ResearchTabProps {
  sessionId: string | null;
  active: boolean;
}

/**
 * Research & Deep Dive — Knowledge Hub. Synthesizes concepts, structured
 * topic breakdowns, and citations from the uploaded material. Kept mounted
 * even when not the active tab so its conversation never resets on switch.
 */
const ResearchTab: FC<ResearchTabProps> = ({ sessionId, active }) => {
  const { messages, isStreaming, error, send, sendActionChip } = useTutorChat({
    sessionId,
    mode: "research",
  });
  const [input, setInput] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    void send(text);
  };

  const handleSaveNote = async (messageId: string, text: string) => {
    if (!text.trim()) return;
    setSavingId(messageId);
    try {
      await saveTutorItem({
        folder: "Research Notes",
        title: text.slice(0, 80).replace(/\s+/g, " ").trim() || "Research note",
        content: text,
      });
      toast.success("Saved to Research Notes");
    } catch {
      toast.error("Could not save this note. Please retry.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className={`flex h-full flex-col ${active ? "" : "hidden"}`}>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            Ask a question about your material to start a research deep-dive.
          </p>
        ) : null}
        {messages.map((message) => (
          <div key={message.id} className="group relative">
            <ChatMessage
              message={message}
              chipsDisabled={isStreaming}
              onActionChip={sendActionChip}
            />
            {message.role === "assistant" && !message.streaming && message.text ? (
              <button
                type="button"
                onClick={() => handleSaveNote(message.id, message.text)}
                disabled={savingId === message.id}
                className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-gray-500 transition-colors hover:text-primary-400 disabled:opacity-50"
              >
                <FiBookmark className="h-3 w-3" />
                {savingId === message.id ? "Saving…" : "Save Note"}
              </button>
            ) : null}
          </div>
        ))}
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
      </div>

      <div className="flex items-center gap-2 border-t border-gray-200 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about your material…"
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

export default ResearchTab;
