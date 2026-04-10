import { writeAuditEntry } from "../audit.js";
const ALLOWED_FIELDS = [
    "tier",
    "score",
    "rationale",
    "nextStep",
    "warmPath",
    "portfolioGap",
];
export function registerUpdateMatch(api, prisma, deps) {
    api.registerTool({
        name: "update_match",
        label: "Update Match",
        description: "Update a Match row's editable fields (tier, score, rationale, nextStep, warmPath, portfolioGap). Requires actingUserId — the admin User.id whose session authorized the edit. Wraps the write + audit insert in a single transaction; if either fails, neither lands.",
        parameters: {
            type: "object",
            properties: {
                matchId: {
                    type: "string",
                    description: "Match.id (cuid) of the row to update.",
                },
                actingUserId: {
                    type: "string",
                    description: "User.id of the admin on whose behalf the assistant is making the edit. Injected by the chat proxy from the NextAuth session — never from the LLM directly.",
                },
                patch: {
                    type: "object",
                    description: "Subset of editable fields to update.",
                    properties: {
                        tier: {
                            type: "integer",
                            minimum: 1,
                            maximum: 3,
                            description: "1, 2, or 3. Tier tier.",
                        },
                        score: { type: "integer", minimum: 0, maximum: 16 },
                        rationale: { type: "string" },
                        nextStep: { type: "string" },
                        warmPath: { type: "string" },
                        portfolioGap: { type: "string" },
                    },
                    additionalProperties: false,
                },
                chatSessionId: {
                    type: "string",
                    description: "Optional OpenClaw chat session id for audit traceability.",
                },
            },
            required: ["matchId", "actingUserId", "patch"],
            additionalProperties: false,
        },
        async execute(_id, params) {
            const matchId = String(params.matchId ?? "");
            const actingUserId = String(params.actingUserId ?? "");
            const patchRaw = (params.patch ?? {});
            const chatSessionId = typeof params.chatSessionId === "string" ? params.chatSessionId : null;
            if (!matchId || !actingUserId) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "error: matchId and actingUserId are required",
                        },
                    ],
                    details: { error: true },
                };
            }
            // Whitelist filter — silently drop anything not in ALLOWED_FIELDS.
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
                    const before = await tx.match.findUniqueOrThrow({
                        where: { id: matchId },
                    });
                    const after = await tx.match.update({
                        where: { id: matchId },
                        data: { ...patch, updatedByUserId: actingUserId },
                    });
                    await writeAuditEntry(tx, {
                        actorUserId: deps.assistantUserId,
                        onBehalfOfUserId: actingUserId,
                        tableName: "Match",
                        rowId: matchId,
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
                            text: `Updated match ${matchId}. Fields changed: ${changed}.\nAfter: ${JSON.stringify(result.after, null, 2)}`,
                        },
                    ],
                };
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        { type: "text", text: `error: update_match failed — ${msg}` },
                    ],
                    details: { error: true },
                };
            }
        },
    });
}
