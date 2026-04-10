"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { id: "methodology", label: "Methodology", href: "/methodology" },
  { id: "investors", label: "Investor Database", href: "/investors" },
  { id: "companies", label: "Portfolio Companies", href: "/companies" },
  { id: "match", label: "Match Output", href: "/match" },
  { id: "pipeline", label: "Pipeline", href: "/pipeline" },
];

const ADMIN_TABS = [
  { id: "analyst", label: "Analyst", href: "/analyst" },
  { id: "audit", label: "Audit", href: "/admin/audit" },
  { id: "clawadmin", label: "Mission Control", href: "/ClawAdmin" },
];

export function NavTabs({ role }: { role?: string }) {
  const pathname = usePathname() ?? "";
  const tabs = role === "admin" ? [...TABS, ...ADMIN_TABS] : TABS;
  return (
    <nav className="bg-surface border-b border-border flex gap-0 px-8">
      {tabs.map((t) => {
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
