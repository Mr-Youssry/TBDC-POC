import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { makePrisma } from "./prisma.js";
import { registerListInvestors } from "./tools/listInvestors.js";
import { registerGetCompany } from "./tools/getCompany.js";
import { registerListMatches } from "./tools/listMatches.js";
import { registerGetMethodology } from "./tools/getMethodology.js";
import { registerUpdateMatch } from "./tools/updateMatch.js";
import { registerUpdateCompany } from "./tools/updateCompany.js";
import { registerUpdateInvestor } from "./tools/updateInvestor.js";
import { registerAppendAuditNote } from "./tools/appendAuditNote.js";

const DEFAULT_ASSISTANT_EMAIL = "assistant@tbdc.ready4vc.com";

export default definePluginEntry({
  id: "tbdc-db",
  name: "TBDC DB",
  description:
    "Read/write access to the TBDC Investor Matchmaking Postgres DB. Every write records an AuditLog row attributed to the assistant user, on behalf of the authenticated admin (actingUserId).",
  configSchema: {
    type: "object",
    properties: {
      databaseUrl: { type: "string" },
      assistantUserEmail: { type: "string" },
    },
    required: ["databaseUrl"],
  },
  async register(api) {
    const config = (api.config ?? {}) as Record<string, unknown>;
    const databaseUrl =
      (typeof config.databaseUrl === "string" && config.databaseUrl) ||
      process.env.TBDC_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "";
    if (!databaseUrl) {
      api.logger?.error?.(
        "[tbdc-db] no databaseUrl in config and no TBDC_DATABASE_URL/DATABASE_URL in env — refusing to register tools",
      );
      return;
    }

    const assistantEmail =
      (typeof config.assistantUserEmail === "string" &&
        config.assistantUserEmail) ||
      process.env.ASSISTANT_USER_EMAIL ||
      DEFAULT_ASSISTANT_EMAIL;

    const prisma = makePrisma(databaseUrl);

    // Resolve the assistant User.id once at register time. This id is baked
    // into every write tool's closure as `actorUserId` on the AuditLog row.
    // If the assistant user is missing, we still register the read tools —
    // writes would fail at runtime with a FK violation anyway, so refusing
    // to register them up-front gives a clearer error at `plugins inspect`
    // time.
    let assistantUserId = "";
    try {
      const row = await prisma.user.findUnique({
        where: { email: assistantEmail },
        select: { id: true },
      });
      if (row) {
        assistantUserId = row.id;
        api.logger?.info?.(
          `[tbdc-db] assistant user resolved: ${assistantEmail} → ${row.id}`,
        );
      } else {
        api.logger?.warn?.(
          `[tbdc-db] assistant user not found for email ${assistantEmail}; write tools will be skipped`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      api.logger?.error?.(
        `[tbdc-db] failed to resolve assistant user: ${msg}; write tools will be skipped`,
      );
    }

    // Read tools — always registered.
    registerListInvestors(api, prisma);
    registerGetCompany(api, prisma);
    registerListMatches(api, prisma);
    registerGetMethodology(api, prisma);

    // Write tools — only registered if we have a valid assistant user id.
    if (assistantUserId) {
      const deps = { assistantUserId };
      registerUpdateMatch(api, prisma, deps);
      registerUpdateCompany(api, prisma, deps);
      registerUpdateInvestor(api, prisma, deps);
      registerAppendAuditNote(api, prisma, deps);
      api.logger?.info?.("[tbdc-db] registered 4 read tools + 4 write tools");
    } else {
      api.logger?.info?.(
        "[tbdc-db] registered 4 read tools (write tools disabled — no assistant user)",
      );
    }
  },
});
