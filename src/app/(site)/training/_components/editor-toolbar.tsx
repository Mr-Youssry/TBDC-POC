"use client";

import type { Editor } from "@tiptap/react";

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const btn = (
    active: boolean,
    onClick: () => void,
    label: string,
    children: React.ReactNode
  ) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={[
        "px-2 py-1 rounded text-xs transition-colors",
        active
          ? "bg-surface-3 text-text-1 font-semibold"
          : "text-text-3 hover:bg-surface-2 hover:text-text-1",
      ].join(" ")}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-surface-2">
      {btn(
        editor.isActive("heading", { level: 1 }),
        () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        "Heading 1",
        "H1"
      )}
      {btn(
        editor.isActive("heading", { level: 2 }),
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        "Heading 2",
        "H2"
      )}
      {btn(
        editor.isActive("heading", { level: 3 }),
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        "Heading 3",
        "H3"
      )}
      <div className="w-px h-4 bg-border mx-1" />
      {btn(
        editor.isActive("bold"),
        () => editor.chain().focus().toggleBold().run(),
        "Bold",
        <span className="font-bold">B</span>
      )}
      {btn(
        editor.isActive("italic"),
        () => editor.chain().focus().toggleItalic().run(),
        "Italic",
        <span className="italic">I</span>
      )}
      <div className="w-px h-4 bg-border mx-1" />
      {btn(
        editor.isActive("bulletList"),
        () => editor.chain().focus().toggleBulletList().run(),
        "Bullet list",
        "• List"
      )}
      {btn(
        editor.isActive("orderedList"),
        () => editor.chain().focus().toggleOrderedList().run(),
        "Numbered list",
        "1. List"
      )}
      <div className="w-px h-4 bg-border mx-1" />
      {btn(
        editor.isActive("blockquote"),
        () => editor.chain().focus().toggleBlockquote().run(),
        "Quote",
        ">"
      )}
      {btn(
        editor.isActive("codeBlock"),
        () => editor.chain().focus().toggleCodeBlock().run(),
        "Code block",
        "<>"
      )}
    </div>
  );
}
