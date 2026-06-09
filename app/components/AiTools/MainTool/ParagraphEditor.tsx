"use client";

import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useContext,
  useRef,
} from "react";
import {
  EditorContent,
  useEditor,
  NodeViewWrapper,
  NodeViewContent,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { NodeViewProps } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import CodeBlock from "@tiptap/extension-code-block";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Extension, type Editor } from "@tiptap/core";
import { Plugin, PluginKey, Transaction } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import BlockMenu from "./BlockMenu";
import BlockToolbar from "./BlockToolbar";
import ParagraphToolbar from "./ParagraphToolbar";
import { MdOutlineDragIndicator, MdAdd } from "react-icons/md";
import {
  WordCountContext,
  EditorContext,
  EditorPreferencesContext,
} from "./MainToolLayout";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import toast from "react-hot-toast";
import {
  generateParagraph,
  getAcademicErrorMessage,
  getAxiosStatus,
  humanizeText,
  searchCitations,
  sendResearchChat,
  updateDocumentContent,
} from "./academicResearchApi";

const MIN_CHARS_BEFORE_CURSOR = 10;
const PARAGRAPH_SUGGESTION_DEBOUNCE_MS = 2200;
const TRANSFORM_BEGIN = "BEGIN_TRANSFORM_RESULT";
const TRANSFORM_END = "END_TRANSFORM_RESULT";

const normalizeCitationStyle = (style: string) => {
  if (/^mla/i.test(style)) return "MLA" as const;
  if (/^chicago/i.test(style)) return "Chicago" as const;
  if (/^harvard/i.test(style)) return "Harvard" as const;
  return "APA" as const;
};

type InlineChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function editorHasEffectiveFocus(editor: Editor): boolean {
  if (editor.view.hasFocus()) return true;
  if (typeof document === "undefined") return false;
  const active = document.activeElement;
  return !!(active && editor.view.dom.contains(active));
}

function pickParagraphApiText(data: {
  section_content?: string;
  content?: string;
}): string {
  const a = data?.section_content;
  const b = data?.content;
  if (typeof a === "string" && a.trim()) return a;
  if (typeof b === "string" && b.trim()) return b;
  return typeof a === "string" ? a : typeof b === "string" ? b : "";
}

function pickBackendMessage(error: unknown): string | null {
  const err = error as any;
  const message = err?.response?.data?.message;
  if (typeof message === "string" && message.trim()) return message.trim();
  if (Array.isArray(message)) {
    const joined = message.filter(Boolean).join(", ").trim();
    if (joined) return joined;
  }
  const fallback = err?.message;
  return typeof fallback === "string" && fallback.trim()
    ? fallback.trim()
    : null;
}

function isRouteMissingMessage(message: string): boolean {
  return /\bCannot\s+GET\b/i.test(message) || /\bNot\s+Found\b/i.test(message);
}

type TransformResultPayload = {
  intent?: string;
  action?: string;
  result?: string;
};

function parseTransformResult(content: string): TransformResultPayload | null {
  if (typeof content !== "string") return null;
  const start = content.indexOf(TRANSFORM_BEGIN);
  const end = content.lastIndexOf(TRANSFORM_END);
  if (start === -1 || end === -1 || end <= start) return null;

  const jsonText = content
    .slice(start + TRANSFORM_BEGIN.length, end)
    .trim();
  if (!jsonText.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(jsonText) as TransformResultPayload;
    if (parsed?.intent !== "text_transform") return null;
    if (typeof parsed?.result !== "string" || !parsed.result.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Custom node views by extending built-in nodes
const CustomHeading = Heading.extend({
  addNodeView() {
    return ReactNodeViewRenderer(NodeWithControls);
  },
} as any);

const CustomParagraph = Paragraph.extend({
  addNodeView() {
    return ReactNodeViewRenderer(NodeWithControls);
  },
} as any);

const CustomCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(NodeWithControls);
  },
} as any);

