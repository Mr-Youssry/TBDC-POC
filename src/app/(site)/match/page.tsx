import type { Metadata } from "next";
export const metadata: Metadata = { title: "Match Output — TBDC POC" };

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/guards";
import { SecHead } from "@/components/sec-head";
import { EditableCell } from "@/components/editable-cell";
import { LongTextModal } from "@/components/long-text-modal";
import {
  updateMatchStringField,
  updateDoNotMatch,
  updateCustomerTarget,
} from "./actions";

export const dynamic = "force-dynamic";

function scoreBadge(sc: number, tier: number) {
  if (tier === 1) {
    return (
      <span className="inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-t1-bg text-t1-txt border border-t1-bdr font-bold whitespace-nowrap">
        Tier 1 · {sc}/14
      </span>
    );
  }
  if (tier === 2) {
    return (
      <span className="inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-t2-bg text-t2-txt border border-t2-bdr font-bold whitespace-nowrap">
        Tier 2 · {sc}/14
      </span>
    );
  }
  return (
    <span className="inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-t3-bg text-t3-txt border border-t3-bdr font-bold whitespace-nowrap">
      Tier 3 · {sc}/14
    </span>
  );
}

function dimSignal(label: string, value: number, max: number) {
  const hit = value >= max && value > 0;
  const partial = value > 0 && value < max;
  const neg = value < 0;
  const base = "font-mono text-[0.7rem] px-[7px] py-[2px] rounded-[3px] border";
  if (neg) {
    return (
      <span className={`${base} bg-t3-bg text-t3-txt border-t3-bdr opacity-70`}>
        ✗ {label} {value}/{max}
      </span>
    );
  }
  if (hit) {
    return (
      <span className={`${base} bg-t1-bg text-t1-txt border-t1-bdr`}>
        ✓ {label} {value}/{max}
      </span>
    );
  }
  if (partial) {
    return (
      <span className={`${base} bg-t2-bg text-t2-txt border-t2-bdr`}>
        ~ {label} {value}/{max}
      </span>
    );
  }
  return (
    <span className={`${base} bg-t3-bg text-t3-txt border-t3-bdr opacity-70`}>
      ✗ {label} {value}/{max}
    </span>
  );
}

type SearchParamsLike = { c?: string };

