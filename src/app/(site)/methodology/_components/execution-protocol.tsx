// Phase 3 — Execution Protocol.
// Two static cards per the preview: warm-path-available (green surface)
// and cold-path-only (slate surface). No data — text is copy-edited from
// the preview so it stays consistent with the rest of the methodology
// narrative.

export function ExecutionProtocol() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-[8px] border border-t1-bdr bg-t1-bg/60">
        <div className="text-[0.88rem] font-semibold text-t1-txt mb-2">
          🤝 Warm Path Available
        </div>
        <p className="text-[0.75rem] text-text-2 leading-relaxed">
          Execute via curated one-paragraph brief sent to the mutual
          connector with a permission ask. The brief maps the investor&apos;s
          stated thesis and recent portfolio moves to the startup&apos;s
          specifics. Connector vouches, investor reviews with social
          proof.
        </p>
      </div>
      <div className="p-4 rounded-[8px] border border-border bg-surface-2/70">
        <div className="text-[0.88rem] font-semibold text-text-1 mb-2">
          ❄️ Cold Path Only
        </div>
        <p className="text-[0.75rem] text-text-2 leading-relaxed">
          Execute via highly targeted, gap-framed outreach. Must
          explicitly reference recent portfolio moves by the VC and map
          the startup directly to the thesis alignment that triggered
          the high Sector &amp; Thesis score. No generic pitches.
        </p>
      </div>
    </div>
  );
}
