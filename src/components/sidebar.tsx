"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

// ── SVG icons (inline, no dependency) ──────────────────────────────────
// Each icon is a 20×20 viewBox, stroke-based, matching the sidebar text.

const icons: Record<string, React.ReactNode> = {
  methodology: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M4 4h12M4 8h8M4 12h10M4 16h6" strokeLinecap="round" />
    </svg>
  ),
  investors: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] flex-shrink-0">
      <circle cx="10" cy="6" r="3" /><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
    </svg>
  ),
  companies: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] flex-shrink-0">
      <rect x="3" y="4" width="14" height="13" rx="1.5" /><path d="M7 4V2M13 4V2M3 9h14" strokeLinecap="round" />
    </svg>
  ),
  match: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M6 10l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="10" cy="10" r="7" />
    </svg>
  ),
  pipeline: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M3 4h14l-4 5v5l-2 2V9L3 4z" strokeLinejoin="round" />
    </svg>
  ),
  analyst: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M4 14l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="2" width="16" height="16" rx="2" />
    </svg>
  ),
  audit: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M6 3h8l3 3v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2z" /><path d="M7 10h6M7 13h4" strokeLinecap="round" />
    </svg>
  ),
  clawadmin: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] flex-shrink-0">
      <circle cx="10" cy="10" r="3" /><path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.2 4.2l2.1 2.1M13.7 13.7l2.1 2.1M4.2 15.8l2.1-2.1M13.7 6.3l2.1-2.1" strokeLinecap="round" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: "methodology", label: "Methodology", href: "/methodology" },
  { id: "investors", label: "Investor Database", href: "/investors" },
  { id: "companies", label: "Portfolio Companies", href: "/companies" },
  { id: "match", label: "Match Output", href: "/match" },
  { id: "pipeline", label: "Pipeline", href: "/pipeline" },
];

const ADMIN_ITEMS = [
  { id: "analyst", label: "Analyst", href: "/analyst" },
  { id: "audit", label: "Audit Log", href: "/admin/audit" },
  { id: "clawadmin", label: "Mission Control", href: "/ClawAdmin" },
];

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = role === "admin";

  // Hide global sidebar on analyst page — it has its own channel sidebar
  if (pathname.startsWith("/analyst")) return null;

  const renderItem = (item: { id: string; label: string; href: string }) => {
    const active =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.id}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={[
          "flex items-center gap-2.5 rounded-md text-[0.78rem] transition-colors relative",
          collapsed ? "px-2 py-2 justify-center" : "px-3 py-2",
          active
            ? "bg-surface-3 text-text-1 font-semibold"
            : "text-text-3 hover:bg-surface-2 hover:text-text-2",
        ].join(" ")}
      >
        <span className={active ? "text-text-1" : "text-text-3"}>
          {icons[item.id]}
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={[
        "sticky top-[60px] h-[calc(100vh-60px)] flex-shrink-0 flex flex-col transition-all duration-200",
        "bg-surface border-r border-border shadow-[2px_0_8px_rgba(0,0,0,0.06)]",
        collapsed ? "w-[52px]" : "w-[220px]",
      ].join(" ")}
    >
      {/* Logo area */}
      <div className={["flex items-center gap-2 border-b border-border", collapsed ? "px-2 py-3 justify-center" : "px-3 py-3"].join(" ")}>
        <Image
          src="/tbdc-logo.png"
          alt="TBDC"
          width={26}
          height={26}
          className="rounded flex-shrink-0"
        />
        {!collapsed && (
          <span className="text-[0.72rem] font-semibold text-text-1 truncate">
            TBDC POC
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 flex flex-col px-1.5 py-2 gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(renderItem)}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="my-2 border-t border-border" />
            {!collapsed && (
              <div className="px-3 pb-1 font-mono text-[0.55rem] text-text-3 uppercase tracking-[0.1em]">
                Admin
              </div>
            )}
            {ADMIN_ITEMS.map(renderItem)}
          </>
        )}
      </nav>

      {/* Floating collapse toggle — fixed at the edge of the sidebar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={[
          "absolute top-1/2 -translate-y-1/2 w-[20px] h-[40px] flex items-center justify-center",
          "bg-surface border border-border rounded-r-md shadow-sm",
          "text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors z-10",
          "-right-[20px]",
        ].join(" ")}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={[
            "w-3 h-3 transition-transform",
            collapsed ? "rotate-180" : "",
          ].join(" ")}
        >
          <path d="M8 2L4 6l4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </aside>
  );
}
