"use client";
import { useEffect, useState } from "react";
import { AssistantMarkdown } from "../../analyst/_components/assistant-markdown";
import { TbdcButton } from "@/components/ui/tbdc-button";

export function FileViewer({ path }: { path: string }) {
  const [content, setContent] = useState("");
  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const loading = loadedPath !== path;

  useEffect(() => {
    let cancelled = false;

    const loadFile = async () => {
      try {
        const response = await fetch(`/api/openclaw/workspace/file?path=${encodeURIComponent(path)}`);
        const data = await response.json();
        if (!cancelled) {
          setContent(data.ok ? data.content : "");
        }
      } catch {
        if (!cancelled) {
          setContent("");
        }
      } finally {
        if (!cancelled) {
          setLoadedPath(path);
        }
      }
    };

    void loadFile();
    return () => {
      cancelled = true;
    };
  }, [path]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-sm text-text-3 italic">Loading…</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-1 font-mono">{path}</span>
          <span className="text-[0.65rem] text-text-3 bg-surface-3 px-1.5 py-0.5 rounded">Read-only</span>
        </div>
        <TbdcButton variant="secondary" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </TbdcButton>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-surface-2/50">
        <AssistantMarkdown content={content} />
      </div>
    </div>
  );
}
