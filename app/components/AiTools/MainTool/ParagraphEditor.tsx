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
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
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
import CitationPicker, { type CitationCandidate } from "./CitationPicker";
import RewritePreview, { type RewriteKind } from "./RewritePreview";
import { MdOutlineDragIndicator, MdAdd, MdClose } from "react-icons/md";
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
  paraphraseSelection,
  rewriteAction,
  searchCitations,
  sendResearchChat,
  updateDocumentContent,
} from "./academicResearchApi";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { isBillingGateError } from "@/app/lib/client/billingGateCodes";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";

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

// A source inserted via the Cite action, shown in the References panel.
type DocumentReference = {
  id: string;
  inText: string;
  full: string;
  /** The sentence/selection this citation was attached to (provenance). */
  citedText?: string;
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

// References are persisted alongside the document by appending a hidden,
// machine-readable block to the saved HTML. This keeps the bibliography (and
// its source provenance) across reloads without a separate API.
const REFERENCES_MARKER_RE =
  /<!--\s*scholarly-references:(.*?)-->/s;

const serializeReferences = (references: DocumentReference[]): string => {
  if (!references.length) return "";
  try {
    const json = JSON.stringify(references);
    // Base64 so the JSON can't break out of the HTML comment.
    const encoded =
      typeof window !== "undefined"
        ? window.btoa(unescape(encodeURIComponent(json)))
        : Buffer.from(json, "utf-8").toString("base64");
    return `<!-- scholarly-references:${encoded} -->`;
  } catch {
    return "";
  }
};

const parseReferences = (html: string): DocumentReference[] => {
  const match = html.match(REFERENCES_MARKER_RE);
  if (!match) return [];
  try {
    const encoded = match[1].trim();
    const json =
      typeof window !== "undefined"
        ? decodeURIComponent(escape(window.atob(encoded)))
        : Buffer.from(encoded, "base64").toString("utf-8");
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r) => r && typeof r.full === "string" && r.full.trim(),
    );
  } catch {
    return [];
  }
};

