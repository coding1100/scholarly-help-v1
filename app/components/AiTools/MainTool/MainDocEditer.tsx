"use client";

import React, { useRef, useState, useEffect, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Paragraph from "@tiptap/extension-paragraph";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { BsFileEarmarkText } from "react-icons/bs";
import { HiOutlineDocumentArrowUp, HiOutlineSparkles } from "react-icons/hi2";
// import { SiMicrosoftword } from "react-icons/si";
import { Extension } from "@tiptap/core";
// import PromptModal from "../PopModal/PromptModal";
import {
  TitleContext,
  EditorContext,
  EditorPreferencesContext,
} from "./MainToolLayout";
import ParagraphToolbar from "./ParagraphToolbar";
import PromptModal from "../PromptModal";
import toast from "react-hot-toast";
import {
  createDocument,
  getAcademicErrorMessage,
  parseDocumentFile,
} from "./academicResearchApi";
import {
  generateOutline,
  outlineToHtml,
  standardOutline,
  titleFromPrompt,
  type OutlineMode,
} from "./outlineGeneration";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
// import ParagraphToolbar from "../../Paragraph-tool/ParagraphToolbar";

// Custom backspace behavior
const BackspaceBehavior = Extension.create({
  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;

        if ($from.parent.content.size === 0 && $from.pos > 1) {
          return editor.commands.deleteNode("paragraph");
        }

        return false;
      },
    };
  },
});

interface MainDocEditorProps {
  onStartWriting: () => void;
  setOutlineResponse: React.Dispatch<React.SetStateAction<string[]>>;
}

