import { Prisma } from "@prisma/client";
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
export async function writeAuditEntry(tx, args) {
    await tx.auditLog.create({
        data: {
            actorUserId: args.actorUserId,
            onBehalfOfUserId: args.onBehalfOfUserId ?? null,
            tableName: args.tableName,
            rowId: args.rowId,
            field: args.field ?? null,
            oldValueJson: args.oldValueJson === undefined
                ? Prisma.JsonNull
                : JSON.parse(JSON.stringify(args.oldValueJson)),
            newValueJson: args.newValueJson === undefined
                ? Prisma.JsonNull
                : JSON.parse(JSON.stringify(args.newValueJson)),
            operation: args.operation,
            chatSessionId: args.chatSessionId ?? null,
        },
    });
}
