import type { Metadata } from "next";
export const metadata: Metadata = { title: "Methodology — TBDC POC" };

import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/guards";
import { SecHead } from "@/components/sec-head";
import { LongTextModal } from "@/components/long-text-modal";
import { updateGateField, updateDimensionField, updateCardField } from "./actions";
import { getFunnelData } from "./_components/funnel-data";
import { FunnelChart } from "./_components/funnel-chart";
import { GateCard } from "./_components/gate-card";
import { DimensionCard } from "./_components/dimension-card";
import { ExecutionProtocol } from "./_components/execution-protocol";

export const dynamic = "force-dynamic";

type Gate = { id: string; code: string; name: string; trigger: string; rationale: string; sortOrder: number };

export default async function MethodologyPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma v7 driver-adapter type lag
  const gateQuery: Promise<Gate[]> = (prisma as any).methodologyGate.findMany({ orderBy: { sortOrder: "asc" } });
  const [gates, dimensions, cards, editable, funnel] = await Promise.all([
    gateQuery,
    prisma.methodologyDimension.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.methodologyCard.findMany({ orderBy: { sortOrder: "asc" } }),
    isLoggedIn(),
    getFunnelData(),
  ]);

  const tiers = [
    { score: "11–14", label: "Tier 1 — Priority intro", desc: "High-conviction match. Make the warm intro immediately, or craft targeted outreach with a specific portfolio gap angle if no warm path is available. Do not delay.", color: "t1" as const },
    { score: "7–10", label: "Tier 2 — Qualified outreach", desc: "Logical match with identified gaps. Worth an introduction if framed correctly — typically positioned as co-investor or follow-on, not lead. Review which dimensions pulled the score down before crafting the intro.", color: "t2" as const },
    { score: "3–6", label: "Tier 3 — Monitor", desc: "Premature or partial alignment. Log for reactivation at a future milestone. Do not make the intro now — a weak intro is worse than no intro. Note the specific milestone that would move this to Tier 2.", color: "t3-muted" as const },
    { score: "0–2 / Gate", label: "Do not match", desc: "Structural mismatch or hard gate triggered. Making this introduction damages TBDC’s credibility with the investor. Log the reason and move on.", color: "t3" as const },
  ];

  return (
    <div className="px-8 py-7 max-w-[1200px]">
      {/* ═══════════════════════════════════════════════════════════════
          Video hero — methodology walkthrough
          Preserved from the 2026-04-23 visual reskin.
          ═══════════════════════════════════════════════════════════════ */}
      <section className="mb-8">
        <div
          className="font-mono text-[0.68rem] uppercase tracking-[0.12em] font-bold mb-2"
          style={{ color: "var(--color-tbdc-blue)" }}
        >
          Watch first — 3 min overview
        </div>
        <h1 className="font-heading text-[1.5rem] font-bold text-text-1 leading-tight mb-1">
          How the matching methodology works
        </h1>
        <p className="text-[0.85rem] text-text-2 mb-4 max-w-[720px]">
          A short walkthrough of the scoring rubric before you dive into the gate, dimension, and rationale tables below.
        </p>
        <div
          className="relative w-full rounded-[8px] overflow-hidden border border-border bg-surface-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          style={{ aspectRatio: "16 / 9", maxWidth: "960px" }}
        >
          <iframe
            src="https://drive.google.com/file/d/1RppYj9i5s6F3wftbYCk3FuxQqV6AV6ck/preview"
            title="TBDC methodology walkthrough"
            allow="autoplay"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="text-[0.65rem] font-mono text-text-3 mt-2">
          Video hosted on Google Drive · requires the file to be shared as &ldquo;Anyone with the link can view&rdquo; to render inline.
        </p>
      </section>

      {/* Page header */}
      <section className="mb-8">
        <div className="app-page-label">Methodology</div>
        <h2 className="app-page-title">Scoring Framework &amp; Filter Architecture</h2>
        <p className="app-page-subtitle max-w-[820px]">
          Three hard gates eliminate structural mismatches before scoring. Seven ranked dimensions with weighted points determine match quality. Warm path modifies execution, not the score.
        </p>
      </section>

      {/* Phase 1 — Hard Gates */}
      <section className="mb-8">
        <div className="flex items-baseline gap-3 mb-4">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.12em] font-bold" style={{ color: "var(--color-tbdc-blue)" }}>Phase 1</div>
          <SecHead id="gates">Hard gates — run before scoring begins</SecHead>
        </div>
        <p className="text-[0.82rem] text-text-2 mb-4 max-w-[820px] leading-relaxed">
          If any gate fires, the investor-startup pair is eliminated from the match output entirely, regardless of what score they would have received. Scoring does not run until all three gates clear.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {gates.map((g) => (
            <GateCard
              key={g.id}
              code={g.code}
              nameSlot={
                <LongTextModal
                  id={g.id}
                  field="name"
                  label={`Gate ${g.code} — name`}
                  initialValue={g.name}
                  editable={editable}
                  update={updateGateField}
                >
                  <span>{g.name}</span>
                </LongTextModal>
              }
              triggerSlot={
                <LongTextModal
                  id={g.id}
                  field="trigger"
                  label={`Gate ${g.code} — trigger`}
                  initialValue={g.trigger}
                  editable={editable}
                  update={updateGateField}
                >
                  <span>{g.trigger}</span>
                </LongTextModal>
              }
              rationaleSlot={
                <LongTextModal
                  id={g.id}
                  field="rationale"
                  label={`Gate ${g.code} — rationale`}
                  initialValue={g.rationale}
                  editable={editable}
                  update={updateGateField}
                >
                  <span>{g.rationale}</span>
                </LongTextModal>
              }
            />
          ))}
        </div>
      </section>

      {/* Phase 2 — Ranked Dimensions */}
      <section className="mb-8">
        <div className="flex items-baseline gap-3 mb-4">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.12em] font-bold" style={{ color: "var(--color-tbdc-blue)" }}>Phase 2</div>
          <SecHead id="dimensions">Ranked dimensions — weighted, not equal</SecHead>
        </div>
        <p className="text-[0.82rem] text-text-2 mb-4 max-w-[820px] leading-relaxed">
          Seven dimensions are scored after the hard gates clear. Higher-ranked dimensions carry greater weight. Maximum possible score: <strong className="text-text-1">14 points</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dimensions.map((d, i) => {
            const isMod = d.maxWeight.startsWith("Activation");
            const rank = isMod ? null : i + 1;
            return (
              <DimensionCard
                key={d.id}
                rank={rank}
                maxWeight={d.maxWeight}
                isModifier={isMod}
                nameSlot={
                  <LongTextModal
                    id={d.id}
                    field="name"
                    label={`${d.name} — name`}
                    initialValue={d.name}
                    editable={editable}
                    update={updateDimensionField}
                  >
                    <span>{d.name}</span>
                  </LongTextModal>
                }
                logicSlot={
                  <LongTextModal
                    id={d.id}
                    field="logic"
                    label={`${d.name} — logic`}
                    initialValue={d.logic}
                    editable={editable}
                    update={updateDimensionField}
                  >
                    <span>{d.logic}</span>
                  </LongTextModal>
                }
              />
            );
          })}
        </div>
      </section>

      {/* Phase 3 — Execution Protocol */}
      <section className="mb-8">
        <div className="flex items-baseline gap-3 mb-4">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.12em] font-bold" style={{ color: "var(--color-tbdc-blue)" }}>Phase 3</div>
          <SecHead>Execution protocol — applied after threshold clears</SecHead>
        </div>
        <p className="text-[0.82rem] text-text-2 mb-4 max-w-[820px] leading-relaxed">
          Once a match clears the Tier 2 threshold (7+ pts), execution branches on whether a warm path is available. The score determines priority; the warm path determines approach.
        </p>
        <ExecutionProtocol />
      </section>

      {/* Filter Architecture — Anti-Spam Funnel */}
      <section className="mb-8">
        <SecHead>Filter architecture — anti-spam funnel</SecHead>
        <p className="text-[0.82rem] text-text-2 mb-4 max-w-[820px] leading-relaxed">
          Live count of investor × company pairs filtering through the gates and the scoring layer in the current cohort. Numbers update as the data does.
        </p>
        <div className="bg-surface border border-border rounded-[10px] p-5">
          <FunnelChart data={funnel} />
        </div>
      </section>

      {/* Score tiers and action protocol — preserved unchanged */}
      <SecHead>Score tiers and action protocol</SecHead>
      <p className="text-[0.78rem] text-text-2 mb-3 leading-relaxed">
        Score tiers are calibrated against a maximum of 14 points. Each tier maps to a specific action protocol for the IR function.
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 mb-3">
        {tiers.map((t) => {
          const borderColor =
            t.color === "t1"
              ? "border-t1-bdr"
              : t.color === "t2"
                ? "border-t2-bdr"
                : t.color === "t3"
                  ? "border-t3-bdr"
                  : "border-border";
          const textColor =
            t.color === "t1"
              ? "text-t1-txt"
              : t.color === "t2"
                ? "text-t2-txt"
                : t.color === "t3"
                  ? "text-t3-txt"
                  : "text-text-3";
          return (
            <div
              key={t.score}
              className={`bg-surface border ${borderColor} rounded-[6px] px-3 py-2.5`}
            >
              <div className={`font-mono text-[1.1rem] font-bold mb-0.5 ${textColor}`}>{t.score}</div>
              <div className={`text-[0.75rem] font-bold mb-0.5 ${textColor}`}>{t.label}</div>
              <div className="text-[0.72rem] text-text-2 leading-snug">{t.desc}</div>
            </div>
          );
        })}
      </div>
      <div className="bg-surface border border-border rounded-[6px] px-4 py-2.5 mb-8 text-[0.75rem] text-text-2 leading-snug italic">
        A weak introduction is worse than no introduction. Tier 3 and Do Not Match outcomes should be logged with the reason and the milestone that would change the outcome.
      </div>

      {/* Design rationale — preserved unchanged */}
      <SecHead id="cards">Design rationale — why these choices</SecHead>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {cards.map((c) => (
          <div key={c.id} className="bg-surface border border-border rounded-[10px] p-5">
            <LongTextModal
              id={c.id}
              field="title"
              label={`${c.title} — title`}
              initialValue={c.title}
              editable={editable}
              update={updateCardField}
            >
              <h3 className="text-[0.88rem] font-bold mb-2 tracking-[-0.01em]">{c.title}</h3>
            </LongTextModal>
            <LongTextModal
              id={c.id}
              field="body"
              label={`${c.title} — body`}
              initialValue={c.body}
              editable={editable}
              update={updateCardField}
            >
              <p className="text-[0.8rem] text-text-2 leading-relaxed whitespace-pre-line">{c.body}</p>
            </LongTextModal>
          </div>
        ))}
      </div>

      {/* Scoring summary — preserved unchanged */}
      <SecHead>Scoring summary</SecHead>
      <div className="bg-surface border border-border rounded-[10px] p-5 mb-6">
        <ul className="text-[0.8rem] text-text-2 leading-loose list-disc pl-5">
          <li>Hard gates: <strong className="text-text-1">3</strong> (Founder Opt-Out, Geographic Jurisdiction, Fund Activity)</li>
          <li>Scored dimensions: <strong className="text-text-1">7</strong></li>
          <li>Maximum score: <strong className="text-text-1">14 points</strong></li>
          <li>Tier 1 threshold: <strong className="text-t1-txt">11–14 pts</strong></li>
          <li>Tier 2 threshold: <strong className="text-t2-txt">7–10 pts</strong></li>
          <li>Tier 3 threshold: <strong className="text-text-3">3–6 pts</strong></li>
          <li>Do Not Match: <strong className="text-t3-txt">0–2 pts</strong> or any gate triggered</li>
          <li>Activation modifier: <span className="text-text-1 font-medium">Warm Path</span> (no pts, changes execution only)</li>
        </ul>
      </div>
    </div>
  );
}
