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
    <div className="app-page flex flex-col gap-5">
      <section className="app-hero">
        <div className="max-w-3xl">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text-3">
            Admin workspace
          </div>
          <h1 className="app-page-title mt-3">User Management</h1>
          <p className="app-page-copy">
            Invite additional admins, track account provenance, and keep access changes visible in one quieter control surface.
          </p>
        </div>
        <div className="app-stat-grid mt-5">
          <div className="app-stat-card">
            <span className="app-stat-card__label">Admin users</span>
            <strong className="app-stat-card__value">{users.length}</strong>
            <span className="app-stat-card__copy">Accounts currently able to edit or administer the console.</span>
          </div>
        </div>
      </section>

      <section>
        <SecHead className="mt-0">Admin · user management</SecHead>
        <p className="mb-4 max-w-[65ch] text-[0.82rem] text-text-2">
          Invite additional admins by filling the form below. New users can sign in at{" "}
          <code className="rounded bg-surface-2 px-1 font-mono text-[0.78rem]">/login</code>
          {" "}with the temp password you set and should receive it out-of-band.
        </p>
        <InviteForm />
      </section>

      <div className="app-table-wrap mb-6">
        <table className="w-full text-[0.82rem] border-collapse">
          <thead>
            <tr>
              {["Email", "Name", "Role", "Created", "Invited by", ""].map((h, i) => (
                <th
                  key={i}
                  className="bg-[#f8fafe] px-3 py-[10px] text-left font-mono text-[0.65rem] tracking-[0.08em] text-text-3 border-b border-border font-normal whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#f8fafe]">
                <td className="border-b border-border px-3 py-[10px] align-top">
                  <strong>{u.email}</strong>
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top">
                  {u.name ?? "—"}
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top font-mono text-[0.72rem] text-text-2">
                  {u.role}
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top font-mono text-[0.72rem] text-text-3">
                  {u.createdAt.toISOString().slice(0, 10)}
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top text-[0.78rem] text-text-2">
                  {u.invitedBy?.email ?? (u.invitedById ? "—" : <span className="text-text-3">bootstrap</span>)}
                </td>
                <td className="border-b border-border px-3 py-[10px] align-top text-right">
                  <DeleteUserButton id={u.id} email={u.email} disabled={u.id === selfId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
