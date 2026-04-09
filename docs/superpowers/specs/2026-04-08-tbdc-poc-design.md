# TBDC Investor Matchmaking POC — Design Document

> Date: 2026-04-08
> Author: Claude (Opus 4.6) in autonomous implementation mode
> Scope: Phases 2–11 of the roadmap (everything from Prisma to production deployment)

## Purpose

Turn the single-file static HTML prototype at [`reference/tbdc_investor_matching_poc_v2.html`](../../../reference/tbdc_investor_matching_poc_v2.html) into a functional, authenticated, edit-in-place web app deployed at **https://tbdc.ready4vc.com**, with all data persisted in Postgres and preserving pixel-level visual parity with the original.

Foundation (Phase 1) is already complete: Next.js 16.2.3 + Tailwind v4 + shadcn + the TBDC design tokens ported verbatim into `globals.css`.

## Locked decisions (answers to the roadmap's open questions)

| Question | Decision | Rationale |
|---|---|---|
| Role model | **Single `admin` role**. All invited users are admins. | POC scope; splitting into admin/editor adds UI complexity without a real user story. |
| Password reset | **Out of scope for v1**. Admins can reset peer passwords from `/admin/users`. | No email infrastructure on the droplet; admin-reset is sufficient for a 2–6 user install. |
| Audit log | **Out of scope for v1**. Not built. | Nice-to-have, adds schema complexity, not requested. |
| Data re-import from reference HTML | **One-time seed only**. After initial seed, the UI is the only edit surface. | The reference HTML is frozen — TBDC will not be re-exporting from it. |
| Dev-server crash (BL-001) | **Accepted workaround**: `npm run dev --webpack`. `npm run dev:turbo` retained for retesting. | Upstream Turbopack/Windows bug, not fixable here. |
| Port collisions on dev box (BL-004) | **Accept fallback to 3001**. Document in CLAUDE.md (already done). | Not blocking. |
| Visual parity check (BL-003) | **Verified**: every token in the reference HTML's `:root` block is present in `globals.css` with identical hex values. | Grep-diffed 2026-04-08. |

## Architecture

### High-level shape

```
┌───────────── Browser ──────────────┐
│  Server-rendered pages + islands    │
│  (Georgia serif, 1200px max width)  │
└────────────────┬────────────────────┘
                 │
     ┌───────────┴───────────┐
     │   Next.js 16 (App     │  ← Docker container `tbdc-web`
     │   Router, src/ layout)│     on rafiq-dev, port 3010
     │                       │
     │  - Server components   │
     │  - Server actions      │
     │    (preferred for writes)
     │  - API routes          │
     │    (only for patterns SA can't express)
     │  - proxy.ts middleware │
     │  - NextAuth v5         │
     └───────────┬───────────┘
                 │ Prisma
                 ▼
     ┌───────────────────────┐
     │  shared-postgres      │  ← existing container
     │  container on         │
     │  rafiq-dev            │
     │  DB: tbdc_poc         │
     └───────────────────────┘
                 ▲
                 │ https
                 │
     ┌───────────────────────┐
     │  Caddy (existing)     │  :443
     │  tbdc.ready4vc.com    │  → tbdc-web:3010
     └───────────────────────┘
```

### Module boundaries

| Module | Responsibility | Dependencies |
|---|---|---|
| `src/lib/prisma.ts` | Singleton Prisma client | `@prisma/client` |
| `src/lib/auth.ts` (+ `auth.config.ts`) | NextAuth v5 config, Credentials provider, session callbacks | `next-auth`, `bcryptjs`, Prisma |
| `src/lib/guards.ts` | `requireAdmin()` / `getSession()` helpers for server components + actions | auth |
| `src/lib/zod/*.ts` | Input schemas for every write endpoint | `zod` |
| `src/app/(public)/methodology/page.tsx` | Read-only methodology view for logged-out; editable for logged-in | Prisma, auth |
| `src/app/(public)/investors/page.tsx` | Investors table; short fields inline, long fields modal | — |
| `src/app/(public)/companies/page.tsx` | Companies table with cohort grouping, WIDMO flag | — |
| `src/app/(public)/match/page.tsx` | Match output (sidebar + main), handles WIDMO branch | — |
| `src/app/admin/users/page.tsx` | Admin-only user management | guards |
| `src/app/login/page.tsx` | Credentials login form | auth |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth handler | auth |
| `src/app/api/**` | Write endpoints (`PATCH`, `POST`, `DELETE`) for each resource | guards, zod, prisma |
| `src/components/ui/*` | shadcn primitives (already installed) | — |
| `src/components/editable-cell.tsx` | Inline-edit text/number/select cell. Read-only if no session. | server actions |
| `src/components/edit-long-modal.tsx` | Modal for long-text edits | server actions |
| `src/components/nav-tabs.tsx` | The 4-tab header | — |
| `prisma/schema.prisma` | DB schema | — |
| `prisma/seed.ts` | Parses data embedded from reference HTML → DB | — |
| `proxy.ts` (root) | Next 16 middleware; enforces auth on `/admin/*` | auth |
| `Dockerfile` | Multi-stage build → standalone runner | — |

