# TBDC POC — Implementation Plan

> Companion to [`../specs/2026-04-08-tbdc-poc-design.md`](../specs/2026-04-08-tbdc-poc-design.md).
> Executed autonomously in one session starting 2026-04-08.

## Guiding rules

- After each phase: `npm run build` must pass; if it doesn't, fix before proceeding.
- Every write endpoint goes through Zod + `requireAdmin()`. No exceptions.
- Never change `globals.css` tokens — they match the reference HTML verbatim.
- Never revert `npm run dev` to Turbopack.
- Data in the seed must be identical to `docs/reference/tbdc_investor_matching_poc_v2.html`.
- Commits: one per phase, Conventional Commits style, author = global git config (Ahmed Youssry).

## Phase 2 — Database & data layer

1. `npm i prisma @prisma/client` (dev: `prisma`).
2. `npx prisma init --datasource-provider postgresql` (creates `prisma/schema.prisma` + `.env` — preserve existing `.env` if any).
3. Write `prisma/schema.prisma` with the 9 models from the design doc.
4. Create `src/lib/prisma.ts` with the `globalForPrisma` singleton.
5. Extract the reference HTML `var INVESTORS`, `var COMPANIES`, `var MATCHES` arrays into `prisma/data/*.ts` modules that export typed TS objects. Copy-paste the object literals; fix the JS `var` syntax to TS `const`.
6. Write `prisma/seed.ts` that:
   - Idempotently deletes and reinserts investors, companies, matches, do-not-matches, customer targets, events, methodology dimensions, methodology cards (skip if User table non-empty — protects prod data if re-run).
   - Creates bootstrap admins from `BOOTSTRAP_ADMIN_EMAILS` (comma-separated) with `BOOTSTRAP_ADMIN_PASSWORD`, bcrypted.
7. Add `package.json` `prisma.seed` field: `ts-node --transpile-only prisma/seed.ts` (install `ts-node`).
8. Create `.env` locally with `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tbdc_poc"` — used only for `prisma migrate dev` locally IF a local postgres is available. Otherwise skip local migrate and run it against the droplet DB in Phase 11.
9. **Local DB optional**: if no local postgres, use SQLite for dev (`provider = "sqlite"`, `DATABASE_URL="file:./dev.db"`) but keep production as postgres. Decision at phase runtime based on what's available.
10. `npx prisma generate` — confirms schema compiles.
11. Commit: `feat(db): add prisma schema + seed parsed from reference HTML`.

## Phase 3 — Auth

1. `npm i next-auth@beta bcryptjs zod`, `npm i -D @types/bcryptjs`.
2. Create `src/lib/auth.ts` + `src/auth.config.ts` with Credentials provider, JWT strategy, custom `authorize` calling Prisma + bcrypt.
3. `src/app/api/auth/[...nextauth]/route.ts` re-exports the handlers.
4. Create `proxy.ts` at repo root (Next 16 uses this instead of `middleware.ts`) that redirects unauthenticated users away from `/admin/*`.
5. Create `src/lib/guards.ts` with `getSession()`, `requireAdmin()`.
6. `src/app/login/page.tsx` — simple credentials form; server action calls `signIn("credentials", ...)`.
7. Add `.env.example` documenting required vars.
8. Commit: `feat(auth): nextauth v5 credentials provider + admin guard`.

## Phase 4 — Layout + Methodology page

1. Create `src/app/layout.tsx` header + nav-tabs component (delete the current visual spike page).
2. Create `src/components/header.tsx` (matches `.hdr` from reference — dark bar with pills).
3. Create `src/components/nav-tabs.tsx` (the 4 tabs).
4. `src/app/methodology/page.tsx` — server component fetching `MethodologyDimension[]`, `MethodologyCard[]`. Renders the dimensions table, tier legend, philosophy grid using the exact classnames in `globals.css`.
5. `src/components/edit-long-modal.tsx` — shadcn Dialog wrapping a textarea + server action.
6. Wire "click row to edit" for dimensions and cards when logged in; disable otherwise.
7. Commit: `feat(methodology): methodology page + edit modals`.

## Phase 5 — Investors page

