import { prisma } from "@/lib/prisma";
import { requireSessionForPage } from "@/lib/guards";
import { AuditRow } from "./_components/audit-row";

/**
 * v2.0 — /admin/audit
 * Admin-only append-only audit log viewer with one-click revert.
 * Shows up to 200 most recent entries, filtered by optional
 * ?entry=<auditId>, ?actor=<userId>, or ?table=<tableName> search params.
 */
export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string; actor?: string; table?: string }>;
}) {
  // Page guard: redirect unauthenticated visitors to /login first, then
  // enforce the admin-only role check. requireAdmin() alone throws on a
  // missing session, which Next renders as a 500 instead of a redirect.
  const session = await requireSessionForPage();
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    throw new Error("Forbidden: admin role required");
  }
  const params = await searchParams;

  const where: {
    id?: string;
    actorUserId?: string;
    tableName?: string;
  } = {};
  if (params.entry) where.id = params.entry;
  if (params.actor) where.actorUserId = params.actor;
  if (params.table) where.tableName = params.table;

  const entries = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      actor: { select: { id: true, name: true, email: true, role: true } },
      onBehalfOf: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      <h1 className="font-serif text-2xl text-text-1 mb-2">Audit Log</h1>
      <p className="text-sm text-text-3 mb-6">
        Every database write performed by admins and the Assistant. Click
        Revert to undo a field-level change.
      </p>
      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-sm text-text-3">
            No audit entries match the filter.
          </p>
        )}
        {entries.map((e) => (
          <AuditRow
            key={e.id}
            entry={{
              id: e.id,
              tableName: e.tableName,
              rowId: e.rowId,
              field: e.field,
              oldValueJson: e.oldValueJson,
              newValueJson: e.newValueJson,
              operation: e.operation,
              createdAt: e.createdAt,
              revertedByAuditId: e.revertedByAuditId,
              actor: e.actor,
              onBehalfOf: e.onBehalfOf,
            }}
          />
        ))}
      </div>
    </div>
  );
}
