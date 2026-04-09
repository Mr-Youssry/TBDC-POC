# TBDC POC v2.0 — OpenClaw Investment Analyst Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Chat-with-the-Assistant surface for the TBDC POC, backed by an OpenClaw sidecar container running GLM-5.1 via z.ai subscription, with direct DB read+write via a custom `tbdc-db` skill, per-entity channels, and an audit log + one-click revert guardrail.

**Architecture:** OpenClaw gateway as a new Docker container alongside the existing `tbdc-web` container on rafiq-dev, sharing the `docker_rafiq-shared` network and the existing `shared-postgres` container. Custom TypeScript skill (`tbdc-db`) connects to Postgres as a restricted `tbdc_assistant` role. New Next.js `/analyst` page renders a channel sidebar + message pane, connects to OpenClaw over WebSocket via a route handler that brokers NextAuth session → short-lived JWT. Assistant is a first-class `User` row; every write is audited and one-click revertible from `/admin/audit`.

**Tech Stack:** TypeScript + Next.js 16, Prisma 7 (driver-adapter pattern), NextAuth v5, Zod, OpenClaw (`ghcr.io/openclaw/openclaw` — exact tag pinned in Task 0.1), Postgres 15 (existing shared container), z.ai GLM-5.1, Docker 29, Caddy (existing).

**Spec:** [2026-04-09-v2-openclaw-analyst-design.md](../specs/2026-04-09-v2-openclaw-analyst-design.md) — read this first.

**Use profile:** Interview portfolio artifact. Expected load: 1–2 test conversations by an interviewer + a handful of dry runs by Ahmed and Korayem. Sized accordingly.

---

## Scope

**Single subsystem:** the v2.0 chat analyst. One new container, one new Next.js page, one new admin page, additive Prisma migration, one custom skill. Ships as a whole unit. No sub-project decomposition needed.

**Explicitly out of scope for this plan:** web research skill (v2.1), broader writes + approval inbox (v2.2), secondary chat channels like Slack/Teams (v2.3), founder-facing access (v3/v4). Each of these is a future separate plan.

## Dependencies and serial order

```
Phase 0 (probe) ──┐
                  ├──► Phase 1 (data model) ──┐
                  │                            ├──► Phase 3 (chat UI) ──┐
                  └──► Phase 2 (skill) ────────┤                         │
                                               ├──► Phase 4 (audit UI) ──┤
                                               └──► Phase 5 (local dev) ──┤
                                                                          │
                                                                          ▼
                                                                   Phase 6 (droplet deploy)
                                                                          │
                                                                          ▼
                                                                   Phase 7 (handoff)
```

- **Phase 0** is fully serial. It unblocks everything.
- **Phases 1 + 2** can run in parallel after Phase 0 resolves. Phase 2 depends on the Prisma schema shape locked in Phase 1 Task 1.1, so Phase 2 starts *after* 1.1 commits.
- **Phases 3 + 4 + 5** can run in parallel after both 1 and 2 complete.
- **Phase 6** requires everything to be committed + tests passing + local dev working.
- **Phase 7** is the handoff document, written after Phase 6 but before closing the session.

**Multi-agent dispatch note:** when executing this plan with `superpowers:subagent-driven-development`, dispatch parallel subagents at the **Phase 1 / Phase 2** boundary (2 agents) and at the **Phase 3 / 4 / 5** boundary (3 agents). Phases 0 and 6 must remain serial (single agent). Phase 7 is a single small doc task.

## Execution environment + SSH access