**Boundary rule:** Pages are server components that fetch via Prisma directly. Mutations go through server actions wherever possible; API routes exist only for client-initiated patterns where an action is awkward (e.g., typeahead search — not needed in v1). Every write path calls a Zod schema + `requireAdmin()` before touching Prisma.

### Data model (Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  role         String   @default("admin")  // only "admin" in v1
  createdAt    DateTime @default(now())
  invitedById  String?
  invitedBy    User?    @relation("Invites", fields: [invitedById], references: [id])
  invitees     User[]   @relation("Invites")
}

model Investor {
  id               String  @id @default(cuid())
  name             String
  type             String  // VC | Government | Corporate
  stage            String
  sectors          String
  chequeSize       String
  geography        String
  leadOrFollow     String  // Lead | Follow | Both
  deals12m         String
  notablePortfolio String
  contactApproach  String
  sortOrder        Int     @default(0)
  matches          Match[]
  doNotMatches     DoNotMatch[]
}

model Company {
  id                    String  @id @default(cuid())
  name                  String
  cohort                String  // Pivot 1 | Horizon 3
  stage                 String
  sector                String
  arrTraction           String
  askSize               String
  homeMarket            String
  targetMarket          String
  founderProfile        String
  acceptsInvestorIntros Boolean @default(true)
  sortOrder             Int     @default(0)
  matches               Match[]
  doNotMatches          DoNotMatch[]
  customerTargets       CustomerTarget[]
  events                IndustryEvent[]
  gateNote              String? // shown in WIDMO-style warning card
}

model Match {
  id           String   @id @default(cuid())
  companyId    String
  investorId   String
  tier         Int      // 1 or 2
  score        Int
  geoPts       Int
  stagePts     Int
  sectorPts    Int
  revenuePts   Int
  chequePts    Int
  founderPts   Int
  gapPts       Int
  warmPath     String
  portfolioGap String
  rationale    String
  nextStep     String
  sortOrder    Int      @default(0)
  company      Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  investor     Investor @relation(fields: [investorId], references: [id], onDelete: Cascade)
  @@unique([companyId, investorId])
}

model DoNotMatch {
  id         String   @id @default(cuid())
  companyId  String
  investorId String?         // nullable — some DN entries are "Panache/Golden/Staircase" grouped
  label      String          // used when investorId is null
  reason     String
  sortOrder  Int      @default(0)
  company    Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  investor   Investor? @relation(fields: [investorId], references: [id], onDelete: SetNull)
}

model CustomerTarget {
  id          String  @id @default(cuid())
  companyId   String
  name        String
  targetType  String  // e.g. "Mining", "Aggregates"
  hq          String
  description String
  sortOrder   Int     @default(0)
  company     Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
}

model IndustryEvent {
  id        String  @id @default(cuid())
  companyId String
  name      String
  sortOrder Int     @default(0)
  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
}

model MethodologyDimension {
  id           String @id @default(cuid())
  name         String
  maxWeight    String // e.g. "3 pts" or "KILLS MATCH" or "Activation modifier"
  logic        String
  rationale    String
  sortOrder    Int    @default(0)
}