const stripReferencesMarker = (html: string): string =>
  html.replace(REFERENCES_MARKER_RE, "").trim();

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

  // Select this block's full text range; returns false if the position is gone.
  const selectThisBlock = useCallback((): boolean => {
    const pos = props.getPos();
    if (typeof pos !== "number") return false;
    const from = pos + 1;
    const to = pos + (props.node?.nodeSize ?? 1) - 1;
    props.editor.chain().focus().setTextSelection({ from, to }).run();
    return true;
  }, [props]);

  // Drag-handle menu actions. Block-level edits run here directly; the three
  // AI/selection actions select the block and hand off to the parent editor's
  // existing handlers via a custom event (the NodeView can't call them directly).
  const handleToolbarSelect = useCallback(
    (option: string) => {
      setShowToolbar(false);
      const pos = props.getPos();
      const hasPos = typeof pos === "number";

      switch (option) {
        case "turnInto":
          // Reuse the block-type picker (text / headings / lists).
          setMenuPosition(getPosition());
          setShowMenu(true);
          return;
        case "highlight": {
          if (!selectThisBlock()) return;
          props.editor.chain().focus().toggleHighlight().run();
          return;
        }
        case "duplicate": {
          if (!hasPos) return;
          const json = props.node.toJSON();
          const insertAt = (pos as number) + props.node.nodeSize;
          props.editor.chain().focus().insertContentAt(insertAt, json).run();
          return;
        }
        case "delete": {
          if (!hasPos) return;
          const from = pos as number;
          const to = from + props.node.nodeSize;
          props.editor.chain().focus().deleteRange({ from, to }).run();
          return;
        }
        case "cite":
        case "aiChat":
        case "aiEdit": {
          if (!selectThisBlock()) return;
          // Hand off to the parent's selection handlers. Defer to the next tick
          // so the selection transaction is fully applied (and the toolbar has
          // closed) before the parent reads editor.state.selection.
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("mainTool:blockAction", {
                detail: { action: option },
              }),
            );
          }, 0);
          return;
        }
        default:
          return;
      }
    },
    [props, selectThisBlock],
  );

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
        chain
          .setParagraph()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
        break;
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
          onSelect={handleToolbarSelect}
          onClose={() => setShowToolbar(false)}
          blockType={props.node?.type?.name}
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
  const { gateOpen, closeGate, ensureGuestClick, isGuestOutOfAllowance } =
    useGuestGate();
  const editorShellRef = useRef<HTMLDivElement | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const referencesSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const autosaveVersionRef = useRef(0);
  const autosaveChainRef = useRef<Promise<unknown>>(Promise.resolve());
  const referencesLoadedRef = useRef(false);
  const suggestionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSuggestionKeyRef = useRef("");
  const suggestionRequestIdRef = useRef(0);
  const suggestionLoadingRef = useRef(false);
  const suppressSuggestionRef = useRef(false);
  const lastLoadedDocumentIdRef = useRef<string | null>(null);
  // Set briefly when a block drag-handle action (Cite / AI Chat / AI Edit)
  // programmatically selects a block and opens a popup. The block-selection
  // transaction would otherwise fire selectionUpdate handlers that immediately
  // dismiss the just-opened popup — the PDF's "Not working" block menus.
  const blockActionGuardRef = useRef(false);

  // Generate content from outlineResponse
  const computedInitialContent = useMemo(() => {
    if (initialContent) {
      return stripReferencesMarker(initialContent);
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
      Underline,
      Highlight.configure({ multicolor: false }),
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

  // Citation insert feedback + collected references (bibliography).
  const [citing, setCiting] = useState(false);
  const [references, setReferences] = useState<DocumentReference[]>([]);
  // Mirror of `references` for reading inside the autosave timer closure.
  const referencesRef = useRef<DocumentReference[]>([]);
  useEffect(() => {
    referencesRef.current = references;
  }, [references]);

  // Persist the bibliography when it changes, even without further doc edits,
  // so an inserted citation survives reload. Skips the initial load.
  useEffect(() => {
    if (!editor || !documentId) return;
    if (!referencesLoadedRef.current) return;

    if (referencesSaveTimerRef.current) {
      clearTimeout(referencesSaveTimerRef.current);
    }
    referencesSaveTimerRef.current = setTimeout(() => {
      const html = `${editor.getHTML()}${serializeReferences(references)}`;
      void updateDocumentContent(documentId, html).catch((error) => {
        console.error(
          "Saving references failed:",
          getAcademicErrorMessage(error, "Could not save references."),
        );
      });
    }, 1500);

    return () => {
      if (referencesSaveTimerRef.current) {
        clearTimeout(referencesSaveTimerRef.current);
      }
    };
  }, [references, editor, documentId]);

  useEffect(() => {
    if (
      !editor ||
      !documentId ||
      lastLoadedDocumentIdRef.current === documentId
    ) {
      return;
    }

    editor.commands.setContent(
      initialContent
        ? stripReferencesMarker(initialContent) || "<h1>Main Heading</h1><p></p>"
        : "<h1>Main Heading</h1><p></p>",
    );
    // Restore the persisted bibliography for this document.
    setReferences(initialContent ? parseReferences(initialContent) : []);
    referencesLoadedRef.current = true;
    lastLoadedDocumentIdRef.current = documentId;
  }, [documentId, editor, initialContent]);

  // When there is no document id (the in-memory page flow), the outline may
  // arrive AFTER the editor mounts — the editor only reads `content` at
  // creation, so headings would otherwise never appear. Apply them once the
  // outline is available and the editor is still effectively empty.
  const appliedOutlineRef = useRef(false);
  useEffect(() => {
    if (!editor || documentId) return;
    if (appliedOutlineRef.current) return;
    if (!outlineResponse || outlineResponse.length === 0) return;

    // Only overwrite an empty/default editor so we never clobber user typing.
    const text = editor.state.doc.textContent.trim();
    const isDefault = text === "" || text === "Main Heading";
    if (!isDefault) {
      appliedOutlineRef.current = true;
      return;
    }

    editor.commands.setContent(computedInitialContent);
    appliedOutlineRef.current = true;
  }, [editor, documentId, outlineResponse, computedInitialContent]);

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

  // Citation picker (Cite shows candidates; user picks before inserting).
  const [citePickerOpen, setCitePickerOpen] = useState(false);
  const [citeLoading, setCiteLoading] = useState(false);
  const [citeQuery, setCiteQuery] = useState("");
  const [citeResults, setCiteResults] = useState<CitationCandidate[]>([]);
  // The selection range to act on, captured before any modal steals focus.
  const pendingRangeRef = useRef<{ from: number; to: number } | null>(null);
  const pendingCiteTextRef = useRef<string>("");

  // Selection rewrite preview (Improve fluency / Paraphrase / Simplify /
  // Strengthen / Counter-argument / Change tense) — preview before applying.
  const [rewriteOpen, setRewriteOpen] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteKind, setRewriteKind] = useState<RewriteKind | null>(null);
  const [rewriteOriginal, setRewriteOriginal] = useState("");
  const [rewriteResult, setRewriteResult] = useState("");
  // "replace" swaps the selection; "append" inserts after it (counter-argument).
  const [rewriteMode, setRewriteMode] = useState<"replace" | "append">(
    "replace",
  );

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

        // Only auto-suggest when the user is at the END of the paragraph and has
        // just finished a word/sentence (trailing space or sentence punctuation).
        // This avoids firing while they are editing mid-sentence, which the QA
        // found intrusive — suggestions at an unexpected cursor position.
        const atBlockEnd = resolvedPos.parentOffset === resolvedPos.parent.content.size;
        const endsAtBoundary = /[\s.!?;:]$/.test(textBeforeCursor);
        if (!atBlockEnd || !endsAtBoundary) {
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

        // Inline autocomplete is an automatic (non-click) AI feature. A guest
        // who has used up their free allowance stops receiving suggestions
        // rather than getting unlimited free AI here; it fails silently (no gate
        // popup) since the user didn't explicitly click anything.
        if (isGuestOutOfAllowance()) {
          clearSuggestion();
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
    isGuestOutOfAllowance,
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

    // Update on content changes only — selectionUpdate does not change word count
    editor.on("update", updateWordCount);

    return () => {
      editor.off("update", updateWordCount);
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
        const version = ++autosaveVersionRef.current;
        const html = `${editor.getHTML()}${serializeReferences(
          referencesRef.current,
        )}`;
        // Serialize writes and skip a queued stale snapshot. This prevents a
        // slower older request from overwriting a newer edit.
        autosaveChainRef.current = autosaveChainRef.current.then(() => {
          if (version !== autosaveVersionRef.current) return;
          return updateDocumentContent(documentId, html, version);
        }).catch((error) => {
          console.error(
            "Autosave failed:",
            getAcademicErrorMessage(error, "Could not autosave document."),
          );
        });
      }, AUTOSAVE_MS);
    };

    editor.on("update", handleAutosave);

    return () => {
      editor.off("update", handleAutosave);
      if (referencesSaveTimerRef.current) {
        clearTimeout(referencesSaveTimerRef.current);
      }
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [documentId, editor]);

  useEffect(() => {
    if (!editor) return;
    const handleSelection = () => {
      // A block action is opening its own popup (cite/chat/edit) — don't pop the
      // format toolbar on top of it.
      if (blockActionGuardRef.current) {
        setShowFormatToolbar(false);
        return;
      }
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

  // Dismiss the current suggestion without accepting it. Suppress auto-retrigger
  // briefly so it doesn't immediately reappear at the same cursor.
  const handleDismissSuggestion = useCallback(() => {
    if (!editor) return;
    suppressSuggestionRef.current = true;
    (editor.commands as any).clearAISuggestion?.();
    setAISuggestion("");
    setSuggestionCursorPos(null);
    window.setTimeout(() => {
      suppressSuggestionRef.current = false;
    }, 1500);
  }, [editor]);

  const handleTryAgain = useCallback(async () => {
    if (!editor) return;
    // "Try again" is an explicit AI-triggering click for guests.
    if (!ensureGuestClick()) return;
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
    ensureGuestClick,
  ]);

  // Ctrl+/ (or Cmd+/) — manually trigger an AI suggestion even when autocomplete is off
  useEffect(() => {
    if (!editor) return;
    const handleManualSuggestion = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        const pos = editor.state.selection.from;
        const resolvedPos = editor.state.doc.resolve(pos);
        if (resolvedPos.parent.type.name !== "paragraph") {
          toast.error("Place the cursor inside a paragraph to get a suggestion.", {
            id: "manual-suggestion-para",
          });
          return;
        }
        const textBefore = resolvedPos.parent
          .textBetween(0, resolvedPos.parentOffset, " ")
          .trim();
        if (textBefore.length < MIN_CHARS_BEFORE_CURSOR) {
          toast.error("Type a bit more text first, then use Ctrl + /.", {
            id: "manual-suggestion-short",
          });
          return;
        }
        void handleTryAgain();
      }
    };
    document.addEventListener("keydown", handleManualSuggestion);
    return () => document.removeEventListener("keydown", handleManualSuggestion);
  }, [editor, handleTryAgain]);

  // Run a citation search and load the results into the picker. Shared by the
  // initial Cite action and the picker's own in-modal search box.
  const runCitationSearch = useCallback(
    async (rawQuery: string) => {
      const q = rawQuery.trim().slice(0, 180);
      if (q.length < 3) return;
      const style = normalizeCitationStyle(citationStyle);

      setCiteQuery(q);
      setCiteLoading(true);
      setCiting(true);
      try {
        const res = await searchCitations({ q, style, type: "title" });
        setCiteResults(res.results ?? []);
      } catch (error) {
        setCiteResults([]);
        const status = getAxiosStatus(error);
        const backendMessage = pickBackendMessage(error);

        if (isBillingGateError(error)) {
          // The global interceptor (ClientScripts.tsx) already opens the
          // upgrade popup for this — a toast here would be redundant.
        } else if (status === 403) {
          toast.error(getAcademicErrorMessage(error, "Token balance exhausted."), {
            id: "cite-status",
            duration: 5200,
          });
        } else if (
          status === 404 ||
          status === 405 ||
          (backendMessage && isRouteMissingMessage(backendMessage))
        ) {
          toast.error(
            "Citation search isn’t available on this server yet. Please ask your backend team to enable `GET /v1/tools/citation-search`.",
            { id: "cite-status", duration: 6500 },
          );
        } else if (backendMessage) {
          toast.error(backendMessage, { id: "cite-status", duration: 5200 });
        } else {
          toast.error("Citation search failed. Try a title or DOI.", {
            id: "cite-status",
            duration: 5200,
          });
        }
      } finally {
        setCiteLoading(false);
        setCiting(false);
      }
    },
    [citationStyle],
  );

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

    // Capture the insertion point (and the cited sentence, for provenance)
    // before the modal steals editor focus.
    pendingRangeRef.current = { from, to };
    pendingCiteTextRef.current = selectedText;
    setCiteResults([]);
    setCiteQuery(selectedText.slice(0, 180));
    setCitePickerOpen(true);
    await runCitationSearch(selectedText);
  }, [editor, runCitationSearch]);

  // Insert the citation the user chose from the picker and record it in the
  // References panel — the user sees what was found and picks, instead of the
  // first hit being inserted silently.
  const handleSelectCitation = useCallback(
    (choice: CitationCandidate) => {
      if (!editor) return;
      const inText = String(choice.in_text_citation || "").trim();
      const fallback = String(choice.full_citation || "").trim();
      if (!inText && !fallback) {
        toast.error("That source has no citation text.", { id: "cite-status" });
        return;
      }

      const at = pendingRangeRef.current?.to ?? editor.state.selection.to;
      const insert = inText ? ` ${inText}` : ` (${fallback})`;
      editor.chain().focus().insertContentAt(at, insert).run();

      if (fallback) {
        const citedText = pendingCiteTextRef.current;
        setReferences((prev) =>
          prev.some((r) => r.full === fallback)
            ? prev
            : [
                ...prev,
                {
                  id: `${Date.now()}-${prev.length}`,
                  inText: inText || `(${fallback})`,
                  full: fallback,
                  citedText: citedText || undefined,
                },
              ],
        );
      }

      setCitePickerOpen(false);
      pendingRangeRef.current = null;
      pendingCiteTextRef.current = "";
      toast.success("Citation inserted.", { id: "cite-status" });
    },
    [editor],
  );

  // --- Selection rewrite suite (preview-before-apply) ---------------------

  // Calls the right backend for a rewrite kind and returns { text, mode }.
  const fetchRewrite = useCallback(
    async (
      kind: RewriteKind,
      text: string,
    ): Promise<{ text: string; mode: "replace" | "append" }> => {
      switch (kind) {
        case "fluency": {
          const r = await paraphraseSelection({ text, tone_mode: "standard" });
          return { text: String(r.paraphrased_text || "").trim(), mode: "replace" };
        }
        case "paraphrase": {
          const r = await paraphraseSelection({ text, tone_mode: "academic" });
          return { text: String(r.paraphrased_text || "").trim(), mode: "replace" };
        }
        case "simplify": {
          const r = await paraphraseSelection({ text, tone_mode: "simple" });
          return { text: String(r.paraphrased_text || "").trim(), mode: "replace" };
        }
        case "strengthen": {
          const r = await rewriteAction({ text, action: "strengthen" });
          return { text: String(r.result_text || "").trim(), mode: r.mode };
        }
        case "counter": {
          const r = await rewriteAction({ text, action: "counter" });
          return { text: String(r.result_text || "").trim(), mode: r.mode };
        }
        case "tense-past":
        case "tense-present":
        case "tense-future": {
          const tense = kind.replace("tense-", "") as
            | "past"
            | "present"
            | "future";
          const r = await rewriteAction({ text, action: "tense", tense });
          return { text: String(r.result_text || "").trim(), mode: r.mode };
        }
        default:
          return { text: "", mode: "replace" };
      }
    },
    [],
  );

  const requestRewrite = useCallback(
    async (kind: RewriteKind, text: string) => {
      setRewriteLoading(true);
      setRewriteResult("");
      try {
        const { text: next, mode } = await fetchRewrite(kind, text);
        if (!next) {
          toast.error("The rewrite came back empty. Try again.", {
            id: "rewrite-status",
          });
          setRewriteResult("");
          return;
        }
        setRewriteMode(mode);
        setRewriteResult(next);
      } catch (error) {
        const status = getAxiosStatus(error);
        const backendMessage = pickBackendMessage(error);
        if (isBillingGateError(error)) {
          // The global interceptor (ClientScripts.tsx) already opens the
          // upgrade popup for this — a toast here would be redundant.
        } else if (status === 403) {
          toast.error(getAcademicErrorMessage(error, "Token balance exhausted."), {
            id: "rewrite-status",
            duration: 5200,
          });
        } else if (
          status === 404 ||
          status === 405 ||
          (backendMessage && isRouteMissingMessage(backendMessage))
        ) {
          toast.error(
            "This rewrite isn’t available on this server yet. Please enable the rewrite endpoints.",
            { id: "rewrite-status", duration: 6500 },
          );
        } else if (backendMessage) {
          toast.error(backendMessage, { id: "rewrite-status", duration: 5200 });
        } else {
          toast.error("Rewrite failed. Try again.", {
            id: "rewrite-status",
            duration: 5200,
          });
        }
        setRewriteResult("");
      } finally {
        setRewriteLoading(false);
      }
    },
    [fetchRewrite],
  );

  const handleRewriteAction = useCallback(
    (kind: RewriteKind) => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      if (from === to) {
        toast.error("Select text first.", { id: "rewrite-select-first" });
        return;
      }
      const selectedText = editor.state.doc.textBetween(from, to, " ").trim();
      if (selectedText.length < 3) {
        toast.error("Select a bit more text first.", {
          id: "rewrite-select-more",
        });
        return;
      }

      // Each rewrite is an AI-triggering click for guests.
      if (!ensureGuestClick()) return;

      pendingRangeRef.current = { from, to };
      setRewriteKind(kind);
      setRewriteOriginal(selectedText);
      setRewriteResult("");
      setRewriteOpen(true);
      void requestRewrite(kind, selectedText);
    },
    [editor, requestRewrite, ensureGuestClick],
  );

  const handleRewriteTryAgain = useCallback(() => {
    if (!rewriteKind || !rewriteOriginal) return;
    // A "try again" is another AI call — counts as a click for guests.
    if (!ensureGuestClick()) return;
    void requestRewrite(rewriteKind, rewriteOriginal);
  }, [rewriteKind, rewriteOriginal, requestRewrite, ensureGuestClick]);

  // List conversions are pure editor commands — instant and undoable, no AI.
  const handleConvertList = useCallback(
    (kind: "bullet" | "numbered") => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      if (from === to) {
        toast.error("Select text first.", { id: "list-select-first" });
        return;
      }
      if (kind === "bullet") {
        editor.chain().focus().toggleBulletList().run();
      } else {
        editor.chain().focus().toggleOrderedList().run();
      }
    },
    [editor],
  );

  const handleAcceptRewrite = useCallback(() => {
    if (!editor || !rewriteResult) return;
    const range = pendingRangeRef.current;
    if (!range) {
      setRewriteOpen(false);
      return;
    }

    if (rewriteMode === "append") {
      // Insert after the selection on a new line (counter-argument).
      editor
        .chain()
        .focus()
        .insertContentAt(range.to, `\n\n${rewriteResult}`)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContentAt({ from: range.from, to: range.to }, rewriteResult)
        .run();
    }

    setRewriteOpen(false);
    setRewriteKind(null);
    pendingRangeRef.current = null;
    toast.success("Applied.", { id: "rewrite-status" });
  }, [editor, rewriteResult, rewriteMode]);

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
      // Don't auto-close while a block action is opening the popup.
      if (blockActionGuardRef.current) return;
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

    // Humanizing is an AI-triggering click for guests.
    if (!ensureGuestClick()) return;

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
      if (isBillingGateError(error)) {
        // The global interceptor (ClientScripts.tsx) already opens the
        // upgrade popup for this — a toast here would be redundant.
      } else if (status === 403) {
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
  }, [editor, ensureGuestClick]);

  const handleSendSelectionChat = useCallback(async () => {
    if (selectionChatLoading) return;
    const message = selectionChatInput.trim();
    if (!message) return;

    // Each research-chat send is an AI-triggering click for guests.
    if (!ensureGuestClick()) return;

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
      if (isBillingGateError(error)) {
        // The global interceptor (ClientScripts.tsx) already opens the
        // upgrade popup for this — a toast here would be redundant.
      } else if (status === 403) {
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
    ensureGuestClick,
  ]);

  // Handle keyboard shortcut for Accept (Shift + →)
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!aiSuggestion) return;
      if (event.shiftKey && event.key === "ArrowRight") {
        event.preventDefault();
        handleAccept();
      } else if (event.key === "Escape") {
        event.preventDefault();
        handleDismissSuggestion();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, aiSuggestion, handleAccept, handleDismissSuggestion]);

  // The block drag-handle menu (a Tiptap NodeView) dispatches AI/selection
  // actions as a custom event; route them to the same handlers the floating
  // selection toolbar uses. The NodeView has already selected the block's text.
  useEffect(() => {
    const onBlockAction = (e: Event) => {
      const action = (e as CustomEvent<{ action?: string }>).detail?.action;
      // Guard the opening transaction so selection handlers don't dismiss the
      // popup we're about to open. Cleared on the next tick, after the block's
      // selection has settled.
      blockActionGuardRef.current = true;
      window.setTimeout(() => {
        blockActionGuardRef.current = false;
      }, 250);

      if (action === "cite") void handleCiteSelectedText();
      else if (action === "aiChat") void openSelectionChat();
      else if (action === "aiEdit") void handleHumanizeSelectedText();
    };
    window.addEventListener("mainTool:blockAction", onBlockAction);
    return () => window.removeEventListener("mainTool:blockAction", onBlockAction);
  }, [handleCiteSelectedText, openSelectionChat, handleHumanizeSelectedText]);

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
            onRewrite={(kind) => handleRewriteAction(kind)}
            onConvertList={(kind) => handleConvertList(kind)}
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

      <CitationPicker
        open={citePickerOpen}
        loading={citeLoading}
        query={citeQuery}
        style={normalizeCitationStyle(citationStyle)}
        results={citeResults}
        onSearch={(q) => void runCitationSearch(q)}
        onSelect={handleSelectCitation}
        onClose={() => {
          setCitePickerOpen(false);
          pendingRangeRef.current = null;
        }}
      />

      <RewritePreview
        open={rewriteOpen}
        loading={rewriteLoading}
        kind={rewriteKind}
        mode={rewriteMode}
        original={rewriteOriginal}
        result={rewriteResult}
        onAccept={handleAcceptRewrite}
        onTryAgain={handleRewriteTryAgain}
        onClose={() => {
          setRewriteOpen(false);
          setRewriteKind(null);
          pendingRangeRef.current = null;
        }}
      />

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
            <button
              aria-label="Dismiss suggestion"
              title="Dismiss (Esc)"
              className="flex items-center justify-center h-6 w-6 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              onClick={handleDismissSuggestion}
            >
              <MdClose size={14} />
            </button>
          </div>
        )}

      {references.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              References{" "}
              <span className="font-normal text-gray-400">
                ({references.length})
              </span>
            </h3>
            <button
              type="button"
              className="text-xs text-[#2b7fff] hover:underline"
              onClick={() => {
                void navigator.clipboard
                  .writeText(references.map((r) => r.full).join("\n"))
                  .then(() =>
                    toast.success("References copied.", { id: "refs-copied" }),
                  );
              }}
            >
              Copy all
            </button>
          </div>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
            {references.map((r) => (
              <li key={r.id} className="break-words">
                <div>{r.full}</div>
                {r.citedText ? (
                  <div className="mt-0.5 text-xs text-gray-400">
                    Cited from: “{r.citedText.slice(0, 120)}
                    {r.citedText.length > 120 ? "…" : ""}”
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      )}
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default ParagraphEditor;
