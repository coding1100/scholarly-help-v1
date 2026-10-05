"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import {
  FiZap,
  FiCheck,
  FiX,
  FiLoader,
  FiHelpCircle,
  FiCornerDownLeft,
} from "react-icons/fi";
import { generateParagraph } from "@/app/components/AiTools/MainTool/academicResearchApi";
import toast from "react-hot-toast";

interface DraftEditorProps {
  initialContent: string;
  topic: string;
  headings: string[];
  onChange: (text: string) => void;
  guardAiClick?: (fn: () => void | Promise<void>) => void;
}

const suggestionPluginKey = new PluginKey("essayGhostSuggestion");

interface SuggestionMeta {
  type: "addSuggestion" | "addLoading" | "clear";
  pos?: number;
  text?: string;
}

function pickParagraphApiText(data: any): string {
  const a = data?.section_content;
  const b = data?.content;
  if (typeof a === "string" && a.trim()) return a.trim();
  if (typeof b === "string" && b.trim()) return b.trim();
  return "";
}

function textToHtml(text: string): string {
  if (!text || !text.trim()) return "<p></p>";
  return text
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p>${p
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");
}

export default function DraftEditor({
  initialContent,
  topic,
  headings,
  onChange,
  guardAiClick = (fn) => fn(),
}: DraftEditorProps) {
  const [currentSuggestion, setCurrentSuggestion] = useState<string>("");
  const [suggestionPos, setSuggestionPos] = useState<number | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [autoCompleteEnabled, setAutoCompleteEnabled] = useState(true);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSuggestedTextRef = useRef<string>("");

  // Create Ghost Suggestion ProseMirror Extension
  const ghostExtension = useMemo(() => {
    return Extension.create({
      name: "essayGhostSuggestion",
      addProseMirrorPlugins() {
        return [
          new Plugin({
            key: suggestionPluginKey,
            state: {
              init() {
                return DecorationSet.empty;
              },
              apply(tr, set) {
                set = set.map(tr.mapping, tr.doc);
                const action = tr.getMeta(
                  suggestionPluginKey,
                ) as SuggestionMeta | undefined;

                if (
                  action?.type === "addSuggestion" &&
                  action.pos !== undefined &&
                  action.text
                ) {
                  const decoration = Decoration.widget(
                    action.pos,
                    () => {
                      const span = document.createElement("span");
                      span.className =
                        "text-[#94A3B8] font-normal italic pointer-events-none select-none transition-opacity duration-200";
                      span.textContent = action.text!;
                      span.setAttribute("data-ghost-suggestion", "true");
                      return span;
                    },
                    { side: 1 },
                  );
                  return DecorationSet.create(tr.doc, [decoration]);
                } else if (
                  action?.type === "addLoading" &&
                  action.pos !== undefined
                ) {
                  const decoration = Decoration.widget(
                    action.pos,
                    () => {
                      const span = document.createElement("span");
                      span.className =
                        "inline-flex items-center gap-1 text-[#6366F1] font-normal pointer-events-none select-none text-xs ml-1";
                      span.innerHTML =
                        '<span class="inline-block animate-pulse">●</span><span class="inline-block animate-pulse [animation-delay:150ms]">●</span><span class="inline-block animate-pulse [animation-delay:300ms]">●</span>';
                      return span;
                    },
                    { side: 1 },
                  );
                  return DecorationSet.create(tr.doc, [decoration]);
                } else if (action?.type === "clear") {
                  return DecorationSet.empty;
                }
                return set;
              },
            },
            props: {
              decorations(state) {
                return this.getState(state);
              },
            },
          }),
        ];
      },
    });
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ghostExtension,
    ],
    content: textToHtml(initialContent),
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] max-w-none focus:outline-none text-sm leading-relaxed text-[#2B2E40] selection:bg-[#E0E7FF] prose prose-p:my-2 prose-headings:font-bold prose-headings:text-[#171A2B]",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const text = ed.getText({ blockSeparator: "\n\n" });
      onChange(text);
    },
  });

  // Keep editor content in sync if parent resets initialContent
  useEffect(() => {
    if (!editor) return;
    const currentText = editor.getText({ blockSeparator: "\n\n" });
    if (initialContent && currentText.trim() !== initialContent.trim()) {
      editor.commands.setContent(textToHtml(initialContent));
    }
  }, [initialContent, editor]);

  // Dismiss ghost suggestion
  const handleDismiss = useCallback(() => {
    if (!editor) return;
    try {
      editor.view.dispatch(
        editor.state.tr.setMeta(suggestionPluginKey, { type: "clear" }),
      );
    } catch {}
    setCurrentSuggestion("");
    setSuggestionPos(null);
  }, [editor]);

  // Accept ghost suggestion and insert into text
  const handleAccept = useCallback(() => {
    if (!editor || !currentSuggestion || suggestionPos === null) return;

    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.insertText(currentSuggestion, suggestionPos);
        tr.setMeta(suggestionPluginKey, { type: "clear" });
        return true;
      })
      .run();

    const updatedText = editor.getText({ blockSeparator: "\n\n" });
    onChange(updatedText);

    setCurrentSuggestion("");
    setSuggestionPos(null);
    toast.success("AI suggestion accepted!", { duration: 1500 });
  }, [editor, currentSuggestion, suggestionPos, onChange]);

  // Fetch AI suggestion from backend
  const triggerSuggestion = useCallback(
    async (isManual: boolean = false) => {
      if (!editor || isLoadingSuggestion) return;
      const { state } = editor;
      const { from, to } = state.selection;
      if (from !== to) return; // Do not suggest if text is highlighted

      // Get preceding document context (up to 400 characters before cursor)
      const docTextBefore = state.doc.textBetween(0, from, "\n\n", " ");
      const contentSofar = docTextBefore.slice(-400).trim();

      // Auto-suggest requires at least a couple of characters of context
      if (!isManual && contentSofar.length < 3) return;
      if (!contentSofar) {
        if (isManual) {
          toast.error("Type a topic or few words first so AI can suggest a continuation.");
        }
        return;
      }

      // Don't re-trigger for identical prefix
      if (!isManual && contentSofar === lastSuggestedTextRef.current) return;
      lastSuggestedTextRef.current = contentSofar;

      const pos = from;

      if (isManual) {
        toast.loading("Thinking of continuation…", { id: "ghost-loading", duration: 3000 });
      }

      // Show inline loading dots
      try {
        editor.view.dispatch(
          editor.state.tr.setMeta(suggestionPluginKey, {
            type: "addLoading",
            pos,
          }),
        );
      } catch {}
      setIsLoadingSuggestion(true);

      try {
        const payloadHeadings =
          headings && headings.length > 0
            ? headings
            : ["Introduction", "Main Body", "Conclusion"];

        const res = await generateParagraph({
          topic: topic || "Academic Essay",
          headings: payloadHeadings,
          current_section: payloadHeadings[0] || "Introduction",
          content_sofar: contentSofar,
        });

        toast.dismiss("ghost-loading");
        const rawText = pickParagraphApiText(res);
        if (!rawText || !rawText.trim()) {
          handleDismiss();
          if (isManual) {
            toast.error(
              "No continuation generated. Type a bit more and try again.",
            );
          }
          return;
        }

        // Format clean continuation
        let cleanText = rawText.trim();
        const immediateCharBefore = docTextBefore.slice(-1);
        if (!cleanText.startsWith(" ") && immediateCharBefore && !/\s/.test(immediateCharBefore)) {
          cleanText = " " + cleanText;
        }

        setSuggestionPos(pos);
        setCurrentSuggestion(cleanText);

        editor.view.dispatch(
          editor.state.tr.setMeta(suggestionPluginKey, {
            type: "addSuggestion",
            pos,
            text: cleanText,
          }),
        );
      } catch {
        toast.dismiss("ghost-loading");
        handleDismiss();
        if (isManual) {
          toast.error("Could not fetch paragraph suggestion.");
        }
      } finally {
        setIsLoadingSuggestion(false);
      }
    },
    [
      editor,
      isLoadingSuggestion,
      topic,
      headings,
      handleDismiss,
    ],
  );

  // Debounced auto-completion while user is typing (fast 650ms debounce)
  useEffect(() => {
    if (!editor || !autoCompleteEnabled) return;

    const handleDocChange = () => {
      // If a suggestion was open and the user typed something else, clear it
      if (currentSuggestion) {
        handleDismiss();
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void triggerSuggestion(false);
      }, 650);
    };

    editor.on("update", handleDocChange);
    return () => {
      editor.off("update", handleDocChange);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    editor,
    autoCompleteEnabled,
    currentSuggestion,
    handleDismiss,
    triggerSuggestion,
  ]);

  // Keyboard shortcut listener (Tab to accept, Esc to dismiss, Ctrl+/ for manual trigger)
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Suggestion accept / dismiss
      if (currentSuggestion) {
        if (
          event.key === "Tab" ||
          (event.shiftKey && event.key === "ArrowRight")
        ) {
          event.preventDefault();
          event.stopPropagation();
          handleAccept();
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          handleDismiss();
          return;
        }
      }

      // Manual shortcut: Ctrl+/ or Cmd+/
      if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        event.preventDefault();
        event.stopPropagation();
        guardAiClick(() => triggerSuggestion(true));
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener("keydown", handleKeyDown, true);
    return () => {
      dom.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    editor,
    currentSuggestion,
    handleAccept,
    handleDismiss,
    triggerSuggestion,
    guardAiClick,
  ]);

  return (
    <div className="flex flex-col gap-3">
      {/* Editor Sub-Bar: AI Completion Status & Manual Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#EEF0F5] bg-[#F8F9FC] px-4 py-2 text-xs">
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 select-none text-[#171A2B] font-medium">
            <input
              type="checkbox"
              checked={autoCompleteEnabled}
              onChange={(e) => {
                setAutoCompleteEnabled(e.target.checked);
                if (!e.target.checked) handleDismiss();
              }}
              className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#4F46E5] focus:ring-0"
            />
            <span>Inline AI Autocomplete</span>
          </label>
          <span className="hidden sm:inline text-[#94A3B8]">·</span>
          <span className="hidden sm:inline text-[#5B6072]">
            Type and pause to get ghost-text suggestions
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLoadingSuggestion && (
            <span className="flex items-center gap-1.5 text-xs text-[#4F46E5]">
              <FiLoader className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </span>
          )}
          <button
            type="button"
            onClick={() => guardAiClick(() => triggerSuggestion(true))}
            disabled={isLoadingSuggestion}
            className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 font-semibold text-[#4F46E5] shadow-xs hover:bg-[#EEF0FF] transition disabled:opacity-50"
            title="Trigger an AI paragraph completion right at your cursor (Ctrl + /)"
          >
            <FiZap className="h-3.5 w-3.5" /> Suggest Continuation{" "}
            <kbd className="hidden md:inline rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 font-mono">
              Ctrl + /
            </kbd>
          </button>
        </div>
      </div>

      {/* Floating Suggestion Accept Banner when ghost text is active */}
      {currentSuggestion && (
        <div className="flex items-center justify-between rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] p-3 text-xs shadow-sm transition">
          <div className="flex items-center gap-2.5 text-[#3730A3]">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#4F46E5] text-white">
              <FiCornerDownLeft className="h-3.5 w-3.5" />
            </div>
            <span>
              <strong>AI suggestion ready:</strong> Press{" "}
              <kbd className="rounded bg-white px-1.5 py-0.5 font-bold shadow-xs text-[#4F46E5]">
                Tab
              </kbd>{" "}
              to insert or{" "}
              <kbd className="rounded bg-white px-1.5 py-0.5 text-gray-600 shadow-xs">
                Esc
              </kbd>{" "}
              to ignore.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDismiss}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1 font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <FiX className="h-3.5 w-3.5" /> Dismiss
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="flex items-center gap-1 rounded-lg bg-[#4F46E5] px-3 py-1 font-bold text-white shadow-xs hover:bg-[#3730A3] transition"
            >
              <FiCheck className="h-3.5 w-3.5" /> Accept Suggestion
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Editor Shell */}
      <div className="rounded-2xl border border-[#CBD5E1] bg-white p-5 focus-within:border-[#4F46E5] transition min-h-[460px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
