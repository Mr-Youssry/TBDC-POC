import type { RegisterApi } from "openclaw/plugin-sdk/plugin-entry";
import type { PrismaClient } from "@prisma/client";

export function registerGetMethodology(
  api: RegisterApi,
  prisma: PrismaClient,
) {
  api.registerTool({
    name: "get_methodology",
    label: "Get Methodology",
    description:
      "Return the 16-point scoring rubric: the weighted dimensions (geography, stage, sector, revenue, cheque, founder, portfolio gap) plus the supporting methodology cards that explain the hard gate and tiering. Use this when justifying a score or explaining why a specific match landed in T1/T2/T3.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    async execute(_id, _params) {
      const [dimensions, cards] = await Promise.all([
        prisma.methodologyDimension.findMany({
          orderBy: { sortOrder: "asc" },
        }),
        prisma.methodologyCard.findMany({ orderBy: { sortOrder: "asc" } }),
      ]);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ dimensions, cards }, null, 2),
          },
        ],
      };
    },
  });
}
