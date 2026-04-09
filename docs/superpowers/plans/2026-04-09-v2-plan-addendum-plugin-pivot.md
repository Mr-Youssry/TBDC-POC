# v2.0 plan addendum — plugin pivot (overrides Phase 2 + touches Phase 5/6)

> **Supersedes** the "tbdc-db skill" references in [2026-04-09-v2-openclaw-analyst-implementation-plan.md](./2026-04-09-v2-openclaw-analyst-implementation-plan.md). This addendum does NOT replace the whole plan — it only rewrites the parts invalidated by the Phase 0 probe finding that OpenClaw skills are prompt-only and that typed code-backed tools must be built as **OpenClaw Plugins** via the Plugin SDK.

Full discovery trail: [deploy/probe/FINDINGS.md](../../../deploy/probe/FINDINGS.md).

## What does NOT change

- Phase 0 tasks 0.1, 0.2, 0.4 stand as-is (image pin + probe scaffold + teardown). Task 0.3 is effectively reinterpreted: the "hello-world-db skill" became a "hello-world-db plugin" and is already committed as the Phase 0 verification probe.
- Phase 1 — Prisma schema additions (`User`, `AuditLog`, any v2.0 tables). Untouched.
- Phase 3 — `/analyst` chat UI. Untouched in shape; see **Phase 3 attribution edit** below for a tiny change to how the chat proxy passes `actingUserId`.
- Phase 4 — `/admin/audit` page. Untouched.
- Phase 5 — local dev compose. Compose file gains plugin-install init; see **Phase 5 edit** below.
- Phase 6 — rafiq-dev deploy. Same compose shape applies; see **Phase 6 edit** below.
- Phase 7 — Korayem smoke-test handoff doc. Untouched.

## Phase 2 REWRITE — `tbdc-db` OpenClaw Plugin

**Goal:** Build and unit-test a locally-installable OpenClaw Plugin named `tbdc-db` that exposes the v2.0 spec's DB tools (`list_investors`, `get_company`, `list_matches`, `update_match`, `append_audit_note`, plus any structural-edit tools the spec allows on `Company.acceptsInvestorIntros` and `MethodologyDimension.maxWeight`). Each tool is a typed `api.registerTool` definition backed by Prisma. Writes append to the `AuditLog` table from Phase 1. `actingUserId` is an explicit argument on every write tool.

### File layout (lives in repo at `deploy/plugins/tbdc-db/`)

```
deploy/plugins/tbdc-db/
├── package.json
├── openclaw.plugin.json
├── tsconfig.json
├── src/
│   ├── index.ts               # definePluginEntry + register(api)
│   ├── prisma.ts              # PrismaClient factory (driver-adapter pattern)
│   ├── tools/
│   │   ├── listInvestors.ts
│   │   ├── getCompany.ts
│   │   ├── listMatches.ts
│   │   ├── updateMatch.ts
│   │   ├── appendAuditNote.ts
│   │   └── …                  # one file per tool
│   ├── audit.ts               # writeAuditEntry helper (reused by every write tool)
│   └── schemas.ts              # shared JSON Schema fragments (ids, etc.)
├── tests/
│   ├── updateMatch.test.ts    # vitest against a disposable Postgres
│   └── …                      # one test file per write tool
└── dist/                      # gitignored, tsc output
```

### package.json template

```json
{
  "name": "@tbdc/openclaw-plugin-tbdc-db",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run"
  },
  "openclaw": {
    "extensions": ["./dist/index.js"],
    "compat": {
      "pluginApi": "1",
      "minGatewayVersion": "2026.2.26"
    }
  },
  "dependencies": {
    "@prisma/client": "^7.0.0",
    "@prisma/adapter-pg": "^7.0.0",
    "pg": "^8.12.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vitest": "^2.0.0"
  }
}
```

Note: `openclaw/plugin-sdk/plugin-entry` is resolved by the OpenClaw gateway at plugin-load time from its own bundled SDK; the plugin does NOT need to `npm install openclaw` itself. Mark it as a type-only import via a local declaration or a `types` file if TypeScript complains.

### openclaw.plugin.json template

