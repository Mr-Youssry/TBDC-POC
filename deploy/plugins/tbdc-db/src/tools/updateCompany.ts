import type { RegisterApi } from "openclaw/plugin-sdk/plugin-entry";
import type { PrismaClient } from "@prisma/client";
import { writeAuditEntry } from "../audit.js";

const ALLOWED_FIELDS = [
  "stage",
  "sector",
  "arrTraction",
  "askSize",
  "homeMarket",
  "targetMarket",
  "founderProfile",
  "acceptsInvestorIntros",
  "gateNote",
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

export interface UpdateCompanyDeps {
  assistantUserId: string;
}

export function registerUpdateCompany(
  api: RegisterApi,
  prisma: PrismaClient,
  deps: UpdateCompanyDeps,
) {
  api.registerTool({
    name: "update_company",
    label: "Update Company",
    description:
      "Update editable fields on a TBDC portfolio Company row. Does NOT touch id/cohort/name/sortOrder. Requires actingUserId. Wraps the write + audit insert in a transaction.",
    parameters: {
      type: "object",
      properties: {
        companyId: { type: "string", description: "Company.id (cuid)." },
        actingUserId: {
          type: "string",
          description:
            "User.id of the admin (injected by the chat proxy from the session).",
        },
        patch: {
          type: "object",
          properties: {
            stage: { type: "string" },
            sector: { type: "string" },
            arrTraction: { type: "string" },
            askSize: { type: "string" },
            homeMarket: { type: "string" },
            targetMarket: { type: "string" },
            founderProfile: { type: "string" },
            acceptsInvestorIntros: { type: "boolean" },
            gateNote: { type: "string" },
          },
          additionalProperties: false,
        },
        chatSessionId: { type: "string" },
      },
      required: ["companyId", "actingUserId", "patch"],
      additionalProperties: false,
    },
    async execute(_id, params) {
      const companyId = String(params.companyId ?? "");
      const actingUserId = String(params.actingUserId ?? "");
      const patchRaw = (params.patch ?? {}) as Record<string, unknown>;
      const chatSessionId =
        typeof params.chatSessionId === "string" ? params.chatSessionId : null;

      if (!companyId || !actingUserId) {
        return {
          content: [
            {
              type: "text",
              text: "error: companyId and actingUserId are required",
            },
          ],
          details: { error: true },
        };
      }

      const patch: Record<string, unknown> = {};
      for (const key of ALLOWED_FIELDS) {
        if (key in patchRaw && patchRaw[key] !== undefined) {
          patch[key] = patchRaw[key as AllowedField];
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
          const before = await tx.company.findUniqueOrThrow({
            where: { id: companyId },
          });
          const after = await tx.company.update({
            where: { id: companyId },
            data: { ...patch, updatedByUserId: actingUserId },
          });
          await writeAuditEntry(tx, {
            actorUserId: deps.assistantUserId,
            onBehalfOfUserId: actingUserId,
            tableName: "Company",
            rowId: companyId,
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
              text: `Updated company ${companyId}. Fields changed: ${changed}.\nAfter: ${JSON.stringify(result.after, null, 2)}`,
            },
          ],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [
            { type: "text", text: `error: update_company failed — ${msg}` },
          ],
          details: { error: true },
        };
      }
    },
  });
}
