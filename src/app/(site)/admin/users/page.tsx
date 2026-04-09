import { prisma } from "@/lib/prisma";
import { requireSessionForPage } from "@/lib/guards";
import { SecHead } from "@/components/sec-head";
import { InviteForm } from "./invite-form";
import { DeleteUserButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requireSessionForPage();
  const selfId = (session.user as { id?: string }).id;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { invitedBy: true },
  });

  return (
    <>
      <SecHead>Admin · user management</SecHead>
      <p className="text-[0.82rem] text-text-2 mb-4 max-w-[65ch]">
        Invite additional admins by filling the form below. New users can sign in at{" "}
        <code className="font-mono text-[0.78rem] bg-surface-2 px-1 rounded">/login</code>
        with the temp password you set — share it with them out-of-band. They can change it
        by being re-invited (there is no self-serve password reset in this POC).
      </p>

      <InviteForm />

      <div className="overflow-x-auto border border-border rounded-[10px] mb-6">
        <table className="w-full text-[0.82rem] border-collapse">
          <thead>
            <tr>
              {["Email", "Name", "Role", "Created", "Invited by", ""].map((h, i) => (
                <th
                  key={i}
                  className="bg-surface-2 px-3 py-[9px] text-left font-mono text-[0.65rem] tracking-[0.05em] text-text-2 border-b border-border font-normal whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-2">
                <td className="px-3 py-[9px] border-b border-border align-top">
                  <strong>{u.email}</strong>
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top">
                  {u.name ?? "—"}
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top font-mono text-[0.72rem] text-text-2">
                  {u.role}
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top font-mono text-[0.72rem] text-text-3">
                  {u.createdAt.toISOString().slice(0, 10)}
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-[0.78rem] text-text-2">
                  {u.invitedBy?.email ?? (u.invitedById ? "—" : <span className="text-text-3">bootstrap</span>)}
                </td>
                <td className="px-3 py-[9px] border-b border-border align-top text-right">
                  <DeleteUserButton id={u.id} email={u.email} disabled={u.id === selfId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
