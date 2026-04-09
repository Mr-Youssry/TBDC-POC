# TBDC POC — Roadmap

> Last updated: 2026-04-09
> Status legend: ✅ done · 🔄 in progress · ⬜ pending · ⏸ blocked

This roadmap is the single source of truth for what this project is and what's next. New Claude Code sessions should read this first, then [changelog.md](changelog.md) for history, then [backlog.md](backlog.md) for open issues.

---

## Project snapshot

**Status: LIVE.** Deployed at https://tbdc.ready4vc.com on the rafiq-dev droplet.

**What this is:** A functional, authenticated, edit-in-place web app for the Toronto Business Development Centre partnerships team to match portfolio companies to investors. Built from a single-file static HTML prototype ([`../reference/tbdc_investor_matching_poc_v2.html`](../reference/tbdc_investor_matching_poc_v2.html)) into Next.js + Postgres while preserving the original's visual design pixel-for-pixel.

**Login:** https://tbdc.ready4vc.com/login
- Bootstrap admins: `korayem@ready4vc.com`, `youssry@ready4vc.com`
- Temp password: `POC@ready4vc` (change at first opportunity by re-inviting)

**Memory files for agent context** (outside the repo):
`C:\Users\Ahmed\.claude\projects\c--my-code-TBDC-POC\memory\`
- `user_ahmed.md` — primary user is Ahmed Youssry
- `project_tbdc_poc.md` — full project overview, stack, data model
- `reference_rafiq_dev_droplet.md` — DigitalOcean droplet details
- `feedback_editing_ux.md` — inline-vs-modal editing rule

**Design + plan:** [docs/superpowers/specs/2026-04-08-tbdc-poc-design.md](superpowers/specs/2026-04-08-tbdc-poc-design.md), [docs/superpowers/plans/2026-04-08-tbdc-poc-implementation-plan.md](superpowers/plans/2026-04-08-tbdc-poc-implementation-plan.md)

---

## Tech stack (locked)

| Layer       | Choice                                                        |
| ----------- | ------------------------------------------------------------- |
| Framework   | Next.js **16.2.3** (App Router, TypeScript, `src/` layout)    |
| Styling     | Tailwind CSS **v4** (CSS-first config via `@theme inline`)    |
| Components  | shadcn/ui (base-nova preset, with TBDC token overrides)       |
| ORM         | Prisma **7** (driver-adapter pattern via `@prisma/adapter-pg`) |
| Database    | Postgres — `tbdc_poc` DB, `tbdc_app` user, inside the existing `shared-postgres` container on rafiq-dev |
| Auth        | NextAuth **v5 beta** (`next-auth@beta`), Credentials provider, JWT sessions, bcryptjs |
| Validation  | Zod (every server action + auth)                              |
| Deployment  | Docker container `tbdc-web` on `docker_rafiq-shared` network behind existing Caddy |
| URL         | https://tbdc.ready4vc.com (Caddy auto-HTTPS)                  |
| Package mgr | npm                                                           |

**Dev server note:** Use `npm run dev` (webpack). Turbopack crashes on Windows with `STATUS_DLL_INIT_FAILED (0xc0000142)` when spawning the PostCSS worker. `next build` with Turbopack works fine. `npm run dev:turbo` is retained for retesting after Next.js updates.

**Prisma 7 note:** The `url` field is no longer allowed in `schema.prisma`. Connection config lives in `prisma.config.ts` for migrations, and `src/lib/prisma.ts` constructs `PrismaClient({ adapter: new PrismaPg(DATABASE_URL) })` at runtime.

---

## Current state (what's done)

### Phase 1 — Foundation ✅
- Git repo + GitHub remote (`Mr-Youssry/TBDC-POC`)
- Original HTML preserved in `reference/`
- Next.js 16 scaffolded with TypeScript, Tailwind v4, App Router, `src/` layout
- shadcn/ui initialized
- TBDC design tokens ported verbatim from original HTML into `src/app/globals.css`
- Dev server running on webpack (Turbopack fallback documented)
- docs/ handoff structure (roadmap, changelog, backlog)

### Phase 2 — Database & data layer ✅
- Prisma 7 schema with 9 models: User, Investor, Company, Match, DoNotMatch, CustomerTarget, IndustryEvent, MethodologyDimension, MethodologyCard
- `prisma.config.ts` (Prisma 7 config file) + `src/lib/prisma.ts` runtime client with PrismaPg adapter
- Seed script ingests all 24 investors, 10 companies, 38 matches, 27 do-not-match rows, 8 WIDMO customer targets, 3 events, 9 methodology dimensions, 4 philosophy cards verbatim from the reference HTML
- Bootstrap admins seeded only when User table is empty

### Phase 3 — Auth ✅
- NextAuth v5 beta with Credentials provider + bcryptjs
- Edge-safe `src/auth.config.ts` (used by `proxy.ts` middleware) split from full-Node `src/auth.ts`
- JWT session strategy carrying `id` and `role` via callbacks
- `src/lib/guards.ts` exports `getSession` / `requireAdmin` / `requireSessionForPage`
- `proxy.ts` (Next 16 middleware replacement) protects `/admin/*`
- `/login` page using `useActionState` + server action

### Phase 4 — Layout + Methodology ✅
- Root layout is the bare html/body shell; `(site)/layout.tsx` wraps in SiteHeader + NavTabs
- SiteHeader shows sign-in/sign-out + admin "users" link
- NavTabs is a client component using `usePathname` for active highlight
- `/methodology` renders dimensions table, tier legend cards, philosophy cards from Prisma
- LongTextModal generic click-to-edit modal for long-form fields
- Server actions Zod-whitelist fields and require admin

### Phase 5 — Investors page ✅
- EditableCell inline component (text/number/select)
- Badges module (TypeBadge / StageBadge / LeadBadge / WarnBadge / OpenBadge)
- `/investors` table — short cols inline-edit, long cols modal-edit
- Add/delete row buttons for admins

### Phase 6 — Companies page ✅
- Same pattern as investors
- AcceptsIntrosToggle client component for the WIDMO flag

### Phase 7 — Match output page ✅
- `/match?c=<companyId>` server component with sidebar + main pane
- Sidebar groups by cohort, WIDMO-style rows highlighted in warn colors
- Normal branch: company profile, Tier 1 cards, Tier 2 cards, Do Not Match list
- WIDMO branch: warn gate card, customer meeting targets grid, industry event pill row
- Inline-edit short fields, modal-edit rationale + next step

### Phase 8 — Admin user management ✅
- `/admin/users` protected by proxy.ts + requireSessionForPage
- InviteForm via useActionState → inviteUser server action
- DeleteUserButton with inline confirm; refuses to delete self

### Phase 9 — API routes ⬜ (skipped — server actions covered all writes)

### Phase 10 — Dockerization ✅
- `next.config.ts` → `output: "standalone"`, `serverExternalPackages` for prisma/pg/bcryptjs
- Multi-stage Dockerfile: deps → builder → runner (node:20-alpine, tini, non-root)
- Full node_modules copied in runner so prisma CLI can run db push + seed at exec time

### Phase 11 — Deployment ✅
- Project files isolated under `/root/tbdc-poc/` on rafiq-dev (separate from `/root/Rafiq-v1/`)
- Repo cloned to `/root/tbdc-poc/repo`
- DB `tbdc_poc` + role `tbdc_app` created inside `shared-postgres` container
- `docker_rafiq-shared` network shared with caddy + shared-postgres
- Container `tbdc-web` running with `--restart unless-stopped`
- Caddyfile appended with `tbdc.ready4vc.com { reverse_proxy tbdc-web:3000 }` (clearly delimited as TBDC project)
- Caddy auto-HTTPS via Let's Encrypt
- Smoke test confirmed: all 6 routes return correct status codes; data renders

---

## Post-launch backlog (future work)

These were intentionally deferred as out-of-scope for the v1 POC:

- Password reset / forgot-password flow (admins reset peer passwords by re-inviting)
- Audit log of who edited what
- CSV import/export
- Search / pagination (24 + 10 rows fit on one page)
- Unit + E2E test suites
- CI/CD pipeline (currently: manual `git pull && docker build && docker stop && docker run` on the droplet)
- Monitoring / alerting
- Email-on-invite (admin currently shares temp password out-of-band)
- Image-size optimization for the runner container (currently copies full node_modules; could prune)
- Caddyfile lives inside `Rafiq-v1/docker/caddy/Caddyfile` — fully isolating that into a TBDC-only file would require restructuring Caddy's mounted config
