import type { Metadata } from "next";
export const metadata: Metadata = { title: "Investor Database — TBDC POC" };

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/guards";
import { EditableCell } from "@/components/editable-cell";
import { LongTextModal } from "@/components/long-text-modal";
import { TypeBadge, StageBadge, LeadBadge, ConfidenceBadge, RegionBadge } from "@/components/badges";
import { updateInvestorField } from "./actions";
import { AddInvestorButton, DeleteInvestorButton } from "./row-actions";
import { InvestorFilters } from "./investor-filters";

export const dynamic = "force-dynamic";

const TYPE_OPTIONS = [
  { label: "VC", value: "VC" },
  { label: "Angel Network", value: "Angel Network" },
  { label: "Corporate VC", value: "Corporate VC" },
  { label: "Gov", value: "Gov" },
  { label: "Gov Program", value: "Gov Program" },
  { label: "Venture Studio / VC", value: "Venture Studio / VC" },
  { label: "Venture Debt", value: "Venture Debt" },
];
const LEAD_OPTIONS = [
  { label: "Lead", value: "Lead" },
  { label: "Follow", value: "Follow" },
  { label: "Lead/Follow", value: "Lead/Follow" },
];
const CONFIDENCE_OPTIONS = [
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
];
const REGION_OPTIONS = [
  { label: "Canada", value: "Canada" },
  { label: "US", value: "US" },
  { label: "Global", value: "Global" },
];

/* Stage ordering for sort — earlier stages get lower numbers */
const STAGE_ORDER: Record<string, number> = {
  "Pre-idea": 0,
  "Pre-seed": 1,
  "Pre-Series A": 2,
  Seed: 3,
  "Series A": 4,
  "Series B": 5,
  "Series C": 6,
  Growth: 7,
};

function stageRank(stage: string): number {
  // Find the earliest stage mentioned in the string
  let min = 99;
  for (const [key, val] of Object.entries(STAGE_ORDER)) {
    if (stage.includes(key) && val < min) min = val;
  }
  return min;
}

type Props = {
  searchParams: Promise<{ region?: string; type?: string; sort?: string }>;
};

