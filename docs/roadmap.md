# TBDC POC — Roadmap

> Last updated: 2026-04-08
> Status legend: ✅ done · 🔄 in progress · ⬜ pending · ⏸ blocked

This roadmap is the single source of truth for what this project is and what's next. New Claude Code sessions should read this first, then [changelog.md](changelog.md) for history, then [backlog.md](backlog.md) for open issues.

---

## Project snapshot

**What this is:** Turning a single-file static HTML prototype — [`../reference/tbdc_investor_matching_poc_v2.html`](../reference/tbdc_investor_matching_poc_v2.html) — into a functional website with Postgres + login, preserving the original's visual aesthetic exactly. Built for the Toronto Business Development Centre partnerships team to match portfolio companies to investors using a weighted 16-point scoring rubric.

**Reference HTML lives in:** [`../reference/`](../reference/) — treat as read-only source of truth for data, scoring logic, and visual design.

**Memory files for agent context** (outside the repo):
`C:\Users\Ahmed\.claude\projects\c--my-code-TBDC-POC\memory\`
- `user_ahmed.md` — primary user is Ahmed Youssry (youssry@ready4vc.com), partner is Ahmed Korayem (korayem@ready4vc.com)
- `project_tbdc_poc.md` — full project overview, stack, data model
- `reference_rafiq_dev_droplet.md` — DigitalOcean droplet details for deployment
- `feedback_editing_ux.md` — inline-editable cells for short fields, modal for long text

---

## Tech stack (locked)

| Layer       | Choice                                                        |
| ----------- | ------------------------------------------------------------- |
| Framework   | Next.js **16.2.3** (App Router, TypeScript, `src/` layout)    |
| Styling     | Tailwind CSS **v4** (CSS-first config via `@theme inline`)    |
| Components  | shadcn/ui (base-nova preset, with TBDC token overrides)       |
| ORM         | Prisma (latest)                                               |
| Database    | Postgres — new `tbdc_poc` DB inside existing `shared-postgres` container on rafiq-dev |
| Auth        | NextAuth v5 (`next-auth@beta`), Credentials provider          |
| Deployment  | Docker container on `rafiq-dev` droplet behind existing Caddy |
| URL         | https://tbdc.ready4vc.com                                     |
| Package mgr | npm                                                           |

**Dev server note:** Use `npm run dev` (webpack). Turbopack crashes on Windows with `STATUS_DLL_INIT_FAILED (0xc0000142)` when spawning the PostCSS worker subprocess. `next build` with Turbopack still works fine. `npm run dev:turbo` is retained for retesting the Turbopack fix after future Next.js updates.

---

## Current state (what's done)

- ✅ Git repo initialized locally (no remote yet — GitHub token in global CLAUDE.md was invalid, deferred)
- ✅ Original HTML preserved in `reference/`
- ✅ Next.js 16 scaffolded with TypeScript, Tailwind v4, App Router, `src/` layout
- ✅ shadcn/ui initialized (base-nova preset, generated `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`)
- ✅ TBDC design tokens ported verbatim from original HTML into `src/app/globals.css` — all 28+ tokens (tier colors, warn/hard-gate, blue accents, surface ramp, text ramp, Georgia serif) exposed as Tailwind v4 utility classes via `@theme inline`
- ✅ Visual spike page at `/` renders header + nav tabs + tier badges + surface ramp for parity verification against the original
- ✅ Build smoke test: clean (2.7s compile, TS passes, 4/4 static pages generate)
- ✅ Dev server running on webpack (Turbopack fallback documented)

---

## Roadmap — tasks & subtasks

### 1. Foundation ✅ DONE
- [x] Scaffold Next.js 16 + TypeScript + Tailwind v4
- [x] Install shadcn/ui + port design tokens
- [x] Visual parity spike at `/`
- [x] Fix Turbopack dev crash (use webpack for dev)
- [x] Create docs/ handoff structure

### 2. Database & data layer ⬜ NEXT
- [ ] Install Prisma + `@prisma/client`
- [ ] Design `prisma/schema.prisma`
  - [ ] `User` (id, email, password_hash, name, role, created_at, invited_by)
  - [ ] `Investor` (all 10 columns from original `var INVESTORS`)
  - [ ] `Company` (all 10 columns from original `var COMPANIES`, plus `accepts_investor_intros` bool)
  - [ ] `Match` (per company × investor, with score breakdown: geo/stage/sector/revenue/cheque/founder/gap points, tier, warm_path, portfolio_gap, rationale, next_step)
  - [ ] `DoNotMatch` (company × investor with `reason` field)
  - [ ] `CustomerTarget` (for WIDMO-mode companies: name, type, hq, description)
  - [ ] `IndustryEvent` (for WIDMO-mode companies: event name)
  - [ ] `MethodologyDimension` (name, max_weight_label, logic, rationale)
  - [ ] `MethodologyCard` (title, body)
- [ ] Create `src/lib/prisma.ts` with the `globalForPrisma` singleton pattern
- [ ] Write `prisma/seed.ts` — parse original HTML data and insert all 24 investors, 10 companies, and every match/WIDMO row verbatim
- [ ] Create `tbdc_poc` database inside the `shared-postgres` container on rafiq-dev
- [ ] Run `prisma migrate dev --name init` against it
- [ ] Run `prisma db seed` to populate

### 3. Auth ⬜
- [ ] Install `next-auth@beta` + `bcryptjs`
- [ ] Create `src/auth.ts` with Credentials provider
- [ ] Create `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Create `proxy.ts` at repo root (Next 16 uses `proxy.ts`, not `middleware.ts`)
- [ ] `.env` with: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `BOOTSTRAP_ADMIN_EMAILS="korayem@ready4vc.com,youssry@ready4vc.com"`, `BOOTSTRAP_ADMIN_PASSWORD="POC@ready4vc"`
- [ ] Bootstrap admin seeder — creates both admins with the temp password on first run if DB is empty
- [ ] Login page at `/login`
- [ ] Session-aware header (show email + sign out when logged in)