```json
{
  "id": "tbdc-db",
  "name": "TBDC DB",
  "description": "Read/write access to the TBDC Investor Matchmaking Postgres database, scoped to the tbdc_assistant role. Every write requires an actingUserId and appends to the AuditLog.",
  "configSchema": {
    "type": "object",
    "properties": {
      "databaseUrl": {
        "type": "string",
        "description": "Postgres connection string for the tbdc_assistant role."
      }
    },
    "required": ["databaseUrl"],
    "additionalProperties": false
  }
}
```

The gateway injects `config.databaseUrl` into the plugin at register time via `api.config` (exact API to be confirmed during Phase 2.1 from `/app/dist/api-builder-*.js`; fall back to reading `process.env.TBDC_DATABASE_URL` if `api.config` is unavailable in the detected SDK version).

### Entry point shape (`src/index.ts`)

```typescript
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { makePrisma } from "./prisma.js";
import { registerListInvestors } from "./tools/listInvestors.js";
import { registerUpdateMatch } from "./tools/updateMatch.js";
// … other registerX imports

export default definePluginEntry({
  id: "tbdc-db",
  name: "TBDC DB",
  description: "Read/write access to the TBDC Investor Matchmaking Postgres DB.",
  configSchema: {
    type: "object",
    properties: { databaseUrl: { type: "string" } },
    required: ["databaseUrl"]
  },
  register(api) {
    const prisma = makePrisma(api.config?.databaseUrl ?? process.env.TBDC_DATABASE_URL!);
    registerListInvestors(api, prisma);
    registerUpdateMatch(api, prisma);
    // …
  }
});
```

### Example tool file (`src/tools/updateMatch.ts`)

```typescript
import type { PrismaClient } from "@prisma/client";
import { writeAuditEntry } from "../audit.js";

export function registerUpdateMatch(api: any, prisma: PrismaClient) {
  api.registerTool({
    name: "update_match",
    label: "Update Match",
    description: "Update a Match row (score, tier, rationale). Requires actingUserId; appends to AuditLog.",
    parameters: {
      type: "object",
      properties: {
        matchId: { type: "string", description: "Match.id (cuid)" },
        actingUserId: { type: "string", description: "User.id of the admin making the change (required for audit)" },
        patch: {
          type: "object",
          description: "Fields to update. Only score/tier/rationale/notes are allowed.",
          properties: {
            score: { type: "number" },
            tier: { type: "string", enum: ["T1", "T2", "T3"] },
            rationale: { type: "string" },
            notes: { type: "string" }
          },
          additionalProperties: false
        }
      },
      required: ["matchId", "actingUserId", "patch"]
    },
    async execute(_id: string, params: any) {
      const { matchId, actingUserId, patch } = params;
      const before = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
      const after = await prisma.match.update({ where: { id: matchId }, data: patch });
      await writeAuditEntry(prisma, {
        actingUserId,
        action: "match.update",
        targetTable: "Match",
        targetId: matchId,
        before,
        after
      });
      return {
        content: [{ type: "text", text: `Updated match ${matchId}. Fields changed: ${Object.keys(patch).join(", ")}.` }]
      };
    }
  });
}
```

(One file per tool; read tools skip the audit write.)

### Phase 2 task list (replaces the original Phase 2 skill tasks)

- [ ] **Task 2.1 — scaffold the plugin directory.** Create `deploy/plugins/tbdc-db/` with `package.json`, `openclaw.plugin.json`, `tsconfig.json`, `src/index.ts` (empty `register(api) {}`), a `.gitignore` for `dist/` + `node_modules/`, and vitest config. Commit.

- [ ] **Task 2.2 — types shim for `openclaw/plugin-sdk/plugin-entry`.** Since the plugin does not install `openclaw` from npm, create `src/types/openclaw.d.ts` with the minimal signatures `definePluginEntry`, `RegisterApi`, `Tool`, `ExecuteResult`. Pull signatures from the bundled SDK source at `/app/dist/plugin-sdk/plugin-entry.js` and `/app/dist/plugin-entry-CcWmObwf.js` in the probe container. Commit.

