# TBDC POC v2.0 — OpenClaw Investment Analyst (Design Document)

> Date: 2026-04-09
> Author: Claude (Opus 4.6 1M) via the superpowers brainstorming flow, in dialogue with Ahmed Youssry
> Scope: v2.0 of the TBDC POC — add an in-app AI investment analyst with direct database access, backed by an [OpenClaw](https://github.com/openclaw/openclaw) sidecar container running GLM-5.1 via z.ai

## Purpose

Add a **Chat with the Assistant** surface to the existing TBDC POC at https://tbdc.ready4vc.com, turning the product from an edit-in-place matchmaking database into one where admins collaborate with a GLM-5.1-backed "TBDC investment analyst" persona that can read, edit, and suggest changes against the live Postgres DB.

The Assistant is implemented as a first-class user row (`assistant@tbdc.ready4vc.com`, role `assistant`) rather than as a "tool" — every write it makes is attributed to it in an audit log, humans can revert any of its writes in one click, and it lives in per-entity "channels" (one per company, one per investor, plus `#general`) that behave like a lightweight Slack workspace built inside the TBDC app.

**Use profile (critical context for sizing decisions):** this is an **interview portfolio artifact**, not a production system. Ahmed is using the TBDC POC to apply for a partnerships/engineering role at TBDC. v2.0 will be tested once or twice by an interviewer during an interview, plus maybe a handful of times by Ahmed and Korayem (Ready4VC co-founder, bootstrap admin on the app) during dry runs. It is not expected to serve sustained traffic, it is not expected to host real investor conversations, and it is not expected to survive a high-load scenario. **If Ahmed is accepted into the role, the TBDC team will move the POC to its own droplet, upgrade the z.ai subscription tier, and potentially migrate to cloud. None of that is v2.0's concern.** The design is sized for "one interview demo" reliability, not "production team" resilience. This framing governs several risk/mitigation calls below.

v1 foundation (phases 2–11 of the main roadmap) is **already complete and deployed**: Prisma 7 + seed, NextAuth v5, all CRUD pages, admin user management, multi-stage Dockerfile, live on rafiq-dev behind Caddy. See [docs/roadmap.md](../../roadmap.md) and [docs/changelog.md](../../changelog.md) for the v1 history and [docs/superpowers/specs/2026-04-08-tbdc-poc-design.md](2026-04-08-tbdc-poc-design.md) for the v1 design.

## Locked decisions (answers to the v2.0 open questions, settled during the brainstorm)

| Question | Decision | Rationale |
|---|---|---|
| **AI provider** | OpenClaw sidecar container, NOT the Anthropic SDK directly | Explicit user preference. OpenClaw is a mature open-source AI gateway with 5,400+ skills in its ClawHub registry, 40+ LLM providers, first-class Docker + VPS deploy story, and multi-channel routing built in. Fits the "one agent, many surfaces" shape we want for future phases. |
| **LLM model** | **GLM-5.1 via z.ai Coding Plan subscription**, no fallback | Cost: GLM-5.1 is covered by a flat monthly subscription that explicitly supports the OpenClaw integration (confirmed at https://docs.z.ai/devpack/tool/openclaw). Per-token alternatives (Claude Sonnet, GPT) are 5–10x more expensive and unnecessary for interview-demo load. Fallback to a second provider is explicitly deferred — if GLM rate-limits during a demo, the Assistant queues; the chat pane shows "queued by provider." |
| **Integration shape** | Custom Next.js chat pane as the only v2.0 surface, talking to OpenClaw over WebSocket. NO iframe to OpenClaw's WebChat, NO Slack/Teams integration in v2.0. | Single primary surface keeps the demo tight. The chat pane can match the TBDC Georgia-serif aesthetic. Secondary chat surfaces (Slack/Teams/WhatsApp/Telegram) get added in v2.3 after user testing reveals which platform the team actually uses. OpenClaw's multi-channel routing is preserved architecturally — adding a second channel later is a config change, not a redesign. |
| **Session model** | One OpenClaw session per *entity* (company, investor, general). Auto-provisioned from seed data. | "Slack-like" mental model per user feedback. `#co-acme` carries Acme's full match history, `#inv-inovia` carries Inovia's portfolio, `#general` is for portfolio-wide questions. Every session has preloaded entity context, so the LLM doesn't burn tool calls re-fetching data per turn. |
| **Identity model for the Assistant** | **Assistant is a first-class `User` row**, not a "tool." Single shared agent for all admins. | Matches OpenClaw's native design (it's built as a personal assistant with identity). Simpler than trusted-proxy per-user session routing. Cleaner audit log semantics — "the Assistant did X" is a first-class statement. Group-chat-per-entity is the natural UX for this framing: when Korayem types in `#co-acme`, his message appears as "Korayem:" and Youssry (if also in the channel) sees it in real time; same session, multi-participant, Assistant is a member. |
| **Chat history scope** | Shared per-channel, not per-user. | At 2–5 admins this is a feature, not a bug — shared context, no duplicate questions, everyone sees the same thinking. Attribution is handled by each message being prefixed with the sender's display name. |
| **Write model** | **Direct writes** by the Assistant, no approval inbox. Full CRUD on Investor, Company (including `acceptsInvestorIntros`), Match, DoNotMatch, CustomerTarget, IndustryEvent, MethodologyDimension (including `maxWeight`), MethodologyCard. | The TBDC content is AI-authored in the first place — the Assistant generates match rationales, scoring notes, investor profile text, and humans edit on top. Requiring human approval for each Assistant write is backwards. The Assistant's trust boundary is the closed 2–5 person admin team; no external actors have agent access. Soft guardrails (ask-before-structural-changes) live in the SKILL.md prompt, not in Postgres-level restrictions. |
| **Write exceptions** | **User table writes stay in the admin UI** (invitations, role changes, deletes), under the admin's NextAuth session. **`User.passwordHash` is excluded from SELECT**. | Identity writes are privileged enough that human initiation matters. Password hashes in chat transcripts would leak through to the LLM provider and that's a data hygiene line worth holding even at POC scale. |
| **Write guardrail** | `AuditLog` table with one-click revert from the admin UI. Every Assistant write produces field-level audit rows. | Replaces the approval-inbox pattern I initially proposed. This also fills a v1 backlog item ("Audit log of who edited what") as a side effect of shipping the Assistant. |
| **No deletes** | No `delete_*` tools in the skill. Records get edited, flagged, or marked `DoNotMatch` — never hard-deleted by the Assistant. | Demo safety. If the Assistant deletes something in front of an interviewer the audit log can still show it but recovery is harder than for an edit. |
| **No raw SQL** | The skill exposes named typed tools only (`update_match`, `create_investor`, etc.). No `run_sql` escape hatch. | Debuggability and audit clarity, not security. When something goes wrong mid-demo, "the Assistant called `update_match({match_id: 17, field: 'rationale', ...})`" is much easier to reason about in a live audit-log pane than "the Assistant ran some SQL it made up." |
| **OpenClaw Control UI** | Exposed at `https://tbdc.ready4vc.com/ClawAdmin/` (subpath, NOT subdomain), gated by Caddy `basic_auth` | Avoids a new DNS record. OpenClaw explicitly supports subpath hosting via `gateway.controlUi.basePath`. Shared password for Ahmed + Korayem, bcrypted into env var. Upgrade path (Caddy `forward_auth` → Next.js NextAuth session validation) noted but not built in v2.0. |
| **Per-message attribution** | Chat pane sends `actingUserId` as OpenClaw message metadata. Skill's write helpers read this and store it as `AuditLog.onBehalfOfUserId`. Skill refuses writes if metadata is absent — no anonymous writes. | Preserves the "Assistant is a user, but we still know which human was in the loop" audit story. |
| **Execution environment** | OpenClaw runs as a new Docker container alongside the existing `tbdc-web` container, on the existing `docker_rafiq-shared` network, behind the existing Caddy. | No new docker network, no new Postgres container, no new droplet. All isolation is by folder (`/root/tbdc-poc/`) and container name (`openclaw-gateway`). |
| **Rollback** | **Full-v2.0 removal** is the only documented rollback path. `docker stop openclaw-gateway`, remove Caddyfile block, drop new tables. No per-audit-entry bulk revert script. | Demo scale. If the Assistant misbehaves in front of an interviewer, the off-switch is `docker compose stop` and the rest of the app keeps working. |

## Architecture

### High-level shape

```
┌───────────── Browser (admin, NextAuth session) ─────────────────┐
│                                                                   │
│  Existing TBDC pages + the new /analyst page                     │
│  (Georgia serif, 1200px max width, same nav tabs + "Analyst")    │
└───────────┬────────────────────────────┬──────────────────────────┘
            │                             │
            │ HTTPS                       │ WSS  (wss://tbdc.ready4vc.com/analyst/ws)
            │                             │
┌───────────▼─────────────────────────────▼──────────────────────────┐
│  Caddy (existing, inside Rafiq-v1/docker/caddy/)                   │
│                                                                    │
│  tbdc.ready4vc.com {                                               │
│    handle /ClawAdmin/*  { basic_auth → openclaw-gateway:18789 }    │
│    handle /analyst/ws   { reverse_proxy openclaw-gateway:18789 }   │
│    handle               { reverse_proxy tbdc-web:3000 }            │
│  }                                                                 │
└──────┬─────────────────────────────────────┬───────────────────────┘
       │                                      │
       │  http                                │  ws
       │                                      │
┌──────▼─────────┐                   ┌─────────▼──────────┐
│  tbdc-web      │                   │ openclaw-gateway   │
│  (Next.js 16,  │                   │ (ghcr.io/openclaw/ │
│   container    │                   │  openclaw pinned   │
│   port 3000)   │                   │  version)          │
│                │                   │                    │
│  - /analyst    │                   │  - WS control      │
│    page        │                   │    plane           │
│  - /analyst/ws │ ◄── shared auth   │  - skill runtime   │
│    route       │     broker        │  - session store   │
│    (Next 16    │                   │    (workspace      │
│    route       │                   │    volume)         │
│    handler)    │                   │                    │
│  - audit log   │                   │  /opt/openclaw/    │
│    viewer page │                   │  workspace/skills/ │
│  - revert      │                   │  tbdc-db/          │
│    button      │                   │     ▲              │
└──────┬─────────┘                   └─────┼──────────────┘
       │                                    │ Prisma client
       │ Prisma                             │ (role: tbdc_assistant)
       │ (role: tbdc_app)                   │
       │                                    │
       └────────────┬───────────────────────┘
                    │
            ┌───────▼────────────┐
            │  shared-postgres   │  (existing)
            │  container         │
            │  DB: tbdc_poc       │
            │  Roles: tbdc_app,   │
            │         tbdc_assistant │
            └────────────────────┘
```

**Trust boundary:** 2–5 TBDC admins (logged in via NextAuth) on one side, everything else on the other. The `/analyst` page and `/ClawAdmin/` are both gated — `/analyst` by NextAuth session + role check, `/ClawAdmin/` by Caddy basic_auth. Neither OpenClaw nor `tbdc-web` exposes any public port to the host; all traffic flows through Caddy.

### Module boundaries (repo additions)

All additions are new files — no modifications to v1 source except the Prisma schema, seed script, nav tabs component, and the Caddyfile addition.

| Module | Responsibility | Dependencies |
|---|---|---|
| `prisma/schema.prisma` | Add `AuditLog`, `ChatSession` models, `UserRole` enum, `updatedBy*` + `updatedAt` columns on writable tables | — (existing) |
| `prisma/migrations/manual/v2_roles_and_grants.sql` | Create `tbdc_assistant` role, `v_user_public` view, SELECT/INSERT/UPDATE grants. Run once, by hand, against the droplet DB. | Postgres |
| `prisma/seed.ts` (edited) | Add idempotent upsert of the Assistant user row + `#general` ChatSession + one ChatSession per company + one per investor | Existing seed |
| `openclaw-workspace/skills/tbdc-db/SKILL.md` | Skill manifest + system-prompt persona for the Assistant | YAML frontmatter |
| `openclaw-workspace/skills/tbdc-db/package.json` | Skill dependencies (`@prisma/client`, `@prisma/adapter-pg`, `pg`, `zod`) | — |
| `openclaw-workspace/skills/tbdc-db/tools/index.ts` | Tool registry — exports all 10 read tools + 14 write tools to OpenClaw's runtime | schema, db, audit |
| `openclaw-workspace/skills/tbdc-db/tools/schema.ts` | Zod schemas for every tool input/output | zod |
| `openclaw-workspace/skills/tbdc-db/tools/db.ts` | Prisma client bound to `DATABASE_URL_ASSISTANT` (the restricted role) | @prisma/client, @prisma/adapter-pg |
| `openclaw-workspace/skills/tbdc-db/tools/audit.ts` | Helper that writes `AuditLog` rows for every mutation and pulls `actingUserId` from the OpenClaw tool-invocation metadata | prisma |
| `openclaw-workspace/skills/tbdc-db/tools/reads/*.ts` | One file per read tool (list_investors, get_investor, list_companies, get_company, list_matches, get_match, list_dnm, get_methodology, get_team, lookup_audit_history) | db, schema |
| `openclaw-workspace/skills/tbdc-db/tools/writes/*.ts` | One file per write tool (update_match, create_match, update_investor, create_investor, update_company, create_company, add_customer_target, update_customer_target, add_industry_event, update_industry_event, set_dnm, clear_dnm, update_methodology_dimension, update_methodology_card) | db, schema, audit |
| `openclaw-workspace/skills/tbdc-db/tools/*.test.ts` | Vitest unit tests for every tool against a test Postgres (no LLM) | vitest, prisma |
| `openclaw-config/openclaw.json` | OpenClaw gateway config — provider (z.ai), models (glm-5.1), Control UI basePath + allowedOrigins, skill enablement | — |
| `src/app/(site)/analyst/page.tsx` | New Analyst page — server component shell that fetches the channel list from Prisma and hands it to the client chat pane | Prisma, guards |
| `src/app/(site)/analyst/_components/channel-sidebar.tsx` | Client component — renders `#general` + grouped `Companies` + grouped `Investors` sections, selection state via URL query param | — |
| `src/app/(site)/analyst/_components/message-pane.tsx` | Client component — renders streaming messages, tool-call pills, input box, connection state | — |
| `src/app/(site)/analyst/_components/tool-call-pill.tsx` | Client component — small inline pill like "✎ Updated Acme's next_step" with a link to the audit log entry | — |
| `src/app/(site)/analyst/_components/use-openclaw-ws.ts` | Client hook that opens the WebSocket, handles reconnect + streaming + per-message metadata | — |
| `src/app/analyst/ws/route.ts` | **Next 16 route handler** — HTTP endpoint that verifies the NextAuth session, mints a short-lived JWT containing `{ userId, openclawSessionId, exp }`, proxies the WebSocket upgrade to `openclaw-gateway:18789`. THIS IS THE ONE PLACE v2.0 LEGITIMATELY INTRODUCES A NEW API SURFACE IN THE APP — v1 uses server actions for everything, but WebSocket upgrades can't be done from a server action. | auth, `jose` for JWT |
| `src/app/(site)/admin/audit/page.tsx` | New admin page — reverse-chron list of `AuditLog` rows with filters (actor, table, row, time range), a "Revert" button per row that calls a server action | guards, prisma |
| `src/app/(site)/admin/audit/_actions.ts` | `revertAuditEntry(auditId)` server action — reads `oldValueJson`, re-applies as a new write by the current admin (which itself gets audited), marks the original audit row as `revertedByAuditId` | guards, prisma |
| `src/components/nav-tabs.tsx` (edited) | Add "Analyst" as the fifth nav tab | — |
| `src/lib/zod/analyst.ts` | Zod schemas for analyst route handler payloads | zod |
| `deploy/caddy-snippet.conf` | Reference copy of the Caddyfile block to append to `Rafiq-v1/docker/caddy/Caddyfile` on the droplet | — |
| `deploy/docker-compose-dev.yml` | Local dev compose — brings up `tbdc-web`, `openclaw-gateway`, and a local Postgres so the loop is testable without the droplet | — |

### Data model changes (Prisma)

All additive. No v1 models removed, no v1 columns dropped.

```prisma
enum UserRole {
  admin
  assistant  // NEW in v2.0
}

// Existing User model gets:
//   role      UserRole @default(admin)       (was: String @default("admin"))
//   auditLogs       AuditLog[] @relation("AuditActor")
//   auditLogsBehalf AuditLog[] @relation("AuditOnBehalfOf")

// Every writable table gets two new columns:
//   updatedByUserId  String?
//   updatedAt        DateTime @updatedAt
// Targets: Investor, Company, Match, DoNotMatch, CustomerTarget,
//          IndustryEvent, MethodologyDimension, MethodologyCard.

model AuditLog {
  id                String    @id @default(cuid())
  actorUserId       String
  actor             User      @relation("AuditActor", fields: [actorUserId], references: [id])
  onBehalfOfUserId  String?
  onBehalfOf        User?     @relation("AuditOnBehalfOf", fields: [onBehalfOfUserId], references: [id])
  tableName         String    // "Match", "Investor", etc.
  rowId             String
  field             String?   // null for insert/delete at row level
  oldValueJson      Json?
  newValueJson      Json?
  operation         AuditOp
  chatSessionId     String?   // OpenClaw session that produced this change (null for admin-UI edits)
  revertedByAuditId String?
  createdAt         DateTime  @default(now())

  @@index([tableName, rowId])
  @@index([actorUserId, createdAt])
  @@index([chatSessionId])
}

enum AuditOp {
  insert
  update
  delete  // reserved for future; v2.0 tools never emit this
}

model ChatSession {
  id                 String         @id @default(cuid())
  scopeType          ChatScopeType
  scopeEntityId      String?        // Company.id or Investor.id, null for general
  openclawSessionId  String         @unique
  displayName        String         // "Acme Corp", "Inovia Capital", "General"
  createdAt          DateTime       @default(now())
  lastMessageAt      DateTime?

  @@unique([scopeType, scopeEntityId])
  @@index([lastMessageAt])
}

enum ChatScopeType {
  company
  investor
  general
}
```

### Database-layer artifacts (not in Prisma)

Kept in `prisma/migrations/manual/v2_roles_and_grants.sql`, committed to the repo, run by hand against the droplet DB after `prisma migrate deploy`. Prisma does not manage roles or grants.

```sql
-- Restricted role for OpenClaw's skill to authenticate as
CREATE ROLE tbdc_assistant LOGIN PASSWORD :'TBDC_ASSISTANT_PASSWORD';

-- Sanitized User view — no passwordHash
CREATE OR REPLACE VIEW v_user_public AS
  SELECT id, name, email, role FROM "User";

-- Grants: tbdc_assistant can SELECT most tables, INSERT/UPDATE on writable ones,
-- and SELECT on the sanitized user view. NO access to User table directly.
GRANT SELECT ON "Investor", "Company", "Match", "DoNotMatch",
                "CustomerTarget", "IndustryEvent",
                "MethodologyDimension", "MethodologyCard",
                "AuditLog", "ChatSession",
                v_user_public
  TO tbdc_assistant;

GRANT INSERT, UPDATE ON "Investor", "Company", "Match", "DoNotMatch",
                        "CustomerTarget", "IndustryEvent",
                        "MethodologyDimension", "MethodologyCard",
                        "AuditLog", "ChatSession"
  TO tbdc_assistant;

-- Sequence usage (for cuid-generated IDs via Prisma? cuids don't need sequences,
-- but if any future table uses serial IDs, the grant is here).
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO tbdc_assistant;

-- Default privileges for future tables (so new tables don't accidentally become
-- invisible to the assistant after a migration)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE ON TABLES TO tbdc_assistant;
```

Separately, the `tbdc_app` role (owned by v1 and used by `tbdc-web`) already has full privileges — unchanged.

### The `tbdc-db` custom skill

Lives at `openclaw-workspace/skills/tbdc-db/` in the repo, bind-mounted into the OpenClaw container at `/opt/openclaw/workspace/skills/tbdc-db/`.

**`SKILL.md` (manifest + system prompt):**

```yaml
---
name: tbdc-db
description: Read and write the TBDC portfolio database (investors, companies, matches, methodology). The Assistant's only way to touch the TBDC data model.
user-invocable: false
metadata:
  openclaw:
    requires:
      env:
        - DATABASE_URL_ASSISTANT
---
```

The body of `SKILL.md` is the Assistant's persona + rubric + tool guidance (verbatim in the spec repo — summary here):

- **Who you are:** internal investment analyst at TBDC supporting the partnerships team.
- **What you know:** the 16-point weighted scoring rubric with dimensions geo/stage/sector/revenue/cheque/founder/portfolio-gap, tier thresholds (13–16 / 8–12 / 4–7 / 0–3), and the WIDMO hard-gate rule (always check `acceptsInvestorIntros` before suggesting investors for a company — WIDMO is the one company that declined investor intros and gets customer-target analysis instead).
- **What you can do:** list of all tools with one-line descriptions (generated from `schema.ts`).
- **How you behave:** concise, cite scores and rationales, flag uncertainty, always call `lookup_audit_history` before rewriting text someone else just wrote, never fabricate investor or company data.
- **Soft guardrails (prompt-level, not enforced at DB):**
  - Ask the admin before making structural changes — changing `acceptsInvestorIntros` (the WIDMO flag), changing `MethodologyDimension.maxWeight` (changes scoring math), deleting any DNM row.
  - Don't send emails through external integrations — you have no email API access. If an admin asks "send an intro to Inovia," draft the email text in chat for them to copy/paste.
  - Don't invite new users — direct the admin to `/admin/users` in the app.

### Tool surface (complete list)

**10 read tools:**

| Tool | Input | Returns |
|---|---|---|
| `list_investors` | `{ stage?, geo?, sector?, leadOnly? }` | `Investor[]` |
| `get_investor` | `{ id }` | `Investor` + matches + DNMs |
| `list_companies` | `{ cohort?, stage?, acceptsInvestorIntros? }` | `Company[]` |
| `get_company` | `{ id }` | `Company` + matches + customer targets + events |
| `list_matches` | `{ companyId?, investorId?, tier?, minScore?, maxScore? }` | `Match[]` |
| `get_match` | `{ matchId }` | Full `Match` with score breakdown |
| `list_dnm` | `{ companyId?, investorId? }` | `DoNotMatch[]` |
| `get_methodology` | `{}` | All dimensions + cards |
| `get_team` | `{}` | User rows from `v_user_public` |
| `lookup_audit_history` | `{ tableName, rowId, limit? }` | Recent `AuditLog` rows with actor names |

**14 write tools** (each produces `AuditLog` rows via `audit.ts`):

| Tool | Input | Notes |
|---|---|---|
| `update_match` | `{ matchId, patch }` | Any writable field |
| `create_match` | `{ companyId, investorId, initialData }` | Propose a new pairing |
| `update_investor` | `{ id, patch }` | — |
| `create_investor` | `{ data }` | — |
| `update_company` | `{ id, patch }` | Includes `acceptsInvestorIntros` (soft-guarded in prompt) |
| `create_company` | `{ data }` | — |
| `add_customer_target` | `{ companyId, data }` | WIDMO-mode |
| `update_customer_target` | `{ id, patch }` | — |
| `add_industry_event` | `{ companyId, data }` | — |
| `update_industry_event` | `{ id, patch }` | — |
| `set_dnm` | `{ companyId, investorId, reason }` | Upsert |
| `clear_dnm` | `{ companyId, investorId }` | Delete DNM row (the one exception to "no deletes" because a DNM is purely a flag) |
| `update_methodology_dimension` | `{ id, patch }` | Soft-guarded: asks admin before changing `maxWeight` |
| `update_methodology_card` | `{ id, patch }` | — |

**Explicitly NOT in v2.0:** no hard deletes, no User table CRUD, no raw SQL, no email API, no web research (that's v2.1), no `revert_audit_entry` (revert is a human-initiated action in the admin UI).

### Context injection per session

On each tool invocation for a given `ChatSession`, the skill's pre-turn hook:

1. Reads `ChatSession.scopeType` and `ChatSession.scopeEntityId` from the session ID metadata
2. If `scopeType=company`: calls `get_company` and injects the result as a `system` message at the head of the LLM's context: *"You are in the channel for Acme Corp. Here is the full company record, all matches, customer targets, and recent audit history: {json}"*
3. If `scopeType=investor`: similar with `get_investor`
4. If `scopeType=general`: injects `get_methodology` output and a portfolio summary (company count, investor count, tier distribution across all matches)

Context is refreshed on session resume, not every turn — OpenClaw's session model handles this.

### Attribution flow (`on_behalf_of_user_id`)

1. Next.js `/analyst` page verifies NextAuth session → knows current admin's user ID
2. `/analyst/ws` route handler mints a short-lived JWT containing `{ userId, openclawSessionId, exp }` and proxies the WebSocket upgrade to `openclaw-gateway:18789`
3. Browser's WebSocket sends messages with `metadata.actingUserId = <currentAdminId>` in the OpenClaw message envelope
4. OpenClaw makes this metadata available to the skill when invoking any tool during the response
5. Every write tool's `audit.ts` helper reads `actingUserId` from the invocation context and writes it as `AuditLog.onBehalfOfUserId`. `AuditLog.actorUserId` is always the Assistant's user ID.
6. **If metadata is missing for any reason, the skill refuses the write with a structured error.** No anonymous writes.

### Chat UI pages and components

**`/analyst` page layout:** Two-column, full-height-below-header. Left: 280px fixed channel sidebar with `#general` on top, collapsible `Companies` and `Investors` groups. Right: message pane with streaming bubbles, sender-name attribution, tool-call pills (✎ Updated X), and input box at the bottom.

**Channel sidebar:**
- `#general` always at top.
- Companies sorted by cohort then name.
- Investors sorted by name, collapsed by default.
- Each channel shows display name and `lastMessageAt`.
- Click → update URL query param `?session=<id>` → message pane loads that session.
- First-click session provisioning: if no `ChatSession` row exists for the entity, the server action `ensureChatSession({ scopeType, scopeEntityId })` creates the OpenClaw session via gateway HTTP API, inserts the `ChatSession` row, and returns the ID.

**Message pane:**
- Messages grouped by sender, timestamps, markdown in Assistant messages, plain text in admin messages.
- Tool-call pills rendered inline with the Assistant message that produced them:
  - Write pills (`✎`) are prominent, link to `/admin/audit?entry=<id>` filtered to the specific entry with a Revert button.
  - Read pills (`🔍`) are muted, collapsible, mostly for debugging.
- Streaming: token-by-token via the WebSocket; "jump to latest" button appears if user scrolls up.
- Rate-limit state: "Assistant is queued by provider, response may be delayed" subtle banner.

**`/admin/audit` page:**
- Reverse-chron list of `AuditLog` rows with filters: actor (admin or Assistant), table, row ID, time range, chat session.
- Each row displays: timestamp, actor name, on-behalf-of name (if present), table.field, old→new value diff, and a **Revert** button.
- Revert button calls the `revertAuditEntry` server action, which reads `oldValueJson`, re-applies it as a write by the current admin (logged as a new audit row), and marks the original row with `revertedByAuditId` pointing to the new one.

### OpenClaw configuration (`openclaw-config/openclaw.json`)

```json
{
  "gateway": {
    "controlUi": {
      "basePath": "/ClawAdmin",
      "allowedOrigins": ["https://tbdc.ready4vc.com"]
    }
  },
  "models": {
    "primary": "zai/glm-5.1",
    "providers": {
      "zai": {
        "plan": "Coding-Plan-Global",
        "models": [
          { "id": "glm-5.1", "contextWindow": 204800, "maxOutput": 131072 }
        ]
      }
    }
  },
  "skills": {
    "tbdc-db": { "enabled": true }
  },
  "channels": {
    "webchat": { "enabled": true },
    "slack": { "enabled": false }
  }
}
```

The `zai.apiKey` field is NOT in this config file — it's injected via the `ZAI_API_KEY` env var on container start, which the onboarded provider config reads. This keeps the key out of the bind-mounted file on disk.

### Caddy snippet (append to `Rafiq-v1/docker/caddy/Caddyfile`)

```caddy
# === TBDC POC v2.0 — analyst chat + OpenClaw Control UI ===
# (appended 2026-04-09; NOT part of Rafiq-v1)

tbdc.ready4vc.com {
    # OpenClaw Control UI — basic-auth-gated, subpath-mounted
    handle /ClawAdmin/* {
        basic_auth {
            admin {env.OPENCLAW_ADMIN_BCRYPT}
        }
        reverse_proxy openclaw-gateway:18789
    }

    # OpenClaw WebSocket for the in-app chat pane
    handle /analyst/ws {
        reverse_proxy openclaw-gateway:18789
    }

    # TBDC web app (existing, unchanged)
    handle {
        reverse_proxy tbdc-web:3000
    }
}
# === end TBDC POC v2.0 ===
```

Replaces the existing `tbdc.ready4vc.com { reverse_proxy tbdc-web:3000 }` block (v1's simple reverse_proxy becomes one `handle` inside the new site block).

### Docker layout on rafiq-dev

Existing: `tbdc-web` container on `docker_rafiq-shared` network, running with `--restart unless-stopped`, loading env from `/root/tbdc-poc/tbdc-web.env`, mounted at v1's `/root/tbdc-poc/` folder.

v2.0 adds:

```
/root/tbdc-poc/
├── repo/                      ← existing (v1 repo clone)
├── tbdc-web.env               ← existing (v1 env)
├── openclaw-config/           ← NEW — bind-mounted to container
│   └── openclaw.json
├── openclaw-workspace/        ← NEW — bind-mounted, holds sessions + skills
│   └── skills/
│       └── tbdc-db/           ← rsynced from repo/openclaw-workspace/skills/tbdc-db/
└── openclaw.env               ← NEW — ZAI_API_KEY, DATABASE_URL_ASSISTANT, OPENCLAW_ADMIN_BCRYPT
```

Container run command (by hand from a shell script, or via a thin docker-compose.yml on the droplet — either works):

```bash
docker run -d \
  --name openclaw-gateway \
  --restart unless-stopped \
  --network docker_rafiq-shared \
  --env-file /root/tbdc-poc/openclaw.env \
  -v /root/tbdc-poc/openclaw-config:/home/node/.openclaw \
  -v /root/tbdc-poc/openclaw-workspace:/home/node/.openclaw/workspace \
  ghcr.io/openclaw/openclaw:<pinned-version>
```

**Port 18789 is NOT exposed to the host** — OpenClaw is only reachable from inside `docker_rafiq-shared`, where Caddy routes to it.

### Environment variables (new, added to `openclaw.env` on the droplet)

```bash
ZAI_API_KEY=<from z.ai dashboard after subscribing to Coding Plan>
DATABASE_URL_ASSISTANT=postgresql://tbdc_assistant:<pw>@shared-postgres:5432/tbdc_poc
OPENCLAW_ADMIN_BCRYPT=<bcrypt of the shared Control UI password>
OPENCLAW_SESSION_JWT_SECRET=<32-byte random, used by /analyst/ws route to mint short-lived tokens>
ASSISTANT_USER_EMAIL=assistant@tbdc.ready4vc.com
```

`tbdc-web.env` also gains `OPENCLAW_SESSION_JWT_SECRET` (same value, shared with openclaw.env) and `OPENCLAW_INTERNAL_URL=http://openclaw-gateway:18789` for server-side calls (session creation, health checks).

## Risks and mitigations

Scoped to the interview-demo use profile — no production-scale concerns included.

1. **Prisma migration against the live `tbdc_poc` DB is the highest-stakes step.** V1 is running. A bad migration could corrupt data or take the app down mid-demo. **Mitigation:** test-run locally against a dump of the production schema before applying. `pg_dump tbdc_poc > /root/tbdc-poc/backups/pre-v2-migration-<timestamp>.sql` immediately before running `prisma migrate deploy`. Rollback is `psql < backup.sql`. The migration is additive (new tables, new columns, new enum value) — no destructive changes — so the risk is bounded.

2. **Editing the live Caddyfile is the second-highest-stakes step.** A syntax error takes down every domain rafiq-dev serves, not just TBDC. **Mitigation:** `cp Caddyfile Caddyfile.backup.<timestamp>` before editing, run `docker exec caddy caddy validate --config /etc/caddy/Caddyfile` after editing, only then `caddy reload`. Rollback command stays in the terminal history.

3. **OpenClaw skill runtime expectations are not fully verified from docs alone.** Assumptions: TypeScript skills can `import` `@prisma/client`, connect to Postgres, and return structured JSON. **Mitigation:** the first implementation-plan step is building a throwaway `hello-world-db` skill that does `SELECT 1 FROM "Investor" LIMIT 1` and verifies it loads and runs inside the gateway before building any real tools. If the shape doesn't work, we find out before writing 24 real tools against a dead pattern.

4. **OpenClaw per-message metadata (`actingUserId`) reaching the skill's tool invocation context is assumed, not verified.** If metadata can't flow cleanly into tool calls, the fallback is to pass `actingUserId` as an explicit first parameter on every write tool — uglier but guaranteed to work. **Mitigation:** verify in the `hello-world-db` step above.

5. **z.ai Coding Plan subscription key lifecycle.** Keys can be rotated or revoked by z.ai. If a key stops working mid-demo the Assistant goes silent. **Mitigation:** Control UI at `/ClawAdmin/` exposes provider auth status; rotation is `vi openclaw.env && docker restart openclaw-gateway`. Ahmed and Korayem will subscribe and generate the key together immediately before the demo, minimizing the exposure window.

6. **Interview-day demo depends on all of this booting cleanly.** **Mitigation:** the implementation plan ends with a dry-run smoke test that Ahmed and Korayem run end-to-end at least 24 hours before any scheduled interview. The smoke test posts messages in all three scope types (company, investor, general), uses at least one read tool and one write tool, verifies the AuditLog entry, and tests the Revert button. If anything fails, we have time to debug before the demo.

## Scope boundaries

### v2.0 — this spec

Chat analyst with read+write access, per-entity channels, direct writes, audit log + revert, in-app chat pane as the only surface, GLM-5.1 via z.ai subscription.

### v2.1 — research skill (future, separate spec)

- `web-research` skill for external web lookups (Google/Brave search API, news API) blended with DB context.
- Per-query cost budget + explicit source attribution in chat.
- Does NOT add write capability beyond what v2.0 has.

### v2.2 — broader write surface and approval inbox (future, separate spec)

- If/when writes can come from contexts outside the direct admin-in-chat flow (scheduled jobs, Slack DMs, eventually founder-facing surfaces), an async "pending actions" inbox for admin approval.
- In-app chat writes continue to go direct — v2.0's model doesn't change.

### v2.3 — secondary chat surface (future, separate spec)

- When the TBDC team settles on a native chat tool (Slack / Teams / WhatsApp / Telegram), wire OpenClaw's corresponding channel to the same agent.
- Architecturally trivial — OpenClaw's multi-channel routing is already in place; this is a provider config + allowlist.

### v3 / v4 — founder-facing access (far future, separate spec — noted for completeness)

- Portfolio company founders log in and chat with the Assistant scoped to their own company only.
- Expands the trust boundary. Re-introduces per-user session model, per-row authorization, prompt-injection hardening, and the approval pattern for writes.
- v2.0's trust model is safe *now* because the audience is 2–5 trusted admins. It is not safe *forever*. When the boundary expands, the security conservatism I argued for during the brainstorm becomes necessary again.

## Things v2.0 explicitly does NOT include

- No web research, news fetching, or external API lookups (v2.1).
- No email sending, no SMTP, no calendar integration.
- No voice / audio / transcription, though OpenClaw supports it.
- No file uploads in chat.
- No Slack, Teams, WhatsApp, Telegram, or any chat surface other than the in-app `/analyst` pane.
- No scheduled/autonomous agent behavior — the Assistant only acts in response to admin messages.
- No approval inbox, no "pending changes" queue, no staged writes — writes go direct, audit log + revert is the guardrail.
- No user management by the Assistant (invitations, role changes, deletes) — admin UI only.
- No hard deletes of any record by the Assistant — soft-delete semantics, or no delete at all.
- No raw SQL execution tool — all writes go through named typed tools.
- No fallback LLM provider — GLM-5.1 via z.ai is the only model configured; if it fails the Assistant goes silent and admins wait.
- No Prometheus, Grafana, OpenTelemetry, or any observability stack beyond `docker logs` and `docker stats`.
- No CI/CD for v2.0 — deploy is manual, same as v1.
- No load testing, no scaling strategy beyond "bump the droplet size if needed."
- No unit tests beyond the skill tool tests. No E2E browser tests.

All of these are intentionally deferred and none are missing by mistake.
