"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { EditorToolbar } from "./editor-toolbar";
import { TbdcButton } from "@/components/ui/tbdc-button";

export function FileEditor({
  path,
  onDirtyChange,
  cachedContent,
  onContentChange,
  onSaved,
}: {
  path: string;
  onDirtyChange?: (path: string, dirty: boolean) => void;
  cachedContent?: string;
  onContentChange?: (path: string, content: string) => void;
  onSaved?: (path: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const loadedRef = useRef(false);

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
        class: "outline-none min-h-[200px] px-4 py-3",
      },
    },
    onUpdate: ({ editor: e }) => {
      // Only mark dirty AFTER the initial content load completes
      if (loadedRef.current) {
        setDirty(true);
        // Cache content in parent so switching files preserves edits
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const md = (e.storage as any)?.markdown?.getMarkdown?.() ?? "";
        if (md && onContentChange) onContentChange(path, md);
      }
    },
  });

  // Load file content (prefer cache, fall back to bridge fetch)
  useEffect(() => {
    if (!editor) return;
    loadedRef.current = false;
    setLoading(true);

    if (cachedContent !== undefined) {
      // Restore from cache — this means we have unsaved changes
      editor.commands.setContent(cachedContent);
      setDirty(true);
      requestAnimationFrame(() => { loadedRef.current = true; });
      setLoading(false);
      return;
    }

    // No cache — fetch from bridge
    setDirty(false);
    fetch(`/api/openclaw/workspace/file?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          editor.commands.setContent(data.content);
          // Small delay to let Tiptap finish processing before enabling dirty tracking
          requestAnimationFrame(() => { loadedRef.current = true; });
        }
      })
      .catch(() => setToast("Failed to load file"))
      .finally(() => setLoading(false));
  }, [path, editor, cachedContent]);

  // Report dirty state to parent for tree indicators
  useEffect(() => {
    onDirtyChange?.(path, dirty);
  }, [dirty, path, onDirtyChange]);

  // Clean up dirty state on unmount
  useEffect(() => {
    return () => { onDirtyChange?.(path, false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const getMarkdown = useCallback((): string => {
    if (!editor) return "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (editor.storage as any).markdown.getMarkdown();
  }, [editor]);

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
        setDirty(false);
        onSaved?.(path);
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
        if (dirty && !saving) handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dirty, saving, handleSave]);

  if (loading || !editor) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-text-3 italic">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header: filename + save button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-text-1 font-mono truncate">{path}</span>
          {dirty && (
            <span className="text-[0.65rem] text-warn-txt flex-shrink-0">● Unsaved</span>
          )}
        </div>
        <TbdcButton
          variant={dirty ? "primary" : "ghost"}
          onClick={handleSave}
          disabled={!dirty || saving}
        >
          {saving ? "Saving\u2026" : "Save"}
        </TbdcButton>
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
