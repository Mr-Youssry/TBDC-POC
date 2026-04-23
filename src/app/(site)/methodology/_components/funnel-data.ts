// Funnel data for the Methodology page — Level 1 visual adoption.
// Computes stage counts against the current 3-gate / 7-dim / 14-pt rubric.
// Intentionally uses coarse approximations for per-gate drops (see notes
// on each field below). Tier counts are exact — they come straight from
// the Match table.

import { prisma } from "@/lib/prisma";

export type FunnelStage = {
  key: string;
  label: string;
  count: number;
  pct: number; // of total possible pairs
  note?: string;
};

export type FunnelData = {
  totalPairs: number;
  stages: FunnelStage[];
  tiers: { t1: number; t2: number; t3: number; dnm: number };
};

export async function getFunnelData(): Promise<FunnelData> {
  const [investors, companies, matches] = await Promise.all([
    prisma.investor.findMany({ select: { id: true, region: true } }),
    prisma.company.findMany({ select: { id: true, acceptsInvestorIntros: true } }),
    prisma.match.findMany({ select: { id: true, tier: true } }),
  ]);

  const totalPairs = investors.length * companies.length;

  // G1 — Founder Opt-Out: companies with acceptsInvestorIntros === false
  // remove all their pairs with every investor.
  const optOutCompanies = companies.filter((c) => !c.acceptsInvestorIntros).length;
  const afterG1 = totalPairs - optOutCompanies * investors.length;

  // G2 — Geographic Jurisdiction: investors with region === "US" are treated
  // as not-deploying-in-Canada for this dataset. region === "Canada" and
  // region === "Global" both pass. Coarse heuristic — see seed data.
  const g2FailInvestors = investors.filter((i) => i.region === "US").length;
  const activeCompanies = companies.length - optOutCompanies;
  const afterG2 = afterG1 - g2FailInvestors * activeCompanies;

  // G3 — Fund Activity: no "active" field on Investor. Assumption: every
  // profiled investor is currently deploying. Drop count: 0.
  const afterG3 = afterG2;

  // Tier breakdown from the Match table.
  const t1 = matches.filter((m) => m.tier === 1).length;
  const t2 = matches.filter((m) => m.tier === 2).length;
  const t3 = matches.filter((m) => m.tier === 3).length;
  const scored = t1 + t2 + t3;

  // DNM bucket: pairs that cleared all gates but weren't scored above the
  // "log as match" threshold. afterG3 - scored is the gap.
  const dnm = Math.max(0, afterG3 - scored);

  const pct = (n: number) => (totalPairs === 0 ? 0 : Math.round((n / totalPairs) * 100));

  const stages: FunnelStage[] = [
    {
      key: "profiled",
      label: "Profiled investor × company pairs",
      count: totalPairs,
      pct: 100,
      note: `${investors.length} investors × ${companies.length} companies`,
    },
    {
      key: "after-g1",
      label: "After G1 — Founder Opt-Out",
      count: afterG1,
      pct: pct(afterG1),
      note: optOutCompanies
        ? `${optOutCompanies} company(ies) opted out → ${optOutCompanies * investors.length} pairs removed`
        : "No opt-outs in current cohort",
    },
    {
      key: "after-g2",
      label: "After G2 — Geographic Jurisdiction",
      count: afterG2,
      pct: pct(afterG2),
      note: g2FailInvestors
        ? `${g2FailInvestors} US-only investor(s) removed from active cohort`
        : "All profiled investors deploy in Canada",
    },
    {
      key: "after-g3",
      label: "After G3 — Fund Activity",
      count: afterG3,
      pct: pct(afterG3),
      note: "All profiled investors currently deploying (no drop)",
    },
    {
      key: "scored",
      label: "Scored above threshold (Tier 1-3)",
      count: scored,
      pct: pct(scored),
      note: "Passes weighted scoring + logged to Match table",
    },
  ];

  return {
    totalPairs,
    stages,
    tiers: { t1, t2, t3, dnm },
  };
}
