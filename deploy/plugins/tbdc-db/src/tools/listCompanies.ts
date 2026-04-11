import type { RegisterApi } from "openclaw/plugin-sdk/plugin-entry";
import type { PrismaClient } from "@prisma/client";

export function registerListCompanies(api: RegisterApi, prisma: PrismaClient) {
  api.registerTool({
    name: "list_companies",
    label: "List Companies",
    description:
      "Return all TBDC portfolio companies (10 in the current cohort). Each row includes the company's database ID, name, stage, sector, revenue, ask size, founder profile, and whether they accept investor introductions. Use this to discover company IDs before calling get_company or list_matches. The workspace profile slugs (e.g., 'omniful') correspond to lowercase-hyphenated versions of the company name.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    async execute(_id, _params) {
      const rows = await prisma.company.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          customerTargets: { orderBy: { sortOrder: "asc" } },
          events: { orderBy: { sortOrder: "asc" } },
        },
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    },
  });
}
