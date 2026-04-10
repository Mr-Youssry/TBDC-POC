import type { ReactNode } from "react";

const base =
  "inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] whitespace-nowrap font-bold border";

export function TypeBadge({ type }: { type: string }) {
  if (type === "VC") {
    return (
      <span className={`${base} bg-[#e8eef8] text-[#1a4fa0] border-[#7090d0]`}>VC</span>
    );
  }
  if (type === "Government") {
    return (
      <span className={`${base} bg-[#e8f4e8] text-[#1a5a1a] border-[#60a060]`}>Gov</span>
    );
  }
  if (type === "Corporate" || type === "Corporate VC") {
    return (
      <span className={`${base} bg-[#f8e8f8] text-[#6a1a6a] border-[#c060c0]`}>Corp</span>
    );
  }
  if (type === "Angel Network") {
    return (
      <span className={`${base} bg-[#fef2df] text-[#7a4b09] border-[#c4840c]`}>Angel</span>
    );
  }
  if (type === "Gov" || type === "Gov Program") {
    return (
      <span className={`${base} bg-[#e8f4e8] text-[#1a5a1a] border-[#60a060]`}>Gov</span>
    );
  }
  if (type.includes("Venture Studio") || type.includes("Venture Debt")) {
    return (
      <span className={`${base} bg-[#f0ede8] text-[#5a5752] border-[#bbb6ae]`}>{type.includes("Debt") ? "Debt" : "Studio"}</span>
    );
  }
  return <span className={`${base} bg-surface-2 text-text-3 border-border`}>{type}</span>;
}

export function StageBadge({ stage }: { stage: string }) {
  const lower = stage;
  if (lower.includes("Pre-seed") || lower.includes("Pre-")) {
    return <span className={`${base} bg-[#f3e8f8] text-[#6a1a9a] border-[#b070d0]`}>{stage}</span>;
  }
  if (lower.includes("Series A")) {
    return <span className={`${base} bg-[#e3f0e8] text-[#1a6a30] border-[#60b070]`}>{stage}</span>;
  }
  if (lower.includes("Series B") || lower.includes("Growth")) {
    return <span className={`${base} bg-[#fdf0e0] text-[#7a4a10] border-[#d09040]`}>{stage}</span>;
  }
  if (lower.includes("Seed")) {
    return <span className={`${base} bg-[#e8eef8] text-[#1a4fa0] border-[#7090d0]`}>{stage}</span>;
  }
  return <span className={`${base} bg-surface-2 text-text-3 border-border`}>{stage}</span>;
}

export function LeadBadge({ lead }: { lead: string }) {
  if (lead === "Lead") {
    return <span className={`${base} bg-[#e8f8ef] text-[#1a6a40] border-[#50b080]`}>Lead</span>;
  }
  if (lead === "Follow") {
    return <span className={`${base} bg-surface-2 text-text-3 border-border`}>Follow</span>;
  }
  return <span className={`${base} bg-[#f8f0e8] text-[#6a4010] border-[#c09050]`}>{lead}</span>;
}

export function WarnBadge({ children }: { children: ReactNode }) {
  return (
    <span className={`${base} bg-warn text-warn-txt border-warn-bdr`}>{children}</span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: string }) {
  if (confidence === "High") {
    return <span className={`${base} bg-[#e8f4e8] text-[#1a5a1a] border-[#60a060]`}>High</span>;
  }
  return <span className={`${base} bg-surface-2 text-text-3 border-border`}>Med</span>;
}

export function RegionBadge({ region }: { region: string }) {
  if (region === "Canada") {
    return <span className={`${base} bg-[#fceaea] text-[#8c2020] border-[#c94040]`}>CA</span>;
  }
  if (region === "US") {
    return <span className={`${base} bg-[#e8eef8] text-[#1a4fa0] border-[#7090d0]`}>US</span>;
  }
  return <span className={`${base} bg-[#f0ede8] text-[#5a5752] border-[#bbb6ae]`}>Intl</span>;
}

export function OpenBadge() {
  return (
    <span className={`${base} bg-[#e8f8ef] text-[#1a6a40] border-[#50b080]`}>Open</span>
  );
}
