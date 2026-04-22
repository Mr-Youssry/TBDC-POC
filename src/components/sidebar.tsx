"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";
import {
  BookOpenText,
  Building2,
  ChevronLeft,
  ChevronRight,
  Database,
  GraduationCap,
  KanbanSquare,
  MessageSquareText,
  Network,
  Radar,
  ShieldCheck,
  Zap,
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { id: "activation", label: "Activation Playbook", href: "/activation-playbook", icon: Zap },
  { id: "methodology", label: "Methodology", href: "/methodology", icon: BookOpenText },
  { id: "investors", label: "Investor Database", href: "/investors", icon: Database },
  { id: "companies", label: "Portfolio Companies", href: "/companies", icon: Building2 },
  { id: "match", label: "Match Studio", href: "/match", icon: Network },
  { id: "pipeline", label: "Pipeline", href: "/pipeline", icon: KanbanSquare },
];

const ADMIN_ITEMS: NavItem[] = [
  { id: "analyst", label: "SCOTE", href: "/analyst", icon: MessageSquareText },
  { id: "training", label: "SCOTE Training", href: "/training", icon: GraduationCap },
  { id: "audit", label: "Audit Log", href: "/admin/audit", icon: ShieldCheck },
  { id: "clawadmin", label: "Mission Control", href: "/ClawAdmin", icon: Radar },
];

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname() ?? "";
  const forceCollapsed =
    pathname.startsWith("/analyst") || pathname.startsWith("/match") || pathname.startsWith("/training");

  const [manualCollapsed, setManualCollapsed] = useState(false);
  const collapsed = forceCollapsed || manualCollapsed;
  const isAdmin = role === "admin";

  const renderItem = (item: NavItem) => {
    const active =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;
    return (
      <Link
        key={item.id}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={[
          "group relative flex items-center gap-3 rounded-[8px] text-[0.8rem] transition-all duration-150",
          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
          active
            ? "bg-white/8 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
            : "text-white/70 hover:bg-white/6 hover:text-white",
        ].join(" ")}
      >
        <span
          className={[
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            active ? "bg-primary/16 text-primary" : "bg-white/6 text-white/48 group-hover:text-white/80",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </span>
        {!collapsed && <span className="truncate font-medium">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={[
        "sticky top-[67px] flex h-[calc(100vh-67px)] flex-shrink-0 flex-col border-r border-sidebar-border bg-[linear-gradient(180deg,#13141d_0%,#191b25_100%)] text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[252px]",
      ].join(" ")}
    >
      <div className={["border-b border-sidebar-border", collapsed ? "px-2 py-4" : "px-4 py-4"].join(" ")}>
        <div className={["flex items-center gap-3", collapsed ? "justify-center" : ""].join(" ")}>
          <div className="relative">
            <Image
              src="/tbdc-logo.png"
              alt="TBDC"
              width={34}
              height={34}
              className="rounded-lg border border-white/10 bg-white/6 p-1 shadow-[0_12px_26px_rgba(0,0,0,0.2)]"
            />
            {!collapsed && <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-[#13141d] bg-primary" />}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-[0.92rem] font-semibold tracking-[-0.03em] text-white">
                TBDC Capital Console
              </div>
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-white/44">
                Operate
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        <div>
          {!collapsed && (
            <div className="px-3 pb-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-white/36">
              Core
            </div>
          )}
          <div className="space-y-1">{NAV_ITEMS.map(renderItem)}</div>
        </div>

        {isAdmin && (
          <div>
            {!collapsed && (
              <div className="px-3 pb-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-white/36">
                Admin
              </div>
            )}
            <div className="space-y-1">{ADMIN_ITEMS.map(renderItem)}</div>
          </div>
        )}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 rounded-[8px] border border-white/8 bg-white/6 p-4 text-white/80 shadow-[0_18px_32px_rgba(0,0,0,0.2)]">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-white/44">
            Design mode
          </div>
          <div className="mt-2 text-[0.88rem] font-semibold leading-6">
            Search-led, icon-led, calmer than the original product.
          </div>
          <p className="mt-2 text-[0.78rem] leading-6 text-white/62">
            The shell keeps the full system visible while the main canvas stays focused.
          </p>
        </div>
      )}

      {!forceCollapsed && (
        <div className="border-t border-sidebar-border px-3 py-3">
          <button
            onClick={() => setManualCollapsed(!manualCollapsed)}
            className={[
              "flex w-full items-center rounded-[8px] text-[0.72rem] font-medium text-white/60 transition-colors hover:bg-white/6 hover:text-white",
              collapsed ? "justify-center px-2 py-2.5" : "justify-between px-3 py-2.5",
            ].join(" ")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <span>Collapse</span>
                <ChevronLeft className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
