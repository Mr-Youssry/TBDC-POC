"use client";
import { useEffect, useState, useCallback } from "react";

export function FileEditor({ path }: { path: string }) {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/openclaw/workspace/file?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setContent(data.content);
          setSavedContent(data.content);
        }
      })
      .catch(() => setToast("Failed to load file"))
      .finally(() => setLoading(false));
  }, [path]);

  const hasChanges = content !== savedContent;

  const handleSave = useCallback(async () => {
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
  }, [path, content]);

  // Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (hasChanges && !saving) handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasChanges, saving, handleSave]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-sm text-text-3 italic">Loading…</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-1 font-mono">{path}</span>
          {hasChanges && (
            <span className="text-[0.65rem] text-warn-txt">● Unsaved</span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="bg-t1-bg text-[#f5f4f0] px-3 py-1 rounded text-xs disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 w-full p-4 font-mono text-sm text-text-1 bg-background resize-none outline-none"
        spellCheck={false}
      />
      {toast && (
        <div className="px-4 py-2 text-xs text-text-2 bg-surface-2 border-t border-border">
          {toast}
        </div>
      )}
    </div>
  );
}
