"use client";

import { useTransition } from "react";
import { revertAuditEntry } from "../_actions";

type Entry = {
  id: string;
  tableName: string;
  rowId: string;
  field: string | null;
  oldValueJson: unknown;
  newValueJson: unknown;
  operation: string;
  createdAt: Date;
  revertedByAuditId: string | null;
  actor: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  onBehalfOf: { id: string; name: string | null; email: string } | null;
};

export function AuditRow({ entry }: { entry: Entry }) {
  const [pending, startTransition] = useTransition();

  const handleRevert = () => {
    if (!confirm("Revert this change?")) return;
    startTransition(async () => {
      const result = await revertAuditEntry({ auditId: entry.id });
      if (!result.ok) alert(`Revert failed: ${result.error}`);
    });
  };

  const isReverted = !!entry.revertedByAuditId;
  const actorLabel =
    entry.actor.role === "assistant"
      ? `Assistant${
          entry.onBehalfOf
            ? ` (on behalf of ${entry.onBehalfOf.name ?? entry.onBehalfOf.email})`
            : ""
        }`
      : entry.actor.name ?? entry.actor.email;

  return (
    <div
      className={`p-3 rounded-[6px] border border-border bg-surface-2 ${
        isReverted ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-3">
            {new Date(entry.createdAt).toLocaleString()} · {actorLabel}
          </div>
          <div className="text-sm text-text-1 mt-1">
            <span className="font-mono">
              {entry.tableName}.{entry.field ?? "*"}
            </span>{" "}
            <span className="text-text-3">({entry.rowId.slice(0, 8)})</span>{" "}
            <span className="text-text-3">· {entry.operation}</span>
          </div>
          <div className="text-xs text-text-2 mt-1 font-mono truncate">
            {JSON.stringify(entry.oldValueJson)} →{" "}
            {JSON.stringify(entry.newValueJson)}
          </div>
          {isReverted && (
            <div className="text-xs text-warn-txt mt-1">Reverted</div>
          )}
        </div>
        {!isReverted && entry.operation === "update" && entry.field && (
          <button
            onClick={handleRevert}
            disabled={pending}
            className="px-3 py-1 text-xs font-mono rounded-[4px] border border-warn-bdr bg-warn text-warn-txt hover:opacity-80 disabled:opacity-50"
          >
            {pending ? "Reverting…" : "Revert"}
          </button>
        )}
      </div>
    </div>
  );
}