export default async function InvestorsPage({ searchParams }: Props) {
  const params = await searchParams;
  const regionFilter = params.region || "All";
  const typeFilter = params.type || "All";
  const sortParam = params.sort || "";

  /* ── Build Prisma where clause ─────────────────────────────────────── */
  const where: Prisma.InvestorWhereInput = {};
  if (regionFilter !== "All") where.region = regionFilter;
  if (typeFilter !== "All") where.type = { contains: typeFilter };

  const [allInvestors, investors, editable] = await Promise.all([
    prisma.investor.groupBy({ by: ["region"], _count: true }),
    prisma.investor.findMany({ where, orderBy: { sortOrder: "asc" } }),
    isLoggedIn(),
  ]);

  /* ── Sort client-side for confidence/stage ──────────────────────────── */
  const sorted = [...investors];
  if (sortParam === "confidence-desc") {
    sorted.sort((a, b) => (a.confidence === "High" ? -1 : 1) - (b.confidence === "High" ? -1 : 1));
  } else if (sortParam === "confidence-asc") {
    sorted.sort((a, b) => (a.confidence === "High" ? 1 : -1) - (b.confidence === "High" ? 1 : -1));
  } else if (sortParam === "stage-asc") {
    sorted.sort((a, b) => stageRank(a.stage) - stageRank(b.stage));
  } else if (sortParam === "stage-desc") {
    sorted.sort((a, b) => stageRank(b.stage) - stageRank(a.stage));
  }

  /* ── Region counts for filter pills ────────────────────────────────── */
  const total = allInvestors.reduce((s, g) => s + g._count, 0);
  const canada = allInvestors.find((g) => g.region === "Canada")?._count ?? 0;
  const us = allInvestors.find((g) => g.region === "US")?._count ?? 0;
  const global = allInvestors.find((g) => g.region === "Global")?._count ?? 0;
  const highConfidence = sorted.filter((iv) => iv.confidence === "High").length;
  const leadFriendly = sorted.filter((iv) => iv.leadOrFollow.includes("Lead")).length;
  const earlyStage = sorted.filter((iv) => stageRank(iv.stage) <= STAGE_ORDER["Series A"]).length;

  const th = "bg-[#f8fafe] px-3 py-[10px] text-left font-mono text-[0.65rem] tracking-[0.08em] text-text-3 border-b border-border whitespace-nowrap font-normal";
  const thSticky = `${th} sticky top-0 z-20`;
  const thFrozen = `${th} sticky top-0 left-0 z-30 bg-[#f8fafe]`;

  return (
    <div className="app-page flex h-full flex-col gap-5">
      <section className="app-hero">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text-3">
              Investor universe
            </div>
            <h1 className="app-page-title mt-3">Investor Database</h1>
            <p className="app-page-copy">
              Search-led investor profiling with filters up front and the full reference matrix underneath.
              The first screen should orient the list before asking the user to scan rows.
            </p>
          </div>
          {editable && <AddInvestorButton />}
        </div>
        <div className="app-stat-grid mt-5">
          <div className="app-stat-card">
            <span className="app-stat-card__label">Profiled funds</span>
            <strong className="app-stat-card__value">{total}</strong>
            <span className="app-stat-card__copy">Current investor universe in the database.</span>
          </div>
          <div className="app-stat-card">
            <span className="app-stat-card__label">High confidence</span>
            <strong className="app-stat-card__value">{highConfidence}</strong>
            <span className="app-stat-card__copy">Funds where fit quality is already strong enough to prioritize.</span>
          </div>
          <div className="app-stat-card">
            <span className="app-stat-card__label">Lead-friendly</span>
            <strong className="app-stat-card__value">{leadFriendly}</strong>
            <span className="app-stat-card__copy">Profiles willing to lead or co-lead, not just observe.</span>
          </div>
          <div className="app-stat-card">
            <span className="app-stat-card__label">Early-stage</span>
            <strong className="app-stat-card__value">{earlyStage}</strong>
            <span className="app-stat-card__copy">Seed to Series A funds currently visible in this set.</span>
          </div>
        </div>
      </section>

      <section className="app-surface p-4">
        <InvestorFilters counts={{ total, canada, us, global }} />
        <p className="mt-3 text-[0.72rem] font-mono text-text-3">
          Showing {sorted.length} of {total} investors
          {regionFilter !== "All" && <> · {regionFilter}</>}
          {typeFilter !== "All" && <> · {typeFilter}</>}
          {sortParam && <> · sorted by {sortParam.replace("-", " ")}</>}
        </p>
      </section>

      <div className="app-table-wrap flex-1">
        <table className="text-[0.78rem] border-collapse">
          <thead>
            <tr>
              <th className={thFrozen} style={{ minWidth: 180 }}>Fund Name</th>
              {["Type", "Region", "Stage", "Sectors", "Cheque", "Geo", "Lead", "Deals/yr", "Confidence", "Notable Portfolio", "Contact Approach", ...(editable ? [""] : [])]
                .map((h, i) => (
                  <th key={i} className={thSticky}>{h}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((iv) => (
              <tr key={iv.id} className="group bg-white hover:bg-[#f8fafe]">
                <td className="sticky left-0 z-10 border-b border-r border-border bg-white px-3 py-[10px] align-top group-hover:bg-[#f8fafe]" style={{ minWidth: 180 }}>
                  <EditableCell
                    id={iv.id}
                    field="name"
                    initialValue={iv.name}
                    editable={editable}
                    update={updateInvestorField}
                    display={<strong>{iv.name}</strong>}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top">
                  <EditableCell
                    id={iv.id}
                    field="type"
                    initialValue={iv.type}
                    editable={editable}
                    update={updateInvestorField}
                    options={TYPE_OPTIONS}
                    display={<TypeBadge type={iv.type} />}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top">
                  <EditableCell
                    id={iv.id}
                    field="region"
                    initialValue={iv.region}
                    editable={editable}
                    update={updateInvestorField}
                    options={REGION_OPTIONS}
                    display={<RegionBadge region={iv.region} />}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top">
                  <EditableCell
                    id={iv.id}
                    field="stage"
                    initialValue={iv.stage}
                    editable={editable}
                    update={updateInvestorField}
                    display={<StageBadge stage={iv.stage} />}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top text-[0.73rem]">
                  <LongTextModal
                    id={iv.id}
                    field="sectors"
                    label={`${iv.name} — sectors`}
                    initialValue={iv.sectors}
                    editable={editable}
                    update={updateInvestorField}
                  >
                    <span>{iv.sectors}</span>
                  </LongTextModal>
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top font-mono text-[0.72rem]">
                  <EditableCell
                    id={iv.id}
                    field="chequeSize"
                    initialValue={iv.chequeSize}
                    editable={editable}
                    update={updateInvestorField}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top text-[0.73rem]">
                  <EditableCell
                    id={iv.id}
                    field="geography"
                    initialValue={iv.geography}
                    editable={editable}
                    update={updateInvestorField}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top">
                  <EditableCell
                    id={iv.id}
                    field="leadOrFollow"
                    initialValue={iv.leadOrFollow}
                    editable={editable}
                    update={updateInvestorField}
                    options={LEAD_OPTIONS}
                    display={<LeadBadge lead={iv.leadOrFollow} />}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top font-mono text-[0.72rem] text-text-3">
                  <EditableCell
                    id={iv.id}
                    field="deals12m"
                    initialValue={iv.deals12m}
                    editable={editable}
                    update={updateInvestorField}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top">
                  <EditableCell
                    id={iv.id}
                    field="confidence"
                    initialValue={iv.confidence}
                    editable={editable}
                    update={updateInvestorField}
                    options={CONFIDENCE_OPTIONS}
                    display={<ConfidenceBadge confidence={iv.confidence} />}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top text-[0.73rem]">
                  <LongTextModal
                    id={iv.id}
                    field="notablePortfolio"
                    label={`${iv.name} — notable portfolio`}
                    initialValue={iv.notablePortfolio}
                    editable={editable}
                    update={updateInvestorField}
                  >
                    <span>{iv.notablePortfolio}</span>
                  </LongTextModal>
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top text-[0.72rem] text-text-2">
                  <LongTextModal
                    id={iv.id}
                    field="contactApproach"
                    label={`${iv.name} — contact approach`}
                    initialValue={iv.contactApproach}
                    editable={editable}
                    update={updateInvestorField}
                  >
                    <span>{iv.contactApproach}</span>
                  </LongTextModal>
                </td>
                {editable && (
                  <td className="border-b border-border px-3 py-[10px] align-top text-right">
                    <DeleteInvestorButton id={iv.id} name={iv.name} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
