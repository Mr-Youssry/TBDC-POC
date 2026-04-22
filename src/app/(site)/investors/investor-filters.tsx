"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const REGIONS = ["All", "Canada", "US", "Global"] as const;
const TYPES = ["All", "VC", "Angel Network", "Corporate VC", "Gov", "Venture Studio / VC", "Venture Debt"] as const;
const SORTS = [
  { label: "Default", value: "" },
  { label: "Confidence ↓", value: "confidence-desc" },
  { label: "Confidence ↑", value: "confidence-asc" },
  { label: "Stage (early first)", value: "stage-asc" },
  { label: "Stage (late first)", value: "stage-desc" },
] as const;

export function InvestorFilters({ counts }: { counts: { total: number; canada: number; us: number; global: number } }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const region = searchParams.get("region") || "All";
  const type = searchParams.get("type") || "All";
  const sort = searchParams.get("sort") || "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "All" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(pathname + (params.toString() ? "?" + params.toString() : ""), { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const pill = (label: string, active: boolean, onClick: () => void, count?: number) => (
    <button
      key={label}
      onClick={onClick}
      className={[
        "inline-flex min-h-[34px] items-center rounded-full border px-3 text-[0.72rem] font-medium transition-colors whitespace-nowrap",
        active
          ? "border-primary/18 bg-accent text-accent-foreground"
          : "border-border bg-surface text-text-2 hover:border-primary/16 hover:text-text-1",
      ].join(" ")}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[0.62rem] ${active ? "bg-white/70 text-accent-foreground/70" : "bg-surface-2 text-text-3"}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="grid gap-3 lg:grid-cols-[auto_auto_1fr]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-text-3">Region</span>
        {REGIONS.map((r) =>
          pill(
            r,
            region === r,
            () => setParam("region", r),
            r === "All" ? counts.total : r === "Canada" ? counts.canada : r === "US" ? counts.us : counts.global,
          ),
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-text-3">Type</span>
        {TYPES.map((t) => pill(t, type === t, () => setParam("type", t)))}
      </div>

      <div className="flex items-center gap-2 lg:justify-end">
        <span className="mr-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-text-3">Sort</span>
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="min-h-[34px] rounded-full border border-border bg-surface px-3 text-[0.72rem] font-medium text-text-2 cursor-pointer"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