export default async function MatchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsLike>;
}) {
  const params = await searchParams;
  const editable = await isLoggedIn();

  const companies = await prisma.company.findMany({
    orderBy: { sortOrder: "asc" },
  });
  if (companies.length === 0) {
    return <p className="text-text-2 text-sm">No companies yet.</p>;
  }
  const selectedId = params.c ?? companies[0]!.id;
  const selected = companies.find((c) => c.id === selectedId) ?? companies[0]!;

  const cohorts: Array<{ label: string; items: typeof companies }> = [];
  for (const c of companies) {
    const existing = cohorts.find((g) => g.label === c.cohort);
    if (existing) existing.items.push(c);
    else cohorts.push({ label: c.cohort, items: [c] });
  }

  const [matches, doNotMatches, customerTargets, events] = await Promise.all([
    prisma.match.findMany({
      where: { companyId: selected.id },
      include: { investor: true },
      orderBy: [{ tier: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.doNotMatch.findMany({
      where: { companyId: selected.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.customerTarget.findMany({
      where: { companyId: selected.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.industryEvent.findMany({
      where: { companyId: selected.id },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const tier1 = matches.filter((m) => m.tier === 1);
  const tier2 = matches.filter((m) => m.tier === 2);

  return (
    <div className="app-page flex h-full gap-5 overflow-hidden">
      <aside className="app-surface w-[240px] flex-shrink-0 overflow-y-auto p-2">
        <div>
          <div className="px-3 py-2.5 font-mono text-[0.62rem] tracking-[0.12em] uppercase text-text-3">
            Select company
          </div>
          {cohorts.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div className="mx-1.5 my-2 border-t border-border" />}
              <div className="px-3 pb-1 pt-2 font-mono text-[0.58rem] text-text-3 uppercase tracking-[0.12em]">
                {group.label}
              </div>
              {group.items.map((c) => {
                const isActive = c.id === selected.id;
                const isWidmo = !c.acceptsInvestorIntros;
                return (
                  <Link
                    key={c.id}
                    href={`/match?c=${c.id}`}
                    className={[
                      "mx-1.5 flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[0.8rem] transition-colors",
                      isActive
                        ? "bg-accent text-text-1 font-semibold shadow-[inset_0_0_0_1px_rgba(255,79,141,0.12)]"
                        : isWidmo
                          ? "text-warn-txt hover:bg-surface-2"
                          : "text-text-3 hover:bg-surface-2 hover:text-text-2",
                    ].join(" ")}
                  >
                    <span className="truncate">
                      {c.name}
                      {isWidmo && " ⚠"}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="app-hero mb-5">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
            <div>
              <div className="font-mono text-[0.68rem] text-text-3 tracking-[0.12em] uppercase mb-[6px]">
                TBDC {selected.cohort}
              </div>
              <div className="app-page-title text-[2.2rem]">{selected.name}</div>
              <div className="mt-1 text-[0.9rem] text-text-2">{selected.sector}</div>
            </div>
            {!selected.acceptsInvestorIntros && (
              <span className="inline-flex items-center rounded-full border border-warn-bdr bg-warn px-3 py-1 text-[0.72rem] font-medium text-warn-txt whitespace-nowrap">
                No investor introductions
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {[selected.stage, selected.homeMarket, selected.askSize].map((t, i) => (
              <span
                key={i}
                className="font-mono text-[0.68rem] px-2 py-[2px] bg-surface-2 border border-border rounded-[3px] text-text-2"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="font-mono text-[0.8rem] text-text-2 leading-[1.5]">
            {selected.arrTraction}
          </div>
        </div>

        {/* Match content or WIDMO branch */}
        {selected.acceptsInvestorIntros ? (
          <>
            {tier1.length > 0 && (
              <>
                <SecHead>Tier 1 — priority introductions (score 11–14/14)</SecHead>
                {tier1.map((m) => (
                  <div
                    key={m.id}
                    className="bg-surface border border-border rounded-[10px] p-5 mb-2.5 hover:border-border-2 transition-colors"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2 mb-2.5">
                      <div>
                        <div className="text-[1rem] font-bold tracking-[-0.01em] mb-[2px]">
                          {m.investor.name}
                        </div>
                        <div className="font-mono text-[0.7rem] text-text-3">
                          <EditableCell
                            id={m.id}
                            field="warmPath"
                            initialValue={m.warmPath}
                            editable={editable}
                            update={updateMatchStringField}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {scoreBadge(m.score, m.tier)}
                        <div className="font-mono text-[0.68rem] text-text-3">
                          Gap:{" "}
                          <EditableCell
                            id={m.id}
                            field="portfolioGap"
                            initialValue={m.portfolioGap}
                            editable={editable}
                            update={updateMatchStringField}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {dimSignal("Sector", m.sectorPts, 3)}
                      {dimSignal("Stage", m.stagePts, 3)}
                      {dimSignal("Cheque", m.chequePts, 2)}
                      {dimSignal("Founder", m.founderPts, 1)}
                      {dimSignal("Gap", m.gapPts, 1)}
                    </div>
                    <div className="text-[0.82rem] text-text-2 leading-relaxed mb-1.5">
                      <LongTextModal
                        id={m.id}
                        field="rationale"
                        label={`${m.investor.name} — rationale`}
                        initialValue={m.rationale}
                        editable={editable}
                        update={updateMatchStringField}
                      >
                        <span>{m.rationale}</span>
                      </LongTextModal>
                    </div>
                    <div className="inline-block font-mono text-[0.72rem] text-[var(--blue)] bg-[var(--bluebg)] px-[10px] py-1 rounded-[4px]">
                      Next:{" "}
                      <LongTextModal
                        id={m.id}
                        field="nextStep"
                        label={`${m.investor.name} — next step`}
                        initialValue={m.nextStep}
                        editable={editable}
                        update={updateMatchStringField}
                      >
                        <span>{m.nextStep}</span>
                      </LongTextModal>
                    </div>
                  </div>
                ))}
              </>
            )}
            {tier2.length > 0 && (
              <>
                <SecHead>Tier 2 — qualified outreach (score 7–10/14)</SecHead>
                {tier2.map((m) => (
                  <div
                    key={m.id}
                    className="bg-surface border border-border rounded-[10px] p-5 mb-2.5 hover:border-border-2 transition-colors"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2 mb-2.5">
                      <div>
                        <div className="text-[1rem] font-bold tracking-[-0.01em] mb-[2px]">
                          {m.investor.name}
                        </div>
                        <div className="font-mono text-[0.7rem] text-text-3">
                          <EditableCell
                            id={m.id}
                            field="warmPath"
                            initialValue={m.warmPath}
                            editable={editable}
                            update={updateMatchStringField}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {scoreBadge(m.score, m.tier)}
                        <div className="font-mono text-[0.68rem] text-text-3">
                          Gap:{" "}
                          <EditableCell
                            id={m.id}
                            field="portfolioGap"
                            initialValue={m.portfolioGap}
                            editable={editable}
                            update={updateMatchStringField}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {dimSignal("Sector", m.sectorPts, 3)}
                      {dimSignal("Stage", m.stagePts, 3)}
                      {dimSignal("Cheque", m.chequePts, 2)}
                      {dimSignal("Founder", m.founderPts, 1)}
                      {dimSignal("Gap", m.gapPts, 1)}
                    </div>
                    <div className="text-[0.82rem] text-text-2 leading-relaxed mb-1.5">
                      <LongTextModal
                        id={m.id}
                        field="rationale"
                        label={`${m.investor.name} — rationale`}
                        initialValue={m.rationale}
                        editable={editable}
                        update={updateMatchStringField}
                      >
                        <span>{m.rationale}</span>
                      </LongTextModal>
                    </div>
                    <div className="inline-block font-mono text-[0.72rem] text-[var(--blue)] bg-[var(--bluebg)] px-[10px] py-1 rounded-[4px]">
                      Next:{" "}
                      <LongTextModal
                        id={m.id}
                        field="nextStep"
                        label={`${m.investor.name} — next step`}
                        initialValue={m.nextStep}
                        editable={editable}
                        update={updateMatchStringField}
                      >
                        <span>{m.nextStep}</span>
                      </LongTextModal>
                    </div>
                  </div>
                ))}
              </>
            )}
            {doNotMatches.length > 0 && (
              <>
                <SecHead>Do not match — reason logged</SecHead>
                {doNotMatches.map((d) => (
                  <div
                    key={d.id}
                    className="bg-surface border border-border rounded-[6px] px-4 py-3 mb-2 flex gap-3 opacity-75"
                  >
                    <div className="text-[var(--red)] text-[0.75rem] font-bold">✗</div>
                    <div>
                      <div className="text-[0.85rem] font-bold mb-[2px]">
                        <LongTextModal
                          id={d.id}
                          field="label"
                          label="Investor label"
                          initialValue={d.label}
                          editable={editable}
                          update={updateDoNotMatch}
                        >
                          <span>{d.label}</span>
                        </LongTextModal>
                      </div>
                      <div className="text-[0.78rem] text-text-2 leading-[1.5]">
                        <LongTextModal
                          id={d.id}
                          field="reason"
                          label="Reason"
                          initialValue={d.reason}
                          editable={editable}
                          update={updateDoNotMatch}
                        >
                          <span>{d.reason}</span>
                        </LongTextModal>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <div className="bg-warn border border-warn-bdr rounded-[10px] p-5 mb-5">
              <h3 className="text-[0.88rem] text-warn-txt mb-1.5 font-mono font-bold">
                ⚠ Hard gate — investor introductions explicitly declined
              </h3>
              <div className="text-[0.82rem] text-[#6a3010] leading-relaxed">
                {selected.gateNote ??
                  "This company has declined investor introductions. All support is redirected to customer meeting facilitation."}
              </div>
            </div>
            {customerTargets.length > 0 && (
              <>
                <SecHead>Customer meeting targets — priority outreach</SecHead>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-5">
                  {customerTargets.map((t) => (
                    <div
                      key={t.id}
                      className="bg-surface border border-border rounded-[6px] px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <div className="text-[0.85rem] font-bold">
                          <EditableCell
                            id={t.id}
                            field="name"
                            initialValue={t.name}
                            editable={editable}
                            update={updateCustomerTarget}
                          />
                        </div>
                        <span className="inline-block font-mono text-[0.6rem] px-[7px] py-[2px] rounded-[4px] bg-surface-2 text-text-3 border border-border whitespace-nowrap font-bold">
                          <EditableCell
                            id={t.id}
                            field="targetType"
                            initialValue={t.targetType}
                            editable={editable}
                            update={updateCustomerTarget}
                          />
                        </span>
                      </div>
                      <div className="font-mono text-[0.68rem] text-text-3 mb-1">
                        <EditableCell
                          id={t.id}
                          field="hq"
                          initialValue={t.hq}
                          editable={editable}
                          update={updateCustomerTarget}
                        />
                      </div>
                      <div className="text-[0.76rem] text-text-2 leading-[1.45]">
                        <LongTextModal
                          id={t.id}
                          field="description"
                          label={`${t.name} — description`}
                          initialValue={t.description}
                          editable={editable}
                          update={updateCustomerTarget}
                        >
                          <span>{t.description}</span>
                        </LongTextModal>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {events.length > 0 && (
              <>
                <SecHead>Industry event activation</SecHead>
                <div>
                  {events.map((e) => (
                    <span
                      key={e.id}
                      className="inline-block font-mono text-[0.68rem] px-[9px] py-[3px] bg-surface border border-border rounded-[4px] text-text-2 m-[2px]"
                    >
                      {e.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
