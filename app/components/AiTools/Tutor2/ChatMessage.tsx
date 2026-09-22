"use client";

import { FC } from "react";
import MarkDown from "@/app/components/MarkDown/MarkDown";
import ActionChips from "./ActionChips";

export interface TutorChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** True while an assistant message is still streaming in. */
  streaming?: boolean;
}

interface ChatMessageProps {
  message: TutorChatMessage;
  /** Grounds Hint/Why?/ELI6/Step-by-Step chips to this exact message's text. */
  onActionChip?: (action: "hint" | "why" | "eli6" | "steps", groundedText: string) => void;
  chipsDisabled?: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({ message, onActionChip, chipsDisabled }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
          isUser
            ? "bg-primary-400 text-white"
            : "border border-gray-200 bg-white text-gray-800"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        ) : message.text ? (
          <div className="prose prose-sm max-w-none break-words">
            <MarkDown content={message.text} />
          </div>
        ) : message.streaming ? (
          <span className="inline-flex items-center gap-1 text-gray-400">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
          </span>
        ) : null}

        {!isUser && !message.streaming && message.text && onActionChip ? (
          <ActionChips
            disabled={Boolean(chipsDisabled)}
            onSelect={(action) => onActionChip(action, message.text)}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ChatMessage;