model MethodologyCard {
  id        String @id @default(cuid())
  title     String
  body      String
  sortOrder Int    @default(0)
}
```

### Auth flow

1. `.env` holds `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `BOOTSTRAP_ADMIN_EMAILS`, `BOOTSTRAP_ADMIN_PASSWORD`.
2. On `prisma db seed`, if the `User` table is empty, create one admin per email in `BOOTSTRAP_ADMIN_EMAILS` with a bcrypted `BOOTSTRAP_ADMIN_PASSWORD`.
3. NextAuth Credentials provider takes email + password, looks up the user, compares bcrypt, issues a JWT session.
4. `proxy.ts` at repo root protects `/admin/*` (admin-only) and lets the 4 public pages render read-only when logged out.
5. Server actions call `requireAdmin()` before any mutation; API routes do the same.

### Pages

Every page uses the same layout skeleton (header + 4 nav tabs), matching the reference HTML.

1. **/** → redirect to `/methodology`.
2. **/methodology** — scoring dimensions table, tier legend (4 cards), philosophy cards (4 long-form). Edit = click-to-modal for all rows (they're all long text).
3. **/investors** — 24 investors, 10 columns. Short cols (name, type, stage, cheque, geo, lead/follow, deals) inline-editable; long cols (sectors, portfolio, contact) modal. Add/delete row buttons for admins.
4. **/companies** — 10 companies grouped by cohort, with an `acceptsInvestorIntros` toggle. Same inline/modal split.
5. **/match** — sidebar lists companies (WIDMO highlighted in warn color), main pane renders match cards (Tier 1, Tier 2, Do Not Match) for normal companies, OR the WIDMO gate warning + `CustomerTarget` grid + `IndustryEvent` pill row for `acceptsInvestorIntros=false`.
6. **/admin/users** — admin only. List users, invite form, delete-user button (cannot delete self).
7. **/login** — credentials form.

### Error handling

- Prisma errors in server components → Next.js error boundary (`error.tsx` per route segment) rendering a plain "Something went wrong — try reloading" card using TBDC warn tokens.
- Server action errors → return a `{ ok: false, error: string }` shape; inline/modal components display it inline.
- Auth failures on write endpoints → 401 (not logged in) or 403 (logged in but missing role).
- Zod validation failures → return `{ ok: false, fieldErrors }`.

### Testing

Given the autonomous-execution constraint and POC scope, testing is pragmatic:

- **Build-time**: `npm run build` must succeed after every phase.
- **Lint**: `npm run lint` must pass.
- **Manual smoke tests** at each phase via Playwright MCP against the local dev server.
- **Unit tests**: skipped for v1 — not requested, scope creep.
- **E2E smoke test in prod**: after deployment, a Playwright script hits `https://tbdc.ready4vc.com`, confirms the 4 pages render, logs in as bootstrap admin, edits one field, logs out.

### Deployment

- **Image**: multi-stage Dockerfile — `deps` (install), `builder` (build with standalone output), `runner` (thin node 20-alpine with `.next/standalone` + `.next/static` + `public` + Prisma engines).
- **Environment**: `.env.production` supplied at runtime via docker env-file; never baked in.
- **DB**: `CREATE DATABASE tbdc_poc` inside the existing `shared-postgres` container, plus a restricted role `tbdc_app` with privileges limited to that DB.
- **Port**: host 3010 → container 3000.
- **Caddy**: add a new site block for `tbdc.ready4vc.com` that `reverse_proxy`s to `tbdc-web:3010`, then `caddy reload`. (Assumes the Caddy container shares a docker network with `tbdc-web`; if not, reverse_proxy via host gateway.)
- **DNS**: A record `tbdc.ready4vc.com` → `67.205.157.55` (rafiq-dev). Ahmed set this or will set it; if unresolved at deploy time, document and continue.
- **Migrations**: `npx prisma migrate deploy && npx prisma db seed` run as a one-off exec against the running container on first deploy.

### Scope boundaries (what this design explicitly does NOT include)

- Password reset / "forgot password" flow
- Audit log
- Email sending (SMTP, transactional)
- Dark mode
- Internationalization
- Multi-tenant support
- CSV import/export
- Search / pagination (10 companies + 24 investors fit on one page)
- Unit/integration test suites
- CI/CD pipeline (build + push is manual on first deploy; automation is future work)
- Monitoring / alerting

These are all acknowledged and intentionally deferred.
