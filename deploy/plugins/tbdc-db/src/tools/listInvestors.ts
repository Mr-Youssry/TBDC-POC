import type { RegisterApi } from "openclaw/plugin-sdk/plugin-entry";
import type { PrismaClient } from "@prisma/client";

export function registerListInvestors(api: RegisterApi, prisma: PrismaClient) {
  api.registerTool({
    name: "list_investors",
    label: "List Investors",
    description:
      "Return every investor in the TBDC database (24 rows in the seed). Use this when you need to look up contact approach, cheque size, sectors, or the notable portfolio field before suggesting matches. No arguments required.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    async execute(_id, _params) {
      const rows = await prisma.investor.findMany({
        orderBy: { sortOrder: "asc" },
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
