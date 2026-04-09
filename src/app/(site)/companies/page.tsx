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
    <>
      <div className="flex items-center justify-between mb-3">
        <SecHead className="mb-0 mt-0 pb-0 border-none">
          Portfolio company profiles — investability dimensions
        </SecHead>
        {editable && <AddCompanyButton />}
      </div>

      <div className="overflow-x-auto border border-border rounded-[10px] mb-6">
        <table className="w-full text-[0.78rem] border-collapse">
          <thead>
            <tr>
              {["Company", "Cohort", "Stage", "Sector", "ARR / Traction", "Ask", "Home", "Target", "Founder Profile", "Investor Intros", editable ? "" : null]
                .filter((h) => h !== null)
                .map((h, i) => (
                  <th
                    key={i}
                    className="bg-surface-2 px-3 py-[9px] text-left font-mono text-[0.65rem] tracking-[0.05em] text-text-2 border-b border-border whitespace-nowrap font-normal"
                  >
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-surface-2">
                <td className="px-3 py-[9px] border-b border-border align-top">
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
    </>
  );
}