- [ ] **Task 2.3 — Prisma client factory.** `src/prisma.ts` exports `makePrisma(databaseUrl)` using the `@prisma/client` + `@prisma/adapter-pg` driver-adapter pattern (same shape as `src/lib/prisma.ts` in the main app). Commit.

- [ ] **Task 2.4 — audit helper.** `src/audit.ts` exports `writeAuditEntry(prisma, { actingUserId, action, targetTable, targetId, before, after })` that writes to the `AuditLog` table created in Phase 1. Unit-tested in isolation with a disposable Postgres. Commit.

- [ ] **Task 2.5 — read tools.** `list_investors`, `get_company`, `list_matches`, `get_methodology`. One file each under `src/tools/`. No audit, no actingUserId required. Each tool: typed JSON Schema params, Prisma query, `{ content: [{ type: "text", text: JSON.stringify(rows) }] }` return. Vitest covers "happy path" per tool. Commit.

- [ ] **Task 2.6 — write tools.** `update_match`, `update_company`, `update_investor`, `append_audit_note`. Every write tool:
  - Requires `actingUserId` in params (JSON Schema `required`)
  - Wraps the Prisma write in a transaction with the audit insert
  - Returns a human-readable summary in the `content[0].text`
  - Has a vitest test that asserts the audit row was written with the correct `before`/`after` snapshots
  Commit at the end of this task (all write tools together — they share the audit helper).

- [ ] **Task 2.7 — `register(api)` wires everything up.** Update `src/index.ts` to build the Prisma client from `api.config.databaseUrl` (or env fallback), then call every `registerX(api, prisma)`. Commit.

- [ ] **Task 2.8 — local smoke test against the probe gateway.** Reuse `deploy/probe/docker-compose.probe.yml` as a template: bind-mount `deploy/plugins/tbdc-db` as `/plugins-src/tbdc-db`, add an init that copies it to `/state/custom-plugins/tbdc-db` with root ownership and runs `openclaw plugins install -l`. Start the gateway, confirm `openclaw plugins list` shows `tbdc-db | loaded`, confirm `openclaw plugins inspect tbdc-db --json` shows all tools registered. Document the commands in `deploy/plugins/tbdc-db/README.md`. Commit.

- [ ] **Phase 2 gate:** `vitest run` green for every tool in `deploy/plugins/tbdc-db/tests/`. Probe gateway shows `tbdc-db | loaded` and every expected tool in `plugins inspect`. Plugin source committed to `v2-analyst`.

### Soft guardrails — moved to companion SKILL.md (optional)

The v2.0 spec said the `tbdc-db` skill carries the WIDMO hard gate + "don't touch Users table" guardrails as prompt text. Since plugins cannot carry that kind of LLM instruction, ship a companion `deploy/skills/tbdc-db/SKILL.md` prompt manifest that the gateway loads via `skills.load.extraDirs`. This file teaches GLM:
- When to use each tool (especially the distinction between `update_match` and `append_audit_note`)
- The WIDMO rule (company index 9 — never create investor matches; use `list_customer_targets` instead)
- The rubric's hard gate must always run before scoring
- Write tools require the admin's authenticated user id, which the chat pane injects

This is a lightweight SKILL.md with frontmatter only and prose body — no tool definitions. Ship as part of Phase 2 Task 2.8 or defer to Phase 3 if the chat pane's prompt template is a better home.

## Phase 3 attribution edit

The chat pane's OpenClaw-WebSocket proxy route handler (Phase 3 Task ~3.4 — "wire the session-to-JWT broker") must, when the LLM issues a tool call for a `tbdc-db` write tool, **inject the NextAuth session's `user.id` into the tool call's `actingUserId` parameter** before forwarding the request to the gateway. Reject any tool call where the LLM tries to pass a different `actingUserId` — that is a trust boundary.

Implementation sketch: intercept `tools/call` messages on the WebSocket, for any tool name in the write-tool allowlist (`update_match`, `update_company`, `update_investor`, `append_audit_note`), overwrite `params.actingUserId` with the authenticated session user id. Log and drop the message if the LLM supplied a different value. Emit a warning in the audit log.

## Phase 5 edit — local dev compose

