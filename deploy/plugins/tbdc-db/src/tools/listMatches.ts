import type { RegisterApi } from "openclaw/plugin-sdk/plugin-entry";
import type { PrismaClient } from "@prisma/client";

export function registerListMatches(api: RegisterApi, prisma: PrismaClient) {
  api.registerTool({
    name: "list_matches",
    label: "List Matches",
    description:
      "List all Match rows for a given company, ordered by tier then sortOrder. Each row includes the linked investor summary so you can reason about it without a second lookup. For WIDMO-style companies (acceptsInvestorIntros=false) this list will normally be empty — use get_company + its customerTargets instead.",
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