The execution session must have SSH access to rafiq-dev for Phase 6. Credentials documented in [~/.claude/projects/C--my-code-Rafiq-v1/memory/droplet-rafiq-dev.md](file:///C:/Users/Ahmed/.claude/projects/C--my-code-Rafiq-v1/memory/droplet-rafiq-dev.md). Direct command:

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55
```

No doctl wrapper needed. Key is the same `edventure-key` that works for edventure-mlp; it's authorized on rafiq-dev. Verify before starting Phase 6:

```bash
ssh -i ~/.ssh/id_ed25519 -o BatchMode=yes -o ConnectTimeout=5 root@67.205.157.55 'echo ok'
```

Expected: `ok` prints and exit code is 0. If this fails, stop and ask the user.

## Pre-flight checks (run once at session start, before any task)

- [ ] **Confirm you're on `main` branch and working tree is clean.**

```bash
git status --short
git branch --show-current
```

Expected: empty status, `main` branch. If dirty or wrong branch, stop and ask user.

- [ ] **Confirm v1 is still live at https://tbdc.ready4vc.com.**

```bash
curl -sI https://tbdc.ready4vc.com/login | head -1
```

Expected: `HTTP/2 200`. If v1 is down, stop — we do not want to deploy v2.0 while v1 is broken.

- [ ] **Confirm SSH access to rafiq-dev works.**

```bash
ssh -i ~/.ssh/id_ed25519 -o BatchMode=yes -o ConnectTimeout=5 root@67.205.157.55 'hostname && docker ps --filter name=tbdc-web --format "{{.Names}} {{.Status}}"'
```

Expected: `rafiq-dev` hostname + `tbdc-web Up ...` line. If SSH fails or tbdc-web is not running, stop.

- [ ] **Create a dedicated branch for v2.0 work.**

```bash
git checkout -b v2-analyst
```

All commits in this plan land on `v2-analyst`. Merge to `main` happens at the end of Phase 6 after successful droplet deployment.

- [ ] **Read the spec document once, end-to-end, before starting Phase 0.** File: [docs/superpowers/specs/2026-04-09-v2-openclaw-analyst-design.md](../specs/2026-04-09-v2-openclaw-analyst-design.md).

---

## Phase 0 — Verification probe (SERIAL, ~60 minutes)

**Purpose:** Resolve the two biggest unknowns before writing any production code. If either assumption is wrong, we find out now and pivot before it's expensive.

**Unknowns being verified:**
1. Which exact `ghcr.io/openclaw/openclaw` tag to pin
2. Whether a TypeScript skill can `import { PrismaClient }` and connect to Postgres at runtime
3. Whether OpenClaw's per-message metadata (`actingUserId`) reaches a skill's tool invocation context cleanly

### Task 0.1 — Pin the OpenClaw image version

**Files:**
- Create: `deploy/openclaw-version.txt` (single-line file with the pinned tag)

- [ ] **Step 1: List available image tags from GHCR.**

```bash
curl -sL "https://ghcr.io/v2/openclaw/openclaw/tags/list" 2>/dev/null || \
  gh api "/orgs/openclaw/packages/container/openclaw/versions" --jq '.[0:10] | .[] | .metadata.container.tags[]' 2>/dev/null || \
  echo "Check https://github.com/openclaw/openclaw/pkgs/container/openclaw manually"
```

Expected: a list of tags like `main`, `latest`, `2026.3.15`, `2026.2.26`, etc. Pick the most recent **dated** stable tag (format `YYYY.M.D`), NOT `latest` and NOT `main`. If no dated tags are visible, check https://github.com/openclaw/openclaw/releases and pick the latest non-prerelease.

- [ ] **Step 2: Verify the image pulls cleanly on the local dev machine.**

```bash
docker pull ghcr.io/openclaw/openclaw:<PINNED_TAG>
```

Expected: successful pull, no errors.

- [ ] **Step 3: Write the pinned tag to the repo for reproducibility.**

```bash
echo "<PINNED_TAG>" > deploy/openclaw-version.txt
```

- [ ] **Step 4: Commit.**

```bash
git add deploy/openclaw-version.txt
git commit -m "chore(v2): pin OpenClaw image version to <PINNED_TAG>"
```

### Task 0.2 — Stand up OpenClaw locally with no skills

**Files:**
- Create: `deploy/probe/openclaw.json` (minimal gateway config, no skills)
- Create: `deploy/probe/docker-compose.probe.yml` (probe compose)

- [ ] **Step 1: Write a minimal `openclaw.json` with no provider configured.**

```json
{
  "gateway": {
    "host": "0.0.0.0",
    "port": 18789,
    "controlUi": {
      "basePath": "/",
      "allowedOrigins": ["http://localhost:18789"]
    }
  },
  "models": {},
  "skills": {},
  "channels": { "webchat": { "enabled": true } }
}
```

Save to `deploy/probe/openclaw.json`.

- [ ] **Step 2: Write a probe docker-compose file.**

```yaml
services:
  openclaw-probe:
    image: ghcr.io/openclaw/openclaw:<PINNED_TAG>
    container_name: openclaw-probe
    ports:
      - "18789:18789"
    volumes:
      - ./openclaw.json:/home/node/.openclaw/openclaw.json:ro
      - openclaw-probe-workspace:/home/node/.openclaw/workspace
    environment:
      - OPENCLAW_HOME=/home/node/.openclaw

volumes:
  openclaw-probe-workspace:
```

Save to `deploy/probe/docker-compose.probe.yml` (substitute the actual pinned tag from 0.1).

- [ ] **Step 3: Start the probe gateway.**

```bash
cd deploy/probe
docker compose -f docker-compose.probe.yml up -d
docker compose -f docker-compose.probe.yml logs --tail 50
```

Expected: gateway starts cleanly, log shows listening on `:18789`, no fatal errors. If it crashes, read logs and either fix the config file or pick a different image tag. Record the working config in the commit message.

- [ ] **Step 4: Verify Control UI responds.**

```bash
curl -sI http://localhost:18789/ | head -1
```

Expected: `HTTP/1.1 200 OK` (or `301`/`302` redirect to a login/onboarding path). If you get connection refused, the container isn't listening — debug via `docker logs openclaw-probe`.

- [ ] **Step 5: Commit the probe scaffolding.**

```bash
git add deploy/probe/
git commit -m "chore(v2): local openclaw probe compose + minimal config"
```

### Task 0.3 — Write a `hello-world-db` throwaway skill

**Goal:** Verify three things end-to-end: (a) a TypeScript skill can load inside OpenClaw, (b) it can `import { PrismaClient }` and run a trivial query, (c) its tool function receives per-message metadata (`actingUserId`).

**Files:**
- Create: `deploy/probe/skills/hello-world-db/SKILL.md`
- Create: `deploy/probe/skills/hello-world-db/package.json`
- Create: `deploy/probe/skills/hello-world-db/index.ts`

- [ ] **Step 1: Write the SKILL.md manifest.**

```markdown
---
name: hello-world-db
description: Probe skill — verifies TS + Prisma + metadata flow inside OpenClaw
user-invocable: true
metadata:
  openclaw:
    requires:
      env:
        - PROBE_DATABASE_URL
---

# Hello World DB Probe

Minimal probe skill. Exposes one tool, `ping_db`, that runs `SELECT 1` against the database and returns the result along with any per-message metadata it received.
```

- [ ] **Step 2: Write package.json.**

```json
{
  "name": "hello-world-db",
  "version": "0.0.1",
  "type": "module",
  "dependencies": {
    "@prisma/client": "^7.0.0",
    "@prisma/adapter-pg": "^7.0.0",
    "pg": "^8.12.0"
  }
}
```

- [ ] **Step 3: Write index.ts.**

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.PROBE_DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const tools = {
  ping_db: {
    description: 'Run SELECT 1 against the probe DB and echo metadata',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async (_args: unknown, context: { metadata?: Record<string, unknown> }) => {
      const rows = await prisma.$queryRaw`SELECT 1 as ok`;
      return {
        ok: true,
        dbResult: rows,
        receivedMetadata: context?.metadata ?? null,
        pid: process.pid
      };
    }
  }
};
```

- [ ] **Step 4: Install skill deps.**

```bash
cd deploy/probe/skills/hello-world-db
npm install
```

Expected: clean install, no errors.

- [ ] **Step 5: Point OpenClaw at a local Postgres and enable the skill.**

Start a disposable Postgres for the probe:

```bash
docker run -d --name probe-postgres \
  -e POSTGRES_PASSWORD=probe \
  -e POSTGRES_DB=probe \
  -p 15432:5432 postgres:15
```

Update `deploy/probe/openclaw.json` to register the skill:

```json
{
  "skills": {
    "hello-world-db": {
      "enabled": true,
      "path": "./skills/hello-world-db"
    }
  }
}
```

Update the probe docker-compose to mount the skills dir and set `PROBE_DATABASE_URL`:

```yaml
    volumes:
      - ./openclaw.json:/home/node/.openclaw/openclaw.json:ro
      - ./skills:/home/node/.openclaw/workspace/skills:ro
      - openclaw-probe-workspace:/home/node/.openclaw/workspace/data
    environment:
      - OPENCLAW_HOME=/home/node/.openclaw
      - PROBE_DATABASE_URL=postgresql://postgres:probe@host.docker.internal:15432/probe
```

Restart:

```bash
cd deploy/probe
docker compose -f docker-compose.probe.yml down
docker compose -f docker-compose.probe.yml up -d
docker compose -f docker-compose.probe.yml logs --tail 100 | grep -i -E "(skill|hello|error)"
```

Expected: log shows `hello-world-db` loaded. If it fails with a module resolution error, that's the first real assumption-breaker — see "Fallback" below.

- [ ] **Step 6: Invoke `ping_db` via OpenClaw's CLI or Control UI.**

Open http://localhost:18789/ in a browser. Find the skill, invoke `ping_db` with a test message that includes custom metadata (check OpenClaw's docs for how to pass metadata from Control UI — likely via an "advanced options" or "raw envelope" field; if not exposed in UI, use the WS API directly with a small Node script in `deploy/probe/send-probe.mjs`).

Expected response shape:
```json
{
  "ok": true,
  "dbResult": [{"ok": 1}],
  "receivedMetadata": { "actingUserId": "probe-user-123" },
  "pid": <some-number>
}
```

- [ ] **Step 7: Record findings in a `deploy/probe/FINDINGS.md` file.**

Document:
- Which image tag you pinned (must match `deploy/openclaw-version.txt`)
- Whether the skill loaded with `@prisma/client` + `@prisma/adapter-pg` deps — if not, what error, and which dependency resolution mechanism OpenClaw actually uses for skills
- Whether `receivedMetadata` was non-null (confirming metadata flow) — if null, whether there's a different API surface for accessing per-message metadata
- Any surprises or config tweaks needed beyond the minimal `openclaw.json`

- [ ] **Step 8: Commit findings.**

```bash
git add deploy/probe/
git commit -m "chore(v2): probe verifies openclaw TS skill + prisma + metadata"
```

**Fallback if metadata doesn't flow cleanly into tool handlers:** Document in FINDINGS.md that the real `tbdc-db` skill must accept `actingUserId` as an **explicit first parameter on every write tool**, and that the chat pane must pass it in the tool arguments rather than in message metadata. This is uglier but guaranteed to work. If this fallback is triggered, update the spec's "Attribution flow" section with a note, and continue.

**Fallback if skill can't load TypeScript with external deps:** Rebuild the skill using whatever OpenClaw's actual skill runtime supports — likely one of (a) plain JS with bundled deps, (b) a pre-compiled bundle via esbuild, (c) an OpenAI-tool-style HTTP endpoint that OpenClaw calls out to. Document the chosen approach in FINDINGS.md and update Phase 2 task structure accordingly.

### Task 0.4 — Teardown probe stack

- [ ] **Step 1: Stop and remove probe containers.**

```bash
cd deploy/probe
docker compose -f docker-compose.probe.yml down -v
docker rm -f probe-postgres
```

- [ ] **Step 2: Keep the probe files committed (don't delete).**

The probe is kept in the repo as a smoke test reference for future debugging. Do not remove `deploy/probe/`.

**Phase 0 gate:** Before starting Phase 1, the following must be true:
1. `deploy/openclaw-version.txt` contains a real pinned tag
2. `deploy/probe/FINDINGS.md` documents skill loading works (or documents the fallback chosen)
3. Both commits are on `v2-analyst` branch

If Phase 0 surfaces an unrecoverable blocker (OpenClaw fundamentally can't do what the spec assumes), **stop and escalate to the user**. Do not silently proceed with a broken assumption.

---

## Phase 1 — Data model (can start after Phase 0; can run in parallel with Phase 2 after Task 1.1 commits)

**Purpose:** Add the `AuditLog`, `ChatSession`, and `UserRole` enum to the Prisma schema, add `updatedBy*`/`updatedAt` to writable tables, extend the seed to create the Assistant user + initial ChatSessions, and write the manual SQL for the `tbdc_assistant` role + `v_user_public` view.

**Dispatch:** Single subagent runs this phase end-to-end. Do not parallelize internally.

### Task 1.1 — Prisma schema migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Read the current schema to understand existing model shapes.**

```bash
cat prisma/schema.prisma
```

Note the exact names of User, Investor, Company, Match, DoNotMatch, CustomerTarget, IndustryEvent, MethodologyDimension, MethodologyCard. The spec uses the same names so there should be no mismatch — verify.

- [ ] **Step 2: Add the `UserRole` enum and change `User.role` to use it.**

```prisma
enum UserRole {
  admin
  assistant
}

model User {
  // ... existing fields unchanged ...
  role         UserRole @default(admin)
  // ... existing relations unchanged ...
  auditLogsActor    AuditLog[] @relation("AuditActor")
  auditLogsOnBehalf AuditLog[] @relation("AuditOnBehalfOf")
}
```

Edit `prisma/schema.prisma` accordingly. Note that `role` was previously `String @default("admin")` — the migration will need to cast existing data, which Prisma handles when the enum value matches the string value (which it does: both are `"admin"`).

- [ ] **Step 3: Add `updatedByUserId` + `updatedAt` columns to every writable table.**

Tables to modify: `Investor`, `Company`, `Match`, `DoNotMatch`, `CustomerTarget`, `IndustryEvent`, `MethodologyDimension`, `MethodologyCard`.

For each, add:

```prisma
  updatedByUserId  String?
  updatedBy        User?    @relation(name: "UpdatedBy<ModelName>", fields: [updatedByUserId], references: [id], onDelete: SetNull)
  updatedAt        DateTime @updatedAt
```

And add matching back-relations on `User`:

```prisma
  updatedInvestors            Investor[]            @relation("UpdatedByInvestor")
  updatedCompanies            Company[]             @relation("UpdatedByCompany")
  updatedMatches              Match[]               @relation("UpdatedByMatch")
  updatedDoNotMatches         DoNotMatch[]          @relation("UpdatedByDoNotMatch")
  updatedCustomerTargets      CustomerTarget[]      @relation("UpdatedByCustomerTarget")
  updatedIndustryEvents       IndustryEvent[]       @relation("UpdatedByIndustryEvent")
  updatedMethodologyDims      MethodologyDimension[] @relation("UpdatedByMethodologyDimension")
  updatedMethodologyCards     MethodologyCard[]     @relation("UpdatedByMethodologyCard")
```

- [ ] **Step 4: Add the `AuditLog` model and `AuditOp` enum.**

```prisma
enum AuditOp {
  insert
  update
  delete
}

model AuditLog {
  id                String    @id @default(cuid())
  actorUserId       String
  actor             User      @relation("AuditActor", fields: [actorUserId], references: [id])
  onBehalfOfUserId  String?
  onBehalfOf        User?     @relation("AuditOnBehalfOf", fields: [onBehalfOfUserId], references: [id])
  tableName         String
  rowId             String
  field             String?
  oldValueJson      Json?
  newValueJson      Json?
  operation         AuditOp
  chatSessionId     String?
  revertedByAuditId String?
  createdAt         DateTime  @default(now())

  @@index([tableName, rowId])
  @@index([actorUserId, createdAt])
  @@index([chatSessionId])
}
```

- [ ] **Step 5: Add the `ChatSession` model and `ChatScopeType` enum.**

```prisma
enum ChatScopeType {
  company
  investor
  general
}

model ChatSession {
  id                 String         @id @default(cuid())
  scopeType          ChatScopeType
  scopeEntityId      String?
  openclawSessionId  String         @unique
  displayName        String
  createdAt          DateTime       @default(now())
  lastMessageAt      DateTime?

  @@unique([scopeType, scopeEntityId])
  @@index([lastMessageAt])
}
```

- [ ] **Step 6: Generate the migration locally against a test DB.**

```bash
# Use a disposable local Postgres (can reuse the probe container if it's still around, or spin up a fresh one)
docker run -d --name v2-migration-test \
  -e POSTGRES_PASSWORD=test -e POSTGRES_DB=tbdc_poc_test \
  -p 15433:5432 postgres:15

# Temporarily point DATABASE_URL at the test DB
export DATABASE_URL="postgresql://postgres:test@localhost:15433/tbdc_poc_test"

# Apply v1 schema first by running migrations from main
npx prisma migrate deploy

# Seed with v1 data to make the test realistic
npx prisma db seed

# Now create the v2.0 migration
npx prisma migrate dev --name v2_add_analyst_tables
```

Expected: Prisma generates a new migration folder under `prisma/migrations/<timestamp>_v2_add_analyst_tables/` with a `migration.sql` file. Migration applies cleanly to the test DB with existing v1 data.

- [ ] **Step 7: Verify the migration is additive and doesn't destroy v1 data.**

```bash
psql "$DATABASE_URL" -c '\dt'
psql "$DATABASE_URL" -c 'SELECT COUNT(*) FROM "Investor";'
psql "$DATABASE_URL" -c 'SELECT COUNT(*) FROM "AuditLog";'
psql "$DATABASE_URL" -c 'SELECT COUNT(*) FROM "ChatSession";'
```

Expected: Investor count matches the v1 seed (24). AuditLog and ChatSession both exist and return 0.

- [ ] **Step 8: Teardown test DB.**

```bash
docker rm -f v2-migration-test
unset DATABASE_URL
```

- [ ] **Step 9: Commit.**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(v2/db): add AuditLog + ChatSession + UserRole enum + updatedBy tracking"
```

### Task 1.2 — Extend seed script for Assistant user and initial ChatSessions

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Read the current seed to understand its structure.**

```bash
cat prisma/seed.ts
```

Note how v1 upserts the bootstrap admin users and how it handles idempotency (the check that skips seeding if data already exists).

- [ ] **Step 2: Add an `upsertAssistantUser` function.**

```typescript
async function upsertAssistantUser(prisma: PrismaClient) {
  const email = process.env.ASSISTANT_USER_EMAIL ?? 'assistant@tbdc.ready4vc.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      email,
      name: 'Assistant',
      role: 'assistant',
      // No passwordHash — login is blocked at the NextAuth layer for role=assistant
      passwordHash: '!',  // placeholder non-empty string; schema requires non-null
    }
  });
}
```

Call it from the main seed function after the admin users are seeded.

- [ ] **Step 3: Add an `upsertInitialChatSessions` function.**

```typescript
async function upsertInitialChatSessions(prisma: PrismaClient) {
  // General session (singleton)
  await prisma.chatSession.upsert({
    where: { scopeType_scopeEntityId: { scopeType: 'general', scopeEntityId: null } },
    create: {
      scopeType: 'general',
      scopeEntityId: null,
      openclawSessionId: 'tbdc-general',
      displayName: 'General',
    },
    update: {},
  });

  // One per company
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  for (const c of companies) {
    await prisma.chatSession.upsert({
      where: { scopeType_scopeEntityId: { scopeType: 'company', scopeEntityId: c.id } },
      create: {
        scopeType: 'company',
        scopeEntityId: c.id,
        openclawSessionId: `tbdc-co-${c.id}`,
        displayName: c.name,
      },
      update: { displayName: c.name },
    });
  }

  // One per investor
  const investors = await prisma.investor.findMany({ select: { id: true, name: true } });
  for (const i of investors) {
    await prisma.chatSession.upsert({
      where: { scopeType_scopeEntityId: { scopeType: 'investor', scopeEntityId: i.id } },
      create: {
        scopeType: 'investor',
        scopeEntityId: i.id,
        openclawSessionId: `tbdc-inv-${i.id}`,
        displayName: i.name,
      },
      update: { displayName: i.name },
    });
  }
}
```

Note the `openclawSessionId` values are deterministic — this lets us reference them from the chat pane without a round-trip lookup, and OpenClaw will auto-create the backing sessions on first message.

Call `upsertInitialChatSessions` after companies and investors are seeded.

- [ ] **Step 4: Run the updated seed against the test DB.**

```bash
docker run -d --name v2-seed-test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=tbdc_poc_test -p 15433:5432 postgres:15
export DATABASE_URL="postgresql://postgres:test@localhost:15433/tbdc_poc_test"
npx prisma migrate deploy
npx prisma db seed
```

Expected: clean run, no errors. Verify:

```bash
psql "$DATABASE_URL" -c "SELECT email, role FROM \"User\" WHERE role = 'assistant';"
psql "$DATABASE_URL" -c "SELECT \"scopeType\", \"displayName\" FROM \"ChatSession\" ORDER BY \"scopeType\", \"displayName\";"
```

Expected: one `assistant` row, one `general` ChatSession, 10 `company` ChatSessions, 24 `investor` ChatSessions (35 total).

- [ ] **Step 5: Verify idempotency — run seed a second time.**

```bash
npx prisma db seed
```

Expected: clean second run, same row counts, no duplicate insertion errors.

- [ ] **Step 6: Teardown test DB.**

```bash
docker rm -f v2-seed-test
unset DATABASE_URL
```

- [ ] **Step 7: Commit.**

```bash
git add prisma/seed.ts
git commit -m "feat(v2/seed): create Assistant user + auto-provision chat sessions"
```

### Task 1.3 — Write the manual SQL role + grants file

**Files:**
- Create: `prisma/migrations/manual/v2_roles_and_grants.sql`

- [ ] **Step 1: Write the SQL file.**

```sql
-- TBDC POC v2.0 — Postgres roles and grants
-- Run by hand after `prisma migrate deploy` on the droplet.
-- Requires superuser. Safe to re-run (all statements use IF NOT EXISTS or equivalent).

-- 1. Restricted role for the OpenClaw skill
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tbdc_assistant') THEN
    CREATE ROLE tbdc_assistant LOGIN PASSWORD :'TBDC_ASSISTANT_PASSWORD';
  END IF;
END
$$;

-- 2. Sanitized User view (no passwordHash)
CREATE OR REPLACE VIEW v_user_public AS
  SELECT id, name, email, role FROM "User";

-- 3. SELECT grants on content tables + AuditLog + ChatSession + user view
GRANT SELECT ON
  "Investor", "Company", "Match", "DoNotMatch",
  "CustomerTarget", "IndustryEvent",
  "MethodologyDimension", "MethodologyCard",
  "AuditLog", "ChatSession",
  v_user_public
TO tbdc_assistant;

-- 4. INSERT/UPDATE grants on writable tables (NO delete)
GRANT INSERT, UPDATE ON
  "Investor", "Company", "Match", "DoNotMatch",
  "CustomerTarget", "IndustryEvent",
  "MethodologyDimension", "MethodologyCard",
  "AuditLog", "ChatSession"
TO tbdc_assistant;

-- 5. Sequence usage (Prisma uses cuid() strings so no sequences today,
--    but future migrations may add serial columns)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO tbdc_assistant;

-- 6. Default privileges for future tables created in this schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE ON TABLES TO tbdc_assistant;

-- 7. Verify tbdc_assistant CANNOT access User.passwordHash
--    (Uncomment to manually verify during deploy)
-- SET ROLE tbdc_assistant;
-- SELECT "passwordHash" FROM "User" LIMIT 1;
-- -- Expected: ERROR: permission denied for table User
-- RESET ROLE;
```

- [ ] **Step 2: Smoke-test the SQL locally.**

```bash
docker run -d --name v2-sql-test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=tbdc_poc_test -p 15433:5432 postgres:15
export DATABASE_URL="postgresql://postgres:test@localhost:15433/tbdc_poc_test"
npx prisma migrate deploy
npx prisma db seed

# Run the SQL file with a placeholder password
PGPASSWORD=test psql -h localhost -p 15433 -U postgres -d tbdc_poc_test \
  -v TBDC_ASSISTANT_PASSWORD="'probe-test-pw'" \
  -f prisma/migrations/manual/v2_roles_and_grants.sql
```

Expected: SQL runs without errors. All GRANTs succeed.

- [ ] **Step 3: Verify the role has the expected access pattern.**

```bash
# Try to SELECT passwordHash as tbdc_assistant — should fail
PGPASSWORD=probe-test-pw psql -h localhost -p 15433 -U tbdc_assistant -d tbdc_poc_test \
  -c 'SELECT "passwordHash" FROM "User" LIMIT 1;'
# Expected: ERROR: permission denied for table User

# Try to SELECT from v_user_public — should succeed
PGPASSWORD=probe-test-pw psql -h localhost -p 15433 -U tbdc_assistant -d tbdc_poc_test \
  -c 'SELECT id, email, role FROM v_user_public LIMIT 3;'
