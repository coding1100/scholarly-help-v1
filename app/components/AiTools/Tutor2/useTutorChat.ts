"use client";

import { useCallback, useRef, useState } from "react";
import { streamStudyTutor, type StudyLearningMode } from "./tutorApi";
import type { TutorChatMessage } from "./ChatMessage";

const ACTION_PROMPTS: Record<"hint" | "why" | "eli6" | "steps", string> = {
  hint: "Give me a hint about this, without giving away the full answer.",
  why: "Explain why this is true — go one level deeper than the text above.",
  eli6: "Explain the text above like I'm 6 years old.",
  steps: "Break the text above into clear, numbered step-by-step points.",
};

interface UseTutorChatOptions {
  sessionId: string | null;
  mode: StudyLearningMode;
  tutorContext?: string;
}

/**
 * Shared streaming-chat state machine for a single tab (Research or
 * Assignment). Each tab instance keeps its own independent message list and
 * in-flight state, so switching tabs never loses or cross-contaminates a
 * conversation — all three tabs stay mounted and this hook's state lives in
 * each one.
 */
export function useTutorChat({ sessionId, mode, tutorContext }: UseTutorChatOptions) {
  const [messages, setMessages] = useState<TutorChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(0);
  const nextId = () => `msg-${(idRef.current += 1)}-${Date.now().toString(36)}`;

  const send = useCallback(
    async (question: string, groundedText?: string) => {
      if (!sessionId || !question.trim() || isStreaming) return;
      setError(null);

      if (!groundedText) {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: "user", text: question.trim() },
        ]);
      }

      const botId = nextId();
      setMessages((prev) => [
        ...prev,
        { id: botId, role: "assistant", text: "", streaming: true },
      ]);
      setIsStreaming(true);

      let streamedText = "";
      try {
        await streamStudyTutor(
          sessionId,
          question,
          undefined,
          { mode, tutorContext, groundedText },
          {
            onChunk: (delta) => {
              if (typeof delta !== "string") return;
              streamedText += delta;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botId ? { ...m, text: streamedText, streaming: true } : m,
                ),
              );
            },
          },
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "The tutor could not respond. Please retry.");
        setMessages((prev) => prev.filter((m) => m.id !== botId));
        setIsStreaming(false);
        return;
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === botId ? { ...m, streaming: false } : m)),
      );
      setIsStreaming(false);
    },
    [sessionId, mode, tutorContext, isStreaming],
  );

  const sendActionChip = useCallback(
    (action: "hint" | "why" | "eli6" | "steps", groundedText: string) => {
      void send(ACTION_PROMPTS[action], groundedText);
    },
    [send],
  );

  return { messages, isStreaming, error, send, sendActionChip };
}
