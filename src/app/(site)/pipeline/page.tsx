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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Pinned header */}
      <div className="flex-shrink-0 px-8 py-4 bg-background border-b border-border">
        <h1 className="font-serif text-xl text-text-1 mb-1">Pipeline</h1>
        <p className="text-sm text-text-3">Track outreach status for each investor-company match.</p>
      </div>

      {/* Scrollable table */}
      <div className="flex-1 overflow-auto mx-8 my-4 border border-border rounded-[10px]">
        <table className="text-[0.78rem] border-collapse">
          <thead>
            <tr className="bg-surface-2 text-text-3 font-mono text-xs uppercase tracking-wider">
              <th className="sticky top-0 left-0 z-30 bg-surface-2 px-3 py-2 text-left font-medium">Company</th>
              <th className="sticky top-0 z-20 bg-surface-2 px-3 py-2 text-left font-medium">Investor</th>
              <th className="sticky top-0 z-20 bg-surface-2 px-3 py-2 text-left font-medium">Score</th>
              <th className="sticky top-0 z-20 bg-surface-2 px-3 py-2 text-left font-medium">Warm Path</th>
              <th className="sticky top-0 z-20 bg-surface-2 px-3 py-2 text-left font-medium">Status</th>
              <th className="sticky top-0 z-20 bg-surface-2 px-3 py-2 text-left font-medium">Bonus</th>
              <th className="sticky top-0 z-20 bg-surface-2 px-3 py-2 text-left font-medium">Next Step</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr
                key={m.id}
                className="group bg-background hover:bg-surface-2 border-b border-border"
              >
                <td className="sticky left-0 z-10 bg-background group-hover:bg-surface-2 border-r border-border px-3 py-2 text-text-1 font-medium whitespace-nowrap" style={{ minWidth: 140 }}>
                  {m.company.name}
                </td>
                <td className="px-3 py-2 text-text-1 whitespace-nowrap">
                  {m.investor.name}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {scoreBadge(m.score)}
                </td>
                <td className="px-3 py-2 text-text-2 font-mono text-xs max-w-[160px]">
                  {m.warmPath}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <StatusSelect
                    matchId={m.id}
                    currentStatus={m.pipelineStatus}
                    disabled={!editable}
                  />
                </td>
                <td className="px-3 py-2 text-text-2 text-xs max-w-[180px]">
                  {truncate(m.warmPathBonus, 60)}
                </td>
                <td className="px-3 py-2 text-text-2 text-xs max-w-[200px]">
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
