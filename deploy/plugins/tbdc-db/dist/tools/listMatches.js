export function registerListMatches(api, prisma) {
    api.registerTool({
        name: "list_matches",
        label: "List Matches",
        description: "List all Match rows for a given company, ordered by tier then sortOrder. Each row includes the linked investor summary, the pipelineStatus (not_started/researching/outreach_sent/meeting_set/follow_up/closed_won/closed_pass), and the warmPathBonus (Ahmed's personal warm-path assessment, if any). For WIDMO-style companies (acceptsInvestorIntros=false) this list will normally be empty — use get_company + its customerTargets instead.",
        parameters: {
            type: "object",
            properties: {
                companyId: {
                    type: "string",
                    description: "Company.id (cuid) to list matches for.",
                },
            },
            required: ["companyId"],
            additionalProperties: false,
        },
        async execute(_id, params) {
            const companyId = String(params.companyId ?? "");
            if (!companyId) {
                return {
                    content: [{ type: "text", text: "error: companyId is required" }],
                    details: { error: true },
                };
            }
            const rows = await prisma.match.findMany({
                where: { companyId },
                include: {
                    investor: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            stage: true,
                            sectors: true,
                            chequeSize: true,
                            geography: true,
                        },
                    },
                },
                orderBy: [{ tier: "asc" }, { sortOrder: "asc" }],
            });
            return {
                content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
            };
        },
    });
}
