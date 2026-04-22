import type { Metadata } from "next";
export const metadata: Metadata = { title: "Methodology — TBDC POC" };

import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/guards";
import { SecHead } from "@/components/sec-head";
import { LongTextModal } from "@/components/long-text-modal";
import { updateGateField, updateDimensionField, updateCardField } from "./actions";

export const dynamic = "force-dynamic";

type Gate = { id: string; code: string; name: string; trigger: string; rationale: string; sortOrder: number };

export default async function MethodologyPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma v7 driver-adapter type lag
  const gateQuery: Promise<Gate[]> = (prisma as any).methodologyGate.findMany({ orderBy: { sortOrder: "asc" } });
  const [gates, dimensions, cards, editable] = await Promise.all([
    gateQuery,
    prisma.methodologyDimension.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.methodologyCard.findMany({ orderBy: { sortOrder: "asc" } }),
    isLoggedIn(),
  ]);

  const tiers = [
    { score: "11\u201314", label: "Tier 1 \u2014 Priority intro", desc: "High-conviction match. Make the warm intro immediately, or craft targeted outreach with a specific portfolio gap angle if no warm path is available. Do not delay.", color: "t1" as const },
    { score: "7\u201310", label: "Tier 2 \u2014 Qualified outreach", desc: "Logical match with identified gaps. Worth an introduction if framed correctly \u2014 typically positioned as co-investor or follow-on, not lead. Review which dimensions pulled the score down before crafting the intro.", color: "t2" as const },
    { score: "3\u20136", label: "Tier 3 \u2014 Monitor", desc: "Premature or partial alignment. Log for reactivation at a future milestone. Do not make the intro now \u2014 a weak intro is worse than no intro. Note the specific milestone that would move this to Tier 2.", color: "t3-muted" as const },
    { score: "0\u20132 / Gate", label: "Do not match", desc: "Structural mismatch or hard gate triggered. Making this introduction damages TBDC\u2019s credibility with the investor. Log the reason and move on.", color: "t3" as const },
  ];

  /* ── Table header cell styles (shared) ─────────────────────────────── */
  const th = "bg-surface-2 px-[10px] py-2 text-left font-mono text-[0.65rem] tracking-[0.05em] text-text-2 border-b border-border font-normal";

  return (
    <div className="app-page mx-auto max-w-[1200px]">
      <section className="app-hero mb-5">
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text-3">
          Scoring system
        </div>
        <h1 className="app-page-title mt-3">Methodology</h1>
        <p className="app-page-copy">
          Hard gates, weighted dimensions, and the tier logic behind the investor matching system.
          This route stays reference-heavy, but the first screen now frames the system before dropping into tables.
        </p>
      </section>

      <nav className="app-topbar mb-4 flex gap-4 py-3">
        <a href="#gates" className="text-[0.74rem] font-mono text-text-3 transition-colors hover:text-text-1">Gates</a>
        <a href="#dimensions" className="text-[0.74rem] font-mono text-text-3 transition-colors hover:text-text-1">Dimensions</a>
        <a href="#cards" className="text-[0.74rem] font-mono text-text-3 transition-colors hover:text-text-1">Cards</a>
      </nav>
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — Hard gates
          ═══════════════════════════════════════════════════════════════ */}
      <SecHead id="gates">Hard gates \u2014 run before scoring begins</SecHead>
      <p className="text-[0.78rem] text-text-2 mb-3 leading-relaxed">
        If any gate fires, the investor-startup pair is eliminated from the match output entirely, regardless of what score they would have received. There are three gates.
      </p>

      <div className="overflow-x-auto border border-border rounded-[10px] mb-6">
        <table className="w-full text-[0.78rem] border-collapse">
          <thead>
            <tr>
              <th className={th}>Gate</th>
              <th className={th}>Trigger</th>
              <th className={th}>Rationale &amp; Implementation Note</th>
            </tr>
          </thead>
          <tbody>
            {gates.map((g, i) => (
              <tr key={g.id} className={i < gates.length - 1 ? "" : "last-row"}>
                <td className="px-[10px] py-2 border-b border-border align-top">
                  <LongTextModal
                    id={g.id}
                    field="name"
                    label={`Gate ${g.code} \u2014 name`}
                    initialValue={g.name}
                    editable={editable}
                    update={updateGateField}
                  >
                    <span className="font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-warn text-warn-txt border border-warn-bdr font-bold whitespace-nowrap">
                      {g.code} \u2014 {g.name}
                    </span>
                  </LongTextModal>
                </td>
                <td className="px-[10px] py-2 border-b border-border align-top">
                  <LongTextModal
                    id={g.id}
                    field="trigger"
                    label={`Gate ${g.code} \u2014 trigger`}
                    initialValue={g.trigger}
                    editable={editable}
                    update={updateGateField}
                  >
                    <span>{g.trigger}</span>
                  </LongTextModal>
                </td>
                <td className="px-[10px] py-2 border-b border-border align-top">
                  <LongTextModal
                    id={g.id}
                    field="rationale"
                    label={`Gate ${g.code} \u2014 rationale`}
                    initialValue={g.rationale}
                    editable={editable}
                    update={updateGateField}
                  >
                    <span>{g.rationale}</span>
                  </LongTextModal>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-warn/40 border border-warn-bdr rounded-[6px] px-4 py-2.5 mb-6 text-[0.75rem] text-warn-txt leading-snug">
        <strong>Implementation note:</strong> the scoring algorithm must not run until all three gates have cleared. A company or investor that triggers any gate should never appear in the match output for that pair.
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — Scoring dimensions
          ═══════════════════════════════════════════════════════════════ */}
      <SecHead id="dimensions">Scoring dimensions \u2014 weighted, not equal</SecHead>
      <p className="text-[0.78rem] text-text-2 mb-3 leading-relaxed">
        Seven dimensions are scored after the hard gates clear. Dimensions are ranked by importance \u2014 higher-ranked dimensions carry greater weight. Maximum possible score: <strong className="text-text-1">14 points</strong>.
      </p>

      <div className="overflow-x-auto border border-border rounded-[10px] mb-6">
        <table className="w-full text-[0.78rem] border-collapse">
          <thead>
            <tr>
              <th className={th}>Rank</th>
              <th className={th}>Dimension</th>
              <th className={th}>Max pts</th>
              <th className={th}>Scoring Logic &amp; Rationale</th>
            </tr>
          </thead>
          <tbody>
            {dimensions.map((d, i) => {
              const isMod = d.maxWeight.startsWith("Activation");
              const rank = isMod ? null : String(i + 1).padStart(2, "0");
              return (
                <tr key={d.id} className={i < dimensions.length - 1 ? "" : "last-row"}>
                  <td className="px-[10px] py-2 border-b border-border align-top">
                    {isMod ? (
                      <span className="font-mono text-[0.72rem] text-text-3 italic">Modifier</span>
                    ) : (
                      <span className="font-mono text-[0.82rem] font-bold">{rank}</span>
                    )}
                  </td>
                  <td className="px-[10px] py-2 border-b border-border align-top">
                    <LongTextModal
                      id={d.id}
                      field="name"
                      label={`${d.name} \u2014 name`}
                      initialValue={d.name}
                      editable={editable}
                      update={updateDimensionField}
                    >
                      {isMod ? (
                        <span className="text-[0.82rem] italic text-text-3">{d.name}</span>
                      ) : (
                        <strong className="text-[0.82rem]">{d.name}</strong>
                      )}
                    </LongTextModal>
                  </td>
                  <td className="px-[10px] py-2 border-b border-border align-top">
                    {isMod ? (
                      <span className="font-mono text-[0.72rem] text-text-3 italic">{d.maxWeight}</span>
                    ) : (
                      <span className="font-mono text-[1rem] font-bold">{d.maxWeight}</span>
                    )}
                  </td>
                  <td className="px-[10px] py-2 border-b border-border align-top">
                    <LongTextModal
                      id={d.id}
                      field="logic"
                      label={`${d.name} \u2014 logic`}
                      initialValue={d.logic}
                      editable={editable}
                      update={updateDimensionField}
                    >
                      <span className={isMod ? "italic text-text-3" : ""}>{d.logic}</span>
                    </LongTextModal>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — Score tiers and action protocol
          ═══════════════════════════════════════════════════════════════ */}
      <SecHead>Score tiers and action protocol</SecHead>
      <p className="text-[0.78rem] text-text-2 mb-3 leading-relaxed">
        Score tiers are calibrated against a maximum of 14 points. Each tier maps to a specific action protocol for the IR function. The tier determines not just whether to make the introduction, but how.
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

      <div className="bg-surface border border-border rounded-[6px] px-4 py-2.5 mb-6 text-[0.75rem] text-text-2 leading-snug italic">
        A weak introduction is worse than no introduction. Tier 3 and Do Not Match outcomes should be logged with the reason and the milestone that would change the outcome. This data feeds the learning loop across cohorts.
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — Design rationale
          ═══════════════════════════════════════════════════════════════ */}
      <SecHead id="cards">Design rationale \u2014 why these choices</SecHead>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {cards.map((c) => (
          <div key={c.id} className="bg-surface border border-border rounded-[10px] p-5">
            <LongTextModal
              id={c.id}
              field="title"
              label={`${c.title} \u2014 title`}
              initialValue={c.title}
              editable={editable}
              update={updateCardField}
            >
              <h3 className="text-[0.88rem] font-bold mb-2 tracking-[-0.01em]">{c.title}</h3>
            </LongTextModal>
            <LongTextModal
              id={c.id}
              field="body"
              label={`${c.title} \u2014 body`}
              initialValue={c.body}
              editable={editable}
              update={updateCardField}
            >
              <p className="text-[0.8rem] text-text-2 leading-relaxed whitespace-pre-line">{c.body}</p>
            </LongTextModal>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — Warm path as activation modifier
          ═══════════════════════════════════════════════════════════════ */}
      <SecHead>Warm path as activation modifier</SecHead>
      <div className="bg-surface border border-border rounded-[10px] p-5 mb-6">
        <p className="text-[0.8rem] text-text-2 leading-relaxed mb-3">
          Warm path availability is logged alongside the match score but does not contribute to it. It changes how the IR function executes a valid match &mdash; not whether the match is valid.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-t1-bg border border-t1-bdr rounded-[6px] px-4 py-3">
            <div className="text-[0.75rem] font-bold text-t1-txt mb-1">Warm path available</div>
            <div className="text-[0.72rem] text-text-2 leading-snug">
              Curated one-paragraph brief to the connector. Permission ask before the introduction. Framed around the specific thesis angle the system identified.
            </div>
          </div>
          <div className="bg-surface-2 border border-border rounded-[6px] px-4 py-3">
            <div className="text-[0.75rem] font-bold text-text-1 mb-1">No warm path</div>
            <div className="text-[0.72rem] text-text-2 leading-snug">
              Gap-framed outreach referencing the investor&rsquo;s recent portfolio moves and the specific thesis alignment. Direct, specific, short.
            </div>
          </div>
        </div>
        <p className="text-[0.75rem] text-text-3 mt-3 italic leading-snug">
          A warm path to a Tier 2 match is not preferable to a cold path to a Tier 1 match. The score determines priority. The warm path determines execution.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — Scoring summary
          ═══════════════════════════════════════════════════════════════ */}
      <SecHead>Scoring summary</SecHead>
      <div className="bg-surface border border-border rounded-[10px] p-5 mb-6">
        <ul className="text-[0.8rem] text-text-2 leading-loose list-disc pl-5">
          <li>Hard gates: <strong className="text-text-1">3</strong> (Founder Opt-Out, Geographic Jurisdiction, Fund Activity)</li>
          <li>Scored dimensions: <strong className="text-text-1">7</strong></li>
          <li>Maximum score: <strong className="text-text-1">14 points</strong></li>
          <li>Tier 1 threshold: <strong className="text-t1-txt">11\u201314 pts</strong></li>
          <li>Tier 2 threshold: <strong className="text-t2-txt">7\u201310 pts</strong></li>
          <li>Tier 3 threshold: <strong className="text-text-3">3\u20136 pts</strong></li>
          <li>Do Not Match: <strong className="text-t3-txt">0\u20132 pts</strong> or any gate triggered</li>
          <li>Activation modifier: <span className="text-text-1 font-medium">Warm Path</span> (no pts, changes execution only)</li>
        </ul>
      </div>
    </div>
  );
}
