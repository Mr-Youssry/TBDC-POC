"use client";

import { useState } from "react";

type CopyActionButtonProps = {
  copiedLabel?: string;
  idleLabel: string;
  text: string;
};

export function CopyActionButton({
  copiedLabel = "Copied",
  idleLabel,
  text,
}: CopyActionButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center rounded-[8px] border border-text-1 bg-text-1 px-3 py-2 text-[0.72rem] font-mono text-background transition-colors hover:bg-[#2b2925]"
    >
      {copied ? copiedLabel : idleLabel}
    </button>
  );
}