### 4. Page 1 — Methodology ⬜
- [ ] `/methodology` (or `/`) rendering the scoring dimensions table
- [ ] Tier legend cards (13–16, 8–12, 4–7, 0–3)
- [ ] 4 philosophy cards (long-form text)
- [ ] Logged-in users: click any card or row to open modal for editing

### 5. Page 2 — Investor Database ⬜
- [ ] `/investors` route, server component fetching all investors from DB
- [ ] Table with 10 columns matching original
- [ ] Type/Stage/Lead badges using ported color tokens
- [ ] Short fields (name, cheque, geo, deals) → **inline-editable** when logged in
- [ ] Long fields (sectors, portfolio, contact) → **click-to-modal** editor when logged in
- [ ] "Add investor" button (logged-in only)
- [ ] Delete row (logged-in only, confirm modal)

### 6. Page 3 — Portfolio Companies ⬜
- [ ] `/companies` route, same patterns as investors
- [ ] Cohort grouping (Pivot 1, Horizon 3)
- [ ] `accepts_investor_intros` toggle prominently displayed (WIDMO flag)
- [ ] Inline-edit short fields, modal for long fields (ARR, founder profile)

### 7. Page 4 — Match Output ⬜
- [ ] `/match` route with sidebar + main layout
- [ ] Sidebar: company picker grouped by cohort
- [ ] Main: renders Tier 1 / Tier 2 / Do Not Match cards for normal companies
- [ ] WIDMO branch: if `accepts_investor_intros = false`, render customer targets + events instead of VC matches
- [ ] Match card component with score badge, dimension dots, rationale text, next step
- [ ] Logged-in users: edit rationale/next-step via modal; edit scores via inline inputs

### 8. Admin — user management ⬜
- [ ] `/admin/users` route (logged-in only, role=admin)
- [ ] List all users (email, name, role, created_at, invited_by)
- [ ] "Invite user" form (email + name + initial password)
- [ ] Delete user (with confirm, can't delete self)

### 9. API routes ⬜
- [ ] `POST /api/investors`, `PATCH /api/investors/:id`, `DELETE /api/investors/:id` — all session-protected
- [ ] Same shape for `/api/companies`, `/api/matches`, `/api/customer-targets`, `/api/events`, `/api/methodology-dimensions`, `/api/methodology-cards`, `/api/users`
- [ ] Zod validation on every write endpoint
- [ ] Return 401 if no session, 403 if session but role != admin/editor

### 10. Dockerization ⬜
- [ ] `Dockerfile` — multi-stage build (deps → builder → runner)
- [ ] `next.config.ts` → `output: "standalone"`
- [ ] `@prisma/nextjs-monorepo-workaround-plugin` for standalone + Prisma
- [ ] `docker-compose.yml` for local dev (app + postgres)
- [ ] `.dockerignore`

### 11. Deployment to rafiq-dev ⬜
- [ ] SSH to droplet, create `tbdc_poc` DB inside `shared-postgres` container
- [ ] Create a DB user for the app with restricted privileges
- [ ] Build Docker image, transfer to droplet (or build on droplet)
- [ ] Run `tbdc-web` container on unused port (e.g., 3010 — **not 3000**, that's dewey-api)
- [ ] Add Caddy route: `tbdc.ready4vc.com { reverse_proxy tbdc-web:3010 }`
- [ ] Reload Caddy
- [ ] Run Prisma migrations + seed against production DB
- [ ] Smoke test: https://tbdc.ready4vc.com loads, login works, data renders

---

## Open questions / decisions needed

- **Roles:** Just `admin` for now, or split into `admin` vs `editor`? (Currently: single `admin` role, all invited users = admins)
- **Password reset:** Out of scope for POC, or include a basic "forgot password" flow?
- **Audit log:** Should edits to investor/company/match data be logged (who changed what, when)? Nice-to-have, not in v1.
- **Data refresh from reference HTML:** If TBDC provides updated investor/company data later, is there a re-import flow or is manual editing in the UI the only path? (Currently: UI is the only path after initial seed.)
