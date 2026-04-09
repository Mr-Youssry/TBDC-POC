import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/guards";
import { SecHead } from "@/components/sec-head";
import { LongTextModal } from "@/components/long-text-modal";
import { updateDimensionField, updateCardField } from "./actions";

export const dynamic = "force-dynamic";

export default async function MethodologyPage() {
  const [dimensions, cards, editable] = await Promise.all([
    prisma.methodologyDimension.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.methodologyCard.findMany({ orderBy: { sortOrder: "asc" } }),
    isLoggedIn(),
  ]);

  const tiers = [
    { score: "13–16", label: "Tier 1 — Priority intro", desc: "High-conviction match. Make the warm intro immediately or craft a targeted cold outreach with a specific portfolio gap angle.", color: "t1" as const },
    { score: "8–12", label: "Tier 2 — Qualified outreach", desc: "Logical match with identified gaps. Worth an intro if framed correctly — typically as co-investor or follow-on, not lead.", color: "t2" as const },
    { score: "4–7", label: "Tier 3 — Monitor", desc: "Premature or partial alignment. Log for reactivation at a future milestone. Do not make the intro now.", color: "t3-muted" as const },
    { score: "0–3 / Gate", label: "Do not match", desc: "Structural mismatch or hard gate triggered. Making this intro damages TBDC's credibility with the investor.", color: "t3" as const },
  ];

  return (
    <>
      <SecHead>Scoring dimensions — weighted, not equal</SecHead>

      <div className="overflow-x-auto border border-border rounded-[10px] mb-6">
        <table className="w-full text-[0.78rem] border-collapse">
          <thead>
            <tr>
              <th className="bg-surface-2 px-[10px] py-2 text-left font-mono text-[0.65rem] tracking-[0.05em] text-text-2 border-b border-border font-normal">Dimension</th>
              <th className="bg-surface-2 px-[10px] py-2 text-left font-mono text-[0.65rem] tracking-[0.05em] text-text-2 border-b border-border font-normal">Max Weight</th>
              <th className="bg-surface-2 px-[10px] py-2 text-left font-mono text-[0.65rem] tracking-[0.05em] text-text-2 border-b border-border font-normal">Logic</th>
              <th className="bg-surface-2 px-[10px] py-2 text-left font-mono text-[0.65rem] tracking-[0.05em] text-text-2 border-b border-border font-normal">Why this weight</th>
            </tr>
          </thead>
          <tbody>
            {dimensions.map((d, i) => {
              const isKills = d.maxWeight.startsWith("KILLS");
              const isMod = d.maxWeight.startsWith("Activation");
              return (
                <tr key={d.id} className={i < dimensions.length - 1 ? "" : "last-row"}>
                  <td className="px-[10px] py-2 border-b border-border align-top">
                    <LongTextModal
                      id={d.id}
                      field="name"
                      label={`${d.name} — name`}
                      initialValue={d.name}
                      editable={editable}
                      update={updateDimensionField}
                    >
                      <strong className="text-[0.82rem]">{d.name}</strong>
                    </LongTextModal>
                  </td>
                  <td className="px-[10px] py-2 border-b border-border align-top">
                    {isKills ? (
                      <span className="font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-warn text-warn-txt border border-warn-bdr font-bold whitespace-nowrap">
                        {d.maxWeight}
                      </span>
                    ) : isMod ? (
                      <span className="font-mono text-[0.72rem] text-text-2">{d.maxWeight}</span>
                    ) : (
                      <span className="font-mono text-[1rem] font-bold">{d.maxWeight}</span>
                    )}
                  </td>
                  <td className="px-[10px] py-2 border-b border-border align-top">
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
                  </td>
                  <td className="px-[10px] py-2 border-b border-border align-top">
                    <LongTextModal
                      id={d.id}
                      field="rationale"
                      label={`${d.name} — rationale`}
                      initialValue={d.rationale}
                      editable={editable}
                      update={updateDimensionField}
                    >
                      <span>{d.rationale}</span>
                    </LongTextModal>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SecHead>Score tiers and action protocol</SecHead>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 mb-6">
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

      <SecHead>Why weighted scoring outperforms binary matching</SecHead>
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
              <p className="text-[0.8rem] text-text-2 leading-relaxed">{c.body}</p>
            </LongTextModal>
          </div>
        ))}
      </div>
    </>
  );
}
