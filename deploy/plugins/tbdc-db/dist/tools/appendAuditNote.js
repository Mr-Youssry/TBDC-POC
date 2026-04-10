import { writeAuditEntry } from "../audit.js";
/**
 * "append_audit_note" is a write tool that records a non-mutating observation
 * in the AuditLog (operation=insert, tableName=<target>, newValueJson={note}).
 * Use this when the assistant wants to leave a breadcrumb without touching
 * any content row — e.g. "considered and rejected investor X for company Y
 * because …". Still requires actingUserId for attribution.
 */
export function registerAppendAuditNote(api, prisma, deps) {
    api.registerTool({
        name: "append_audit_note",
        label: "Append Audit Note",
        description: "Append a free-text note to the AuditLog without mutating any content row. Use this to record rationale-only observations (e.g. why you did NOT create a match). Requires actingUserId.",
        parameters: {
            type: "object",
            properties: {
                actingUserId: {
                    type: "string",
                    description: "User.id of the admin on whose behalf the note is being recorded.",
                },
                tableName: {
                    type: "string",
                    description: "Table the note is about (e.g. 'Match', 'Company'). Free-text — used for filtering in /admin/audit.",
                },
                rowId: {
                    type: "string",
                    description: "Row id the note is about. Use 'n/a' if the note is not about a specific row.",
                },
                note: {
                    type: "string",
                    description: "The note body. Will be stored in newValueJson.note.",
                },
                chatSessionId: { type: "string" },
            },
            required: ["actingUserId", "tableName", "rowId", "note"],
            additionalProperties: false,
        },
        async execute(_id, params) {
            const actingUserId = String(params.actingUserId ?? "");
            const tableName = String(params.tableName ?? "");
            const rowId = String(params.rowId ?? "");
            const note = String(params.note ?? "");
            const chatSessionId = typeof params.chatSessionId === "string" ? params.chatSessionId : null;
            if (!actingUserId || !tableName || !rowId || !note) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "error: actingUserId, tableName, rowId, and note are all required",
                        },
                    ],
                    details: { error: true },
                };
            }
            try {
                await prisma.$transaction(async (tx) => {
                    await writeAuditEntry(tx, {
                        actorUserId: deps.assistantUserId,
                        onBehalfOfUserId: actingUserId,
                        tableName,
                        rowId,
                        operation: "insert",
                        newValueJson: { note },
                        chatSessionId,
                    });
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: `Appended audit note on ${tableName}:${rowId}.`,
                        },
                    ],
                };
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        {
                            type: "text",
                            text: `error: append_audit_note failed — ${msg}`,
                        },
                    ],
                    details: { error: true },
                };
            }
        },
    });
}
