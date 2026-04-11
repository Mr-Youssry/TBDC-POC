"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { EditorToolbar } from "./editor-toolbar";

export function FileEditor({
  path,
  onDirtyChange,
}: {
  path: string;
  onDirtyChange?: (path: string, dirty: boolean) => void;
}) {
  const [savedContent, setSavedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start typing\u2026" }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none outline-none min-h-[200px] px-4 py-3 text-text-1 font-serif",
      },
    },
  });

  // Load file content
  useEffect(() => {
    setLoading(true);
    fetch(`/api/openclaw/workspace/file?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && editor) {
          editor.commands.setContent(data.content);
          setSavedContent(data.content);
        }
      })
      .catch(() => setToast("Failed to load file"))
      .finally(() => setLoading(false));
  }, [path, editor]);

  const getMarkdown = useCallback((): string => {
    if (!editor) return "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (editor.storage as any).markdown.getMarkdown();
  }, [editor]);

  const hasChanges = editor ? getMarkdown() !== savedContent : false;

  // Report dirty state to parent for tree indicators
  const prevDirty = useRef(false);
  useEffect(() => {
    if (hasChanges !== prevDirty.current) {
      prevDirty.current = hasChanges;
      onDirtyChange?.(path, hasChanges);
    }
  }, [hasChanges, path, onDirtyChange]);

  // Clean up dirty state on unmount
  useEffect(() => {
    return () => { onDirtyChange?.(path, false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const handleSave = useCallback(async () => {
    const content = getMarkdown();
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/openclaw/workspace/file", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content }),
      });
      const data = await res.json();
      if (data.ok) {
        setSavedContent(content);
        setToast("Saved. SCOTE will pick up this change on the next message.");
        setTimeout(() => setToast(null), 4000);
      } else {
        setToast(`Save failed: ${data.error}`);
      }
    } catch {
      setToast("Save failed: network error");
    } finally {
      setSaving(false);
    }
  }, [path, getMarkdown]);

  // Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (!saving) handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saving, handleSave]);

  if (loading || !editor) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-text-3 italic">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-1 font-mono">{path}</span>
          {hasChanges && (
            <span className="text-[0.65rem] text-warn-txt">● Unsaved</span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-t1-bg text-[#f5f4f0] px-3 py-1 rounded text-xs disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {saving ? "Saving\u2026" : "Save"}
        </button>
      </div>

      {/* Formatting toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Toast */}
      {toast && (
        <div className="px-4 py-2 text-xs text-text-2 bg-surface-2 border-t border-border">
          {toast}
        </div>
      )}
    </div>
  );
}