# Expected: 3 rows, no error

# Try to INSERT into Investor — should succeed
PGPASSWORD=probe-test-pw psql -h localhost -p 15433 -U tbdc_assistant -d tbdc_poc_test \
  -c "INSERT INTO \"Investor\" (id, name, type, stage, sectors, \"chequeSize\", geography, \"leadOrFollow\", \"deals12m\", \"notablePortfolio\", \"contactApproach\", \"sortOrder\") VALUES ('test1', 'Test Inv', 'VC', 'Seed', 'AI', '1M', 'NA', 'Lead', '0', '', '', 0) RETURNING id;"
# Expected: returns 'test1'

# Try to DELETE from Investor — should fail
PGPASSWORD=probe-test-pw psql -h localhost -p 15433 -U tbdc_assistant -d tbdc_poc_test \
  -c "DELETE FROM \"Investor\" WHERE id = 'test1';"
# Expected: ERROR: permission denied for table Investor
```

All four expected behaviors must hold. If any fails, fix the SQL file before moving on.

- [ ] **Step 4: Teardown.**

```bash
docker rm -f v2-sql-test
unset DATABASE_URL
```

- [ ] **Step 5: Commit.**

```bash
git add prisma/migrations/manual/v2_roles_and_grants.sql
git commit -m "feat(v2/db): manual SQL for tbdc_assistant role + v_user_public view + grants"
```

**Phase 1 gate:** Before starting Phase 3/4/5, the following must be true:
1. `prisma/schema.prisma` contains AuditLog, ChatSession, UserRole enum, updatedBy tracking
2. `prisma migrate dev` has generated and applied the migration against a test DB without data loss
3. Extended seed creates Assistant user + 35 ChatSessions and is idempotent
4. SQL file grants tbdc_assistant exactly the intended access (verified by the four smoke tests in Task 1.3 Step 3)

---

## Phase 2 — Custom `tbdc-db` skill (parallel with Phase 1 after Task 1.1)

**Purpose:** Build the TypeScript skill that the Assistant uses to read and write the TBDC database. Depends on the Prisma schema shape from Task 1.1.

**Dispatch:** Single subagent runs this phase end-to-end. Internal parallelism is NOT recommended — the tools share `db.ts`, `schema.ts`, and `audit.ts`, and editing them concurrently causes merge conflicts.

**Source-of-truth note:** the skill directory lives at `openclaw-workspace/skills/tbdc-db/` in the repo. On the droplet, it will be **rsynced** from the repo clone into `/root/tbdc-poc/openclaw-workspace/skills/tbdc-db/` during Phase 6 deployment. The repo is authoritative; the droplet copy is a mirror. Never edit the droplet copy directly.

**`clear_dnm` / no-deletes note:** `clear_dnm` is the only write tool that removes a row, and it's intentional. A `DoNotMatch` row is a flag indicating "these two should not be paired," not a content record. Removing a DNM row is semantically an edit ("unflag this pair"), not a content deletion, so it doesn't violate the "no hard deletes of content records" rule. All other write tools are insert/update only.

### Task 2.1 — Skill scaffolding

**Files:**
- Create: `openclaw-workspace/skills/tbdc-db/SKILL.md`
- Create: `openclaw-workspace/skills/tbdc-db/package.json`
- Create: `openclaw-workspace/skills/tbdc-db/tsconfig.json`
- Create: `openclaw-workspace/skills/tbdc-db/tools/db.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/schema.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/audit.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/index.ts`

- [ ] **Step 1: Write `SKILL.md` with the Assistant persona + tool list.**

The manifest has YAML frontmatter plus a Markdown body that is injected as a system-prompt preamble. Full persona text:

```markdown
---
name: tbdc-db
description: Read and write the TBDC portfolio database. Use for any question about investors, companies, matches, methodology, or audit history.
user-invocable: false
metadata:
  openclaw:
    requires:
      env:
        - DATABASE_URL_ASSISTANT
---

# TBDC Investment Analyst

You are an internal investment analyst at the Toronto Business Development Centre (TBDC), supporting the partnerships team. Your job is to help the team match portfolio companies to investors using a weighted 16-point scoring rubric, draft rationales and next steps, and maintain the match database.

## What you know

**The rubric** (16 points total):
- Geography fit (3 pts)
- Stage fit (3 pts)
- Sector fit (3 pts)
- Revenue/traction alignment (2 pts)
- Cheque size fit (2 pts)
- Founder fit (2 pts)
- Portfolio gap fit (1 pt)
- Plus a **hard gate**: if a company's `acceptsInvestorIntros` is false, NO investor matches are allowed — you pivot to customer target analysis instead.

**Tier thresholds:**
- Tier 1: 13–16 points (strong match)
- Tier 2: 8–12 points (speculative)
- Tier 3: 4–7 points (weak)
- Do Not Match: 0–3 points or hard-gate violation

**The WIDMO edge case:** Company `WIDMO Spectral` has `acceptsInvestorIntros = false`. For WIDMO, you never suggest investors. You analyze customer meeting targets and industry events instead.

## How you behave

- Cite scores and rationales. When you say "Acme is a Tier 2 match for Inovia," show the point breakdown.
- Flag uncertainty. If you don't have enough context, say so and ask.
- Before rewriting text someone else just wrote, call `lookup_audit_history` on the row to see what changed and who changed it. This avoids stepping on admin edits.
- Never fabricate investor or company data. Only act on what the tools return.
- Always prefix actions you're about to take: "I'm going to update Acme's next_step to ..." before calling the tool. Transparency matters — admins are reviewing your work live.

## Soft guardrails

These are guidance, not enforcement. The Postgres role can technically do these, but the team asks you to pause and confirm first:

- **Structural changes:** ask before changing `Company.acceptsInvestorIntros` (the WIDMO hard gate) or `MethodologyDimension.maxWeight` (changes scoring math for the whole portfolio).
- **New Do-Not-Match rows:** `set_dnm` is a business relationship decision. Confirm with the admin before creating a new DNM.
- **Emails:** you have no email API. If an admin asks you to "send an intro to Inovia," draft the email text in the chat for the admin to copy and paste. Don't claim you sent anything.
- **User invitations:** you cannot invite new users. Direct the admin to `/admin/users`.

## Tools

You have 10 read tools and 14 write tools. Full schemas are injected by the runtime. Brief summary:

**Reads:** `list_investors`, `get_investor`, `list_companies`, `get_company`, `list_matches`, `get_match`, `list_dnm`, `get_methodology`, `get_team`, `lookup_audit_history`

**Writes:** `update_match`, `create_match`, `update_investor`, `create_investor`, `update_company`, `create_company`, `add_customer_target`, `update_customer_target`, `add_industry_event`, `update_industry_event`, `set_dnm`, `clear_dnm`, `update_methodology_dimension`, `update_methodology_card`

Every write is logged to the `AuditLog` table and one-click revertible by admins. Act with confidence — if you make a mistake, it's recoverable.
```

- [ ] **Step 2: Write `package.json`.**

```json
{
  "name": "tbdc-db-skill",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@prisma/client": "^7.0.0",
    "@prisma/adapter-pg": "^7.0.0",
    "pg": "^8.12.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "@types/pg": "^8.11.0",
    "@types/node": "^20.17.0"
  }
}
```

Exact versions can be bumped — match the versions the TBDC main app already uses where possible (check the root `package.json`).

- [ ] **Step 3: Write `tsconfig.json`.**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "noEmit": true
  },
  "include": ["tools/**/*.ts"]
}
```

- [ ] **Step 4: Write `tools/db.ts` — Prisma client singleton bound to `DATABASE_URL_ASSISTANT`.**

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const url = process.env.DATABASE_URL_ASSISTANT;
if (!url) {
  throw new Error('DATABASE_URL_ASSISTANT env var is required');
}

const adapter = new PrismaPg({ connectionString: url });

// Singleton pattern so hot-reload during dev doesn't leak connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ['warn', 'error'] });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 5: Write `tools/schema.ts` — Zod schemas for tool inputs and shared types.**

```typescript
import { z } from 'zod';

// Shared primitives
export const IdSchema = z.string().min(1);
export const PatchSchema = z.record(z.string(), z.unknown());

// Read tool inputs
export const ListInvestorsInput = z.object({
  stage: z.string().optional(),
  geo: z.string().optional(),
  sector: z.string().optional(),
  leadOnly: z.boolean().optional(),
});

export const GetInvestorInput = z.object({ id: IdSchema });

export const ListCompaniesInput = z.object({
  cohort: z.string().optional(),
  stage: z.string().optional(),
  acceptsInvestorIntros: z.boolean().optional(),
});

export const GetCompanyInput = z.object({ id: IdSchema });

export const ListMatchesInput = z.object({
  companyId: IdSchema.optional(),
  investorId: IdSchema.optional(),
  tier: z.number().int().min(1).max(3).optional(),
  minScore: z.number().int().min(0).max(16).optional(),
  maxScore: z.number().int().min(0).max(16).optional(),
});

export const GetMatchInput = z.object({ matchId: IdSchema });
export const ListDnmInput = z.object({
  companyId: IdSchema.optional(),
  investorId: IdSchema.optional(),
});
export const GetMethodologyInput = z.object({});
export const GetTeamInput = z.object({});
export const LookupAuditHistoryInput = z.object({
  tableName: z.string().min(1),
  rowId: IdSchema,
  limit: z.number().int().min(1).max(100).optional(),
});

// Write tool inputs (condensed — each uses a row-shape Zod schema as .patch)
export const UpdateMatchInput = z.object({ matchId: IdSchema, patch: PatchSchema });
export const CreateMatchInput = z.object({
  companyId: IdSchema,
  investorId: IdSchema,
  initialData: PatchSchema,
});
export const UpdateInvestorInput = z.object({ id: IdSchema, patch: PatchSchema });
export const CreateInvestorInput = z.object({ data: PatchSchema });
export const UpdateCompanyInput = z.object({ id: IdSchema, patch: PatchSchema });
export const CreateCompanyInput = z.object({ data: PatchSchema });
export const AddCustomerTargetInput = z.object({ companyId: IdSchema, data: PatchSchema });
export const UpdateCustomerTargetInput = z.object({ id: IdSchema, patch: PatchSchema });
export const AddIndustryEventInput = z.object({ companyId: IdSchema, data: PatchSchema });
export const UpdateIndustryEventInput = z.object({ id: IdSchema, patch: PatchSchema });
export const SetDnmInput = z.object({
  companyId: IdSchema,
  investorId: IdSchema,
  reason: z.string().min(1),
});
export const ClearDnmInput = z.object({
  companyId: IdSchema,
  investorId: IdSchema,
});
export const UpdateMethodologyDimensionInput = z.object({ id: IdSchema, patch: PatchSchema });
export const UpdateMethodologyCardInput = z.object({ id: IdSchema, patch: PatchSchema });

// Shared error shape for all tools
export class ToolError extends Error {
  constructor(
    public code: 'validation' | 'not_found' | 'forbidden' | 'missing_metadata' | 'db_error',
    message: string,
  ) {
    super(message);
    this.name = 'ToolError';
  }
}
```

- [ ] **Step 6: Write `tools/audit.ts` — audit log helper with metadata enforcement.**

```typescript
import { prisma } from './db.js';
import { ToolError } from './schema.js';

export interface ToolContext {
  metadata?: {
    actingUserId?: string;
    chatSessionId?: string;
  };
}

export async function getActingUserId(ctx: ToolContext): Promise<string> {
  const id = ctx.metadata?.actingUserId;
  if (!id) {
    throw new ToolError(
      'missing_metadata',
      'No actingUserId in message metadata — refusing write. ' +
      'This indicates a chat-pane misconfiguration; escalate.',
    );
  }
  return id;
}

export function getChatSessionId(ctx: ToolContext): string | null {
  return ctx.metadata?.chatSessionId ?? null;
}

const ASSISTANT_USER_ID_CACHE: { id?: string } = {};

async function getAssistantUserId(): Promise<string> {
  if (ASSISTANT_USER_ID_CACHE.id) return ASSISTANT_USER_ID_CACHE.id;
  const user = await prisma.user.findUnique({
    where: { email: process.env.ASSISTANT_USER_EMAIL ?? 'assistant@tbdc.ready4vc.com' },
    select: { id: true },
  });
  if (!user) {
    throw new ToolError('db_error', 'Assistant user row missing from DB — seed not run?');
  }
  ASSISTANT_USER_ID_CACHE.id = user.id;
  return user.id;
}

export interface AuditEntry {
  tableName: string;
  rowId: string;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  operation: 'insert' | 'update' | 'delete';
}

export async function recordAuditEntries(
  ctx: ToolContext,
  entries: AuditEntry[],
): Promise<string[]> {
  const actorUserId = await getAssistantUserId();
  const onBehalfOfUserId = await getActingUserId(ctx);
  const chatSessionId = getChatSessionId(ctx);

  const created = await prisma.$transaction(
    entries.map(e =>
      prisma.auditLog.create({
        data: {
          actorUserId,
          onBehalfOfUserId,
          tableName: e.tableName,
          rowId: e.rowId,
          field: e.field,
          oldValueJson: e.oldValue === undefined ? null : (e.oldValue as any),
          newValueJson: e.newValue === undefined ? null : (e.newValue as any),
          operation: e.operation,
          chatSessionId,
        },
        select: { id: true },
      }),
    ),
  );
  return created.map(c => c.id);
}

/**
 * Diff two objects and return field-level audit entries.
 * Only includes fields where oldRow[k] !== newRow[k].
 */
export function diffRow(
  tableName: string,
  rowId: string,
  oldRow: Record<string, unknown>,
  newRow: Record<string, unknown>,
): AuditEntry[] {
  const entries: AuditEntry[] = [];
  const keys = new Set([...Object.keys(oldRow), ...Object.keys(newRow)]);
  for (const k of keys) {
    if (oldRow[k] !== newRow[k]) {
      entries.push({
        tableName,
        rowId,
        field: k,
        oldValue: oldRow[k],
        newValue: newRow[k],
        operation: 'update',
      });
    }
  }
  return entries;
}

export async function updateLastMessageAt(chatSessionId: string | null): Promise<void> {
  if (!chatSessionId) return;
  await prisma.chatSession.updateMany({
    where: { openclawSessionId: chatSessionId },
    data: { lastMessageAt: new Date() },
  });
}
```

