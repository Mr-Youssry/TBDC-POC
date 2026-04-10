"use client";

import { useState, useTransition } from "react";
import { updatePipelineStatus } from "../actions";

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  researching: "Researching",
  outreach_sent: "Outreach Sent",
  meeting_set: "Meeting Set",
  follow_up: "Follow-up",
  closed_won: "Closed (Won)",
  closed_pass: "Closed (Pass)",
};

interface StatusSelectProps {
  matchId: string;
  currentStatus: string;
  disabled: boolean;
}

export function StatusSelect({ matchId, currentStatus, disabled }: StatusSelectProps) {
  const [value, setValue] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  if (disabled) {
    return (
      <span className="inline-block font-mono text-[0.68rem] px-2 py-[2px] bg-surface-2 border border-border rounded-[3px] text-text-2 whitespace-nowrap">
        {STATUS_LABELS[value] ?? value}
      </span>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setValue(next);
    startTransition(async () => {
      await updatePipelineStatus(matchId, next);
    });
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={isPending}
      className="font-mono text-[0.68rem] px-2 py-[2px] bg-surface border border-border rounded-[3px] text-text-2 cursor-pointer hover:border-border-2 focus:outline-none focus:ring-1 focus:ring-border-2 disabled:opacity-50 disabled:cursor-wait"
    >
      {Object.entries(STATUS_LABELS).map(([k, label]) => (
        <option key={k} value={k}>
          {label}
        </option>
      ))}
    </select>
  );
}
