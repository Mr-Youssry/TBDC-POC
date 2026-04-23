// Single Hard Gate card for the Methodology Phase 1 grid.
// Structure mirrors the preview's .gate-card block — red "G#" badge,
// name, rule. Children render the editable spans wrapped in
// LongTextModal from the parent page.

export function GateCard({
  code,
  nameSlot,
  triggerSlot,
  rationaleSlot,
}: {
  code: string;
  nameSlot: React.ReactNode;
  triggerSlot: React.ReactNode;
  rationaleSlot: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-[8px] bg-surface border border-border hover:border-border/80 transition-colors min-h-[96px]">
      <div className="flex-shrink-0 w-10 h-10 rounded-[6px] bg-t3-bg border border-t3-bdr flex items-center justify-center font-mono font-bold text-[0.85rem] text-t3-txt">
        G{code}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[0.85rem] font-semibold text-text-1 leading-tight mb-1">
          {nameSlot}
        </div>
        <div className="text-[0.72rem] text-text-2 leading-snug mb-1.5">
          {triggerSlot}
        </div>
        <div className="text-[0.68rem] text-text-3 leading-snug">
          {rationaleSlot}
        </div>
      </div>
    </div>
  );
}