- [ ] **Step 7: Write a stub `tools/index.ts` that will be filled by Tasks 2.2 + 2.3.**

```typescript
// Tool registry — populated by Tasks 2.2 (reads) and 2.3 (writes).
// Each entry maps a tool name to a { description, parameters, handler } shape
// that OpenClaw's skill runtime consumes.

export const tools: Record<string, unknown> = {};

// Import order matters for side effects — each tool file registers itself.
import './reads/index.js';
import './writes/index.js';

export default tools;
```

Create empty `tools/reads/index.ts` and `tools/writes/index.ts` files so the imports don't fail:

```typescript
// tools/reads/index.ts — populated by Task 2.2
```

```typescript
// tools/writes/index.ts — populated by Task 2.3
```

- [ ] **Step 8: Install deps.**

```bash
cd openclaw-workspace/skills/tbdc-db
npm install
```

Expected: clean install.

- [ ] **Step 9: Verify the scaffolding compiles.**

```bash
npx tsc --noEmit
```

Expected: no errors. (Zod schemas for the `PatchSchema` field-level validators will be refined in Tasks 2.2/2.3.)

- [ ] **Step 10: Commit.**

```bash
cd ../../../  # back to repo root
git add openclaw-workspace/skills/tbdc-db/
git commit -m "feat(v2/skill): scaffold tbdc-db skill (SKILL.md, schema, db, audit helpers)"
```

### Task 2.2 — Implement all 10 read tools

**Files:**
- Create: `openclaw-workspace/skills/tbdc-db/tools/reads/list-investors.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/reads/get-investor.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/reads/list-companies.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/reads/get-company.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/reads/list-matches.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/reads/get-match.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/reads/list-dnm.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/reads/get-methodology.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/reads/get-team.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/reads/lookup-audit-history.ts`
- Modify: `openclaw-workspace/skills/tbdc-db/tools/reads/index.ts`
- Create: `openclaw-workspace/skills/tbdc-db/tools/reads/__tests__/list-investors.test.ts` (+ others)

Each read tool follows the same template. The work is mechanical — mostly copy-paste with different Prisma queries.

- [ ] **Step 1: Write the first read tool (`list-investors.ts`) as the reference template.**

```typescript
import { z } from 'zod';
import { prisma } from '../db.js';
import { ListInvestorsInput, ToolError } from '../schema.js';
import { tools } from '../index.js';

tools.list_investors = {
  description:
    'List investors, optionally filtered by stage, geography, sector, or lead-only. Returns ordered by sortOrder.',
  parameters: {
    type: 'object',
    properties: {
      stage: { type: 'string', description: 'Filter by investor stage' },
      geo: { type: 'string', description: 'Filter by geography' },
      sector: { type: 'string', description: 'Filter by sector substring match' },
      leadOnly: { type: 'boolean', description: 'Only include investors willing to lead' },
    },
    required: [],
  },
  handler: async (rawArgs: unknown) => {
    const parse = ListInvestorsInput.safeParse(rawArgs);
    if (!parse.success) {
      throw new ToolError('validation', `Invalid args: ${parse.error.message}`);
    }
    const args = parse.data;

    const where: Record<string, unknown> = {};
    if (args.stage) where.stage = { contains: args.stage, mode: 'insensitive' };
    if (args.geo) where.geography = { contains: args.geo, mode: 'insensitive' };
    if (args.sector) where.sectors = { contains: args.sector, mode: 'insensitive' };
    if (args.leadOnly) where.leadOrFollow = { in: ['Lead', 'Both'] };

    const investors = await prisma.investor.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    return { ok: true, investors };
  },
};
```

- [ ] **Step 2: Write a test for `list_investors`.**

```typescript
// tools/reads/__tests__/list-investors.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { tools } from '../../index.js';
import '../list-investors.js';  // side-effect register

describe('list_investors', () => {
  it('returns all investors when called with no filters', async () => {
    const tool = tools.list_investors as any;
    const result = await tool.handler({});
    expect(result.ok).toBe(true);
    expect(result.investors.length).toBeGreaterThan(0);
  });

  it('filters by geography substring (case-insensitive)', async () => {
    const tool = tools.list_investors as any;
    const result = await tool.handler({ geo: 'canada' });
    expect(result.ok).toBe(true);
    for (const inv of result.investors) {
      expect(inv.geography.toLowerCase()).toContain('canada');
    }
  });

  it('throws ToolError on invalid args', async () => {
    const tool = tools.list_investors as any;
    await expect(tool.handler({ leadOnly: 'not-a-boolean' })).rejects.toThrow(
      /Invalid args/,
    );
  });
});
```

- [ ] **Step 3: Set up test DB fixture for vitest.**

Create `openclaw-workspace/skills/tbdc-db/vitest.setup.ts`:

```typescript
import { beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';

const TEST_CONTAINER = 'tbdc-skill-test-db';
const TEST_PORT = 15434;
const TEST_URL = `postgresql://postgres:test@localhost:${TEST_PORT}/tbdc_poc_test`;

beforeAll(async () => {
  // Spin up disposable Postgres
  try { execSync(`docker rm -f ${TEST_CONTAINER}`, { stdio: 'ignore' }); } catch {}
  execSync(
    `docker run -d --name ${TEST_CONTAINER} -e POSTGRES_PASSWORD=test -e POSTGRES_DB=tbdc_poc_test -p ${TEST_PORT}:5432 postgres:15`,
    { stdio: 'inherit' },
  );
  // Wait for postgres to accept connections
  for (let i = 0; i < 30; i++) {
    try {
      execSync(`docker exec ${TEST_CONTAINER} pg_isready -U postgres`, { stdio: 'ignore' });
      break;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  // Apply migrations from the main repo
  execSync(`cd ../../../ && DATABASE_URL=${TEST_URL} npx prisma migrate deploy`, {
    stdio: 'inherit',
  });
  // Seed
  execSync(`cd ../../../ && DATABASE_URL=${TEST_URL} npx prisma db seed`, {
    stdio: 'inherit',
  });
  // Set the env var the skill reads
  process.env.DATABASE_URL_ASSISTANT = TEST_URL;
  process.env.ASSISTANT_USER_EMAIL = 'assistant@tbdc.ready4vc.com';
}, 120_000);

afterAll(() => {
  try { execSync(`docker rm -f ${TEST_CONTAINER}`, { stdio: 'ignore' }); } catch {}
});
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run --setup-files vitest.setup.ts"
  }
}
```

- [ ] **Step 4: Run the first test and verify it passes.**

```bash
cd openclaw-workspace/skills/tbdc-db
npm test
```

Expected: `list_investors` tests pass. If Prisma can't find the schema, make sure the skill's `db.ts` is pointing at the right DATABASE_URL (it reads `process.env.DATABASE_URL_ASSISTANT` which the setup file populates).

- [ ] **Step 5: Implement the remaining 9 read tools following the same pattern.**

Each tool is ~30-50 lines. Write the implementation, write a 2-3 test vitest file, run tests. Template for a "get one" tool:

```typescript
// Example: get-company.ts
import { prisma } from '../db.js';
import { GetCompanyInput, ToolError } from '../schema.js';
import { tools } from '../index.js';

