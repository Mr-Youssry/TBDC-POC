// Visual dimension breakdown — preview-style mini grid.
// Pure presentation. Accepts per-dimension values + shared context
// (total score, max, tier) and renders:
//   row 1: colored cells (full / partial / zero)
//   row 2: labels
//   row 3: max denominators
// Plus a small score bar on the right with "X / max (Y%)".
//
// Full cell  = value === max (green)
// Partial    = 0 < value < max (amber)
// Zero       = value === 0 (slate)
// Negative   = value < 0 (red) — preserved from the current dimSignal pattern.

export type DimCell = {
  label: string;
  value: number;
  max: number;
  title?: string;
};

function cellClass(value: number, max: number): string {
  if (value < 0) return "bg-t3-bg text-t3-txt border-t3-bdr";
  if (value === 0) return "bg-surface-2 text-text-3 border-border";
  if (value >= max) return "bg-t1-bg text-t1-txt border-t1-bdr";
  return "bg-t2-bg text-t2-txt border-t2-bdr";
}

function barClass(tier: 1 | 2 | 3): string {
  if (tier === 1) return "bg-t1-txt";
  if (tier === 2) return "bg-t2-txt";
  return "bg-text-3";
}

export function DimCellGrid({
  cells,
  total,
  max,
  tier,
}: {
  cells: DimCell[];
  total: number;
  max: number;
  tier: 1 | 2 | 3;
}) {
  const pct = Math.max(0, Math.min(100, Math.round((total / max) * 100)));
  return (
    <div className="flex items-start gap-4">
      <div className="inline-flex flex-col gap-1">
        <div className="flex gap-1">
          {cells.map((c, i) => (
            <div
              key={`v-${i}`}
              title={c.title ?? `${c.label}: ${c.value}/${c.max}`}
              className={[
                "w-8 h-7 rounded-[4px] border flex items-center justify-center",
                "font-mono text-[0.65rem] font-bold",
                cellClass(c.value, c.max),
              ].join(" ")}
            >
              {c.value < 0 ? "✗" : c.value}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {cells.map((c, i) => (
            <div
              key={`l-${i}`}
              className="w-8 text-center font-mono text-[0.55rem] text-text-3"
            >
              {c.label}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {cells.map((c, i) => (
            <div
              key={`m-${i}`}
              className="w-8 text-center font-mono text-[0.5rem] text-text-3/70"
            >
              /{c.max}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 min-w-[140px] pt-1">
        <div className="text-[0.7rem] font-mono text-text-2 tabular-nums">
          {total} / {max}{" "}
          <span className="text-text-3">({pct}%)</span>
        </div>
        <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden border border-border">
          <div
            className={["h-full rounded-full transition-all", barClass(tier)].join(" ")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
