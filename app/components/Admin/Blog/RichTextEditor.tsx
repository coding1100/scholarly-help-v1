"use client";

import { useEffect } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-8 rounded px-2 py-1 text-sm font-semibold ${
        active ? "bg-[#283c88] text-white" : "text-[#374151] hover:bg-[#eef0f8]"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", previous || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };
  const c = () => editor.chain().focus();
  return (
    <div className="flex flex-wrap gap-1 border-b border-[#e2e8f4] bg-[#f8f9fc] p-1.5">
      <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
      <ToolbarButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
      <ToolbarButton label="Paragraph" active={editor.isActive("paragraph")} onClick={() => c().setParagraph().run()}>¶</ToolbarButton>
      <span className="mx-1 w-px bg-[#e2e8f4]" />
      <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()}>B</ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()}><em>I</em></ToolbarButton>
      <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => c().toggleUnderline().run()}><u>U</u></ToolbarButton>
      <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>Link</ToolbarButton>
      <span className="mx-1 w-px bg-[#e2e8f4]" />
      <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()}>• List</ToolbarButton>
      <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()}>1. List</ToolbarButton>
      <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()}>“ ”</ToolbarButton>
      <span className="mx-1 w-px bg-[#e2e8f4]" />
      <ToolbarButton label="Insert table" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</ToolbarButton>
      {editor.isActive("table") && (
        <>
          <ToolbarButton label="Add row" onClick={() => c().addRowAfter().run()}>+Row</ToolbarButton>
          <ToolbarButton label="Add column" onClick={() => c().addColumnAfter().run()}>+Col</ToolbarButton>
          <ToolbarButton label="Delete row" onClick={() => c().deleteRow().run()}>−Row</ToolbarButton>
          <ToolbarButton label="Delete column" onClick={() => c().deleteColumn().run()}>−Col</ToolbarButton>
          <ToolbarButton label="Delete table" onClick={() => c().deleteTable().run()}>✕Table</ToolbarButton>
        </>
      )}
      <span className="mx-1 w-px bg-[#e2e8f4]" />
      <ToolbarButton label="Undo" onClick={() => c().undo().run()}>↶</ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => c().redo().run()}>↷</ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true },
        codeBlock: false,
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "blog-admin-prose min-h-[160px] px-4 py-3 outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Keep the editor in sync if the block is replaced from outside (e.g. post reload).
  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="overflow-hidden rounded-lg border border-[#d6dbec] bg-white">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
