import type { Metadata } from "next";
export const metadata: Metadata = { title: "Pipeline — TBDC POC" };

import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/guards";
import { StatusSelect } from "./_components/status-select";

export const dynamic = "force-dynamic";

function scoreBadge(sc: number) {
  if (sc >= 13) {
    return (
      <span className="inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-t1-bg text-t1-txt border border-t1-bdr font-bold whitespace-nowrap">
        Tier 1 · {sc}/16
      </span>
    );
  }
  if (sc >= 8) {
    return (
      <span className="inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-t2-bg text-t2-txt border border-t2-bdr font-bold whitespace-nowrap">
        Tier 2 · {sc}/16
      </span>
    );
  }
  return (
    <span className="inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-t3-bg text-t3-txt border border-t3-bdr font-bold whitespace-nowrap">
      Tier 3 · {sc}/16
    </span>
  );
}

function truncate(text: string | null | undefined, max: number): string {
  if (!text) return "—";
  if (text.length <= max) return text;
  return text.slice(0, max) + "…";
}

export default async function PipelinePage() {
  const [matches, editable] = await Promise.all([
    prisma.match.findMany({
      orderBy: { score: "desc" },
      include: { company: true, investor: true },
    }),
    isLoggedIn(),
  ]);
  const liveOutreach = matches.filter((match) => match.pipelineStatus === "outreach_sent").length;
  const followUps = matches.filter((match) => match.pipelineStatus === "follow_up").length;
  const meetings = matches.filter((match) => match.pipelineStatus === "meeting_set").length;
  const wins = matches.filter((match) => match.pipelineStatus === "closed_won").length;

  return (
    <div className="app-page flex h-full flex-col gap-5">
      <section className="app-hero">
        <div className="max-w-3xl">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text-3">
            Execution queue
          </div>
          <h1 className="app-page-title mt-3">Pipeline</h1>
          <p className="app-page-copy">
            Status-first pipeline tracking for every investor-company match. The page now leads with queue health before dropping into the detailed table.
          </p>
        </div>
        <div className="app-stat-grid mt-5">
          <div className="app-stat-card">
            <span className="app-stat-card__label">Live outreach</span>
            <strong className="app-stat-card__value">{liveOutreach}</strong>
            <span className="app-stat-card__copy">Threads currently out in market.</span>
          </div>
          <div className="app-stat-card">
            <span className="app-stat-card__label">Follow-up</span>
            <strong className="app-stat-card__value">{followUps}</strong>
            <span className="app-stat-card__copy">Conversations that need a timed second push.</span>
          </div>
          <div className="app-stat-card">
            <span className="app-stat-card__label">Meetings set</span>
            <strong className="app-stat-card__value">{meetings}</strong>
            <span className="app-stat-card__copy">Warmest threads currently converting into calls.</span>
          </div>
          <div className="app-stat-card">
            <span className="app-stat-card__label">Closed won</span>
            <strong className="app-stat-card__value">{wins}</strong>
            <span className="app-stat-card__copy">Matches that reached a positive outcome.</span>
          </div>
        </div>
      </section>

      <section className="app-surface p-4">
        <div className="flex flex-wrap gap-2">
          <span className="app-chip app-chip--active">Actionable queue</span>
          <span className="app-chip">Editable status</span>
          <span className="app-chip">Warm path tracked</span>
          <span className="app-chip">Next step visible</span>
        </div>
      </section>

      <div className="app-table-wrap flex-1">
        <table className="text-[0.78rem] border-collapse">
          <thead>
            <tr className="bg-[#f8fafe] font-mono text-xs uppercase tracking-[0.08em] text-text-3">
              <th className="sticky top-0 left-0 z-30 bg-[#f8fafe] px-3 py-[10px] text-left font-medium">Company</th>
              <th className="sticky top-0 z-20 bg-[#f8fafe] px-3 py-[10px] text-left font-medium">Investor</th>
              <th className="sticky top-0 z-20 bg-[#f8fafe] px-3 py-[10px] text-left font-medium">Score</th>
              <th className="sticky top-0 z-20 bg-[#f8fafe] px-3 py-[10px] text-left font-medium">Warm Path</th>
              <th className="sticky top-0 z-20 bg-[#f8fafe] px-3 py-[10px] text-left font-medium">Status</th>
              <th className="sticky top-0 z-20 bg-[#f8fafe] px-3 py-[10px] text-left font-medium">Bonus</th>
              <th className="sticky top-0 z-20 bg-[#f8fafe] px-3 py-[10px] text-left font-medium">Next Step</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr
                key={m.id}
                className="group border-b border-border bg-white hover:bg-[#f8fafe]"
              >
                <td className="sticky left-0 z-10 border-r border-border bg-white px-3 py-[10px] text-text-1 font-medium whitespace-nowrap group-hover:bg-[#f8fafe]" style={{ minWidth: 140 }}>
                  {m.company.name}
                </td>
                <td className="px-3 py-[10px] text-text-1 whitespace-nowrap">
                  {m.investor.name}
                </td>
                <td className="px-3 py-[10px] whitespace-nowrap">
                  {scoreBadge(m.score)}
                </td>
                <td className="px-3 py-[10px] text-text-2 font-mono text-xs max-w-[160px]">
                  {m.warmPath}
                </td>
                <td className="px-3 py-[10px] whitespace-nowrap">
                  <StatusSelect
                    matchId={m.id}
                    currentStatus={m.pipelineStatus}
                    disabled={!editable}
                  />
                </td>
                <td className="px-3 py-[10px] text-text-2 text-xs max-w-[180px]">
                  {truncate(m.warmPathBonus, 60)}
                </td>
                <td className="px-3 py-[10px] text-text-2 text-xs max-w-[200px]">
                  {truncate(m.nextStep, 80)}
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-text-3">
                  No matches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
