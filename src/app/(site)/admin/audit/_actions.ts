"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { RevertAuditEntryInput } from "@/lib/zod/audit";

/**
 * Map of AuditLog.tableName -> PrismaClient delegate property name.
 * Only tables that v2.0 write tools can modify are revertible.
 */
const WRITABLE_TABLES: Record<string, string> = {
  Investor: "investor",
  Company: "company",
  Match: "match",
  DoNotMatch: "doNotMatch",
  CustomerTarget: "customerTarget",
  IndustryEvent: "industryEvent",
  MethodologyDimension: "methodologyDimension",
  MethodologyCard: "methodologyCard",
};

type RevertResult =
  | { ok: true; newAuditId: string }
  | { ok: false; error: string };

/**
 * Revert a single audit entry: apply its `oldValueJson` back to the target
 * row's field, write a new audit entry attributed to the current admin, and
 * mark the original entry as reverted via `revertedByAuditId`.
 *
 * Only `operation = 'update'` entries with a non-null `field` are revertible
 * in v2.0. Create/delete rollbacks are deferred.
 */
export async function revertAuditEntry(raw: unknown): Promise<RevertResult> {
  const session = await requireAdmin();
  const adminId = (session.user as { id?: string }).id;
  if (!adminId) return { ok: false, error: "Admin session missing user id" };

  const parse = RevertAuditEntryInput.safeParse(raw);
  if (!parse.success) return { ok: false, error: parse.error.message };

  const entry = await prisma.auditLog.findUnique({
    where: { id: parse.data.auditId },
  });
  if (!entry) return { ok: false, error: "Audit entry not found" };
  if (entry.revertedByAuditId) return { ok: false, error: "Already reverted" };

  if (entry.operation !== "update" || !entry.field) {
    return { ok: false, error: "Only field updates are revertible in v2.0" };
  }

  const delegateName = WRITABLE_TABLES[entry.tableName];
  if (!delegateName) {
    return { ok: false, error: `Table ${entry.tableName} is not revertible` };
  }

  // Defensive: refuse to revert to a JSON null on a scalar field — Prisma
  // will either throw or silently coerce. The POC bail-out keeps the
  // invariant simple: if the old value is null, a human should intervene.
  if (entry.oldValueJson === null) {
    return {
      ok: false,
      error:
        "Cannot auto-revert: old value was null. Edit the row manually.",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelDelegate = (prisma as any)[delegateName];

  const before = await modelDelegate.findUnique({
    where: { id: entry.rowId },
  });
  if (!before) return { ok: false, error: "Target row no longer exists" };

  const patch: Record<string, unknown> = {
    [entry.field]: entry.oldValueJson,
    updatedByUserId: adminId,
  };

  try {
    await modelDelegate.update({ where: { id: entry.rowId }, data: patch });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Revert update failed: ${msg}` };
  }

  const newAudit = await prisma.auditLog.create({
    data: {
      actorUserId: adminId,
      onBehalfOfUserId: null,
      tableName: entry.tableName,
      rowId: entry.rowId,
      field: entry.field,
      oldValueJson: entry.newValueJson ?? undefined, // value before this revert
      newValueJson: entry.oldValueJson ?? undefined, // value after this revert
      operation: "update",
      chatSessionId: null,
    },
  });

  await prisma.auditLog.update({
    where: { id: entry.id },
    data: { revertedByAuditId: newAudit.id },
  });

  revalidatePath("/admin/audit");
  return { ok: true, newAuditId: newAudit.id };
}
