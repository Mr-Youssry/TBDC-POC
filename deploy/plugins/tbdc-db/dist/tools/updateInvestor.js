import { writeAuditEntry } from "../audit.js";
const ALLOWED_FIELDS = [
    "type",
    "stage",
    "sectors",
    "chequeSize",
    "geography",
    "leadOrFollow",
    "deals12m",
    "notablePortfolio",
    "contactApproach",
];
export function registerUpdateInvestor(api, prisma, deps) {
    api.registerTool({
        name: "update_investor",
        label: "Update Investor",
        description: "Update editable fields on an Investor row. Does NOT touch id/name/sortOrder. Requires actingUserId. Wraps write + audit insert in a transaction.",
        parameters: {
            type: "object",
            properties: {
                investorId: { type: "string", description: "Investor.id (cuid)." },
                actingUserId: {
                    type: "string",
                    description: "User.id of the admin (injected by the chat proxy from the session).",
                },
                patch: {
                    type: "object",
                    properties: {
                        type: { type: "string" },
                        stage: { type: "string" },
                        sectors: { type: "string" },
                        chequeSize: { type: "string" },
                        geography: { type: "string" },
                        leadOrFollow: { type: "string" },
                        deals12m: { type: "string" },
                        notablePortfolio: { type: "string" },
                        contactApproach: { type: "string" },
                    },
                    additionalProperties: false,
                },
                chatSessionId: { type: "string" },
            },
            required: ["investorId", "actingUserId", "patch"],
            additionalProperties: false,
        },
        async execute(_id, params) {
            const investorId = String(params.investorId ?? "");
            const actingUserId = String(params.actingUserId ?? "");
            const patchRaw = (params.patch ?? {});
            const chatSessionId = typeof params.chatSessionId === "string" ? params.chatSessionId : null;
            if (!investorId || !actingUserId) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "error: investorId and actingUserId are required",
                        },
                    ],
                    details: { error: true },
                };
            }
            const patch = {};
            for (const key of ALLOWED_FIELDS) {
                if (key in patchRaw && patchRaw[key] !== undefined) {
                    patch[key] = patchRaw[key];
                }
            }
            if (Object.keys(patch).length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "error: patch is empty — no allowed fields supplied",
                        },
                    ],
                    details: { error: true },
                };
            }
            try {
                const result = await prisma.$transaction(async (tx) => {
                    const before = await tx.investor.findUniqueOrThrow({
                        where: { id: investorId },
                    });
                    const after = await tx.investor.update({
                        where: { id: investorId },
                        data: { ...patch, updatedByUserId: actingUserId },
                    });
                    await writeAuditEntry(tx, {
                        actorUserId: deps.assistantUserId,
                        onBehalfOfUserId: actingUserId,
                        tableName: "Investor",
                        rowId: investorId,
                        operation: "update",
                        oldValueJson: before,
                        newValueJson: after,
                        chatSessionId,
                    });
                    return { before, after };
                });
                const changed = Object.keys(patch).join(", ");
                return {
                    content: [
                        {
                            type: "text",
                            text: `Updated investor ${investorId}. Fields changed: ${changed}.\nAfter: ${JSON.stringify(result.after, null, 2)}`,
                        },
                    ],
                };
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        { type: "text", text: `error: update_investor failed — ${msg}` },
                    ],
                    details: { error: true },
                };
            }
        },
    });
}
