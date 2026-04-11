"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

  return (
    <aside
      className={[
        "flex-shrink-0 bg-[var(--text-1)] text-[#ccc] flex flex-col transition-all duration-200 border-r border-[#333]",
        collapsed ? "w-[52px]" : "w-[220px]",
      ].join(" ")}
    >
      {/* Logo area */}
      <div className="px-3 py-3 flex items-center gap-2">
        <Image
          src="/tbdc-logo.png"
          alt="TBDC"
          width={28}
          height={28}
          className="rounded flex-shrink-0"
        />
        {!collapsed && (
          <span className="text-[0.75rem] font-semibold text-[#eee] truncate">
            TBDC POC
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 flex flex-col px-1.5 py-1 gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={[
                "flex items-center gap-2 px-2.5 py-2 rounded-md text-[0.78rem] transition-colors",
                active
                  ? "bg-[#333] text-white font-semibold"
                  : "text-[#aaa] hover:bg-[#2a2a2a] hover:text-[#ddd]",
              ].join(" ")}
            >
              <span className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                style={{ backgroundColor: active ? "#4ade80" : "transparent" }}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="my-2 border-t border-[#444]" />
            {!collapsed && (
              <div className="px-2.5 pb-1 font-mono text-[0.55rem] text-[#666] uppercase tracking-[0.1em]">
                Admin
              </div>
            )}
            {ADMIN_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={[
                    "flex items-center gap-2 px-2.5 py-2 rounded-md text-[0.78rem] transition-colors",
                    active
                      ? "bg-[#333] text-white font-semibold"
                      : "text-[#aaa] hover:bg-[#2a2a2a] hover:text-[#ddd]",
                  ].join(" ")}
                >
                  <span className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: active ? "#4ade80" : "transparent" }}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="px-3 py-2.5 text-[0.7rem] text-[#666] hover:text-[#aaa] border-t border-[#333] transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? ">" : "< collapse"}
      </button>
    </aside>
  );
}
