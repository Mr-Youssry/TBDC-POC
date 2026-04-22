import type { Metadata } from "next";
export const metadata: Metadata = { title: "Audit Log — TBDC POC" };

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
    <div className="app-page mx-auto max-w-[1200px]">
      <section className="app-hero mb-5">
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text-3">
          Audit trail
        </div>
        <h1 className="app-page-title mt-3">Audit Log</h1>
        <p className="app-page-copy">
          Every database write performed by admins and the Assistant. Revert remains available at the row level, but the page now opens with a calmer review surface.
        </p>
      </section>
      <div className="space-y-2">
        {entries.length === 0 && (
          <div className="app-surface-muted px-6 py-8 text-center">
            <p className="text-sm text-text-3">No audit entries match the filter.</p>
            <p className="text-xs text-text-3 mt-1">Database writes by admins and the Assistant appear here automatically.</p>
          </div>
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
