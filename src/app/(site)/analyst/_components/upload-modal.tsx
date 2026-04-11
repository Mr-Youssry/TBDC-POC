"use client";
import { useEffect, useRef, useState } from "react";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear state when modal reopens
  useEffect(() => {
    if (open) {
      setError(null);
      setSelectedFile(null);
    }
  }, [open]);

  if (!open) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    // Auto-set filename from the selected file
    setFilename(file.name.replace(/\.[^.]+$/, ".md"));

    // Read text files directly into content
    if (file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = () => setContent(reader.result as string);
      reader.readAsText(file);
    } else {
      // For non-text files (PDF, images), we'll upload the raw file
      // and let the user know it will be saved as-is
      setContent(`[File: ${file.name} (${(file.size / 1024).toFixed(1)} KB) — will be saved to workspace]`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;
    setSubmitting(true);
    setError(null);
    try {
      // For text content (pasted or read from text file)
      const uploadContent = content.startsWith("[File:") && selectedFile
        ? await readFileAsBase64(selectedFile)
        : content;

      const isBase64 = content.startsWith("[File:") && selectedFile;

      const res = await fetch("/api/openclaw/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug,
          filename: isBase64 ? selectedFile!.name : filename,
          content: isBase64 ? undefined : uploadContent,
          contentBase64: isBase64 ? uploadContent : undefined,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const finalFilename = isBase64 ? selectedFile!.name : filename;
      sendMessage(
        `I just uploaded ${finalFilename} to your workspace at companies/${companySlug}/${finalFilename}. Please read it and create/update the company profile.`
      );
      setContent("");
      setFilename("pitch-deck.md");
      setSelectedFile(null);
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

  const hasContent = content.trim().length > 0 || selectedFile !== null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-lg border border-border shadow-lg w-full max-w-lg p-6">
        <h2 className="font-serif text-lg text-text-1 mb-4">
          Upload to workspace
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

          {/* File picker */}
          <div className="space-y-1">
            <label className="text-sm text-text-2">Choose a file</label>
            <div className="flex items-center gap-2">
              <TbdcButton
                variant="secondary"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse...
              </TbdcButton>
              <span className="text-xs text-text-3 truncate">
                {selectedFile ? selectedFile.name : "No file selected"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt,.pdf,.png,.jpg,.jpeg,.csv,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-3">or paste content</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm text-text-2">Filename</label>
            </div>
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
              value={content.startsWith("[File:") ? "" : content}
              onChange={(e) => { setContent(e.target.value); setSelectedFile(null); }}
              placeholder="Paste markdown, notes, or any text content…"
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm text-text-1 min-h-[120px] font-mono"
              disabled={content.startsWith("[File:")}
            />
          </div>

          {error && (
            <p className="text-xs text-warn-txt">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <TbdcButton variant="secondary" size="md" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </TbdcButton>
            <TbdcButton variant="primary" size="md" type="submit" disabled={!hasContent || submitting}>
              {submitting ? "Uploading\u2026" : "Upload"}
            </TbdcButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // strip data:...;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
