import type { ReactNode } from "react";

const base =
  "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.66rem] font-semibold whitespace-nowrap";

export function TypeBadge({ type }: { type: string }) {
  if (type === "VC") {
    return (
      <span className={`${base} bg-tbdc-blue-bg text-tbdc-blue border-[rgba(75,107,255,0.18)]`}>VC</span>
    );
  }
  if (type === "Government") {
    return (
      <span className={`${base} bg-t1-bg text-t1-txt border-t1-bdr`}>Gov</span>
    );
  }
  if (type === "Corporate" || type === "Corporate VC") {
    return (
      <span className={`${base} bg-accent text-accent-foreground border-transparent`}>Corp</span>
    );
  }
  if (type === "Angel Network") {
    return (
      <span className={`${base} bg-t2-bg text-t2-txt border-t2-bdr`}>Angel</span>
    );
  }
  if (type === "Gov" || type === "Gov Program") {
    return (
      <span className={`${base} bg-t1-bg text-t1-txt border-t1-bdr`}>Gov</span>
    );
  }
  if (type.includes("Venture Studio") || type.includes("Venture Debt")) {
    return (
      <span className={`${base} bg-surface-2 text-text-2 border-border`}>{type.includes("Debt") ? "Debt" : "Studio"}</span>
    );
  }
  return <span className={`${base} bg-surface-2 text-text-3 border-border`}>{type}</span>;
}

export function StageBadge({ stage }: { stage: string }) {
  const lower = stage;
  if (lower.includes("Pre-seed") || lower.includes("Pre-")) {
    return <span className={`${base} bg-accent text-accent-foreground border-transparent`}>{stage}</span>;
  }
  if (lower.includes("Series A")) {
    return <span className={`${base} bg-t1-bg text-t1-txt border-t1-bdr`}>{stage}</span>;
  }
  if (lower.includes("Series B") || lower.includes("Growth")) {
    return <span className={`${base} bg-t2-bg text-t2-txt border-t2-bdr`}>{stage}</span>;
  }
  if (lower.includes("Seed")) {
    return <span className={`${base} bg-tbdc-blue-bg text-tbdc-blue border-[rgba(75,107,255,0.18)]`}>{stage}</span>;
  }
  return <span className={`${base} bg-surface-2 text-text-3 border-border`}>{stage}</span>;
}

export function LeadBadge({ lead }: { lead: string }) {
  if (lead === "Lead") {
    return <span className={`${base} bg-t1-bg text-t1-txt border-t1-bdr`}>Lead</span>;
  }
  if (lead === "Follow") {
    return <span className={`${base} bg-surface-2 text-text-3 border-border`}>Follow</span>;
  }
  return <span className={`${base} bg-t2-bg text-t2-txt border-t2-bdr`}>{lead}</span>;
}

export function WarnBadge({ children }: { children: ReactNode }) {
  return (
    <span className={`${base} bg-warn text-warn-txt border-warn-bdr`}>{children}</span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: string }) {
  if (confidence === "High") {
    return <span className={`${base} bg-t1-bg text-t1-txt border-t1-bdr`}>High</span>;
  }
  return <span className={`${base} bg-surface-2 text-text-3 border-border`}>Med</span>;
}

export function RegionBadge({ region }: { region: string }) {
  if (region === "Canada") {
    return <span className={`${base} bg-accent text-accent-foreground border-transparent`}>CA</span>;
  }
  if (region === "US") {
    return <span className={`${base} bg-tbdc-blue-bg text-tbdc-blue border-[rgba(75,107,255,0.18)]`}>US</span>;
  }
  return <span className={`${base} bg-[#f0ede8] text-[#5a5752] border-[#bbb6ae]`}>Intl</span>;
}

export function OpenBadge() {
  return (
    <span className={`${base} bg-t1-bg text-t1-txt border-t1-bdr`}>Open</span>
  );
}
