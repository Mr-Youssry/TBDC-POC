import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/guards";
import { SecHead } from "@/components/sec-head";
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
  let sorted = [...investors];
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

  // Shared cell classes
  const th = "bg-surface-2 px-3 py-[9px] text-left font-mono text-[0.65rem] tracking-[0.05em] text-text-2 border-b border-border whitespace-nowrap font-normal";
  const thSticky = `${th} sticky top-0 z-20`; // frozen header row
  const thFrozen = `${th} sticky top-0 left-0 z-30 bg-surface-2`; // frozen header + frozen column intersection

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Pinned controls (don't scroll) ─────────────────────────────── */}
      <div className="flex-shrink-0 px-8 py-4 bg-background border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <SecHead className="mb-0 mt-0 pb-0 border-none">
            Investor database — {total} funds profiled
          </SecHead>
          {editable && <AddInvestorButton />}
        </div>

        <InvestorFilters counts={{ total, canada, us, global }} />

        <p className="text-[0.68rem] font-mono text-text-3">
          Showing {sorted.length} of {total} investors
          {regionFilter !== "All" && <> · {regionFilter}</>}
          {typeFilter !== "All" && <> · {typeFilter}</>}
          {sortParam && <> · sorted by {sortParam.replace("-", " ")}</>}
        </p>
      </div>

      {/* ── Scrollable table container ─────────────────────────────────── */}
      <div className="flex-1 overflow-auto mx-8 my-4 border border-border rounded-[10px]">
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
              <tr key={iv.id} className="hover:bg-surface-2 group">
                <td className="px-3 py-[9px] border-b border-border align-top sticky left-0 z-10 bg-background group-hover:bg-surface-2 border-r border-border" style={{ minWidth: 180 }}>
                  <EditableCell
                    id={iv.id}
                    field="name"
                    initialValue={iv.name}
                    editable={editable}
                    update={updateInvestorField}
                    display={<strong>{iv.name}</strong>}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top">
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
                <td className="px-3 py-[9px] border-b border-border align-top">
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
                <td className="px-3 py-[9px] border-b border-border align-top">
                  <EditableCell
                    id={iv.id}
                    field="stage"
                    initialValue={iv.stage}
                    editable={editable}
                    update={updateInvestorField}
                    display={<StageBadge stage={iv.stage} />}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.73rem]">
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
                <td className="px-3 py-[9px] border-b border-border align-top font-mono text-[0.72rem]">
                  <EditableCell
                    id={iv.id}
                    field="chequeSize"
                    initialValue={iv.chequeSize}
                    editable={editable}
                    update={updateInvestorField}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.73rem]">
                  <EditableCell
                    id={iv.id}
                    field="geography"
                    initialValue={iv.geography}
                    editable={editable}
                    update={updateInvestorField}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top">
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
                <td className="px-3 py-[9px] border-b border-border align-top font-mono text-[0.72rem] text-text-3">
                  <EditableCell
                    id={iv.id}
                    field="deals12m"
                    initialValue={iv.deals12m}
                    editable={editable}
                    update={updateInvestorField}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top">
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
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.73rem]">
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
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.72rem] text-text-2">
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
                  <td className="px-3 py-[9px] border-b border-border align-top text-right">
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
