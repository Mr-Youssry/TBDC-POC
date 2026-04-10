"use client";
import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Older browsers / non-https contexts: fall back to a temporary
      // textarea + execCommand. We're served over HTTPS so this should
      // never trigger, but it costs nothing to keep as a safety net.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* noop */
      }
      document.body.removeChild(ta);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex-shrink-0 px-3 py-1 text-xs rounded border border-border bg-surface-2 text-text-2 hover:bg-surface hover:text-text-1 transition-colors"
      aria-label={label}
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}