The `docker-compose.dev.yml` sidecar for OpenClaw gains the plugin-install init. Working shape:

```yaml
services:
  openclaw-gateway:
    image: ghcr.io/openclaw/openclaw:2026.4.8
    container_name: tbdc-openclaw
    ports:
      - "18789:18789"
    user: "0:0"
    entrypoint:
      - /bin/sh
      - -c
      - |
        chown node:node /state || true
        mkdir -p /state/workspace && chown node:node /state/workspace || true
        [ -f /state/openclaw.json ] && chown node:node /state/openclaw.json
        [ -f /state/openclaw.json.bak ] && chown node:node /state/openclaw.json.bak
        if [ -d /plugins-src/tbdc-db/dist ] && [ ! -d /state/custom-plugins/tbdc-db ]; then
          mkdir -p /state/custom-plugins
          cp -r /plugins-src/tbdc-db /state/custom-plugins/
          chown -R root:root /state/custom-plugins
          chmod -R 755 /state/custom-plugins
          su -s /bin/sh node -c "cd /app && node openclaw.mjs plugins install -l /state/custom-plugins/tbdc-db"
          chown node:node /state/openclaw.json
        fi
        exec su -s /bin/sh node -c "node /app/openclaw.mjs gateway"
    environment:
      - OPENCLAW_STATE_DIR=/state
      - TBDC_DATABASE_URL=postgresql://tbdc_assistant:PASSWORD@shared-postgres:5432/tbdc_poc
      - ZAI_API_KEY=${ZAI_API_KEY:-}
    volumes:
      - openclaw-state:/state
      - ../deploy/plugins/tbdc-db:/plugins-src/tbdc-db:ro
    depends_on:
      - shared-postgres

volumes:
  openclaw-state:
```

Phase 5 must document: "run `npm run build` inside `deploy/plugins/tbdc-db/` before starting compose, otherwise `/plugins-src/tbdc-db/dist` is missing and the init skips plugin install".

## Phase 6 edit — rafiq-dev deploy

Same compose shape, but:
- Bind-mount path changes to the droplet's absolute path
- `TBDC_DATABASE_URL` uses the shared-postgres container's internal DNS name
- `ZAI_API_KEY` is **intentionally empty** at Phase 6 completion — the spec's hard-stop applies
- The Caddy route for `tbdc.ready4vc.com/analyst/ws` proxies to `tbdc-web:3010` (the Next.js route handler), NOT directly to `openclaw-gateway:18789`. The route handler brokers NextAuth session → tool-call authorization.
- A separate Caddy route for `tbdc.ready4vc.com/ClawAdmin/` proxies (basic-auth) directly to `openclaw-gateway:18789/`.
- Before first boot on the droplet: build the plugin locally, tar it up, scp to droplet, untar under `/srv/tbdc-poc/deploy/plugins/tbdc-db`, THEN `docker compose up -d`. Document the exact commands in Phase 6 Task 6.4.

## Summary of files this addendum will create during execution

- `deploy/plugins/tbdc-db/**` — the plugin source (Phase 2)
- `deploy/skills/tbdc-db/SKILL.md` — optional companion prompt manifest (Phase 2 or 3)
- `docker-compose.dev.yml` — gets an openclaw-gateway service with the init shape above (Phase 5)
- `deploy/rafiq-dev/docker-compose.yml` — same service definition, droplet paths (Phase 6)
- Tests under `deploy/plugins/tbdc-db/tests/*.test.ts` (vitest)

## What is deliberately NOT attempted in this session

- Runtime verification that `execute()` actually returns correct content via a real LLM tool call. The Phase 0 probe verified `register()` runs and the tool appears in `plugins list`. Actually **invoking** a tool from the LLM side requires z.ai credentials and live chat, which the plan's hard stop defers to the Korayem smoke-test session.
- Exercising the audit-log-based revert flow with a real LLM-driven write. Vitest-level tests in Phase 2 cover the direct-call path; end-to-end LLM-driven verification is deferred to the Korayem session.
- Any changes to the OpenClaw image itself. We ride on `ghcr.io/openclaw/openclaw:2026.4.8` unmodified.
