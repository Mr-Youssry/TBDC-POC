export function registerGetCompany(api, prisma) {
    api.registerTool({
        name: "get_company",
        label: "Get Company",
        description: "Fetch a single TBDC portfolio company by id, including its customer targets and industry events. Returns `null` in the JSON payload if no row matches. IMPORTANT: check `acceptsInvestorIntros` — if false, the WIDMO hard gate applies and you must use customerTargets instead of suggesting investor matches.",
        parameters: {
            type: "object",
            properties: {
                companyId: {
                    type: "string",
                    description: "Company.id (cuid) of the row to fetch.",
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
            const row = await prisma.company.findUnique({
                where: { id: companyId },
                include: {
                    customerTargets: { orderBy: { sortOrder: "asc" } },
                    events: { orderBy: { sortOrder: "asc" } },
                },
            });
            return {
                content: [{ type: "text", text: JSON.stringify(row, null, 2) }],
            };
        },
    });
}
