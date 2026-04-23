"use client";

import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useContext,
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
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Transaction } from "@tiptap/pm/state";
import BlockMenu from "./BlockMenu";
import BlockToolbar from "./BlockToolbar";
import ParagraphToolbar from "./ParagraphToolbar";
import axios from "axios";
import { MdOutlineDragIndicator, MdAdd } from "react-icons/md";
import { WordCountContext, EditorContext } from "./MainToolLayout";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";

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
              <NodeViewContent as="div" className="contents" />
            </HeadingTag>
          );
        })()
      ) : props.node.type.name === "paragraph" ? (
        <p className="prose focus:outline-none flex-1 mt-2">
          <NodeViewContent as="div" className="contents" />
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
}

const fetchAISuggestion = async (
  payload: {
    topic: string;
    headings: string[];
    current_section: string;
    content_sofar: string;
  },
  apiUrl: string,
) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await axios.post(apiUrl, payload, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  });
  console.log("API Response:", res.data);
  return res.data.section_content as string;
};

const ParagraphEditor: React.FC<ParagraphEditorProps> = ({
  aiApiUrl = `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/paragraph-generator`,
  outlineResponse,
}) => {
  const { setWordCount } = useContext(WordCountContext);
  const { setEditor: setEditorContext } = useContext(EditorContext);

  // Generate content from outlineResponse
  const initialContent = useMemo(() => {
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
  }, [outlineResponse]);

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
      Underline,
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
    content: initialContent,
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

  // Helper function to determine current section based on cursor position
  const getCurrentSection = useCallback(
    (cursorPos: number): string => {
      if (!editor) return "Introduction";

      const doc = editor.state.doc;
      let currentSection = "Introduction";

      for (let i = cursorPos; i >= 0; i--) {
        const node = doc.nodeAt(i);
        if (node && node.type.name === "heading") {
          const headingText = node.textContent.trim();
          if (headingText) {
            currentSection = headingText;
            break;
          }
        }
      }

      return currentSection;
    },
    [editor],
  );

  // Helper function to get content under current section
  const getContentUnderCurrentSection = useCallback(
    (cursorPos: number): string => {
      if (!editor) return "";

      const doc = editor.state.doc;
      let sectionStartPos = 0;
      let foundCurrentHeading = false;

      for (let i = cursorPos; i >= 0; i--) {
        const node = doc.nodeAt(i);
        if (node && node.type.name === "heading") {
          sectionStartPos = i + node.nodeSize;
          foundCurrentHeading = true;
          break;
        }
      }

      if (!foundCurrentHeading) {
        return "";
      }

      const content = doc.textBetween(sectionStartPos, cursorPos, " ");
      return content.trim();
    },
    [editor],
  );

  useEffect(() => {
    if (!editor) return;
    const updateSuggestion = async () => {
      const pos = editor.state.selection.from;

      // Build payload from document content
      const topic = getTopic();
      const headings = getAllHeadings();
      const current_section = getCurrentSection(pos);
      const content_sofar = getContentUnderCurrentSection(pos);

      const payload = {
        topic,
        headings,
        current_section,
        content_sofar: content_sofar || "",
      };

      const suggestion = await fetchAISuggestion(payload, aiApiUrl);
      const plainText = suggestion.replace(/<[^>]*>/g, "");

      setAISuggestion(plainText);
      setSuggestionCursorPos(pos);

      // Clear previous suggestion and add new one
      const commands = editor.commands as any;
      commands.clearAISuggestion();
      commands.addAISuggestion(pos, plainText);

      // Position the buttons near the cursor
      const dom = editor.view.domAtPos(pos);
      if (dom.node instanceof HTMLElement) {
        const rect = dom.node.getBoundingClientRect();
        setSuggestionButtonPos({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
    };
    editor.on("selectionUpdate", updateSuggestion);
    return () => {
      editor.off("selectionUpdate", updateSuggestion);
    };
  }, [
    editor,
    aiApiUrl,
    getTopic,
    getAllHeadings,
    getCurrentSection,
    getContentUnderCurrentSection,
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
      const commands = editor.commands as any;
      commands.acceptAISuggestion(suggestionCursorPos, aiSuggestion);
      setAISuggestion("");
      setSuggestionCursorPos(null);
    }
  }, [editor, aiSuggestion, suggestionCursorPos]);

  const handleTryAgain = useCallback(async () => {
    if (!editor) return;
    trackToolGenerate({ toolName: "Main Tool" });
    const pos = editor.state.selection.from;

    const topic = getTopic();
    const headings = getAllHeadings();
    const current_section = getCurrentSection(pos);
    const content_sofar = getContentUnderCurrentSection(pos);

    const payload = {
      topic,
      headings,
      current_section,
      content_sofar: content_sofar || "",
    };

    const suggestion = await fetchAISuggestion(payload, aiApiUrl);
    const plainText = suggestion.replace(/<[^>]*>/g, "");

    setAISuggestion(plainText);
    setSuggestionCursorPos(pos);

    const commands = editor.commands as any;
    commands.clearAISuggestion();
    commands.addAISuggestion(pos, plainText);
  }, [
    editor,
    aiApiUrl,
    getTopic,
    getAllHeadings,
    getCurrentSection,
    getContentUnderCurrentSection,
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
    <div className="relative">
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
      <EditorContent
        editor={editor}
        className="min-h-[300px] outline-none border-none focus:outline-none focus:ring-0 focus:border-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror]:focus:border-none"
      />
      {aiSuggestion && suggestionCursorPos !== null && (
        <div
          className="absolute z-20 flex gap-2 items-center mt-1 p-1 bg-white rounded-md shadow-md border border-gray-300"
          style={{
            top: suggestionButtonPos.top,
            left: suggestionButtonPos.left,
          }}
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
