// Single Dimension card for the Methodology Phase 2 grid.
// Preview pattern: large pts badge on the left, colored left border
// keyed to rank (higher rank = deeper blue), name + logic on the right.
// Modifier variant (warm path) uses slate instead of blue and italicises
// the text.

const RANK_COLORS: Record<number, string> = {
  1: "#2563eb",
  2: "#3b82f6",
  3: "#60a5fa",
  4: "#93c5fd",
  5: "#bfdbfe",
  6: "#dbeafe",
  7: "#eff6ff",
};
const MOD_COLOR = "#e2e8f0";

export function DimensionCard({
  rank,
  maxWeight,
  isModifier,
  nameSlot,
  logicSlot,
}: {
  rank: number | null;
  maxWeight: string;
  isModifier: boolean;
  nameSlot: React.ReactNode;
  logicSlot: React.ReactNode;
}) {
  const borderColor = isModifier
    ? MOD_COLOR
    : rank
      ? (RANK_COLORS[rank] ?? RANK_COLORS[7])
      : RANK_COLORS[7];

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-[8px] bg-surface border border-border min-h-[88px] transition-colors"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div
        className={[
          "flex-shrink-0 text-center min-w-[44px] pt-0.5",
          isModifier ? "text-text-3 italic" : "text-tbdc-blue",
        ].join(" ")}
      >
        <div className="font-mono text-[1.2rem] font-bold leading-none">
          {isModifier ? "—" : maxWeight.replace(/\s*pts?$/i, "")}
        </div>
        <div className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-text-3 mt-0.5">
          {isModifier ? "mod" : "pts"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {!isModifier && rank !== null && (
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.08em] text-text-3">
              Rank {String(rank).padStart(2, "0")}
            </span>
          )}
          {isModifier && (
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.08em] text-text-3">
              Activation modifier
            </span>
          )}
        </div>
        <div
          className={[
            "text-[0.82rem] font-semibold leading-tight mb-1",
            isModifier ? "text-text-2 italic" : "text-text-1",
          ].join(" ")}
        >
          {nameSlot}
        </div>
        <div
          className={[
            "text-[0.72rem] leading-snug",
            isModifier ? "text-text-3 italic" : "text-text-2",
          ].join(" ")}
        >
          {logicSlot}
        </div>
      </div>
    </div>
  );
}