tools.get_company = {
  description:
    'Get a single company with all its matches, DNM entries, customer targets, and events.',
  parameters: {
    type: 'object',
    properties: { id: { type: 'string' } },
    required: ['id'],
  },
  handler: async (rawArgs: unknown) => {
    const parse = GetCompanyInput.safeParse(rawArgs);
    if (!parse.success) throw new ToolError('validation', parse.error.message);
    const company = await prisma.company.findUnique({
      where: { id: parse.data.id },
      include: {
        matches: { include: { investor: true }, orderBy: { sortOrder: 'asc' } },
        doNotMatches: { include: { investor: true } },
        customerTargets: { orderBy: { sortOrder: 'asc' } },
        events: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!company) throw new ToolError('not_found', `Company ${parse.data.id} not found`);
    return { ok: true, company };
  },
};
```

Follow this shape for: `get_investor`, `list_companies`, `get_company`, `list_matches`, `get_match`, `list_dnm`, `get_methodology` (returns `{ dimensions: [...], cards: [...] }`), `get_team` (uses `v_user_public` via raw query if Prisma doesn't map views, else direct SELECT), `lookup_audit_history`.

For `get_team`, since Prisma doesn't auto-model DB views, use:

```typescript
const users = await prisma.$queryRaw`
  SELECT id, name, email, role FROM v_user_public ORDER BY email
`;
```

For `lookup_audit_history`:

```typescript
const entries = await prisma.auditLog.findMany({
  where: { tableName: parse.data.tableName, rowId: parse.data.rowId },
  orderBy: { createdAt: 'desc' },
  take: parse.data.limit ?? 20,
  include: { actor: { select: { name: true, email: true, role: true } } },
});
```

- [ ] **Step 6: Update `tools/reads/index.ts` to import all 10 files.**

```typescript
import './list-investors.js';
import './get-investor.js';
import './list-companies.js';
import './get-company.js';
import './list-matches.js';
import './get-match.js';
import './list-dnm.js';
import './get-methodology.js';
import './get-team.js';
import './lookup-audit-history.js';
```

- [ ] **Step 7: Run all read-tool tests together.**

```bash
cd openclaw-workspace/skills/tbdc-db
npm test -- reads
```

Expected: all read-tool tests pass.

- [ ] **Step 8: Commit.**

```bash
cd ../../../
git add openclaw-workspace/skills/tbdc-db/tools/reads/
git add openclaw-workspace/skills/tbdc-db/vitest.setup.ts
git add openclaw-workspace/skills/tbdc-db/package.json
git commit -m "feat(v2/skill): 10 read tools + vitest harness against disposable Postgres"
```

### Task 2.3 — Implement all 14 write tools

**Files:**
- Create: `openclaw-workspace/skills/tbdc-db/tools/writes/update-match.ts`
- Create: ... (14 files total, one per tool)
- Create: `openclaw-workspace/skills/tbdc-db/tools/writes/index.ts`
- Create: corresponding `__tests__` files

- [ ] **Step 1: Write `update_match` as the template write tool.**

```typescript
// tools/writes/update-match.ts
import { prisma } from '../db.js';
import { UpdateMatchInput, ToolError } from '../schema.js';
import {
  ToolContext,
  getActingUserId,
  recordAuditEntries,
  diffRow,
  updateLastMessageAt,
  getChatSessionId,
} from '../audit.js';
import { tools } from '../index.js';

const EDITABLE_MATCH_FIELDS = new Set([
  'tier', 'score', 'geoPts', 'stagePts', 'sectorPts', 'revenuePts',
  'chequePts', 'founderPts', 'gapPts', 'warmPath', 'portfolioGap',
  'rationale', 'nextStep', 'sortOrder',
]);

tools.update_match = {
  description:
    'Update one or more fields on a Match row. Pass { matchId, patch: { field: newValue, ... } }. ' +
    'Only editable fields (tier, score, per-dimension points, warmPath, portfolioGap, rationale, nextStep, sortOrder) are accepted.',
  parameters: {
    type: 'object',
    properties: {
      matchId: { type: 'string' },
      patch: { type: 'object' },
    },
    required: ['matchId', 'patch'],
  },
  handler: async (rawArgs: unknown, ctx: ToolContext) => {
    const parse = UpdateMatchInput.safeParse(rawArgs);
    if (!parse.success) throw new ToolError('validation', parse.error.message);
    const { matchId, patch } = parse.data;

    // Filter patch to only editable fields
    const safePatch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (EDITABLE_MATCH_FIELDS.has(k)) safePatch[k] = v;
    }
    if (Object.keys(safePatch).length === 0) {
      throw new ToolError('validation', 'No editable fields in patch');
    }

    const actingUserId = await getActingUserId(ctx);

    const before = await prisma.match.findUnique({ where: { id: matchId } });
    if (!before) throw new ToolError('not_found', `Match ${matchId} not found`);

    const after = await prisma.match.update({
      where: { id: matchId },
      data: { ...safePatch, updatedByUserId: actingUserId },
    });

    const auditEntries = diffRow(
      'Match',
      matchId,
      before as unknown as Record<string, unknown>,
      after as unknown as Record<string, unknown>,
    );
    const auditIds = await recordAuditEntries(ctx, auditEntries);
    await updateLastMessageAt(getChatSessionId(ctx));

    return {
      ok: true,
      match: after,
      auditIds,
      summary: `Updated Match ${matchId}: ${auditEntries.map(e => e.field).join(', ')}`,
    };
  },
};
```

- [ ] **Step 2: Test for `update_match`.**

```typescript
// tools/writes/__tests__/update-match.test.ts
import { describe, it, expect } from 'vitest';
import { tools } from '../../index.js';
import '../update-match.js';
import { prisma } from '../../db.js';

describe('update_match', () => {
  const ctx = { metadata: { actingUserId: '', chatSessionId: 'tbdc-general' } };

  beforeAll(async () => {
    // Pick one admin to be the on-behalf-of for all tests
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    ctx.metadata.actingUserId = admin!.id;
  });

  it('updates a single field and creates an audit log entry', async () => {
    const match = await prisma.match.findFirst();
    const tool = tools.update_match as any;
    const result = await tool.handler(
      { matchId: match!.id, patch: { rationale: 'Updated by test' } },
      ctx,
    );
    expect(result.ok).toBe(true);
    expect(result.auditIds.length).toBe(1);
    const log = await prisma.auditLog.findUnique({ where: { id: result.auditIds[0] } });
    expect(log?.field).toBe('rationale');
    expect(log?.onBehalfOfUserId).toBe(ctx.metadata.actingUserId);
  });

  it('rejects writes if actingUserId is missing from metadata', async () => {
    const match = await prisma.match.findFirst();
    const tool = tools.update_match as any;
    await expect(
      tool.handler({ matchId: match!.id, patch: { rationale: 'anon' } }, { metadata: {} }),
    ).rejects.toThrow(/actingUserId/);
  });

  it('ignores non-editable fields in patch', async () => {
    const match = await prisma.match.findFirst();
    const tool = tools.update_match as any;
    await expect(
      tool.handler({ matchId: match!.id, patch: { id: 'evil-id' } }, ctx),
    ).rejects.toThrow(/No editable fields/);
  });
});
```

- [ ] **Step 3: Implement the remaining 13 write tools using the same template.**

The remaining tools follow nearly identical patterns. Key variations:

- **Create tools** (`create_match`, `create_investor`, `create_company`, `add_customer_target`, `add_industry_event`): call `prisma.<model>.create(...)` instead of `update(...)`, and emit one audit entry per created row with `operation: 'insert'` and `oldValue: null`.
- **set_dnm**: use `prisma.doNotMatch.upsert(...)` — if an existing row exists it becomes an update, otherwise an insert. Audit captures the operation type.
- **clear_dnm**: `prisma.doNotMatch.delete(...)` with `operation: 'delete'` in the audit entry. This is the one exception to "no deletes" — a DNM row is a flag, not content, so removing it is semantically an edit.
- **update_methodology_dimension / update_methodology_card / update_investor / update_company / update_customer_target / update_industry_event**: same shape as `update_match` with different allowlists.
- **Soft-guarded fields** (`Company.acceptsInvestorIntros`, `MethodologyDimension.maxWeight`) are still in the allowlist — the SKILL.md prompt tells the LLM to ask first, but the tool doesn't refuse the write.

For each, write the handler + a test covering: happy path, missing metadata, validation error.

- [ ] **Step 4: Update `tools/writes/index.ts` to import all 14 files.**

```typescript
import './update-match.js';
import './create-match.js';
import './update-investor.js';
import './create-investor.js';
import './update-company.js';
import './create-company.js';
import './add-customer-target.js';
import './update-customer-target.js';
import './add-industry-event.js';
import './update-industry-event.js';
import './set-dnm.js';
import './clear-dnm.js';
import './update-methodology-dimension.js';
import './update-methodology-card.js';
```

- [ ] **Step 5: Run all tests.**

```bash
cd openclaw-workspace/skills/tbdc-db
npm test
```

Expected: all 10 read + 14 write tool tests pass. If any fail, fix before committing.

- [ ] **Step 6: Typecheck.**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit.**

```bash
cd ../../../
git add openclaw-workspace/skills/tbdc-db/tools/writes/
git commit -m "feat(v2/skill): 14 write tools with audit log + metadata enforcement"
```

**Phase 2 gate:** Before starting Phase 3/4/5, the following must be true:
1. All 24 tool files exist and export their tool registration
2. All vitest tests pass against a disposable Postgres seeded with v1 data
3. `npx tsc --noEmit` is clean
4. `audit.ts` enforces `actingUserId` presence — no anonymous writes possible

---

## Phase 3 — Chat pane UI (parallel with Phase 4 + Phase 5 after Phases 1 + 2)

**Purpose:** Build the `/analyst` page, the WebSocket route handler, and the chat UI components.

**Dispatch:** Single subagent runs this phase end-to-end. UI components are interdependent.

### Task 3.1 — Next.js route handler for WebSocket broker

**Files:**
- Create: `src/app/analyst/ws/route.ts`
- Modify: `src/lib/zod/analyst.ts` (new, for payload schemas)
- Create: `src/lib/openclaw-session-jwt.ts`

- [ ] **Step 1: Install `jose` for JWT signing.**

```bash
npm install jose
```

- [ ] **Step 2: Write the JWT signing helper.**

```typescript
// src/lib/openclaw-session-jwt.ts
import { SignJWT, jwtVerify } from 'jose';

const secret = () => {
  const s = process.env.OPENCLAW_SESSION_JWT_SECRET;
  if (!s) throw new Error('OPENCLAW_SESSION_JWT_SECRET env var is required');
  return new TextEncoder().encode(s);
};

export interface OpenClawSessionClaims {
  userId: string;
  openclawSessionId: string;
}

export async function mintOpenClawSessionToken(claims: OpenClawSessionClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(secret());
}

export async function verifyOpenClawSessionToken(token: string): Promise<OpenClawSessionClaims> {
  const { payload } = await jwtVerify(token, secret());
  return payload as unknown as OpenClawSessionClaims;
}
```

- [ ] **Step 3: Write the route handler that proxies the WebSocket upgrade.**

```typescript
// src/app/analyst/ws/route.ts
import { NextRequest } from 'next/server';
import { requireSessionForPage } from '@/lib/guards';
import { mintOpenClawSessionToken } from '@/lib/openclaw-session-jwt';

// Next 16 supports WebSocket upgrades via Route Handlers that return a 101 response.
// The actual WS proxy is handled at the edge of the Node runtime.
// See: https://nextjs.org/docs/app/api-reference/file-conventions/route

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Verify NextAuth session — only logged-in admins can open a WS to OpenClaw
  const session = await requireSessionForPage();
  if (session.user.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }

  const sessionId = req.nextUrl.searchParams.get('session');
  if (!sessionId) {
    return new Response('Missing session param', { status: 400 });
  }

  // Mint a short-lived token that proves the user is who they say they are
  const token = await mintOpenClawSessionToken({
    userId: session.user.id,
    openclawSessionId: sessionId,
  });

  // The browser will open a real WebSocket to wss://tbdc.ready4vc.com/analyst/ws?session=X&token=Y
  // Caddy reverse-proxies to openclaw-gateway:18789. OpenClaw verifies the token via a pre-shared
  // secret (via gateway.auth.mode: "trusted-proxy" or a custom header) before accepting.
  //
  // Since Next.js Route Handlers don't natively proxy WS, the browser connects directly through
  // Caddy to openclaw-gateway. This handler is used for the INITIAL token mint only — the browser
  // calls GET /analyst/ws/token (see below) to get the token, then opens its own WebSocket.

  return Response.json({
    token,
    url: `/analyst/ws/socket?session=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`,
  });
}
```

**Note:** Next.js 16 Route Handlers cannot natively complete a WebSocket upgrade — the WS must be handled by Caddy routing directly to `openclaw-gateway:18789`. This handler instead acts as a **token-minting endpoint**: the browser calls it, receives a short-lived JWT, and then opens its own WebSocket to `/analyst/ws/socket` which Caddy reverse-proxies to OpenClaw. OpenClaw validates the JWT via its `gateway.auth` config.

Split the path in the Caddyfile:

```caddy
handle /analyst/ws/token {
    reverse_proxy tbdc-web:3000
}
handle /analyst/ws/socket {
    reverse_proxy openclaw-gateway:18789
}
```

Update the spec's Caddy snippet mentally and record the change in the commit message.

- [ ] **Step 4: Write a minimal test that the token endpoint returns 401 without a session and 200 with one.**

Since v1 doesn't have Vitest/Jest set up for Next.js routes, use a manual smoke test in a `SMOKE.md` file under `src/app/analyst/ws/` instead — document the curl commands to run against the dev server to verify the endpoint works.

- [ ] **Step 5: Commit.**

```bash
git add src/app/analyst/ws/ src/lib/openclaw-session-jwt.ts package.json package-lock.json
git commit -m "feat(v2/ws): token-minting endpoint for analyst websocket handshake"
```

### Task 3.2 — Chat pane components

**Files:**
- Create: `src/app/(site)/analyst/page.tsx`
- Create: `src/app/(site)/analyst/_components/channel-sidebar.tsx`
- Create: `src/app/(site)/analyst/_components/message-pane.tsx`
- Create: `src/app/(site)/analyst/_components/tool-call-pill.tsx`
- Create: `src/app/(site)/analyst/_components/use-openclaw-ws.ts`
- Modify: `src/components/nav-tabs.tsx` (add "Analyst" tab)

- [ ] **Step 1: Add "Analyst" to the nav tabs.**

Open `src/components/nav-tabs.tsx`, read its current structure, and add a new entry for `/analyst` with label "Analyst". The tab should only appear when `session?.user?.role === 'admin'`.

- [ ] **Step 2: Write the `/analyst` page as a server component.**

```tsx
// src/app/(site)/analyst/page.tsx
import { requireSessionForPage } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { ChannelSidebar } from './_components/channel-sidebar';
import { MessagePane } from './_components/message-pane';

export default async function AnalystPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const session = await requireSessionForPage();
  if (session.user.role !== 'admin') {
    throw new Error('Forbidden');
  }

  const params = await searchParams;
  const activeSessionId = params.session ?? 'tbdc-general';

  const channels = await prisma.chatSession.findMany({
    orderBy: [{ scopeType: 'asc' }, { displayName: 'asc' }],
    select: {
      id: true,
      scopeType: true,
      scopeEntityId: true,
      openclawSessionId: true,
      displayName: true,
      lastMessageAt: true,
    },
  });

  const active = channels.find(c => c.openclawSessionId === activeSessionId) ?? channels[0];

  return (
    <div className="flex h-[calc(100vh-120px)]">
      <ChannelSidebar channels={channels} activeId={active?.openclawSessionId ?? ''} />
      <MessagePane
        key={active?.openclawSessionId}
        openclawSessionId={active?.openclawSessionId ?? ''}
        displayName={active?.displayName ?? ''}
        currentUserId={session.user.id}
        currentUserName={session.user.name ?? session.user.email ?? 'User'}
      />
    </div>
  );
}
```

- [ ] **Step 3: Write the `ChannelSidebar` client component.**

```tsx
// src/app/(site)/analyst/_components/channel-sidebar.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';

type Channel = {
  id: string;
  scopeType: 'company' | 'investor' | 'general';
  openclawSessionId: string;
  displayName: string;
  lastMessageAt: Date | null;
};

export function ChannelSidebar({
  channels,
  activeId,
}: {
  channels: Channel[];
  activeId: string;
}) {
  const general = channels.filter(c => c.scopeType === 'general');
  const companies = channels.filter(c => c.scopeType === 'company');
  const investors = channels.filter(c => c.scopeType === 'investor');

  const [companiesOpen, setCompaniesOpen] = useState(true);
  const [investorsOpen, setInvestorsOpen] = useState(false);

  const ChannelLink = (c: Channel) => (
    <Link
      key={c.id}
      href={`/analyst?session=${encodeURIComponent(c.openclawSessionId)}`}
      className={`block px-3 py-1.5 text-sm rounded transition-colors ${
        c.openclawSessionId === activeId
          ? 'bg-t1-bg text-text-1 font-medium'
          : 'text-text-2 hover:bg-surface-2'
      }`}
    >
      # {c.displayName}
    </Link>
  );

  return (
    <aside className="w-[280px] flex-shrink-0 border-r border-border bg-surface-2 p-3 overflow-y-auto">
      <div className="space-y-4">
        <div>{general.map(ChannelLink)}</div>

        <div>
          <button
            className="flex items-center gap-2 text-xs font-semibold text-text-3 uppercase tracking-wider mb-2"
            onClick={() => setCompaniesOpen(v => !v)}
          >
            <span>{companiesOpen ? '▾' : '▸'}</span> Companies
          </button>
          {companiesOpen && <div className="space-y-0.5">{companies.map(ChannelLink)}</div>}
        </div>

        <div>
          <button
            className="flex items-center gap-2 text-xs font-semibold text-text-3 uppercase tracking-wider mb-2"
            onClick={() => setInvestorsOpen(v => !v)}
          >
            <span>{investorsOpen ? '▾' : '▸'}</span> Investors
          </button>
          {investorsOpen && <div className="space-y-0.5">{investors.map(ChannelLink)}</div>}
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Write the `useOpenClawWs` hook.**

```tsx
// src/app/(site)/analyst/_components/use-openclaw-ws.ts
'use client';
import { useEffect, useRef, useState } from 'react';

export type ChatMessage = {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  senderName: string;
  content: string;
  timestamp: number;
  toolCalls?: Array<{ id: string; tool: string; summary: string; auditIds?: string[] }>;
};

export type ConnectionState = 'connecting' | 'open' | 'closed' | 'error' | 'rate-limited';

export function useOpenClawWs({
  openclawSessionId,
  currentUserId,
  currentUserName,
}: {
  openclawSessionId: string;
  currentUserId: string;
  currentUserName: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<ConnectionState>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | null = null;

    async function connect() {
      // 1. Get a token from the Next.js route handler
      const tokenRes = await fetch(
        `/analyst/ws/token?session=${encodeURIComponent(openclawSessionId)}`,
      );
      if (!tokenRes.ok) {
        setState('error');
        return;
      }
      const { url } = await tokenRes.json();
      if (cancelled) return;

      // 2. Open the WebSocket to the proxied OpenClaw endpoint
      ws = new WebSocket(`wss://${window.location.host}${url}`);
      wsRef.current = ws;

      ws.onopen = () => setState('open');
      ws.onerror = () => setState('error');
      ws.onclose = () => setState('closed');

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          // Expected shape from OpenClaw: { type: "message" | "tool_call" | "rate_limit" | ..., payload: ... }
          if (msg.type === 'message') {
            setMessages(prev => [
              ...prev,
              {
                id: msg.payload.id,
                sender: msg.payload.role === 'user' ? 'user' : 'assistant',
                senderName: msg.payload.senderName ?? 'Assistant',
                content: msg.payload.content,
                timestamp: msg.payload.timestamp ?? Date.now(),
                toolCalls: msg.payload.toolCalls,
              },
            ]);
          } else if (msg.type === 'rate_limit') {
            setState('rate-limited');
          } else if (msg.type === 'system') {
            setMessages(prev => [
              ...prev,
              {
                id: `sys-${Date.now()}`,
                sender: 'system',
                senderName: 'System',
                content: msg.payload.content,
                timestamp: Date.now(),
              },
            ]);
          }
        } catch (e) {
          console.error('ws parse error', e);
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
      ws?.close();
    };
  }, [openclawSessionId]);

  const sendMessage = (content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const payload = {
      type: 'message',
      payload: {
        content,
        metadata: {
          actingUserId: currentUserId,
          chatSessionId: openclawSessionId,
          senderName: currentUserName,
        },
      },
    };
    wsRef.current.send(JSON.stringify(payload));
    // Optimistically render the user's message
    setMessages(prev => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        sender: 'user',
        senderName: currentUserName,
        content,
        timestamp: Date.now(),
      },
    ]);
  };

  return { messages, state, sendMessage };
}
```

- [ ] **Step 5: Write the `ToolCallPill` component.**

```tsx
// src/app/(site)/analyst/_components/tool-call-pill.tsx
'use client';
import Link from 'next/link';

