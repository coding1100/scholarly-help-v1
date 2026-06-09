"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { HiOutlineXMark } from "react-icons/hi2";
import {
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import {
  EditorContext,
  EditorPreferencesContext,
  TitleContext,
} from "./MainToolLayout";
import {
  createSource,
  getAcademicErrorMessage,
  getAxiosStatus,
  listSources,
  runResearchReview,
  sendResearchChat,
  uploadSource,
  type SourceRecord,
} from "./academicResearchApi";

export type AssistantPanel = "documents" | "library" | "chat" | "review";

type AcademicAssistantPanelProps = {
  activePanel: Exclude<AssistantPanel, "documents">;
  onClose: () => void;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const getDocumentText = (editor: any | null) => {
  if (!editor) return "";
  return String(editor.state?.doc?.textContent || "").trim();
};

const normalizeCitationStyle = (style: string) => {
  if (/^mla/i.test(style)) return "MLA";
  if (/^chicago/i.test(style)) return "Chicago";
  if (/^harvard/i.test(style)) return "Harvard";
  return "APA";
};

const PanelHeader = ({
  icon,
  title,
  subtitle,
  onClose,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClose: () => void;
}) => (
  <div className="border-b border-gray-200 px-4 py-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-primary-400">{icon}</span>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-gray-500">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close panel"
        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      >
        <HiOutlineXMark className="h-5 w-5" />
      </button>
    </div>
  </div>
);

const AcademicAssistantPanel: React.FC<AcademicAssistantPanelProps> = ({
  activePanel,
  onClose,
}) => {
  const { editor } = useContext(EditorContext);
  const { title } = useContext(TitleContext);
  const { citationStyle } = useContext(EditorPreferencesContext);
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [sourceTitle, setSourceTitle] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask about your draft, request a paragraph, find research angles, or ask for citation suggestions.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const documentText = getDocumentText(editor);
  const wordCount = useMemo(
    () => documentText.split(/\s+/).filter(Boolean).length,
    [documentText],
  );

  useEffect(() => {
    if (activePanel !== "library") return;

    setSourcesLoading(true);
    listSources()
      .then((data) => setSources(Array.isArray(data) ? data : []))
      .catch((error) => {
        setSources([]);
        const status = getAxiosStatus(error);
        if (status === 404 || status === 405) {
          toast(
            "Library isn’t available on this server yet (sources list is empty). You can keep editing; adding sources will work once the backend Library module is live.",
            { id: "sources-library-unavailable", duration: 5200 },
          );
        } else {
          toast.error(
            getAcademicErrorMessage(error, "Could not load sources."),
            { id: "sources-load-error" },
          );
        }
      })
      .finally(() => setSourcesLoading(false));
  }, [activePanel]);

  const handleAddSource = async (titleValue = sourceTitle) => {
    const nextTitle = titleValue.trim();
    if (!nextTitle) return;
    try {
      const source = await createSource({ title: nextTitle, type: "other" });
      setSources((prev) => [source, ...prev]);
      setSourceTitle("");
      toast.success("Source added to library");
    } catch (error) {
      toast.error(getAcademicErrorMessage(error, "Could not add source."));
    }
  };

  const handleUploadSource = async (file: File) => {
    try {
      const source = await uploadSource(file, {
        title: file.name.replace(/\.[^.]+$/, ""),
        type: file.type === "application/pdf" ? "pdf" : "other",
      });
      setSources((prev) => [source, ...prev]);
      toast.success("Source uploaded");
    } catch (error) {
      toast.error(getAcademicErrorMessage(error, "Could not upload source."));
    }
  };

  const handleSendChat = async () => {
    const message = chatInput.trim();
    if (!message || chatLoading) return;

    const nextMessages: ChatMessage[] = [
      ...chatMessages,
      { id: `${Date.now()}-user`, role: "user", content: message },
    ];

    setChatInput("");
    setChatMessages(nextMessages);
    setChatLoading(true);

    try {
      const response = await sendResearchChat({
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
        document_content: documentText || undefined,
        citation_style: normalizeCitationStyle(citationStyle),
      });
      setChatMessages((prev) => [
      ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: response.reply,
        },
      ]);
    } catch (error) {
      toast.error(getAcademicErrorMessage(error, "AI chat failed. Please try again."));
      setChatMessages((prev) => prev.filter((item) => item.content !== message));
    } finally {
      setChatLoading(false);
    }
  };

  const handleReview = async () => {
    if (!documentText) {
      toast.error("Add content to the document before running review.");
      return;
    }

    setReviewLoading(true);
    try {
      const response = await runResearchReview({
        content: documentText,
        document_title: title || undefined,
        citation_style: normalizeCitationStyle(citationStyle),
      });
      const feedback = response.feedback;
      setReviewText(
        [
          `**Grammar**\n\n${feedback.grammar}`,
          `**Clarity**\n\n${feedback.clarity}`,
          `**Structure**\n\n${feedback.structure}`,
          `**Evidence gaps**\n\n${feedback.evidence_gaps}`,
          `**Citation opportunities**\n\n${feedback.citation_opportunities}`,
        ].join("\n\n"),
      );
    } catch (error) {
      toast.error(getAcademicErrorMessage(error, "Review failed. Please try again."));
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <aside className="hidden lg:flex h-screen w-[20rem] xl:w-[24rem] flex-col border-r border-gray-200 bg-white">
      {activePanel === "library" && (
        <>
          <PanelHeader
            icon={<HiOutlineBookOpen className="h-5 w-5" />}
            title="Library"
            subtitle="Collect sources for citations and research context."
            onClose={onClose}
          />
          <div className="flex-1 overflow-auto p-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <label className="text-xs font-medium text-gray-700">
                Add source
              </label>
              <input
                value={sourceTitle}
                onChange={(event) => setSourceTitle(event.target.value)}
                placeholder="Paste a URL, DOI, book title, or note"
                className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleAddSource()}
                  className="rounded-md bg-primary-400 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-500"
                >
                  Add source
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Upload file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleUploadSource(file);
                  }}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {sourcesLoading && (
                <p className="text-sm text-gray-500">Loading sources...</p>
              )}
              {!sourcesLoading && sources.length === 0 && (
                <p className="text-sm text-gray-500">
                  Class notes or PDFs you upload appear here.
                </p>
              )}
              {sources.map((source) => (
                <div
                  key={source.id || source._id}
                  className="rounded-lg border border-gray-200 bg-white p-3"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {source.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {source.type || "Source"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activePanel === "chat" && (
        <>
          <PanelHeader
            icon={<HiOutlineChatBubbleLeftRight className="h-5 w-5" />}
            title="AI Chat"
            subtitle="Ask questions and generate research help from your draft."
            onClose={onClose}
          />
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl px-3 py-2 text-sm leading-6 ${
                    message.role === "assistant"
                      ? "bg-primary-100 text-gray-800"
                      : "bg-primary-400 text-white"
                  }`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ))}
              {chatLoading && (
                <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-500">
                  Thinking...
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200 p-3">
            <textarea
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSendChat();
                }
              }}
              placeholder="Ask AI about your paper..."
              className="h-20 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
            />
            <button
              type="button"
              onClick={() => void handleSendChat()}
              disabled={!chatInput.trim() || chatLoading}
              className="mt-2 w-full rounded-md bg-primary-400 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Send
            </button>
          </div>
        </>
      )}

      {activePanel === "review" && (
        <>
          <PanelHeader
            icon={<HiOutlineClipboardDocumentCheck className="h-5 w-5" />}
            title="Review"
            subtitle="Check clarity, structure, and citation opportunities."
            onClose={onClose}
          />
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-primary-100 p-3">
                <p className="text-xs text-gray-500">Words</p>
                <p className="text-xl font-semibold text-primary-500">
                  {wordCount}
                </p>
              </div>
              <div className="rounded-xl bg-primary-100 p-3">
                <p className="text-xs text-gray-500">Sources</p>
                <p className="text-xl font-semibold text-primary-500">
                  {sources.length}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleReview()}
              disabled={reviewLoading}
              className="mt-4 w-full rounded-md bg-primary-400 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {reviewLoading ? "Reviewing..." : "Review document"}
            </button>
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 text-sm leading-6 text-gray-700">
              {reviewText ? (
                <ReactMarkdown>{reviewText}</ReactMarkdown>
              ) : (
                <p>
                  Run review to get feedback on argument flow, evidence,
                  citations, and next writing steps.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default AcademicAssistantPanel;
