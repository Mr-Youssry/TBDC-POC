// Visual funnel for the Methodology "Filter Architecture" section.
// Preview-style horizontal bars with narrowing widths per stage.
// Pure presentation — takes the FunnelData shape from funnel-data.ts.

import type { FunnelData } from "./funnel-data";

// Blue palette scale used for the bars — darkest at the top, lightest at
// the bottom. Matches the preview's visual cadence.
const BAR_COLORS = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#c7d2fe",
];

export function FunnelChart({ data }: { data: FunnelData }) {
  const { stages, tiers } = data;

  return (
    <div className="flex flex-col gap-0 w-full max-w-[760px]">
      {stages.map((stage, i) => {
        const widthPct = Math.max(8, stage.pct);
        const color = BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)];
        const isLast = i === stages.length - 1;
        return (
          <div key={stage.key} className="flex flex-col">
            <div className="flex items-center gap-4">
              <div className="text-[0.7rem] text-text-2 text-right min-w-[200px] leading-snug">
                <div className="font-semibold text-text-1">{stage.label}</div>
                {stage.note && (
                  <div className="font-mono text-[0.6rem] text-text-3 mt-0.5">
                    {stage.note}
                  </div>
                )}
              </div>
              <div
                className="h-10 rounded-[6px] flex items-center justify-center font-semibold text-white text-[0.75rem] shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-all"
                style={{ width: `${widthPct}%`, background: color }}
              >
                {stage.count} {stage.count === 1 ? "pair" : "pairs"}
              </div>
            </div>
            {!isLast && (
              <div className="ml-[216px] py-1 text-[0.6rem] font-mono text-text-3 uppercase tracking-[0.06em]">
                ▼ {stages[i + 1].label.replace(/^After /, "Remove: ")}
              </div>
            )}
          </div>
        );
      })}

      {/* Tier breakdown strip below the funnel */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-[0.68rem] font-mono uppercase tracking-[0.1em] text-text-3 mb-2">
          Tier classification of scored pairs
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-t1-bdr bg-t1-bg text-t1-txt text-[0.75rem] font-semibold">
            Tier 1 (11-14 pts): {tiers.t1}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-t2-bdr bg-t2-bg text-t2-txt text-[0.75rem] font-semibold">
            Tier 2 (7-10 pts): {tiers.t2}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-border bg-surface-2 text-text-2 text-[0.75rem] font-semibold">
            Tier 3 (3-6 pts): {tiers.t3}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-t3-bdr bg-t3-bg text-t3-txt text-[0.75rem] font-semibold">
            Do Not Match (gates): {tiers.dnm}
          </span>
        </div>
      </div>
    </div>
  );
}