1. `src/app/investors/page.tsx` — server fetch + table.
2. `src/components/editable-cell.tsx` — inline edit for short text/number/select. Uses `useOptimistic` + server action.
3. Wire columns: name, type, stage, cheque, geo, lead/follow, deals = inline; sectors, portfolio, contact = modal.
4. "Add investor" button (admin only) → server action inserting blank row.
5. Delete row button with confirm (shadcn AlertDialog).
6. Server actions live in `src/app/investors/actions.ts`.
7. Commit: `feat(investors): table with inline + modal editing`.

## Phase 6 — Companies page

Same shape as investors, with:
- Cohort grouping (`Pivot 1`, `Horizon 3`).
- `acceptsInvestorIntros` bool column as a toggle.
- Long fields: arrTraction, founderProfile, gateNote.
Commit: `feat(companies): table with cohort grouping + WIDMO flag`.

## Phase 7 — Match output page

1. `src/app/match/page.tsx` — sidebar (company list) + main pane, with a `?c=<companyId>` search param picking the active company.
2. Sidebar uses `<Link>`s preserving query; WIDMO-style companies get the `.co-btn.w-on` warn styling.
3. Main pane:
   - If `accepts=true`: render Tier 1 cards, Tier 2 cards, Do Not Match list.
   - If `accepts=false`: render warn gate, customer targets grid, events pill row.
4. `match-card.tsx` component with score badge, signal dots, rationale, next step.
5. Inline-edit scores (number inputs); modal-edit rationale/next-step.
6. Commit: `feat(match): match page + widmo branch`.

## Phase 8 — Admin user management

1. `src/app/admin/users/page.tsx` — list users.
2. Invite form → server action creating user with bcrypt password.
3. Delete user → server action with self-delete guard.
4. `proxy.ts` already protects the route.
5. Commit: `feat(admin): user management page`.

## Phase 9 — API routes (fallback + external integrations)

Only if a client-side pattern genuinely needs it. With server actions covering all writes, this phase may be a no-op. Skip if no consumer emerges. Commit: `feat(api): api route fallbacks (if any)`.

## Phase 10 — Dockerization

1. `next.config.ts` → `output: "standalone"`.
2. `.dockerignore` covering `node_modules`, `.next`, `.git`, `reference/`, `docs/`, `.env*`.
3. `Dockerfile` multi-stage:
   - `deps`: `node:20-alpine`, `npm ci`.
   - `builder`: copy src, `npx prisma generate`, `npm run build`.
   - `runner`: `node:20-alpine`, copy `.next/standalone`, `.next/static`, `public`, `prisma/` (for `migrate deploy` + `db seed`). Non-root user. `CMD ["node", "server.js"]`.
4. `docker-compose.yml` for local dev (optional — skip if not used).
5. Local build test: `docker build -t tbdc-web:test .`.
6. Commit: `feat(docker): multi-stage build + standalone runner`.

## Phase 11 — Deploy to rafiq-dev

1. SSH to droplet via `doctl compute ssh rafiq-dev --ssh-key-path ~/.ssh/id_ed25519`.
2. `docker exec -it shared-postgres psql -U postgres -c "CREATE DATABASE tbdc_poc;"` and create a role `tbdc_app` with grants on that DB.
3. Identify the existing docker network Caddy + shared-postgres share; put `tbdc-web` on it.
4. Transfer image: build on droplet (preferred, avoids slow image push) via `git clone` of the repo + `docker build`.
5. `docker run -d --name tbdc-web --network <shared-net> -p 3010:3000 --env-file /root/tbdc-web.env tbdc-web:latest`.
6. `docker exec tbdc-web npx prisma migrate deploy && docker exec tbdc-web npx prisma db seed`.
7. Update the Caddy container's Caddyfile: add a new site block
   ```
   tbdc.ready4vc.com {
     reverse_proxy tbdc-web:3000
   }
   ```
   then `docker exec caddy caddy reload --config /etc/caddy/Caddyfile`.
8. Verify DNS `dig tbdc.ready4vc.com` resolves to 67.205.157.55. If not, create the A record (manual step — continue if blocked, document in changelog).
9. Smoke test in-browser via curl: `curl -I https://tbdc.ready4vc.com`.
10. Playwright smoke test: login, navigate all 4 tabs, edit one investor field, confirm persistence after refresh.
11. Commit: `chore(deploy): deploy to rafiq-dev behind caddy`.

## After deployment

- Update `docs/roadmap.md` to mark Phases 2–11 as ✅.
- Wipe out old roadmap "next steps" section or rewrite it as "post-launch backlog".
- Write changelog entries for every phase commit.
- Update memory files if anything durable changed.
