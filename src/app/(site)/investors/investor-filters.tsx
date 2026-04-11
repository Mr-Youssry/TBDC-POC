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
        "px-[10px] py-[4px] rounded-[4px] text-[0.68rem] font-mono tracking-[0.03em] border transition-colors whitespace-nowrap",
        active
          ? "bg-text-1 text-[#f5f4f0] border-text-1"
          : "bg-surface border-border text-text-2 hover:bg-surface-2",
      ].join(" ")}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1 ${active ? "text-text-3/60" : "text-text-3"}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-[0.72rem]">
      {/* Region filter */}
      <div className="flex items-center gap-1">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.06em] text-text-3 mr-1">Region</span>
        {REGIONS.map((r) =>
          pill(
            r,
            region === r,
            () => setParam("region", r),
            r === "All" ? counts.total : r === "Canada" ? counts.canada : r === "US" ? counts.us : counts.global,
          ),
        )}
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-1">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.06em] text-text-3 mr-1">Type</span>
        {TYPES.map((t) => pill(t, type === t, () => setParam("type", t)))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.06em] text-text-3 mr-1">Sort</span>
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="px-[8px] py-[3px] rounded-[4px] text-[0.68rem] font-mono border border-border bg-surface text-text-2 cursor-pointer"
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
