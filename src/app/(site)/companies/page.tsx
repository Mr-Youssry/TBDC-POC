import type { Metadata } from "next";
export const metadata: Metadata = { title: "Portfolio Companies — TBDC POC" };

import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/guards";
import { EditableCell } from "@/components/editable-cell";
import { LongTextModal } from "@/components/long-text-modal";
import { StageBadge } from "@/components/badges";
import { updateCompanyField } from "./actions";
import {
  AddCompanyButton,
  DeleteCompanyButton,
  AcceptsIntrosToggle,
} from "./row-actions";

export const dynamic = "force-dynamic";

const COHORT_OPTIONS = [
  { label: "Pivot 1", value: "Pivot 1" },
  { label: "Horizon 3", value: "Horizon 3" },
];

export default async function CompaniesPage() {
  const [companies, editable] = await Promise.all([
    prisma.company.findMany({ orderBy: { sortOrder: "asc" } }),
    isLoggedIn(),
  ]);
  const openCount = companies.filter((company) => company.acceptsInvestorIntros).length;
  const blockedCount = companies.length - openCount;
  const horizonCount = companies.filter((company) => company.cohort === "Horizon 3").length;
  const seedToA = companies.filter((company) => /(seed|series a)/i.test(company.stage)).length;

  return (
    <div className="app-page flex h-full flex-col gap-5">
      <section className="app-hero">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text-3">
              Company profiles
            </div>
            <h1 className="app-page-title mt-3">Portfolio Companies</h1>
            <p className="app-page-copy">
              Cleaner company records with the investability story visible up front and the full editable matrix below.
            </p>
          </div>
          {editable && <AddCompanyButton />}
        </div>
        <div className="app-stat-grid mt-5">
          <div className="app-stat-card">
            <span className="app-stat-card__label">Company count</span>
            <strong className="app-stat-card__value">{companies.length}</strong>
            <span className="app-stat-card__copy">Profiles currently tracked in the portfolio workspace.</span>
          </div>
          <div className="app-stat-card">
            <span className="app-stat-card__label">Intro-ready</span>
            <strong className="app-stat-card__value">{openCount}</strong>
            <span className="app-stat-card__copy">Companies that accept investor introductions now.</span>
          </div>
          <div className="app-stat-card">
            <span className="app-stat-card__label">Blocked</span>
            <strong className="app-stat-card__value">{blockedCount}</strong>
            <span className="app-stat-card__copy">Profiles requiring customer proof or alternate paths first.</span>
          </div>
          <div className="app-stat-card">
            <span className="app-stat-card__label">Seed-Series A</span>
            <strong className="app-stat-card__value">{seedToA}</strong>
            <span className="app-stat-card__copy">Core venture-stage companies visible in the current list.</span>
          </div>
        </div>
        <p className="mt-4 text-[0.72rem] font-mono text-text-3">
          Showing {companies.length} {companies.length === 1 ? "company" : "companies"} · {horizonCount} Horizon 3
        </p>
      </section>

      <div className="app-table-wrap flex-1">
        <table className="text-[0.78rem] border-collapse">
          <thead>
            <tr>
              <th
                className="sticky top-0 left-0 z-30 border-b border-r border-border bg-[#f8fafe] px-3 py-[10px] text-left font-mono text-[0.65rem] tracking-[0.08em] text-text-3 whitespace-nowrap font-normal"
              >
                Company
              </th>
              {["Cohort", "Stage", "Sector", "ARR / Traction", "Ask", "Home", "Target", "Founder Profile", "Investor Intros", editable ? "" : null]
                .filter((h) => h !== null)
                .map((h, i) => (
                  <th
                    key={i}
                    className="sticky top-0 z-20 border-b border-border bg-[#f8fafe] px-3 py-[10px] text-left font-mono text-[0.65rem] tracking-[0.08em] text-text-3 whitespace-nowrap font-normal"
                  >
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="group bg-white hover:bg-[#f8fafe]">
                <td
                  className="sticky left-0 z-10 border-b border-r border-border bg-white px-3 py-[10px] align-top group-hover:bg-[#f8fafe]"
                  style={{ minWidth: 160 }}
                >
                  <EditableCell
                    id={c.id}
                    field="name"
                    initialValue={c.name}
                    editable={editable}
                    update={updateCompanyField}
                    display={<strong>{c.name}</strong>}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top font-mono text-[0.7rem]">
                  <EditableCell
                    id={c.id}
                    field="cohort"
                    initialValue={c.cohort}
                    editable={editable}
                    update={updateCompanyField}
                    options={COHORT_OPTIONS}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top">
                  <EditableCell
                    id={c.id}
                    field="stage"
                    initialValue={c.stage}
                    editable={editable}
                    update={updateCompanyField}
                    display={<StageBadge stage={c.stage} />}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top text-[0.73rem]">
                  <EditableCell
                    id={c.id}
                    field="sector"
                    initialValue={c.sector}
                    editable={editable}
                    update={updateCompanyField}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top text-[0.73rem]">
                  <LongTextModal
                    id={c.id}
                    field="arrTraction"
                    label={`${c.name} — ARR / traction`}
                    initialValue={c.arrTraction}
                    editable={editable}
                    update={updateCompanyField}
                  >
                    <span>{c.arrTraction}</span>
                  </LongTextModal>
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top font-mono text-[0.72rem]">
                  <EditableCell
                    id={c.id}
                    field="askSize"
                    initialValue={c.askSize}
                    editable={editable}
                    update={updateCompanyField}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top text-[0.73rem]">
                  <EditableCell
                    id={c.id}
                    field="homeMarket"
                    initialValue={c.homeMarket}
                    editable={editable}
                    update={updateCompanyField}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top text-[0.73rem]">
                  <EditableCell
                    id={c.id}
                    field="targetMarket"
                    initialValue={c.targetMarket}
                    editable={editable}
                    update={updateCompanyField}
                  />
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top text-[0.73rem]">
                  <LongTextModal
                    id={c.id}
                    field="founderProfile"
                    label={`${c.name} — founder profile`}
                    initialValue={c.founderProfile}
                    editable={editable}
                    update={updateCompanyField}
                  >
                    <span>{c.founderProfile}</span>
                  </LongTextModal>
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top">
                  <AcceptsIntrosToggle
                    id={c.id}
                    initial={c.acceptsInvestorIntros}
                    editable={editable}
                  />
                </td>
                {editable && (
                  <td className="border-b border-border px-3 py-[10px] align-top text-right">
                    <DeleteCompanyButton id={c.id} name={c.name} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
