import { z } from "zod";

/**
 * v2.0 — input schema for the one-click revert action on /admin/audit.
 * Only the audit entry id is needed; the server action reads the full row
 * and applies `oldValueJson` back to the target field.
 */
export const RevertAuditEntryInput = z.object({
  auditId: z.string().min(1),
});

export type RevertAuditEntryInputT = z.infer<typeof RevertAuditEntryInput>;