export function ToolCallPill({
  tool,
  summary,
  auditIds,
}: {
  tool: string;
  summary: string;
  auditIds?: string[];
}) {
  const isWrite = !tool.startsWith('list_') && !tool.startsWith('get_') && !tool.startsWith('lookup_');
  const icon = isWrite ? '✎' : '🔍';

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${
        isWrite
          ? 'bg-t1-bg text-text-1 border border-t1-bdr'
          : 'bg-surface-3 text-text-3'
      }`}
    >
      <span>{icon}</span>
      <span>{summary}</span>
    </span>
  );

  if (isWrite && auditIds?.[0]) {
    return <Link href={`/admin/audit?entry=${auditIds[0]}`}>{content}</Link>;
  }
  return content;
}
```

- [ ] **Step 6: Write the `MessagePane` component.**

```tsx
// src/app/(site)/analyst/_components/message-pane.tsx
'use client';
import { useRef, useState, useEffect } from 'react';
import { useOpenClawWs } from './use-openclaw-ws';
import { ToolCallPill } from './tool-call-pill';

export function MessagePane({
  openclawSessionId,
  displayName,
  currentUserId,
  currentUserName,
}: {
  openclawSessionId: string;
  displayName: string;
  currentUserId: string;
  currentUserName: string;
}) {
  const { messages, state, sendMessage } = useOpenClawWs({
    openclawSessionId,
    currentUserId,
    currentUserName,
  });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || state !== 'open') return;
    sendMessage(input);
    setInput('');
  };

  return (
    <main className="flex-1 flex flex-col">
      <div className="px-6 py-3 border-b border-border bg-surface-2">
        <h2 className="font-serif text-lg text-text-1"># {displayName}</h2>
        {state === 'rate-limited' && (
          <p className="text-xs text-warn-fg mt-1">
            Assistant is queued by provider, response may be delayed
          </p>
        )}
        {(state === 'closed' || state === 'error') && (
          <p className="text-xs text-warn-fg mt-1">
            Disconnected — {state === 'error' ? 'connection error' : 'connection closed'}
          </p>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && state === 'open' && (
          <p className="text-sm text-text-3 italic">
            Start a conversation about {displayName}. The Assistant knows the full match history
            and can read or edit the database.
          </p>
        )}
        {messages.map(m => (
          <div key={m.id} className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-semibold text-sm text-text-1">{m.senderName}</span>
              <span className="text-xs text-text-3">
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-sm text-text-2 whitespace-pre-wrap">{m.content}</div>
            {m.toolCalls && m.toolCalls.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {m.toolCalls.map(tc => (
                  <ToolCallPill
                    key={tc.id}
                    tool={tc.tool}
                    summary={tc.summary}
                    auditIds={tc.auditIds}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-3 border-t border-border bg-surface-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={state === 'open' ? 'Type a message to the Assistant…' : 'Connecting…'}
          disabled={state !== 'open'}
          className="w-full px-3 py-2 rounded border border-border bg-surface-1 text-sm text-text-1 disabled:opacity-50"
        />
      </form>
    </main>
  );
}
```

- [ ] **Step 7: Run `npm run build` to verify everything compiles.**

```bash
npm run build
```

Expected: clean build, no TypeScript errors. The build may warn that `/analyst` is a dynamic route (because it uses auth) — that's fine.

- [ ] **Step 8: Manual smoke test in dev.**

```bash
npm run dev
```

Navigate to `http://localhost:3000/analyst` (after logging in). Expected: the channel sidebar renders with `#general` + companies + investors; clicking a channel updates the URL and loads the message pane with a "Disconnected — connection error" banner (because OpenClaw isn't running locally yet — we'll fix that in Phase 5).

- [ ] **Step 9: Commit.**

```bash
git add src/app/\(site\)/analyst/ src/components/nav-tabs.tsx
git commit -m "feat(v2/ui): analyst page with channel sidebar + message pane + WS hook"
```

**Phase 3 gate:** `npm run build` passes, dev server renders `/analyst` page, channel sidebar loads from DB, WebSocket attempts connection (fails gracefully because OpenClaw isn't up yet).

---

## Phase 4 — Audit log admin page (parallel with Phase 3 + Phase 5)

**Purpose:** Build the `/admin/audit` page so admins can browse Assistant + admin writes and one-click-revert any change.

**Dispatch:** Single subagent.

### Task 4.1 — Audit log list page + revert action

**Files:**
- Create: `src/app/(site)/admin/audit/page.tsx`
- Create: `src/app/(site)/admin/audit/_actions.ts`
- Create: `src/app/(site)/admin/audit/_components/audit-row.tsx`
- Create: `src/lib/zod/audit.ts`
- Modify: `src/components/nav-tabs.tsx` or admin-side nav (add link to audit page if the admin nav exists as a separate component)

- [ ] **Step 1: Write the Zod schemas.**

```typescript
// src/lib/zod/audit.ts
import { z } from 'zod';

export const RevertAuditEntryInput = z.object({
  auditId: z.string().min(1),
});
```

- [ ] **Step 2: Write the revert server action.**

```typescript
// src/app/(site)/admin/audit/_actions.ts
'use server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guards';
import { RevertAuditEntryInput } from '@/lib/zod/audit';
import { revalidatePath } from 'next/cache';

const WRITABLE_TABLES: Record<string, string> = {
  Investor: 'investor',
  Company: 'company',
  Match: 'match',
  DoNotMatch: 'doNotMatch',
  CustomerTarget: 'customerTarget',
  IndustryEvent: 'industryEvent',
  MethodologyDimension: 'methodologyDimension',
  MethodologyCard: 'methodologyCard',
};

export async function revertAuditEntry(raw: unknown) {
  const session = await requireAdmin();
  const parse = RevertAuditEntryInput.safeParse(raw);
  if (!parse.success) return { ok: false, error: parse.error.message };

  const entry = await prisma.auditLog.findUnique({ where: { id: parse.data.auditId } });
  if (!entry) return { ok: false, error: 'Audit entry not found' };
  if (entry.revertedByAuditId) return { ok: false, error: 'Already reverted' };

  const delegate = WRITABLE_TABLES[entry.tableName];
  if (!delegate) return { ok: false, error: `Table ${entry.tableName} not revertible` };

  // Revert: apply oldValueJson to the field
  if (entry.operation !== 'update' || !entry.field) {
    return { ok: false, error: 'Only field updates are revertible in v2.0' };
  }

  // Read the "before" row state for audit diff
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelDelegate = (prisma as any)[delegate];
  const before = await modelDelegate.findUnique({ where: { id: entry.rowId } });
  if (!before) return { ok: false, error: 'Target row no longer exists' };

  const patch: Record<string, unknown> = { [entry.field]: entry.oldValueJson };
  patch.updatedByUserId = session.user.id;

  const after = await modelDelegate.update({ where: { id: entry.rowId }, data: patch });

  // Log the revert as a new audit entry attributed to the admin
  const newAudit = await prisma.auditLog.create({
    data: {
      actorUserId: session.user.id,
      onBehalfOfUserId: null,
      tableName: entry.tableName,
      rowId: entry.rowId,
      field: entry.field,
      oldValueJson: entry.newValueJson,  // what it was before revert
      newValueJson: entry.oldValueJson,  // what it is now
      operation: 'update',
      chatSessionId: null,
    },
  });

  // Mark the original entry as reverted
  await prisma.auditLog.update({
    where: { id: entry.id },
    data: { revertedByAuditId: newAudit.id },
  });

  revalidatePath('/admin/audit');
  return { ok: true, newAuditId: newAudit.id };
}
```

- [ ] **Step 3: Write the audit list page.**

```tsx
// src/app/(site)/admin/audit/page.tsx
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guards';
import { AuditRow } from './_components/audit-row';

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string; actor?: string; table?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const where: Record<string, unknown> = {};
  if (params.entry) where.id = params.entry;
  if (params.actor) where.actorUserId = params.actor;
  if (params.table) where.tableName = params.table;

  const entries = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      actor: { select: { id: true, name: true, email: true, role: true } },
      onBehalfOf: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      <h1 className="font-serif text-2xl text-text-1 mb-4">Audit Log</h1>
      <p className="text-sm text-text-3 mb-6">
        Every write to the database by admins and the Assistant. Click Revert to undo any change.
      </p>
      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-sm text-text-3">No audit entries match the filter.</p>
        )}
        {entries.map(e => (
          <AuditRow key={e.id} entry={e} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write the `AuditRow` component with a revert button.**

```tsx
// src/app/(site)/admin/audit/_components/audit-row.tsx
'use client';
import { useTransition } from 'react';
import { revertAuditEntry } from '../_actions';

type Entry = {
  id: string;
  tableName: string;
  rowId: string;
  field: string | null;
  oldValueJson: unknown;
  newValueJson: unknown;
  operation: string;
  createdAt: Date;
  revertedByAuditId: string | null;
  actor: { id: string; name: string | null; email: string; role: string };
  onBehalfOf: { id: string; name: string | null; email: string } | null;
};

export function AuditRow({ entry }: { entry: Entry }) {
  const [pending, startTransition] = useTransition();

  const handleRevert = () => {
    if (!confirm('Revert this change?')) return;
    startTransition(async () => {
      const result = await revertAuditEntry({ auditId: entry.id });
      if (!result.ok) alert(`Revert failed: ${result.error}`);
    });
  };

  const isReverted = !!entry.revertedByAuditId;
  const actorLabel = entry.actor.role === 'assistant'
    ? `Assistant${entry.onBehalfOf ? ` (on behalf of ${entry.onBehalfOf.name ?? entry.onBehalfOf.email})` : ''}`
    : (entry.actor.name ?? entry.actor.email);

  return (
    <div className={`p-3 rounded border border-border bg-surface-2 ${isReverted ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-3">
            {new Date(entry.createdAt).toLocaleString()} · {actorLabel}
          </div>
          <div className="text-sm text-text-1 mt-1">
            <span className="font-mono">{entry.tableName}.{entry.field ?? '*'}</span>
            {' '}<span className="text-text-3">({entry.rowId.slice(0, 8)})</span>
          </div>
          <div className="text-xs text-text-2 mt-1 font-mono truncate">
            {JSON.stringify(entry.oldValueJson)} → {JSON.stringify(entry.newValueJson)}
          </div>
          {isReverted && (
            <div className="text-xs text-warn-fg mt-1">Reverted</div>
          )}
        </div>
        {!isReverted && entry.operation === 'update' && (
          <button
            onClick={handleRevert}
            disabled={pending}
            className="px-3 py-1 text-xs rounded border border-warn-bdr bg-warn-bg text-warn-fg hover:bg-warn-bg-hover disabled:opacity-50"
          >
            {pending ? 'Reverting…' : 'Revert'}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run `npm run build` + dev smoke test.**

```bash
npm run build
npm run dev
# visit /admin/audit and verify it loads (empty list is fine at this point)
```

- [ ] **Step 6: Commit.**

```bash
git add src/app/\(site\)/admin/audit/ src/lib/zod/audit.ts
git commit -m "feat(v2/audit): admin audit log page with one-click revert"
```

**Phase 4 gate:** `/admin/audit` renders, empty state shown when no entries, revert action compiles but is untestable until Phase 5 creates real audit entries through the skill.

---

## Phase 5 — Local dev docker-compose (parallel with Phase 3 + Phase 4)

**Purpose:** A local development stack that runs `tbdc-web` + `openclaw-gateway` + Postgres together, so the full chat loop can be exercised before touching the droplet.

**Dispatch:** Single subagent.

### Task 5.1 — Local dev compose file

**Files:**
- Create: `deploy/docker-compose-dev.yml`
- Create: `deploy/dev-openclaw.json` (dev version of the gateway config)
- Create: `deploy/README-dev.md`

- [ ] **Step 1: Write `deploy/docker-compose-dev.yml`.**

```yaml
services:
  postgres:
    image: postgres:15
    container_name: tbdc-dev-pg
    ports:
      - "15432:5432"
    environment:
      POSTGRES_PASSWORD: devpw
      POSTGRES_DB: tbdc_poc_dev
    volumes:
      - tbdc-dev-pg:/var/lib/postgresql/data

  openclaw-gateway:
    image: ghcr.io/openclaw/openclaw:${OPENCLAW_TAG:?set OPENCLAW_TAG to the pinned version}
    container_name: tbdc-dev-openclaw
    depends_on:
      - postgres
    ports:
      - "18789:18789"
    volumes:
      - ./dev-openclaw.json:/home/node/.openclaw/openclaw.json:ro
      - ../openclaw-workspace:/home/node/.openclaw/workspace
    environment:
      OPENCLAW_HOME: /home/node/.openclaw
      DATABASE_URL_ASSISTANT: postgresql://tbdc_assistant:devpw@postgres:5432/tbdc_poc_dev
      ASSISTANT_USER_EMAIL: assistant@tbdc.ready4vc.com
      # ZAI_API_KEY intentionally unset in dev — the gateway will boot without it
      # and respond with a rate-limit-style error on any actual model call.
      # This is expected; full smoke testing happens on the droplet after Korayem session.

volumes:
  tbdc-dev-pg:
```

- [ ] **Step 2: Write `deploy/dev-openclaw.json`.**

```json
{
  "gateway": {
    "host": "0.0.0.0",
    "port": 18789,
    "controlUi": {
      "basePath": "/",
      "allowedOrigins": ["http://localhost:18789", "http://localhost:3000"]
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
    "tbdc-db": {
      "enabled": true,
      "path": "./workspace/skills/tbdc-db"
    }
  },
  "channels": {
    "webchat": { "enabled": true }
  }
}
```

- [ ] **Step 3: Write `deploy/README-dev.md`.**

```markdown
# Local dev for TBDC POC v2.0

Brings up Postgres + OpenClaw gateway locally. The Next.js app runs on the host via `npm run dev` and connects to both.

## Prerequisites

- Docker running
- `OPENCLAW_TAG` env var set to the pinned tag from `deploy/openclaw-version.txt`
- v1 Prisma migrations applied + v1 seed run against the dev DB

## First run

```bash
export OPENCLAW_TAG=$(cat deploy/openclaw-version.txt)
cd deploy
docker compose -f docker-compose-dev.yml up -d postgres

# Apply v1 migrations + v2 migrations to dev DB
export DATABASE_URL="postgresql://postgres:devpw@localhost:15432/tbdc_poc_dev"
cd ..
npx prisma migrate deploy
npx prisma db seed

# Create tbdc_assistant role in dev DB
PGPASSWORD=devpw psql -h localhost -p 15432 -U postgres -d tbdc_poc_dev \
  -v TBDC_ASSISTANT_PASSWORD="'devpw'" \
  -f prisma/migrations/manual/v2_roles_and_grants.sql

# Start the gateway
cd deploy
docker compose -f docker-compose-dev.yml up -d openclaw-gateway

# Verify
curl -sI http://localhost:18789/
```

## Run the Next.js app

```bash
# In a separate terminal, from repo root
export DATABASE_URL="postgresql://postgres:devpw@localhost:15432/tbdc_poc_dev"
export DATABASE_URL_ASSISTANT="postgresql://tbdc_assistant:devpw@localhost:15432/tbdc_poc_dev"
export OPENCLAW_SESSION_JWT_SECRET="dev-secret-32-bytes-minimum-xxxxxxxxxxxx"
export OPENCLAW_INTERNAL_URL="http://localhost:18789"
export ASSISTANT_USER_EMAIL="assistant@tbdc.ready4vc.com"
export AUTH_SECRET="dev-auth-secret-32-bytes-xxxxxxxxxxxxxxx"
export AUTH_TRUST_HOST="true"
export BOOTSTRAP_ADMIN_EMAILS="korayem@ready4vc.com,youssry@ready4vc.com"
export BOOTSTRAP_ADMIN_PASSWORD="POC@ready4vc"

npm run dev
```

Open http://localhost:3000, log in as a bootstrap admin, navigate to `/analyst`. The channel sidebar will load. The WebSocket will connect to the local OpenClaw. Sending a message will hit the skill (verifiable in `docker logs tbdc-dev-openclaw`), but the LLM response will fail with a "no API key" error — that's expected in dev.

## Teardown

```bash
cd deploy
docker compose -f docker-compose-dev.yml down -v
```
```

- [ ] **Step 4: Commit.**

```bash
git add deploy/docker-compose-dev.yml deploy/dev-openclaw.json deploy/README-dev.md
git commit -m "feat(v2/dev): local docker-compose + README for end-to-end dev stack"
```

### Task 5.2 — End-to-end local smoke test

- [ ] **Step 1: Follow `deploy/README-dev.md` to bring the full stack up locally.**

- [ ] **Step 2: Verify the skill loads inside the gateway.**

```bash
docker logs tbdc-dev-openclaw 2>&1 | grep -i -E "(tbdc-db|skill loaded|error)"
```

Expected: `tbdc-db` skill loaded message, no errors.

- [ ] **Step 3: Log in to the Next.js app and open `/analyst`.**

Verify:
- Channel sidebar loads with 35 entries (1 general + 10 companies + 24 investors)
- Clicking a channel changes the URL and loads the message pane
- WebSocket connects (green "connected" state or no "disconnected" banner)

- [ ] **Step 4: Attempt to send a message.**

Expected: the message appears in the pane immediately (optimistic render). The Assistant reply fails with an error visible in the gateway logs about the missing ZAI_API_KEY. **This is the expected stop point for local testing.** The error proves the chat pane → gateway → skill → LLM path is wired; only the final LLM call is blocked by the missing key.

- [ ] **Step 5: Write a `SMOKE-DEV.md` recording the exact observed error and confirming the wiring.**

Save to `deploy/SMOKE-DEV.md`:

```markdown
# Local dev smoke test — <date>

## Wiring verified
- [x] Next.js `/analyst` page loads
- [x] Channel sidebar shows 35 channels
- [x] WebSocket handshake completes (token endpoint returns 200, WS state "open")
- [x] Message from chat pane reaches OpenClaw gateway (log entry visible)
- [x] Skill `tbdc-db` is loaded in the gateway
- [x] Skill handler invoked on message (log entry visible)
- [x] Expected failure: LLM call fails with "ZAI_API_KEY not set" or equivalent

## Observed LLM error
<paste actual error message from gateway logs>

## Conclusion
Everything wired correctly. Full end-to-end blocked only on the z.ai API key, which will be configured during the Korayem session.
```

- [ ] **Step 6: Commit the smoke test doc.**

```bash
git add deploy/SMOKE-DEV.md
git commit -m "chore(v2/dev): local smoke test confirms wiring; LLM blocked on key"
```

**Phase 5 gate:** Full local stack runs. Message flow reaches the LLM provider step. The only remaining blocker is the z.ai key. Everything up to this point is safe to deploy to the droplet.

---

## Phase 6 — Droplet deployment (SERIAL, after all previous phases committed + tests passing)

**Purpose:** Deploy everything to rafiq-dev. Stops one step short of the first real chat — z.ai key is added during the Korayem session.

**Dispatch:** Single subagent, serial steps only. Droplet state changes require full context awareness.

**Pre-flight:**
- Verify the v2-analyst branch has all phase 0–5 commits
- Verify `npm run build` passes clean on `main` when v2 is merged in (optional local check)
- Re-verify SSH access works: `ssh -i ~/.ssh/id_ed25519 -o BatchMode=yes root@67.205.157.55 'echo ok'`

### Task 6.1 — Backup v1 state on the droplet

**Purpose:** Before touching anything, snapshot what's currently live so rollback is possible.

- [ ] **Step 1: SSH to rafiq-dev and create a backup folder.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'mkdir -p /root/tbdc-poc/backups && date'
```

- [ ] **Step 2: Dump the `tbdc_poc` database.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'TS=$(date +%Y%m%d-%H%M%S) && \
   docker exec shared-postgres pg_dump -U postgres -d tbdc_poc \
     > /root/tbdc-poc/backups/pre-v2-$TS.sql && \
   ls -lh /root/tbdc-poc/backups/pre-v2-$TS.sql'
```

Expected: a non-empty SQL file. Record the timestamp for rollback reference.

- [ ] **Step 3: Backup the Rafiq Caddyfile.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'TS=$(date +%Y%m%d-%H%M%S) && \
   cp /root/Rafiq-v1/docker/caddy/Caddyfile /root/tbdc-poc/backups/Caddyfile.pre-v2-$TS && \
   ls -lh /root/tbdc-poc/backups/Caddyfile.pre-v2-*'
```

### Task 6.2 — Push the v2-analyst branch and pull on the droplet

- [ ] **Step 1: Push v2-analyst to GitHub.**

```bash
git push -u origin v2-analyst
```

- [ ] **Step 2: Pull on the droplet.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'cd /root/tbdc-poc/repo && git fetch origin && git checkout v2-analyst && git pull origin v2-analyst && git log --oneline -5'
```

Expected: v2 commits visible in the log.

### Task 6.3 — Apply the Prisma migration to the live DB

- [ ] **Step 1: Run `prisma migrate deploy` against the live `tbdc_poc` DB.**

The existing `tbdc-web` container has Prisma CLI available at exec time. Use it:

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'cd /root/tbdc-poc/repo && \
   docker cp prisma/migrations tbdc-web:/app/prisma/migrations && \
   docker exec -e DATABASE_URL="$(cat /root/tbdc-poc/tbdc-web.env | grep ^DATABASE_URL= | cut -d= -f2-)" \
     tbdc-web npx prisma migrate deploy'
```

Expected: "Applied migration v2_add_analyst_tables". If it fails, check logs and use the SQL dump from Task 6.1 to restore before retrying.

- [ ] **Step 2: Run the manual SQL role + grants file.**

```bash
# First, decide on the tbdc_assistant password and write it into a temp env file
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'cat > /root/tbdc-poc/openclaw.env.tmp << EOF
TBDC_ASSISTANT_PASSWORD=<generate a strong password and paste here>
EOF
chmod 600 /root/tbdc-poc/openclaw.env.tmp'

# Run the SQL
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'PW=$(grep ^TBDC_ASSISTANT_PASSWORD= /root/tbdc-poc/openclaw.env.tmp | cut -d= -f2-) && \
   docker exec -i shared-postgres psql -U postgres -d tbdc_poc \
     -v TBDC_ASSISTANT_PASSWORD="'\''$PW'\''" \
     < /root/tbdc-poc/repo/prisma/migrations/manual/v2_roles_and_grants.sql'
```

Expected: all GRANT statements succeed. Role `tbdc_assistant` now exists.

- [ ] **Step 3: Re-run the seed to create the Assistant user and ChatSessions.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'docker exec -e DATABASE_URL="$(grep ^DATABASE_URL= /root/tbdc-poc/tbdc-web.env | cut -d= -f2-)" \
     tbdc-web npx prisma db seed'
```

Expected: idempotent run — existing v1 data untouched, assistant user upserted, 35 ChatSessions created.

### Task 6.4 — Write the openclaw config + env on the droplet

- [ ] **Step 1: Create `openclaw-config/` and `openclaw-workspace/` dirs on the droplet.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'mkdir -p /root/tbdc-poc/openclaw-config \
            /root/tbdc-poc/openclaw-workspace/skills'
```

- [ ] **Step 2: Rsync the tbdc-db skill from the repo clone to the workspace dir.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'rsync -av --delete \
     /root/tbdc-poc/repo/openclaw-workspace/skills/tbdc-db/ \
     /root/tbdc-poc/openclaw-workspace/skills/tbdc-db/'
```

The rsync establishes `/root/tbdc-poc/openclaw-workspace/skills/tbdc-db/` as a mirror of the repo copy. Future updates: re-run the same rsync after `git pull`.

- [ ] **Step 3: Install skill deps on the droplet.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'cd /root/tbdc-poc/openclaw-workspace/skills/tbdc-db && npm install --omit=dev'
```

- [ ] **Step 4: Write `openclaw.json` to the bind-mounted config dir.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'cat > /root/tbdc-poc/openclaw-config/openclaw.json << EOF
{
  "gateway": {
    "host": "0.0.0.0",
    "port": 18789,
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
    "tbdc-db": {
      "enabled": true,
      "path": "./workspace/skills/tbdc-db"
    }
  },
  "channels": { "webchat": { "enabled": true } }
}
EOF'
```

- [ ] **Step 5: Write the final `openclaw.env` file.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'cat > /root/tbdc-poc/openclaw.env << EOF
# TBDC POC v2.0 — OpenClaw gateway env vars
# z.ai API key is intentionally LEFT BLANK — set during Korayem session
ZAI_API_KEY=
DATABASE_URL_ASSISTANT=postgresql://tbdc_assistant:<PASTE_THE_PASSWORD_FROM_TASK_6.3>@shared-postgres:5432/tbdc_poc
OPENCLAW_ADMIN_BCRYPT=<generated below>
OPENCLAW_SESSION_JWT_SECRET=<generate 32 bytes>
ASSISTANT_USER_EMAIL=assistant@tbdc.ready4vc.com
OPENCLAW_HOME=/home/node/.openclaw
EOF
chmod 600 /root/tbdc-poc/openclaw.env'
```

- [ ] **Step 6: Generate the Control UI basic-auth bcrypt.**

Pick a shared password for Ahmed + Korayem. On the droplet:

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'docker run --rm caddy:latest caddy hash-password --plaintext <CHOSEN_PASSWORD>'
```

Paste the resulting bcrypt string into `openclaw.env` as `OPENCLAW_ADMIN_BCRYPT=`. Record the plaintext password in a secure location (password manager) — neither Ahmed nor this plan stores it in cleartext anywhere on disk.

- [ ] **Step 7: Generate the JWT secret.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'openssl rand -hex 32'
```

Paste into `openclaw.env` as `OPENCLAW_SESSION_JWT_SECRET=`.

- [ ] **Step 8: Also add the JWT secret to `tbdc-web.env` so the Next.js app can mint tokens.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'grep -q OPENCLAW_SESSION_JWT_SECRET /root/tbdc-poc/tbdc-web.env || \
   echo "OPENCLAW_SESSION_JWT_SECRET=<same value as openclaw.env>" >> /root/tbdc-poc/tbdc-web.env'
```

Also add `OPENCLAW_INTERNAL_URL=http://openclaw-gateway:18789` and `ASSISTANT_USER_EMAIL=assistant@tbdc.ready4vc.com` to `tbdc-web.env`.

### Task 6.5 — Start the openclaw-gateway container

- [ ] **Step 1: Pull the pinned image on the droplet.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  "OPENCLAW_TAG=\$(cat /root/tbdc-poc/repo/deploy/openclaw-version.txt) && \
   docker pull ghcr.io/openclaw/openclaw:\$OPENCLAW_TAG"
```

- [ ] **Step 2: Run the gateway container.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 '
OPENCLAW_TAG=$(cat /root/tbdc-poc/repo/deploy/openclaw-version.txt)
docker run -d \
  --name openclaw-gateway \
  --restart unless-stopped \
  --network docker_rafiq-shared \
  --env-file /root/tbdc-poc/openclaw.env \
  -v /root/tbdc-poc/openclaw-config:/home/node/.openclaw \
  -v /root/tbdc-poc/openclaw-workspace:/home/node/.openclaw/workspace \
  ghcr.io/openclaw/openclaw:$OPENCLAW_TAG
'
```

- [ ] **Step 3: Verify it started cleanly.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'docker logs openclaw-gateway --tail 100 2>&1 | grep -i -E "(listening|tbdc-db|skill|error)"'
```

Expected: "listening on :18789", "tbdc-db skill loaded", no fatal errors. A warning about missing `ZAI_API_KEY` is expected and fine — the gateway still boots.

- [ ] **Step 4: Verify container is healthy.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'docker ps --filter name=openclaw-gateway --format "{{.Names}} {{.Status}}"'
```

Expected: `openclaw-gateway Up ...`.

### Task 6.6 — Edit the Rafiq Caddyfile (in-place replacement, not append)

- [ ] **Step 1: Find the existing v1 TBDC block.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'grep -n "tbdc.ready4vc.com" /root/Rafiq-v1/docker/caddy/Caddyfile'
```

Note the line numbers of the existing block.

- [ ] **Step 2: Delete the existing block and insert the v2 block in its place.**

Use `sed` or a careful manual edit. The safest approach is to fetch the file locally, edit it, and scp it back:

```bash
scp -i ~/.ssh/id_ed25519 root@67.205.157.55:/root/Rafiq-v1/docker/caddy/Caddyfile /tmp/Caddyfile.edit
```

Open `/tmp/Caddyfile.edit` locally. Find the existing `# === TBDC POC ===` / `tbdc.ready4vc.com { ... }` block (the one added during v1 deploy, commit `[deploy]` on 2026-04-09). Replace the entire block (including comment headers) with:

```caddy
# === TBDC POC v2.0 — analyst chat + OpenClaw Control UI ===
# Replaces the v1 block (was: single reverse_proxy to tbdc-web:3000).
# NOT part of Rafiq-v1. Last edited 2026-04-09.

tbdc.ready4vc.com {
    handle /ClawAdmin/* {
        basic_auth {
            admin {env.OPENCLAW_ADMIN_BCRYPT}
        }
        reverse_proxy openclaw-gateway:18789
    }

    handle /analyst/ws/socket {
        reverse_proxy openclaw-gateway:18789
    }

    handle {
        reverse_proxy tbdc-web:3000
    }
}
# === end TBDC POC v2.0 ===
```

Note: `/analyst/ws/token` is NOT in this Caddyfile block — it's handled by the default `handle` → `tbdc-web:3000` route, because the token endpoint is a Next.js route handler inside the app.

- [ ] **Step 3: Copy edited file back to the droplet.**

```bash
scp -i ~/.ssh/id_ed25519 /tmp/Caddyfile.edit root@67.205.157.55:/root/Rafiq-v1/docker/caddy/Caddyfile
```

- [ ] **Step 4: Validate the Caddyfile syntax BEFORE reloading.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'docker exec rafiq-caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile'
```

Expected: `Valid configuration`. If it fails, restore from backup:

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'cp /root/tbdc-poc/backups/Caddyfile.pre-v2-<TIMESTAMP> /root/Rafiq-v1/docker/caddy/Caddyfile'
```

Then fix the syntax error and re-validate.

- [ ] **Step 5: Expose `OPENCLAW_ADMIN_BCRYPT` to the Caddy container.**

Caddy's `{env.OPENCLAW_ADMIN_BCRYPT}` placeholder reads from the environment of the Caddy container. Either:
- **(a)** Add `OPENCLAW_ADMIN_BCRYPT=...` to the Caddy container's env (inspect how v1 passes env vars: `docker inspect rafiq-caddy | grep -A 20 Env`), or
- **(b)** Put the bcrypt string directly into the Caddyfile (not using env substitution). This is fine for a POC — the Caddyfile is on a private droplet.

If (a) is complex, use (b). Replace `{env.OPENCLAW_ADMIN_BCRYPT}` with the actual bcrypt string inline in the Caddyfile. Re-validate.

- [ ] **Step 6: Reload Caddy.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'docker exec rafiq-caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile'
```

Expected: reload succeeds. If it fails, the old config keeps running — no downtime — but the new routes aren't active. Fix and retry.

### Task 6.7 — Rebuild and redeploy `tbdc-web` with v2 code

- [ ] **Step 1: Build the new image on the droplet.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'cd /root/tbdc-poc/repo && docker build -t tbdc-web:v2 .'
```

- [ ] **Step 2: Stop and remove the old container.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'docker stop tbdc-web && docker rm tbdc-web'
```

- [ ] **Step 3: Run the new container with the updated env file.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'docker run -d \
     --name tbdc-web \
     --restart unless-stopped \
     --network docker_rafiq-shared \
     --env-file /root/tbdc-poc/tbdc-web.env \
     tbdc-web:v2'
```

- [ ] **Step 4: Verify the container boots.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'docker logs tbdc-web --tail 50 2>&1 | tail -30'
```

Expected: "Ready on http://...:3000" or equivalent Next.js ready message. No errors.

### Task 6.8 — Final droplet smoke test (no LLM call)

- [ ] **Step 1: Verify `/login` still works.**

```bash
curl -sI https://tbdc.ready4vc.com/login | head -1
# Expected: HTTP/2 200
```

- [ ] **Step 2: Verify `/analyst` responds (expects redirect to login if not authed).**

```bash
curl -sI https://tbdc.ready4vc.com/analyst | head -1
# Expected: HTTP/2 307 (redirect to login)
```

- [ ] **Step 3: Verify `/ClawAdmin/` prompts for basic auth.**

```bash
curl -sI https://tbdc.ready4vc.com/ClawAdmin/ | head -5
# Expected: HTTP/2 401 with WWW-Authenticate: Basic header
```

- [ ] **Step 4: Verify basic auth works with the chosen credentials.**

```bash
curl -sI -u admin:<PASSWORD> https://tbdc.ready4vc.com/ClawAdmin/ | head -1
# Expected: HTTP/2 200 (or 301/302 redirect within the Control UI)
```

- [ ] **Step 5: Log in as a bootstrap admin via browser and navigate to `/analyst`.**

Open https://tbdc.ready4vc.com/ in a browser. Log in. Click the Analyst tab. Verify:
- Channel sidebar loads with 35 entries
- Clicking a channel updates the URL
- The message pane attempts a WebSocket connection
- The token endpoint at `/analyst/ws/token?session=...` returns a JSON object with a token

- [ ] **Step 6: Do NOT send a real message yet.** This is the Korayem-session step. Sending a message now would trigger an LLM call and fail because `ZAI_API_KEY` is empty. That failure is OK but not the test we're running in this task.

- [ ] **Step 7: Verify all v1 functionality still works.**

Click through the existing tabs: Methodology, Investors, Companies, Match, Admin → Users. Edit one field in the Investors table as a smoke test for the live DB + migration. Verify the edit persists and the audit log now captures it.

### Task 6.9 — Commit Caddyfile backup marker + merge v2-analyst to main

- [ ] **Step 1: Return to local repo root and merge v2-analyst to main.**

```bash
git checkout main
git merge --no-ff v2-analyst -m "Merge branch 'v2-analyst': v2.0 OpenClaw investment analyst"
git push origin main
```

Do NOT delete the `v2-analyst` branch yet — keep it as a reference until the Korayem smoke test passes.

- [ ] **Step 2: Pull merged `main` on the droplet to align the repo clone.**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  'cd /root/tbdc-poc/repo && git fetch origin && git checkout main && git pull origin main'
```

- [ ] **Step 3: Record the deployment in the changelog.**

Edit `docs/changelog.md` locally and add an entry at the top:

```markdown
## 2026-04-09 — [deploy] v2.0 OpenClaw analyst deployed to rafiq-dev

- Gateway container `openclaw-gateway` running on `docker_rafiq-shared` alongside `tbdc-web`.
- New `/analyst` page + `/ClawAdmin/` Control UI (basic-auth-gated) on `tbdc.ready4vc.com`.
- Prisma migration `v2_add_analyst_tables` applied to live `tbdc_poc` DB.
- `tbdc_assistant` Postgres role + `v_user_public` view created.
- Rafiq Caddyfile edited in-place: v1 simple reverse_proxy block replaced with v2 multi-handle block.
- `tbdc-web` rebuilt and redeployed with the `/analyst` page + audit log UI + WebSocket token route.
- **Blocked on z.ai API key** — set during Korayem session, then run smoke test per `docs/superpowers/plans/2026-04-09-v2-openclaw-analyst-implementation-plan.md` Phase 7.
```

- [ ] **Step 4: Commit and push the changelog update.**

```bash
git add docs/changelog.md
git commit -m "docs(v2): record v2.0 droplet deployment (blocked on z.ai key)"
git push origin main
```

- [ ] **Step 5: Update the roadmap.**

Edit `docs/roadmap.md` and add a "Phase 12 — v2.0 OpenClaw analyst" section (or similar), marking it as **blocked on z.ai key configuration**. Commit and push.

**Phase 6 gate:** All infrastructure live. Chat pane connects to OpenClaw. Control UI accessible under basic auth. v1 functionality untouched. Only the z.ai API key remains to be configured.

---

## Phase 7 — Handoff document for the Korayem session

**Purpose:** Write a concise checklist that Ahmed can follow with Korayem to configure the z.ai key, run the first real smoke test, and confirm v2.0 is fully live.

**Dispatch:** Single subagent, small task.

### Task 7.1 — Write `docs/superpowers/plans/2026-04-09-v2-korayem-smoke-test.md`

**Files:**
- Create: `docs/superpowers/plans/2026-04-09-v2-korayem-smoke-test.md`

- [ ] **Step 1: Write the handoff checklist.**

```markdown
# V2.0 Korayem Smoke Test — Final Commissioning

> Run with Ahmed Youssry and Ahmed Korayem both present.
> Prerequisite: Phase 6 of the v2.0 implementation plan is complete and all infrastructure is deployed.

## What's already live

- [x] `openclaw-gateway` container running on rafiq-dev
- [x] Prisma migration applied; `tbdc_assistant` role and `v_user_public` view created
- [x] Caddy routes for `/analyst/ws/socket`, `/ClawAdmin/*`, and the main app
- [x] `/analyst` page + chat pane + audit log page in the app
- [x] `tbdc-db` skill installed in the gateway workspace
- [x] The Assistant User row exists (`assistant@tbdc.ready4vc.com`, role `assistant`)
- [x] 35 ChatSession rows (1 general + 10 companies + 24 investors)

## What's missing

- [ ] z.ai Coding Plan subscription
- [ ] z.ai API key
- [ ] First real chat message

## Steps (run together, ~15 minutes)

### 1. Subscribe to z.ai Coding Plan (Korayem's account or shared account)

1. Go to https://open.z.ai (or whichever URL z.ai's dashboard uses as of the session date).
2. Create an account or log in.
3. Subscribe to the "Coding Plan" — the tier that explicitly supports OpenClaw integration (documented at https://docs.z.ai/devpack/tool/openclaw).
4. Generate an API key from the API Keys management page.
5. Copy the key — you'll paste it into the droplet in the next step.

### 2. Inject the key into the droplet

SSH to rafiq-dev:

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55
```

Edit `openclaw.env`:

```bash
nano /root/tbdc-poc/openclaw.env
# Replace the empty ZAI_API_KEY= line with:
# ZAI_API_KEY=<paste the key here>
# Save and exit.
```

Restart the gateway:

```bash
docker restart openclaw-gateway
```

Verify provider auth succeeded:

```bash
docker logs openclaw-gateway --tail 50 2>&1 | grep -i -E "(zai|provider|auth|ready)"
```

Expected: a line indicating z.ai provider is loaded and auth succeeded. If you see an auth error, double-check the key was pasted without a trailing newline or quote.

### 3. First real chat message (from the web app)

1. Open https://tbdc.ready4vc.com/login in a browser.
2. Log in as `youssry@ready4vc.com` with the bootstrap password.
3. Click the **Analyst** tab in the nav.
4. Click `#general` in the sidebar.
5. Type: **"Which company in our portfolio has the fewest Tier 1 matches? Give me a one-sentence answer."**
6. Press Enter.

Expected:
- Your message appears immediately with your name
- Within 2–10 seconds, the Assistant responds, starting with something that acknowledges the question
- The Assistant calls at least one tool (visible as a small `🔍 Looked up …` pill if read pills are shown; definitely visible in the gateway logs)
- The final answer cites a specific company by name

### 4. First real write test

1. Switch to `#co-acme` in the sidebar (or any company channel).
2. Type: **"Please append this sentence to Acme's match rationale with Inovia: 'Test write from the Korayem smoke test, can be reverted.'"**
3. Press Enter.

Expected:
- Assistant acknowledges, possibly asks for confirmation or just does it
- An `✎ Updated Match …` pill appears inline
- Clicking the pill opens `/admin/audit` filtered to the new entry

### 5. Revert test

1. On the `/admin/audit` page, find the entry from step 4.
2. Click **Revert**.
3. Confirm the dialog.
4. Expected: the entry is marked as reverted, a new audit row appears showing the admin as the actor reverting it.
5. Go back to `#co-acme` and verify the rationale is restored by asking the Assistant to read it.

### 6. Rate-limit behavior check

Send 5–10 messages in quick succession in `#general`. If you hit the z.ai rate limit, expected behavior: the chat pane shows a subtle "Assistant is queued by provider, response may be delayed" banner. No hard errors. Once the rate limit passes, responses resume.

### 7. Sign off

If all 6 steps above pass, v2.0 is officially live and ready for the interview demo.

Write a final entry in `docs/changelog.md`:

```markdown
## <date> — [smoke] v2.0 Korayem smoke test PASSED

- z.ai Coding Plan subscribed, API key generated and injected into openclaw.env
- Gateway restart succeeded; provider auth verified in logs
- First chat in #general answered correctly with tool call
- First write in #co-acme produced an audit log entry
- Revert from /admin/audit worked end-to-end
- Rate limit handling verified graceful
- **v2.0 officially live at https://tbdc.ready4vc.com/analyst**
```

## If something fails

- **z.ai auth fails:** double-check the key. If still failing, check z.ai's dashboard for plan/billing issues. If urgent, switch `openclaw.json` primary to `zai/glm-5-turbo` (cheaper model, same provider).
- **Chat loads but no response:** check `docker logs openclaw-gateway --tail 100`. If the skill isn't loaded, re-run rsync from the repo.
- **Tool call fails with DB error:** verify `tbdc_assistant` role was created and has grants: `docker exec shared-postgres psql -U postgres -d tbdc_poc -c "\du tbdc_assistant"`.
- **WebSocket won't connect:** check Caddy logs (`docker logs rafiq-caddy --tail 50`). Most likely the `/analyst/ws/socket` handle is routing wrong.
- **Revert fails:** check the browser console. The revert server action should return a structured error.
- **Full bailout:** `docker stop openclaw-gateway`. The rest of the TBDC app keeps working. v1 is untouched.
```

- [ ] **Step 2: Commit.**

```bash
git add docs/superpowers/plans/2026-04-09-v2-korayem-smoke-test.md
git commit -m "docs(v2): handoff checklist for Korayem smoke test session"
git push origin main
```

**Phase 7 gate:** The handoff doc is committed. The implementation is done. Close the session.

---

## Plan review loop

After writing this plan, dispatch a plan-document-reviewer subagent to verify the plan is implementable as written.

Review template: `plan-document-reviewer-prompt.md` in the writing-plans skill directory.

Review context to provide the subagent:
- Path to this plan: `docs/superpowers/plans/2026-04-09-v2-openclaw-analyst-implementation-plan.md`
- Path to the spec: `docs/superpowers/specs/2026-04-09-v2-openclaw-analyst-design.md`
- Instruction: this plan has a hard stop before the z.ai API key step; don't flag that as missing.

## Execution handoff

After the plan is committed and reviewed, present the user with the execution choice:

> "Plan complete and committed to `docs/superpowers/plans/2026-04-09-v2-openclaw-analyst-implementation-plan.md`. Two execution options:
>
> **1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, parallelize Phase 1 / Phase 2, then Phase 3 / 4 / 5. Fast iteration with review checkpoints.
>
> **2. Inline Execution** — execute tasks in the current session using `superpowers:executing-plans`, with commit-boundary checkpoints for your review.
>
> Which approach?"

