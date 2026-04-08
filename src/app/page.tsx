import Link from "next/link";

/*
  TBDC POC — home page (visual spike for design token port).
  Renders the original header + nav tabs layout from the static prototype,
  using the ported design tokens. This is a parity check: if colors,
  spacing, typography, and badge styles look right here, the token
  system is solid and we can start building real pages.
*/

const TABS = [
  { id: "methodology", label: "01 — Methodology", href: "/" },
  { id: "investors",   label: "02 — Investor Database", href: "/investors" },
  { id: "companies",   label: "03 — Portfolio Companies", href: "/companies" },
  { id: "matching",    label: "04 — Match Output", href: "/match" },
];

export default function Home() {
  return (
    <>
      {/* ── Header ── */}
      <header className="bg-foreground text-background px-8 pt-7 pb-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[1.4rem] font-normal tracking-tight">
              TBDC Investor Matching POC
            </h1>
            <div className="font-mono text-[0.7rem] text-[#999] mt-[3px] tracking-wider">
              Toronto Business Development Centre · Partnerships Workflow
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            <span className="font-mono text-[0.65rem] px-[10px] py-[3px] border border-[#444] rounded text-[#aaa]">
              v2 · Next.js
            </span>
            <span className="font-mono text-[0.65rem] px-[10px] py-[3px] border border-[#444] rounded text-[#aaa]">
              16-point weighted scoring
            </span>
          </div>
        </div>
      </header>

      {/* ── Nav tabs ── */}
      <nav className="bg-card border-b border-border flex gap-0 px-8">
        {TABS.map((t, i) => (
          <Link
            key={t.id}
            href={t.href}
            className={[
              "px-4 py-3 font-mono text-[0.82rem] tracking-wider transition-colors",
              i === 0
                ? "text-foreground border-b-2 border-foreground font-bold"
                : "text-text-3 border-b-2 border-transparent hover:text-text-2",
            ].join(" ")}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {/* ── Page content (visual spike) ── */}
      <main className="px-8 py-7 max-w-[1200px]">
        <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-text-3 mb-3 pb-1.5 border-b border-border">
          Design token spike — verifying palette port
        </h2>

        <p className="text-[0.9rem] leading-relaxed mb-6 max-w-[65ch]">
          This page exists only to verify the design tokens from the original
          static prototype were ported correctly into Tailwind v4. If the
          warm off-white background, Georgia serif body, and traffic-light
          tier badges below look pixel-identical to the reference HTML,
          the system is working. Real pages land next.
        </p>

        <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-text-3 mb-3 pb-1.5 border-b border-border mt-8">
          Tier badges
        </h2>
        <div className="flex gap-2 flex-wrap mb-6">
          <span className="font-mono text-[0.62rem] px-[7px] py-[2px] rounded bg-t1-bg text-t1-txt border border-t1-bdr font-bold">
            Tier 1 · 14/16
          </span>
          <span className="font-mono text-[0.62rem] px-[7px] py-[2px] rounded bg-t2-bg text-t2-txt border border-t2-bdr font-bold">
            Tier 2 · 10/16
          </span>
          <span className="font-mono text-[0.62rem] px-[7px] py-[2px] rounded bg-t3-bg text-t3-txt border border-t3-bdr font-bold">
            Tier 3 · 5/16
          </span>
          <span className="font-mono text-[0.62rem] px-[7px] py-[2px] rounded bg-warn text-warn-txt border border-warn-bdr font-bold">
            ⚠ Hard gate
          </span>
        </div>

        <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-text-3 mb-3 pb-1.5 border-b border-border mt-8">
          Surface ramp
        </h2>
        <div className="flex gap-3 flex-wrap">
          <div className="bg-surface border border-border rounded-[10px] px-4 py-3 min-w-40">
            <div className="font-mono text-[0.62rem] text-text-3 mb-1">SURFACE</div>
            <code className="text-[0.75rem]">#ffffff</code>
          </div>
          <div className="bg-surface-2 border border-border rounded-[10px] px-4 py-3 min-w-40">
            <div className="font-mono text-[0.62rem] text-text-3 mb-1">SURFACE-2</div>
            <code className="text-[0.75rem]">#f0ede8</code>
          </div>
          <div className="bg-surface-3 border border-border rounded-[10px] px-4 py-3 min-w-40">
            <div className="font-mono text-[0.62rem] text-text-3 mb-1">SURFACE-3</div>
            <code className="text-[0.75rem]">#e8e4de</code>
          </div>
          <div className="bg-background border border-border rounded-[10px] px-4 py-3 min-w-40">
            <div className="font-mono text-[0.62rem] text-text-3 mb-1">BACKGROUND</div>
            <code className="text-[0.75rem]">#f5f4f0</code>
          </div>
        </div>
      </main>
    </>
  );
}
