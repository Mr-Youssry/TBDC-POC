import type { Metadata } from "next";
export const metadata: Metadata = { title: "Portfolio Companies — TBDC POC" };

import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/guards";
import { SecHead } from "@/components/sec-head";
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Pinned controls */}
      <div className="flex-shrink-0 px-8 py-4 bg-background border-b border-border">
        <div className="flex items-center justify-between">
          <SecHead className="mb-0 mt-0 pb-0 border-none">
            Portfolio company profiles — investability dimensions
          </SecHead>
          {editable && <AddCompanyButton />}
        </div>
        <p className="text-[0.72rem] text-text-3 mt-1">
          Showing {companies.length} {companies.length === 1 ? "company" : "companies"}
        </p>
      </div>

      {/* Scrollable table */}
      <div className="flex-1 overflow-auto mx-8 my-4 border border-border rounded-[10px]">
        <table className="text-[0.78rem] border-collapse">
          <thead>
            <tr>
              {/* Company Name — frozen column + frozen row intersection */}
              <th
                className="sticky top-0 left-0 z-30 bg-surface-2 px-3 py-[9px] text-left font-mono text-[0.65rem] tracking-[0.05em] text-text-2 border-b border-border border-r whitespace-nowrap font-normal"
              >
                Company
              </th>
              {["Cohort", "Stage", "Sector", "ARR / Traction", "Ask", "Home", "Target", "Founder Profile", "Investor Intros", editable ? "" : null]
                .filter((h) => h !== null)
                .map((h, i) => (
                  <th
                    key={i}
                    className="sticky top-0 z-20 bg-surface-2 px-3 py-[9px] text-left font-mono text-[0.65rem] tracking-[0.05em] text-text-2 border-b border-border whitespace-nowrap font-normal"
                  >
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="group bg-background hover:bg-surface-2">
                <td
                  className="sticky left-0 z-10 bg-background group-hover:bg-surface-2 border-r border-border px-3 py-[9px] border-b align-top"
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
                <td className="px-3 py-[9px] border-b border-border align-top font-mono text-[0.7rem]">
                  <EditableCell
                    id={c.id}
                    field="cohort"
                    initialValue={c.cohort}
                    editable={editable}
                    update={updateCompanyField}
                    options={COHORT_OPTIONS}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top">
                  <EditableCell
                    id={c.id}
                    field="stage"
                    initialValue={c.stage}
                    editable={editable}
                    update={updateCompanyField}
                    display={<StageBadge stage={c.stage} />}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.73rem]">
                  <EditableCell
                    id={c.id}
                    field="sector"
                    initialValue={c.sector}
                    editable={editable}
                    update={updateCompanyField}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.73rem]">
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
                <td className="px-3 py-[9px] border-b border-border align-top font-mono text-[0.72rem]">
                  <EditableCell
                    id={c.id}
                    field="askSize"
                    initialValue={c.askSize}
                    editable={editable}
                    update={updateCompanyField}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.73rem]">
                  <EditableCell
                    id={c.id}
                    field="homeMarket"
                    initialValue={c.homeMarket}
                    editable={editable}
                    update={updateCompanyField}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.73rem]">
                  <EditableCell
                    id={c.id}
                    field="targetMarket"
                    initialValue={c.targetMarket}
                    editable={editable}
                    update={updateCompanyField}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.73rem]">
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
                <td className="px-3 py-[9px] border-b border-border align-top">
                  <AcceptsIntrosToggle
                    id={c.id}
                    initial={c.acceptsInvestorIntros}
                    editable={editable}
                  />
                </td>
                {editable && (
                  <td className="px-3 py-[9px] border-b border-border align-top text-right">
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