// Custom NodeView for heading and paragraph
const NodeWithControls: React.FC<NodeViewProps> = (props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const blockRef = React.useRef<HTMLDivElement>(null);

  const getPosition = () => {
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      return {
        top: rect.top + window.scrollY + 10,
        left: rect.left + window.scrollX,
      };
    }
    return { top: 0, left: 0 };
  };

  const handlePlusClick = useCallback(() => {
    setMenuPosition(getPosition());
    setShowMenu(true);
  }, []);

  const handleDragClick = useCallback(() => {
    setMenuPosition(getPosition());
    setShowToolbar(true);
  }, []);

  const onDragStart = (event: React.DragEvent) => {
    const pos = props.getPos();
    if (typeof pos === "number") {
      props.editor.commands.setNodeSelection(pos);
      event.dataTransfer.effectAllowed = "move";
    }
  };

  const handleBlockSelect = (option: string) => {
    const startPos = props.getPos();
    if (typeof startPos === "number") {
      const endPos = startPos + (props.node?.nodeSize ?? 1) - 1;
      props.editor.commands.setTextSelection({ from: endPos, to: endPos });
    }
    const chain = props.editor.chain().focus().splitBlock();
    switch (option) {
      case "text":
        chain.setParagraph().run();
        break;
      case "h1":
        chain.setHeading({ level: 1 }).run();
        break;
      case "h2":
        chain.setHeading({ level: 2 }).run();
        break;
      case "h3":
        chain.setHeading({ level: 3 }).run();
        break;
      case "bulletList":
        chain.setParagraph().toggleBulletList().run();
        break;
      case "numberedList":
        chain.setParagraph().toggleOrderedList().run();
        break;
      case "codeBlock":
        chain.toggleCodeBlock().run();
        break;
      case "table":
      case "image":
      default:
        break;
    }
    setShowMenu(false);
  };

  const isActive =
    props.editor?.state?.selection?.from >= (props.getPos?.() ?? 0) &&
    props.editor?.state?.selection?.to <=
      (props.getPos?.() ?? 0) + (props.node?.nodeSize ?? 0);

  return (
    <NodeViewWrapper className="relative group">
      <div
        className={`absolute top-1/2 -left-16 transform -translate-y-1/2 flex items-center space-x-1 transition-opacity ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        ref={blockRef}
        contentEditable={false}
      >
        <button
          type="button"
          onClick={handlePlusClick}
          className="p-1 rounded hover:bg-gray-200"
        >
          <MdAdd size={18} />
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200 cursor-grab"
          draggable
          onDragStart={onDragStart}
          onClick={handleDragClick}
        >
          <MdOutlineDragIndicator size={18} />
        </button>
      </div>

      {props.node.type.name === "heading" ? (
        (() => {
          const level = props.node.attrs.level || 1;
          const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
          const fontSize = level === 1 ? "text-[30px]" : "text-[20px] mt-6";
          return (
            <HeadingTag
              className={`prose focus:outline-none flex-1 font-bold ${fontSize}`}
            >
              <NodeViewContent as={"span" as any} className="contents" />
            </HeadingTag>
          );
        })()
      ) : props.node.type.name === "paragraph" ? (
        <p className="prose focus:outline-none flex-1 mt-2">
          <NodeViewContent as={"span" as any} className="contents" />
        </p>
      ) : props.node.type.name === "codeBlock" ? (
        <pre className="prose focus:outline-none flex-1">
          <code>
            <NodeViewContent as="div" className="contents" />
          </code>
        </pre>
      ) : (
        <div className="flex-1">
          <NodeViewContent className="prose focus:outline-none" />
        </div>
      )}

      {showMenu && (
        <BlockMenu
          position={menuPosition}
          onSelect={handleBlockSelect}
          onClose={() => setShowMenu(false)}
        />
      )}

      {showToolbar && (
        <BlockToolbar
          position={menuPosition}
          onSelect={() => setShowToolbar(false)}
          onClose={() => setShowToolbar(false)}
        />
      )}
    </NodeViewWrapper>
  );
};

// AI Suggestion Plugin Key
const suggestionPluginKey = new PluginKey("aiSuggestion");

const createSuggestionLoadingWidget = () => {
  const span = document.createElement("span");
  span.className =
    "inline-flex items-center gap-[3px] ml-0.5 align-baseline pointer-events-none";
  span.setAttribute("data-suggestion-loading", "true");
  span.setAttribute("aria-label", "Loading suggestion");

  for (let i = 0; i < 3; i += 1) {
    const dot = document.createElement("span");
    dot.className = "inline-block h-1 w-1 rounded-full bg-gray-400 animate-bounce";
    dot.style.animationDelay = `${i * 0.15}s`;
    span.appendChild(dot);
  }

  return span;
};

// Create AI Suggestion Extension
const AISuggestionExtension = Extension.create({
  name: "aiSuggestion",

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
            const action = tr.getMeta(suggestionPluginKey);
            if (action?.type === "addSuggestion") {
              const { pos, text } = action;
              const decoration = Decoration.widget(
                pos,
                () => {
                  const span = document.createElement("span");
                  span.className = "text-gray-400 pointer-events-none";
                  span.textContent = text;
                  span.setAttribute("data-suggestion", "true");
                  return span;
                },
                { side: 1 },
              );
              return DecorationSet.create(tr.doc, [decoration]);
            } else if (action?.type === "addSuggestionLoading") {
              const { pos } = action;
              const decoration = Decoration.widget(
                pos,
                () => createSuggestionLoadingWidget(),
                { side: 1 },
              );
              return DecorationSet.create(tr.doc, [decoration]);
            } else if (action?.type === "clearSuggestion") {
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

  addCommands() {
    return {
      addAISuggestion:
        (pos: number, text: string) =>
        ({
          tr,
          dispatch,
        }: {
          tr: Transaction;
          dispatch?: (tr: Transaction) => void;
        }) => {
          if (dispatch) {
            tr.setMeta(suggestionPluginKey, {
              type: "addSuggestion",
              pos,
              text,
            });
          }
          return true;
        },
      clearAISuggestion:
        () =>
        ({
          tr,
          dispatch,
        }: {
          tr: Transaction;
          dispatch?: (tr: Transaction) => void;
        }) => {
          if (dispatch) {
            tr.setMeta(suggestionPluginKey, { type: "clearSuggestion" });
          }
          return true;
        },
      addAISuggestionLoading:
        (pos: number) =>
        ({
          tr,
          dispatch,
        }: {
          tr: Transaction;
          dispatch?: (tr: Transaction) => void;
        }) => {
          if (dispatch) {
            tr.setMeta(suggestionPluginKey, {
              type: "addSuggestionLoading",
              pos,
            });
          }
          return true;
        },
      acceptAISuggestion:
        (pos: number, text: string) =>
        ({
          tr,
          dispatch,
        }: {
          tr: Transaction;
          dispatch?: (tr: Transaction) => void;
        }) => {
          if (dispatch) {
            tr.insertText(text, pos);
            tr.setMeta(suggestionPluginKey, { type: "clearSuggestion" });
          }
          return true;
        },
    } as any;
  },
});

// Main ParagraphEditor component
interface ParagraphEditorProps {
  aiApiUrl?: string;
  outlineResponse: string[];
  documentId?: string | null;
  initialContent?: string;
}

const fetchAISuggestion = async (payload: {
  topic: string;
  headings: string[];
  current_section: string;
  content_sofar: string;
}) => {
  const data = await generateParagraph(payload);
  return pickParagraphApiText(
    data as { section_content?: string; content?: string },
  );
};

const ParagraphEditor: React.FC<ParagraphEditorProps> = ({
  outlineResponse,
  documentId,
  initialContent,
}) => {
  const { setWordCount } = useContext(WordCountContext);
  const { setEditor: setEditorContext } = useContext(EditorContext);
  const { autoComplete, showAutocompleteButtons, citationStyle } = useContext(
    EditorPreferencesContext,
  );
  const editorShellRef = useRef<HTMLDivElement | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSuggestionKeyRef = useRef("");
  const suggestionRequestIdRef = useRef(0);
  const suggestionLoadingRef = useRef(false);
  const suppressSuggestionRef = useRef(false);
  const lastLoadedDocumentIdRef = useRef<string | null>(null);

  // Generate content from outlineResponse
  const computedInitialContent = useMemo(() => {
    if (initialContent) {
      return initialContent;
    }

    if (!outlineResponse || outlineResponse.length === 0) {
      return "<h1>Main Heading</h1><p></p>";
    }

    let content = "";
    outlineResponse.forEach((item, index) => {
      if (index === 0) {
        content += `<h1>${item}</h1><p></p>`;
      } else {
        content += `<h2>${item}</h2><p></p>`;
      }
    });

    return content;
  }, [initialContent, outlineResponse]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: false,
        codeBlock: false,
      }),
      CustomHeading,
      CustomParagraph,
      CustomCodeBlock,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          style: "border-collapse: collapse; width: 100%; margin: 16px 0;",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          style:
            "border: 1px solid #ddd; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: 600; min-width: 100px;",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          style: "border: 1px solid #ddd; padding: 12px; min-width: 100px;",
        },
      }),
      AISuggestionExtension,
    ],
    content: computedInitialContent,
    autofocus: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "focus:outline-none focus:ring-0 focus:border-none border-none outline-none",
        style: "border: none !important; outline: none !important;",
      },
    },
  });

  useEffect(() => {
    if (
      !editor ||
      !documentId ||
      lastLoadedDocumentIdRef.current === documentId
    ) {
      return;
    }

    editor.commands.setContent(
      initialContent || "<h1>Main Heading</h1><p></p>",
    );
    lastLoadedDocumentIdRef.current = documentId;
  }, [documentId, editor, initialContent]);

  const [aiSuggestion, setAISuggestion] = useState<string>("");
  const [suggestionCursorPos, setSuggestionCursorPos] = useState<number | null>(
    null,
  );
  const [suggestionButtonPos, setSuggestionButtonPos] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [formatToolbarPos, setFormatToolbarPos] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  // Helper function to extract all headings from the document
  const getAllHeadings = useCallback((): string[] => {
    if (!editor) return [];
    const doc = editor.state.doc;
    const headings: string[] = [];

    doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        const headingText = node.textContent.trim();
        if (headingText) {
          headings.push(headingText);
        }
      }
    });

    return headings;
  }, [editor]);

  // Helper function to get the first h1 heading (topic)
  const getTopic = useCallback((): string => {
    if (!editor) return "Main Topic";
    const doc = editor.state.doc;

    let firstH1: string | null = null;
    doc.descendants((node) => {
      if (node.type.name === "heading" && node.attrs.level === 1) {
        const headingText = node.textContent.trim();
        if (headingText && !firstH1) {
          firstH1 = headingText;
        }
      }
    });

    return firstH1 || "Main Topic";
  }, [editor]);

  /**
   * ProseMirror: doc.nodeAt(pos) only matches node boundaries, so scanning
   * positions backward never finds headings. Use nodesBetween instead.
   */
  const getSectionContextAt = useCallback(
    (cursorPos: number) => {
      if (!editor) {
        return { current_section: "Introduction", content_sofar: "" };
      }

      const doc = editor.state.doc;
      const topic = getTopic();
      const safeEnd = Math.min(Math.max(cursorPos, 0), doc.content.size);

      let lastHeadingText = "";
      let bodyStartAfterHeading = 0;
      let sawHeading = false;

      doc.nodesBetween(0, safeEnd, (node, pos) => {
        if (node.type.name === "heading") {
          const title = node.textContent.trim();
          if (title) {
            lastHeadingText = title;
            bodyStartAfterHeading = pos + node.nodeSize;
            sawHeading = true;
          }
        }
        return true;
      });

      const content_sofar = doc
        .textBetween(bodyStartAfterHeading, cursorPos, " ")
        .trim();

      const current_section = sawHeading ? lastHeadingText || topic : topic;

      return { current_section, content_sofar };
    },
    [editor, getTopic],
  );

  const clearSuggestionLoading = useCallback(() => {
    suggestionLoadingRef.current = false;
    (editor?.commands as any)?.clearAISuggestion?.();
  }, [editor]);

  const showSuggestionLoading = useCallback(
    (pos: number) => {
      if (!editor) return;
      suggestionLoadingRef.current = true;
      const commands = editor.commands as any;
      commands.clearAISuggestion?.();
      commands.addAISuggestionLoading?.(pos);
    },
    [editor],
  );

  const clearSuggestion = useCallback(() => {
    suggestionLoadingRef.current = false;
    setAISuggestion("");
    setSuggestionCursorPos(null);
    const commands = editor?.commands as any;
    commands?.clearAISuggestion?.();
  }, [editor]);

  const updateSuggestionButtonPosition = useCallback(
    (pos: number) => {
      if (!editor || !editorShellRef.current) return;

      try {
        const cursorRect = editor.view.coordsAtPos(pos);
        const shellRect = editorShellRef.current.getBoundingClientRect();
        const top = cursorRect.bottom - shellRect.top + 8;
        const left = Math.min(
          Math.max(cursorRect.left - shellRect.left, 0),
          Math.max(shellRect.width - 180, 0),
        );

        setSuggestionButtonPos({ top, left });
      } catch {
        setSuggestionButtonPos({ top: 0, left: 0 });
      }
    },
    [editor],
  );

  useEffect(() => {
    if (!editor) return;
    const scheduleSuggestionUpdate = ({
      transaction,
    }: {
      transaction: Transaction;
    }) => {
      if (!autoComplete) {
        clearSuggestion();
        return;
      }

      if (!transaction.docChanged || !editorHasEffectiveFocus(editor)) {
        return;
      }

      if (suggestionLoadingRef.current) {
        suggestionRequestIdRef.current += 1;
        clearSuggestionLoading();
      }

      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }

      suggestionTimerRef.current = setTimeout(async () => {
        if (suppressSuggestionRef.current) return;

        const { state } = editor;
        const { from, to } = state.selection;
        if (from !== to) {
          clearSuggestion();
          return;
        }

        const pos = from;
        const resolvedPos = state.doc.resolve(pos);
        if (resolvedPos.parent.type.name !== "paragraph") {
          clearSuggestion();
          return;
        }

        const textBeforeCursor = resolvedPos.parent.textBetween(
          0,
          resolvedPos.parentOffset,
          " ",
        );
        if (textBeforeCursor.trim().length < MIN_CHARS_BEFORE_CURSOR) {
          clearSuggestion();
          return;
        }

        // Build payload from document content
        const topic = getTopic();
        const headings = getAllHeadings();
        const { current_section, content_sofar } = getSectionContextAt(pos);
        const requestKey = JSON.stringify({
          topic,
          current_section,
          content_sofar,
        });

        if (!content_sofar || requestKey === lastSuggestionKeyRef.current) {
          return;
        }

        const requestId = suggestionRequestIdRef.current + 1;
        suggestionRequestIdRef.current = requestId;

        const payload = {
          topic,
          headings,
          current_section,
          content_sofar,
        };

        setAISuggestion("");
        setSuggestionCursorPos(null);
        showSuggestionLoading(pos);

        try {
          const suggestion = await fetchAISuggestion(payload);
          if (requestId !== suggestionRequestIdRef.current) return;

          suggestionLoadingRef.current = false;

          const plainText = suggestion.replace(/<[^>]*>/g, "");
          if (!plainText.trim()) {
            clearSuggestionLoading();
            return;
          }

          lastSuggestionKeyRef.current = requestKey;

          setAISuggestion(plainText);
          setSuggestionCursorPos(pos);

          const commands = editor.commands as any;
          commands.clearAISuggestion();
          commands.addAISuggestion(pos, plainText);
          updateSuggestionButtonPosition(pos);
        } catch (error) {
          if (requestId !== suggestionRequestIdRef.current) return;
          clearSuggestionLoading();
          const message = getAcademicErrorMessage(
            error,
            "AI suggestion failed.",
          );
          console.error("Error fetching AI suggestion:", message);
          toast.error(message, {
            id: "paragraph-suggestion-autocomplete",
            duration: 4000,
          });
        }
      }, PARAGRAPH_SUGGESTION_DEBOUNCE_MS);
    };

    editor.on("update", scheduleSuggestionUpdate);
    return () => {
      editor.off("update", scheduleSuggestionUpdate);
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }
    };
  }, [
    editor,
    getTopic,
    getAllHeadings,
    getSectionContextAt,
    autoComplete,
    clearSuggestion,
    clearSuggestionLoading,
    showSuggestionLoading,
    updateSuggestionButtonPosition,
  ]);

  // Share editor instance with context for FooterBar undo/redo
  useEffect(() => {
    if (editor) {
      setEditorContext(editor);
    }
    return () => {
      setEditorContext(null);
    };
  }, [editor, setEditorContext]);

  // Calculate and update word count
  useEffect(() => {
    if (!editor) return;

    const updateWordCount = () => {
      const text = editor.state.doc.textContent;
      // Count words (split by whitespace and filter empty strings)
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      const count = words.length;
      setWordCount(count);
    };

    // Update on initial load
    updateWordCount();

    // Update on editor changes
    editor.on("update", updateWordCount);
    editor.on("selectionUpdate", updateWordCount);

    return () => {
      editor.off("update", updateWordCount);
      editor.off("selectionUpdate", updateWordCount);
    };
  }, [editor, setWordCount]);

  useEffect(() => {
    if (!editor || !documentId) return;

    const AUTOSAVE_MS = 10_000;

    const handleAutosave = ({ transaction }: { transaction: Transaction }) => {
      if (!transaction.docChanged) return;

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(() => {
        void updateDocumentContent(documentId, editor.getHTML()).catch(
          (error) => {
            console.error(
              "Autosave failed:",
              getAcademicErrorMessage(error, "Could not autosave document."),
            );
          },
        );
      }, AUTOSAVE_MS);
    };

    editor.on("update", handleAutosave);

    return () => {
      editor.off("update", handleAutosave);
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [documentId, editor]);

  useEffect(() => {
    if (!editor) return;
    const handleSelection = () => {
      const { state } = editor;
      const { from, to } = state.selection;
      const hasSelection = from !== to;
      if (!hasSelection) {
        setShowFormatToolbar(false);
        return;
      }
      const sel = window.getSelection?.();
      if (!sel || sel.rangeCount === 0) {
        setShowFormatToolbar(false);
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        setFormatToolbarPos({
          top: rect.top + window.scrollY - 8,
          left: rect.left + rect.width / 2 + window.scrollX,
        });
        setShowFormatToolbar(true);
      } else {
        setShowFormatToolbar(false);
      }
    };
    editor.on("selectionUpdate", handleSelection);
    editor.on("transaction", handleSelection);
    return () => {
      editor.off("selectionUpdate", handleSelection);
      editor.off("transaction", handleSelection);
    };
  }, [editor]);

  const handleAccept = useCallback(() => {
    if (editor && aiSuggestion && suggestionCursorPos !== null) {
      trackToolGenerate({ toolName: "Main Tool" });
      suppressSuggestionRef.current = true;
      const commands = editor.commands as any;
      commands.acceptAISuggestion(suggestionCursorPos, aiSuggestion);
      setAISuggestion("");
      setSuggestionCursorPos(null);
      window.setTimeout(() => {
        suppressSuggestionRef.current = false;
      }, 2500);
    }
  }, [editor, aiSuggestion, suggestionCursorPos]);

  const handleTryAgain = useCallback(async () => {
    if (!editor) return;
    trackToolGenerate({ toolName: "Main Tool" });
    const pos = editor.state.selection.from;

    const topic = getTopic();
    const headings = getAllHeadings();
    const { current_section, content_sofar } = getSectionContextAt(pos);

    const payload = {
      topic,
      headings,
      current_section,
      content_sofar: content_sofar || "",
    };

    setAISuggestion("");
    setSuggestionCursorPos(null);
    showSuggestionLoading(pos);

    try {
      const suggestion = await fetchAISuggestion(payload);
      suggestionLoadingRef.current = false;

      const plainText = suggestion.replace(/<[^>]*>/g, "");
      if (!plainText.trim()) {
        clearSuggestionLoading();
        toast.error("No suggestion returned. Try typing a bit more and wait.");
        return;
      }

      lastSuggestionKeyRef.current = JSON.stringify({
        topic,
        current_section,
        content_sofar: content_sofar || "",
      });

      setAISuggestion(plainText);
      setSuggestionCursorPos(pos);
      updateSuggestionButtonPosition(pos);

      const commands = editor.commands as any;
      commands.clearAISuggestion();
      commands.addAISuggestion(pos, plainText);
    } catch (error) {
      clearSuggestionLoading();
      const message = getAcademicErrorMessage(
        error,
        "Could not refresh suggestion.",
      );
      toast.error(message, {
        id: "paragraph-suggestion-retry",
        duration: 4000,
      });
    }
  }, [
    editor,
    getTopic,
    getAllHeadings,
    getSectionContextAt,
    showSuggestionLoading,
    clearSuggestionLoading,
    updateSuggestionButtonPosition,
  ]);

  const handleCiteSelectedText = useCallback(async () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) {
      toast.error("Select text first to cite it.", { id: "cite-select-first" });
      return;
    }

    const selectedText = editor.state.doc.textBetween(from, to, " ").trim();
    if (selectedText.length < 3) {
      toast.error("Select a bit more text to cite.", {
        id: "cite-select-more",
      });
      return;
    }

    const q = selectedText.slice(0, 180);
    const style = normalizeCitationStyle(citationStyle);

    try {
      const res = await searchCitations({ q, style, type: "title" });
      const first = res.results?.[0];
      if (!first) {
        toast.error(
          "No citation found for this selection. Try selecting the paper title / DOI / PubMed ID, or a bit more context.",
          { id: "cite-none-found", duration: 5200 },
        );
        return;
      }

      const inText = String(first.in_text_citation || "").trim();
      const fallback = String(first.full_citation || "").trim();
      const citationText = inText || fallback;
      if (!citationText) {
        toast.error("Citation service returned an empty result.", {
          id: "cite-empty",
        });
        return;
      }

      const insert = inText ? ` ${inText}` : ` (${fallback})`;
      editor.chain().focus().insertContentAt(to, insert).run();

      toast.success("Citation inserted.", { id: "cite-inserted" });
    } catch (error) {
      const status = getAxiosStatus(error);
      const backendMessage = pickBackendMessage(error);

      if (status === 403) {
        toast.error(
          getAcademicErrorMessage(error, "Token balance exhausted."),
          {
            id: "cite-error-paywall",
            duration: 5200,
          },
        );
        return;
      }

      if (
        status === 404 ||
        status === 405 ||
        (backendMessage && isRouteMissingMessage(backendMessage))
      ) {
        toast.error(
          "Citation search isn’t available on this server yet. Please ask your backend team to enable `GET /v1/tools/citation-search`.",
          { id: "cite-search-unavailable", duration: 6500 },
        );
        return;
      }

      if (backendMessage) {
        toast.error(backendMessage, {
          id: "cite-error-backend",
          duration: 5200,
        });
        return;
      }

      toast.error("Citation failed. Try a different selection (title/DOI).", {
        id: "cite-error-generic",
        duration: 5200,
      });
    }
  }, [citationStyle, editor]);

  const [selectionChatOpen, setSelectionChatOpen] = useState(false);
  const [selectionChatText, setSelectionChatText] = useState("");
  const [selectionChatInput, setSelectionChatInput] = useState("");
  const [selectionChatLoading, setSelectionChatLoading] = useState(false);
  const selectionChatRangeRef = useRef<{ from: number; to: number } | null>(
    null,
  );
  const [selectionChatTransformHandled, setSelectionChatTransformHandled] =
    useState<Record<string, "accepted" | "rejected">>({});
  const [selectionChatPos, setSelectionChatPos] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const [selectionChatMessages, setSelectionChatMessages] = useState<
    InlineChatMessage[]
  >([
    {
      id: "welcome",
      role: "assistant",
      content: "Ask anything about the selected text.",
    },
  ]);

  const openSelectionChat = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) {
      toast.error("Select text first to chat about it.", {
        id: "chat-select-first",
      });
      return;
    }
    const selectedText = editor.state.doc.textBetween(from, to, " ").trim();
    if (!selectedText) {
      toast.error("Select text first to chat about it.", {
        id: "chat-select-first",
      });
      return;
    }

    // Anchor the chat box to the selection end inside the editor shell.
    try {
      const shell = editorShellRef.current;
      const shellRect = shell?.getBoundingClientRect();
      const caretRect = editor.view.coordsAtPos(to);
      if (shellRect) {
        const width = 360;
        const padding = 8;
        const top = caretRect.bottom - shellRect.top + 12;
        const left = clamp(
          caretRect.left - shellRect.left + 12,
          padding,
          Math.max(padding, shellRect.width - width - padding),
        );
        setSelectionChatPos({ top, left });
      }
    } catch {
      setSelectionChatPos({ top: 0, left: 0 });
    }

    setSelectionChatText(selectedText);
    selectionChatRangeRef.current = { from, to };
    setSelectionChatTransformHandled({});
    setSelectionChatOpen(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handler = ({ transaction }: { transaction: Transaction }) => {
      const range = selectionChatRangeRef.current;
      if (!range) return;
      selectionChatRangeRef.current = {
        from: transaction.mapping.map(range.from),
        to: transaction.mapping.map(range.to),
      };
    };

    editor.on("transaction", handler as any);
    return () => {
      editor.off("transaction", handler as any);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      if (!selectionChatOpen) return;
      const range = selectionChatRangeRef.current;
      if (!range) return;
      const { from, to } = editor.state.selection;
      if (from === range.from && to === range.to) return;
      setSelectionChatOpen(false);
    };

    editor.on("selectionUpdate", handler as any);
    return () => {
      editor.off("selectionUpdate", handler as any);
    };
  }, [editor, selectionChatOpen]);

  const handleAcceptSelectionTransform = useCallback(
    (messageId: string, payload: TransformResultPayload) => {
      if (!editor) return;
      const range = selectionChatRangeRef.current;
      if (!range) {
        toast.error("Select text again to apply this change.", {
          id: "selection-transform-missing-range",
        });
        return;
      }

      const next = String(payload.result || "").trim();
      if (!next) return;

      editor.chain().focus().insertContentAt({ from: range.from, to: range.to }, next).run();
      selectionChatRangeRef.current = {
        from: range.from,
        to: range.from + next.length,
      };
      setSelectionChatText(next);
      setSelectionChatTransformHandled((prev) => ({
        ...prev,
        [messageId]: "accepted",
      }));
      toast.success("Applied to selection.", { id: "selection-transform-applied" });
    },
    [editor],
  );

  const handleRejectSelectionTransform = useCallback((messageId: string) => {
    setSelectionChatTransformHandled((prev) => ({
      ...prev,
      [messageId]: "rejected",
    }));
  }, []);

  const handleHumanizeSelectedText = useCallback(async () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) {
      toast.error("Select text first to humanize it.", {
        id: "humanize-select-first",
      });
      return;
    }

    const selectedText = editor.state.doc.textBetween(from, to, " ").trim();
    if (!selectedText) {
      toast.error("Select text first to humanize it.", {
        id: "humanize-select-first",
      });
      return;
    }

    try {
      const res = await humanizeText({ text: selectedText, tone: "natural" });
      const next = String(res?.humanized_text || "").trim();
      if (!next) {
        toast.error("Humanizer returned an empty result.", {
          id: "humanize-empty",
        });
        return;
      }
      editor.chain().focus().insertContentAt({ from, to }, next).run();
      toast.success("Humanized.", { id: "humanize-ok" });
    } catch (error) {
      const status = getAxiosStatus(error);
      const backendMessage = pickBackendMessage(error);
      if (status === 403) {
        toast.error(
          getAcademicErrorMessage(error, "Token balance exhausted."),
          {
            id: "humanize-paywall",
            duration: 5200,
          },
        );
        return;
      }
      if (
        status === 404 ||
        status === 405 ||
        (backendMessage && isRouteMissingMessage(backendMessage))
      ) {
        toast.error(
          "Humanizer isn’t available on this server yet. Please enable `POST /v1/tools/humanizer`.",
          { id: "humanize-unavailable", duration: 6500 },
        );
        return;
      }
      if (backendMessage) {
        toast.error(backendMessage, { id: "humanize-backend", duration: 5200 });
        return;
      }
      toast.error("Could not humanize this text. Try again.", {
        id: "humanize-generic",
        duration: 5200,
      });
    }
  }, [editor]);

  const handleSendSelectionChat = useCallback(async () => {
    if (selectionChatLoading) return;
    const message = selectionChatInput.trim();
    if (!message) return;

    const style = normalizeCitationStyle(citationStyle);
    const nextMessages: InlineChatMessage[] = [
      ...selectionChatMessages,
      { id: `${Date.now()}-user`, role: "user", content: message },
    ];
    setSelectionChatInput("");
    setSelectionChatMessages(nextMessages);
    setSelectionChatLoading(true);

    try {
      const res = await sendResearchChat({
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
        document_content: selectionChatText || undefined,
        citation_style: style,
      });
      setSelectionChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: res.reply,
        },
      ]);
    } catch (error) {
      const status = getAxiosStatus(error);
      const backendMessage = pickBackendMessage(error);
      if (status === 403) {
        toast.error(
          getAcademicErrorMessage(error, "Token balance exhausted."),
          {
            id: "chat-paywall",
            duration: 5200,
          },
        );
      } else if (
        status === 404 ||
        status === 405 ||
        (backendMessage && isRouteMissingMessage(backendMessage))
      ) {
        toast.error(
          "Chat isn’t available on this server yet. Please enable `POST /v1/tools/research-chat`.",
          { id: "chat-unavailable", duration: 6500 },
        );
      } else if (backendMessage) {
        toast.error(backendMessage, { id: "chat-backend", duration: 5200 });
      } else {
        toast.error("Chat failed. Please try again.", {
          id: "chat-generic",
          duration: 5200,
        });
      }
    } finally {
      setSelectionChatLoading(false);
    }
  }, [
    citationStyle,
    selectionChatInput,
    selectionChatLoading,
    selectionChatMessages,
    selectionChatText,
  ]);

  // Handle keyboard shortcut for Accept (Shift + →)
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "ArrowRight" && aiSuggestion) {
        event.preventDefault();
        handleAccept();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, aiSuggestion, handleAccept]);

  return (
    <div ref={editorShellRef} className="relative">
      {editor && showFormatToolbar && (
        <div
          className="absolute z-50"
          style={{
            top: formatToolbarPos.top,
            left: formatToolbarPos.left,
            transform: "translate(-50%, -100%)",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <ParagraphToolbar
            onCite={() => void handleCiteSelectedText()}
            onHumanize={() => void handleHumanizeSelectedText()}
            onOpenChat={() => void openSelectionChat()}
            onSetBlock={(value) => {
              const { from, to } = editor.state.selection;
              const hasSelection = from !== to;
              if (hasSelection) {
                const selText = editor.state.doc.textBetween(from, to, "\n");
                if (!selText) return;
                const toListItems = (text: string) =>
                  text
                    .split(/\n+/)
                    .map((t) => `<li>${t || ""}</li>`)
                    .join("");
                let html = "";
                switch (value) {
                  case "text":
                    html = `<p>${selText}</p>`;
                    break;
                  case "h1":
                    html = `<h1>${selText}</h1>`;
                    break;
                  case "h2":
                    html = `<h2>${selText}</h2>`;
                    break;
                  case "h3":
                    html = `<h3>${selText}</h3>`;
                    break;
                  case "bulletList":
                    html = `<ul>${toListItems(selText)}</ul>`;
                    break;
                  case "numberedList":
                    html = `<ol>${toListItems(selText)}</ol>`;
                    break;
                  case "codeBlock":
                    html = `<pre><code>${selText}</code></pre>`;
                    break;
                  default:
                    break;
                }
                if (html) {
                  editor
                    .chain()
                    .focus()
                    .deleteSelection()
                    .insertContent(html)
                    .run();
                }
              } else {
                const chain = editor.chain().focus();
                switch (value) {
                  case "text":
                    chain.setParagraph().run();
                    break;
                  case "h1":
                    chain.setHeading({ level: 1 }).run();
                    break;
                  case "h2":
                    chain.setHeading({ level: 2 }).run();
                    break;
                  case "h3":
                    chain.setHeading({ level: 3 }).run();
                    break;
                  case "bulletList":
                    chain.toggleBulletList().run();
                    break;
                  case "numberedList":
                    chain.toggleOrderedList().run();
                    break;
                  case "codeBlock":
                    chain.toggleCodeBlock().run();
                    break;
                  default:
                    break;
                }
              }
            }}
            onToggleBold={() => editor.chain().focus().toggleBold().run()}
            onToggleItalic={() => editor.chain().focus().toggleItalic().run()}
            onToggleUnderline={() =>
              editor.chain().focus().toggleUnderline().run()
            }
            onToggleStrike={() => editor.chain().focus().toggleStrike().run()}
            onToggleCode={() => editor.chain().focus().toggleCode().run()}
            onLink={() => {}}
          />
        </div>
      )}
      {selectionChatOpen && (
        <div
          className="absolute z-[60] w-[360px] rounded-lg border border-gray-200 bg-white shadow-lg p-3"
          style={{
            top: selectionChatPos.top,
            left: selectionChatPos.left,
          }}
          onMouseDown={(e) => {
            // Keep editor selection stable when clicking inside the popup,
            // but still allow inputs/buttons to receive focus.
            const target = e.target as HTMLElement | null;
            const tag = target?.tagName?.toLowerCase();
            if (tag === "input" || tag === "textarea" || tag === "button") return;
            e.preventDefault();
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Chat about selection
              </div>
              <div className="mt-0.5 text-xs text-gray-500">
                Uses the selected text as context.
              </div>
            </div>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
              onClick={() => setSelectionChatOpen(false)}
            >
              Close
            </button>
          </div>

          <div className="mt-2 max-h-40 overflow-y-auto space-y-2">
            <div className="rounded-md bg-gray-50 border border-gray-100 p-2 text-xs text-gray-700 line-clamp-4">
              <span className="font-semibold text-gray-800">Selected:</span>{" "}
              {selectionChatText}
            </div>
            {selectionChatMessages.map((m) => (
              (() => {
                const transform =
                  m.role === "assistant" ? parseTransformResult(m.content) : null;
                const handled = selectionChatTransformHandled[m.id];
                const showActions =
                  !!transform && !handled && selectionChatRangeRef.current;
                const displayContent = transform?.result
                  ? transform.result
                  : m.content;

                return (
                  <div
                    key={m.id}
                    className={`text-xs rounded-md px-2 py-1 ${
                      m.role === "user"
                        ? "bg-primary-50 text-gray-800 border border-primary-100"
                        : "bg-gray-50 text-gray-800 border border-gray-100"
                    }`}
                  >
                    <div>
                      <span className="font-semibold">
                        {m.role === "user" ? "You" : "AI"}:
                      </span>{" "}
                      {displayContent}
                    </div>

                    {showActions && (
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-md bg-primary-400 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary-500"
                          onClick={() =>
                            handleAcceptSelectionTransform(m.id, transform!)
                          }
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                          onClick={() => handleRejectSelectionTransform(m.id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <input
              value={selectionChatInput}
              onChange={(e) => setSelectionChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSendSelectionChat();
              }}
              placeholder="Ask a question…"
              className="flex-1 rounded-md border border-gray-200 px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-100"
              disabled={selectionChatLoading}
            />
            <button
              type="button"
              className="rounded-md bg-primary-400 px-3 py-2 text-xs text-white hover:bg-primary-500 disabled:opacity-50"
              onClick={() => void handleSendSelectionChat()}
              disabled={selectionChatLoading || !selectionChatInput.trim()}
            >
              {selectionChatLoading ? "…" : "Send"}
            </button>
          </div>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="min-h-[300px] outline-none border-none focus:outline-none focus:ring-0 focus:border-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror]:focus:border-none"
      />
      {showAutocompleteButtons &&
        aiSuggestion &&
        suggestionCursorPos !== null && (
          <div
            className="absolute z-20 flex gap-2 items-center mt-1 p-1 bg-white rounded-md shadow-md border border-gray-300"
            style={{
              top: suggestionButtonPos.top,
              left: suggestionButtonPos.left,
            }}
            onMouseDown={(event) => event.preventDefault()}
          >
            <button
              className="px-2 py-1 bg-[#2b7fff] text-white rounded text-xs hover:bg-[#155dfc] w-max"
              onClick={handleAccept}
            >
              Accept <span className="ml-1 text-[10px]">(Shift + →)</span>
            </button>
            <button
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 w-max"
              onClick={handleTryAgain}
            >
              Try Again
            </button>
          </div>
        )}
    </div>
  );
};

export default ParagraphEditor;
