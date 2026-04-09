"use client";
import Link from "next/link";

// Read vs write classification is based on tool-name prefixes. Phase 2
// plugin tools: list_/get_ are read, update_/append_ are write.
export function ToolCallPill({
  tool,
  summary,
  auditIds,
}: {
  tool: string;
  summary: string;
  auditIds?: string[];
}) {
  const isWrite =
    !tool.startsWith("list_") &&
    !tool.startsWith("get_") &&
    !tool.startsWith("lookup_");
  const icon = isWrite ? "✎" : "🔍";

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${
        isWrite
          ? "bg-t1-bg text-text-1 border border-t1-bdr"
          : "bg-surface-3 text-text-3"
      }`}
    >
      <span>{icon}</span>
      <span>{summary}</span>
    </span>
  );

  if (isWrite && auditIds?.[0]) {
    return <Link href={`/admin/audit?entry=${auditIds[0]}`}>{content}</Link>;
  }
  return content;
}
