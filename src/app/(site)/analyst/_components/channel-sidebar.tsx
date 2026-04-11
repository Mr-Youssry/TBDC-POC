"use client";
import Link from "next/link";
import { useState } from "react";

type Channel = {
  id: string;
  scopeType: string;
  openclawSessionId: string;
  displayName: string;
  lastMessageAt: Date | null;
};

export function ChannelSidebar({
  channels,
  activeId,
}: {
  channels: Channel[];
  activeId: string;
}) {
  const general = channels.filter((c) => c.scopeType === "general");
  const companies = channels.filter((c) => c.scopeType === "company");
  const investors = channels.filter((c) => c.scopeType === "investor");

  const [companiesOpen, setCompaniesOpen] = useState(true);
  const [investorsOpen, setInvestorsOpen] = useState(false);

  const renderLink = (c: Channel) => (
    <Link
      key={c.id}
      href={`/analyst?session=${encodeURIComponent(c.openclawSessionId)}`}
      className={`block px-3 py-1.5 text-[0.78rem] rounded-full transition-colors ${
        c.openclawSessionId === activeId
          ? "bg-t1-bg text-[#f5f4f0] font-medium"
          : "text-text-2 hover:bg-surface-3 bg-surface-2/60"
      }`}
    >
      {c.displayName}
    </Link>
  );

  return (
    <aside className="w-[280px] flex-shrink-0 border-r border-border bg-surface-2 p-3 overflow-y-auto">
      <div className="space-y-4">
        <div>{general.map(renderLink)}</div>

        <div>
          <button
            type="button"
            className="flex items-center gap-2 text-xs font-semibold text-text-3 uppercase tracking-wider mb-2"
            onClick={() => setCompaniesOpen((v) => !v)}
          >
            <span>{companiesOpen ? "▾" : "▸"}</span> Companies
          </button>
          {companiesOpen && (
            <div className="space-y-0.5">{companies.map(renderLink)}</div>
          )}
        </div>

        <div>
          <button
            type="button"
            className="flex items-center gap-2 text-xs font-semibold text-text-3 uppercase tracking-wider mb-2"
            onClick={() => setInvestorsOpen((v) => !v)}
          >
            <span>{investorsOpen ? "▾" : "▸"}</span> Investors
          </button>
          {investorsOpen && (
            <div className="space-y-0.5">{investors.map(renderLink)}</div>
          )}
        </div>
      </div>
    </aside>
  );
}
