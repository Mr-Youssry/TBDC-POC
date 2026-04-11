"use client";
import { useEffect, useState } from "react";
import { TbdcButton } from "@/components/ui/tbdc-button";

export function UploadModal({
  open,
  onClose,
  companySlug,
  sendMessage,
}: {
  open: boolean;
  onClose: () => void;
  companySlug: string;
  sendMessage: (content: string) => void;
}) {
  const [filename, setFilename] = useState("pitch-deck.md");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear stale error when modal reopens
  useEffect(() => { if (open) setError(null); }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/openclaw/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companySlug, filename, content }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      sendMessage(
        `I just uploaded ${filename} to your workspace at companies/${companySlug}/${filename}. Please read it and create/update the company profile.`
      );
      setContent("");
      setFilename("pitch-deck.md");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-lg border border-border shadow-lg w-full max-w-lg p-6">
        <h2 className="font-serif text-lg text-text-1 mb-4">
          Upload document to workspace
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-text-2">Company folder</label>
            <input
              type="text"
              value={`companies/${companySlug}`}
              readOnly
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm text-text-1 opacity-60 cursor-default"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-text-2">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm text-text-1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-text-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste pitch deck markdown, notes, or any text content…"
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm text-text-1 min-h-[200px] font-mono"
            />
          </div>

          {error && (
            <p className="text-xs text-warn-txt">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <TbdcButton variant="secondary" size="md" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </TbdcButton>
            <TbdcButton variant="primary" size="md" type="submit" disabled={!content.trim() || submitting}>
              {submitting ? "Uploading\u2026" : "Upload"}
            </TbdcButton>
          </div>
        </form>
      </div>
    </div>
  );
}
