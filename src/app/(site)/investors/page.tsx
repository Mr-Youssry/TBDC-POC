import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/guards";
import { SecHead } from "@/components/sec-head";
import { EditableCell } from "@/components/editable-cell";
import { LongTextModal } from "@/components/long-text-modal";
import { TypeBadge, StageBadge, LeadBadge } from "@/components/badges";
import { updateInvestorField } from "./actions";
import { AddInvestorButton, DeleteInvestorButton } from "./row-actions";

export const dynamic = "force-dynamic";

const TYPE_OPTIONS = [
  { label: "VC", value: "VC" },
  { label: "Government", value: "Government" },
  { label: "Corporate", value: "Corporate" },
];
const LEAD_OPTIONS = [
  { label: "Lead", value: "Lead" },
  { label: "Follow", value: "Follow" },
  { label: "Lead+Follow", value: "Lead+Follow" },
];

export default async function InvestorsPage() {
  const [investors, editable] = await Promise.all([
    prisma.investor.findMany({ orderBy: { sortOrder: "asc" } }),
    isLoggedIn(),
  ]);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <SecHead className="mb-0 mt-0 pb-0 border-none">
          Investor database — 24 funds profiled on 10 dimensions
        </SecHead>
        {editable && <AddInvestorButton />}
      </div>

      <div className="overflow-x-auto border border-border rounded-[10px] mb-6">
        <table className="w-full text-[0.78rem] border-collapse">
          <thead>
            <tr>
              {["Fund Name", "Type", "Stage", "Sectors", "Cheque", "Geo", "Lead", "Deals 12M", "Notable Portfolio", "Contact Approach", editable ? "" : null]
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
            {investors.map((iv) => (
              <tr key={iv.id} className="hover:bg-surface-2">
                <td className="px-3 py-[9px] border-b border-border align-top">
                  <EditableCell
                    id={iv.id}
                    field="name"
                    initialValue={iv.name}
                    editable={editable}
                    update={updateInvestorField}
                    display={<strong>{iv.name}</strong>}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top">
                  <EditableCell
                    id={iv.id}
                    field="type"
                    initialValue={iv.type}
                    editable={editable}
                    update={updateInvestorField}
                    options={TYPE_OPTIONS}
                    display={<TypeBadge type={iv.type} />}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top">
                  <EditableCell
                    id={iv.id}
                    field="stage"
                    initialValue={iv.stage}
                    editable={editable}
                    update={updateInvestorField}
                    display={<StageBadge stage={iv.stage} />}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.73rem]">
                  <LongTextModal
                    id={iv.id}
                    field="sectors"
                    label={`${iv.name} — sectors`}
                    initialValue={iv.sectors}
                    editable={editable}
                    update={updateInvestorField}
                  >
                    <span>{iv.sectors}</span>
                  </LongTextModal>
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top font-mono text-[0.72rem]">
                  <EditableCell
                    id={iv.id}
                    field="chequeSize"
                    initialValue={iv.chequeSize}
                    editable={editable}
                    update={updateInvestorField}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.73rem]">
                  <EditableCell
                    id={iv.id}
                    field="geography"
                    initialValue={iv.geography}
                    editable={editable}
                    update={updateInvestorField}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top">
                  <EditableCell
                    id={iv.id}
                    field="leadOrFollow"
                    initialValue={iv.leadOrFollow}
                    editable={editable}
                    update={updateInvestorField}
                    options={LEAD_OPTIONS}
                    display={<LeadBadge lead={iv.leadOrFollow} />}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top font-mono text-[0.72rem] text-text-3">
                  <EditableCell
                    id={iv.id}
                    field="deals12m"
                    initialValue={iv.deals12m}
                    editable={editable}
                    update={updateInvestorField}
                  />
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.73rem]">
                  <LongTextModal
                    id={iv.id}
                    field="notablePortfolio"
                    label={`${iv.name} — notable portfolio`}
                    initialValue={iv.notablePortfolio}
                    editable={editable}
                    update={updateInvestorField}
                  >
                    <span>{iv.notablePortfolio}</span>
                  </LongTextModal>
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.72rem] text-text-2">
                  <LongTextModal
                    id={iv.id}
                    field="contactApproach"
                    label={`${iv.name} — contact approach`}
                    initialValue={iv.contactApproach}
                    editable={editable}
                    update={updateInvestorField}
                  >
                    <span>{iv.contactApproach}</span>
                  </LongTextModal>
                </td>
                {editable && (
                  <td className="px-3 py-[9px] border-b border-border align-top text-right">
                    <DeleteInvestorButton id={iv.id} name={iv.name} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[0.72rem] font-mono text-text-3">
        * Portfolio and deal data sourced from LinkedIn, public announcements, and direct market knowledge. Crunchbase/PitchBook integration recommended for production deployment. Contact names validated via LinkedIn Sales Navigator.
      </p>
    </>
  );
}
