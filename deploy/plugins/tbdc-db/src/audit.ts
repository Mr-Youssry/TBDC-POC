import type { PrismaClient, AuditOp } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type AuditOperation = "insert" | "update" | "delete";

export interface WriteAuditEntryArgs {
  /** User.id of the assistant service account — resolved once at register time. */
  actorUserId: string;
  /**
   * User.id of the admin the LLM was acting on behalf of. Null for automated
   * writes with no human in the loop (not used in Phase 2 but kept for
   * schema symmetry).
   */
  onBehalfOfUserId?: string | null;
  tableName: string;
  rowId: string;
  operation: AuditOperation;
  /** Optional field-level label (e.g. "score" on a narrow patch). */
  field?: string | null;
  /** Pre-write snapshot of the row (or null for inserts). */
  oldValueJson?: unknown;
  /** Post-write snapshot of the row (or null for deletes). */
  newValueJson?: unknown;
  /** Optional OpenClaw chat session id for traceability. */
  chatSessionId?: string | null;
}

/**
 * Append a row to the AuditLog table. Call this INSIDE a Prisma transaction
 * alongside the content write, so either both land or neither does.
 *
 * Caller contract (enforced by TypeScript, not by runtime checks):
 *   - `actorUserId` is the assistant User (resolved in register()).
 *   - `onBehalfOfUserId` is the human admin whose authenticated session
 *     triggered the write. The chat proxy in Phase 3 is responsible for
 *     supplying this value; it MUST NOT be trusted from the LLM tool call.
 *   - `oldValueJson` and `newValueJson` are JSON-serializable snapshots.
 *     Dates, Decimals, etc. must be pre-serialized by the caller.
 */
export async function writeAuditEntry(
  tx: Pick<PrismaClient, "auditLog">,
  args: WriteAuditEntryArgs,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      actorUserId: args.actorUserId,
      onBehalfOfUserId: args.onBehalfOfUserId ?? null,
      tableName: args.tableName,
      rowId: args.rowId,
      field: args.field ?? null,
      oldValueJson:
        args.oldValueJson === undefined
          ? Prisma.JsonNull
          : (JSON.parse(JSON.stringify(args.oldValueJson)) as Prisma.InputJsonValue),
      newValueJson:
        args.newValueJson === undefined
          ? Prisma.JsonNull
          : (JSON.parse(JSON.stringify(args.newValueJson)) as Prisma.InputJsonValue),
      operation: args.operation as AuditOp,
      chatSessionId: args.chatSessionId ?? null,
    },
  });
}
