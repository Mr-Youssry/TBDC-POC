"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { id: "methodology", label: "01 — Methodology", href: "/methodology" },
  { id: "investors", label: "02 — Investor Database", href: "/investors" },
  { id: "companies", label: "03 — Portfolio Companies", href: "/companies" },
  { id: "match", label: "04 — Match Output", href: "/match" },
];

export function NavTabs() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="bg-surface border-b border-border flex gap-0 px-8">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.id}
            href={t.href}
            className={[
              "px-4 py-3 font-mono text-[0.82rem] tracking-[0.03em] transition-colors border-b-2",
              active
                ? "text-[var(--text-1)] border-b-[var(--text-1)] font-bold"
                : "text-text-3 border-b-transparent hover:text-text-2",
            ].join(" ")}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