const MainDocEditor: React.FC<MainDocEditorProps> = ({
  onStartWriting,
  setOutlineResponse,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();
  const { title, setTitle } = useContext(TitleContext);
  const { setEditor: setEditorContext } = useContext(EditorContext);
  const { citationStyle, setCitationStyle } = useContext(
    EditorPreferencesContext,
  );
  const [showStarterOptions, setShowStarterOptions] = useState(true);
  const [isTypingTitle, setIsTypingTitle] = useState(false);
  const [isPromptModalOpen, setPromptModalOpen] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [selectedOutline, setSelectedOutline] = useState("smart");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [formatToolbarPos, setFormatToolbarPos] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ paragraph: false }),
      Paragraph,
      BackspaceBehavior,
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
    ],
    immediatelyRender: false,
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose focus:outline-none focus:ring-0 focus:border-none min-h-[200px] max-w-full px-4 py-2 cursor-text border-none outline-none",
        style: "border: none !important; outline: none !important;",
      },
    },
  });

  // Share editor instance with context for FooterBar table insertion
  useEffect(() => {
    if (editor) {
      setEditorContext(editor);
    }
    return () => {
      setEditorContext(null);
    };
  }, [editor, setEditorContext]);

  // Enter key on title
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsTypingTitle(true);
    if (e.key === "Enter") {
      e.preventDefault();
      setIsTypingTitle(false);
      if (title.trim() !== "") {
        setShowStarterOptions(false);
        if (editor?.isEmpty) {
          editor.commands.setContent("<p></p>");
        }
        editor?.commands.focus("end");
      }
    }
  };

  // Backspace from below paragraph deletes and jumps up
  useEffect(() => {
    if (!editor) return;

    const checkContentEmpty = () => {
      const json = editor.getJSON();
      const hasContent = json.content?.some((node) =>
        node.content?.some(
          (inner: any) =>
            typeof inner.text === "string" && inner.text.trim() !== "",
        ),
      );

      if (!title.trim() && !hasContent) {
        setShowStarterOptions(true);
      }
    };

    editor.on("update", checkContentEmpty);

    return () => {
      editor.off("update", checkContentEmpty); // ✅ Clean-up correctly
    };
  }, [editor, title]);

  // Floating toolbar above selection
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

  // Hide starter options and editor content when typing in title
  useEffect(() => {
    if (title.trim() === "") {
      setShowStarterOptions(true);
    } else if (isTypingTitle) {
      setShowStarterOptions(false);
    }
  }, [title, isTypingTitle]);

  const handleDocImportClick = () => {
    fileInputRef.current?.click();
  };

  const startPersistedDocument = async (
    content: string,
    fallbackTitle: string,
  ) => {
    try {
      const document = await createDocument({
        title: title.trim() || fallbackTitle || "Untitled",
        content,
      });
      const savedDocumentId = document.id || document._id;
      if (savedDocumentId) {
        router.replace(
          `${
            pathname || "/tools/academic-research-assistant"
          }?doc=${savedDocumentId}`,
        );
      }
    } catch (error) {
      toast.error(
        getAcademicErrorMessage(error, "Could not save the document yet."),
      );
    } finally {
      onStartWriting();
    }
  };

  const handleGenerateHeadings = async () => {
    const prompt = promptInput.trim();
    if (!prompt) {
      toast.error("Add a document prompt first.");
      return;
    }

    const docTitle = titleFromPrompt(prompt);
    const mode = selectedOutline as OutlineMode;

    // Standard / none are deterministic — no AI call, no spinner needed, and
    // NOT counted against the guest click allowance.
    if (mode === "standard" || mode === "none") {
      const sections = mode === "standard" ? standardOutline(prompt) : [];
      setOutlineResponse(sections);
      if (!title.trim()) setTitle(docTitle);
      await startPersistedDocument(
        sections.length ? outlineToHtml(sections) : "<p></p>",
        docTitle,
      );
      return;
    }

    // A custom AI outline is an AI-triggering click — gate it for guests.
    guardAiClick(async () => {
      setIsGenerating(true);
      try {
        const { sections, usedFallback } = await generateOutline(mode, prompt);
        if (usedFallback) {
          toast("Couldn’t build a custom outline — used a standard structure.", {
            id: "outline-fallback",
          });
        }

        setOutlineResponse(sections);
        if (!title.trim()) setTitle(docTitle);
        await startPersistedDocument(outlineToHtml(sections), docTitle);
      } catch (error) {
        // Never strand the user on an empty page: fall back to the deterministic
        // skeleton instead of a blank draft.
        const sections = standardOutline(prompt);
        toast(
          getAcademicErrorMessage(
            error,
            "Couldn’t reach the outline service — used a standard structure.",
          ),
          { id: "outline-fallback" },
        );
        setOutlineResponse(sections);
        if (!title.trim()) setTitle(docTitle);
        await startPersistedDocument(outlineToHtml(sections), docTitle);
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const handleImportFile = async (file: File) => {
    setIsGenerating(true);
    try {
      const response = await parseDocumentFile(file);
      const importedText = String(response.text || "").trim();
      setShowStarterOptions(false);
      editor?.commands.setContent(`<p>${importedText || file.name}</p>`);
      if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
      editor?.commands.focus("end");
      toast.success("Document imported");
    } catch (error) {
      console.error("Error importing document:", error);
      toast.error(
        getAcademicErrorMessage(error, "Could not import this file."),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      data-tour="ara-welcome-screen"
      className="p-8 max-w-3xl mx-auto relative"
    >
      <ToolsApiLoader show={isGenerating} contained />
      {/* ===== Editable Title ===== */}
      <div className="relative w-full mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setIsTypingTitle(true);
          }}
          onBlur={() => setIsTypingTitle(false)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="text-4xl font-bold focus:outline-none w-full border-none focus:ring-0 bg-transparent placeholder-gray-400"
        />
      </div>

      {/* ===== Starter Options ===== */}
      {!isTypingTitle && showStarterOptions && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Set up your research document
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Add a prompt, choose citation settings, then generate headings
                or start from a blank page.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-400"
              onClick={() => setPromptModalOpen(true)}
            >
              Advanced prompt
            </button>
          </div>

          <label className="mt-5 block text-sm font-medium text-gray-800">
            Fill document prompt
          </label>
          <textarea
            value={promptInput}
            onChange={(event) => setPromptInput(event.target.value)}
            placeholder="Example: Write a literature review about AI in higher education with recent peer-reviewed sources."
            className="mt-2 h-28 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
          />

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-medium text-gray-800">
              Citation style
              <select
                value={citationStyle}
                onChange={(event) => setCitationStyle(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-400"
              >
                <option value="APA 7th edition">APA 7th edition</option>
                <option value="MLA 9th edition">MLA 9th edition</option>
                <option value="Chicago 17th edition">
                  Chicago 17th edition
                </option>
                <option value="Harvard">Harvard</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-800">
              Headings
              <select
                value={selectedOutline}
                onChange={(event) => setSelectedOutline(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-400"
              >
                <option value="smart">Smart headings</option>
                <option value="standard">Standard headings</option>
                <option value="none">No headings</option>
              </select>
            </label>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => void handleGenerateHeadings()}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary-400 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <HiOutlineSparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate headings"}
            </button>
            <button
              type="button"
              onClick={() => {
                void startPersistedDocument("<p></p>", title || "Untitled");
              }}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              <BsFileEarmarkText size={16} />
              Start writing
            </button>
            <button
              type="button"
              onClick={handleDocImportClick}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              <HiOutlineDocumentArrowUp className="h-4 w-4" />
              Import Word
              <span className="rounded bg-primary-100 px-1 text-[10px] text-primary-400">
                BETA
              </span>
            </button>
            <input
              type="file"
              accept=".doc,.docx,.pdf,.txt"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImportFile(file);
              }}
            />
          </div>
        </div>
      )}

      {/* ===== Editor Content ===== */}
      {!isTypingTitle && !showStarterOptions && editor && (
        <div className="relative">
          {showFormatToolbar && (
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
                    const selText = editor.state.doc.textBetween(
                      from,
                      to,
                      "\n",
                    );
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
                onToggleItalic={() =>
                  editor.chain().focus().toggleItalic().run()
                }
                onToggleUnderline={() =>
                  editor.chain().focus().toggleUnderline().run()
                }
                onToggleStrike={() =>
                  editor.chain().focus().toggleStrike().run()
                }
                onToggleCode={() => editor.chain().focus().toggleCode().run()}
                onLink={() => {}}
              />
            </div>
          )}
          <EditorContent
            editor={editor}
            className="outline-none border-none focus:outline-none focus:ring-0 focus:border-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror]:focus:border-none"
          />
        </div>
      )}

      {/* ===== Click Below Area ===== */}
      {!isTypingTitle && (
        <div
          className="h-24 cursor-text"
          onClick={() => {
            setShowStarterOptions(false);
            if (editor?.isEmpty) {
              editor.commands.setContent("<p></p>");
            }
            editor?.commands.focus("end");
          }}
        />
      )}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        onStartWriting={onStartWriting}
        setOutlineResponse={setOutlineResponse}
      />
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default MainDocEditor;
