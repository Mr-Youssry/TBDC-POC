# Changelog

All notable changes to TBDC POC, newest first. Every entry corresponds to one or more git commits — see the commit hash in brackets.

Format: `## YYYY-MM-DD — [short hash] Title` followed by 1–3 lines explaining *why* and *what*.

---

## 2026-04-09 — [9da9297] Fix Docker runner missing transitive deps

- Selective `COPY --from=builder` for individual node_modules (`prisma`, `tsx`, `bcryptjs`, etc.) was missing transitive deps the prisma CLI needs at exec time. `prisma db push` failed with "Cannot find module @prisma/config" inside the container.
- Switched to a single `COPY --from=builder /app/node_modules ./node_modules`. Image is larger but reliable. Pruning is in the post-launch backlog.

## 2026-04-09 — [ec5b16f] Multi-stage Dockerfile + standalone output

- `next.config.ts` → `output: "standalone"` + `serverExternalPackages` for `@prisma/client`, `@prisma/adapter-pg`, `pg`, `bcryptjs` so the bundler doesn't try to inline native or driver code.
- Three-stage Dockerfile: `deps` (npm ci) → `builder` (prisma generate + next build with placeholder env) → `runner` (node:20-alpine, tini, non-root nextjs user). Real `DATABASE_URL` and `AUTH_SECRET` injected at runtime via `--env-file`.
- `.dockerignore` excludes `reference/`, `docs/`, `.env*`, `.serena/`, `.claude/`.

## 2026-04-09 — [a6962de] Admin user management page

- `/admin/users` protected by proxy.ts + `requireSessionForPage`. InviteForm uses `useActionState` to post email/name/password to `inviteUser` server action (Zod-validated, bcrypt password, admin role, records inviter).
- DeleteUserButton has inline confirm flow and the server action refuses to delete the caller's own account.
- SiteHeader gained a "users" link visible only when authenticated.

## 2026-04-09 — [df6ee46] Match output page with WIDMO branch

- `/match?c=<companyId>` server component, sidebar groups companies by cohort, WIDMO-style rows use warn colors.
- Normal branch: profile card → Tier 1 cards → Tier 2 cards → Do Not Match list. Each match card shows score badge, per-dimension dot signals (geo/stage/sector/revenue/cheque/founder/gap), inline-edit short fields, modal-edit rationale + next step.
- WIDMO branch: warn gate card with `gateNote`, customer meeting targets grid, industry event pill row.
- Server actions (updateMatch* / updateDoNotMatch / updateCustomerTarget) Zod-whitelist fields and require admin.

## 2026-04-09 — [7224be8] Companies page

- Same editing pattern as investors. Cohort grouping (Pivot 1, Horizon 3) via column.
- AcceptsIntrosToggle client component flips the WIDMO flag optimistically; reverts on server failure. updates revalidate both `/companies` and `/match`.

## 2026-04-09 — [1bfb7f2] Investors page with inline + modal editing

- EditableCell component: inline text/number/select with autofocus, Enter/blur-to-save, Esc-to-cancel, optimistic-ish via `useTransition`.
- Badges module (TypeBadge / StageBadge / LeadBadge / WarnBadge / OpenBadge) carries the exact color palette from the reference HTML.
- Investors page: short cols inline-edit, sectors/portfolio/contact click-to-modal. Add/delete row buttons admin-only.

## 2026-04-09 — [a4b725b] Site layout + methodology page

- Split bare root layout from `(site)/layout.tsx` (header + nav + 1200px main wrapper). Login page bypasses the site chrome.
- SiteHeader is a server component showing sign-in/sign-out + admin links based on session.
- NavTabs is a client component using `usePathname` for active highlight.
- LongTextModal generic click-to-edit modal for long-form fields (used everywhere).
- Methodology page renders dimensions table, 4 tier legend cards, 4 philosophy cards from Prisma. All editable when logged in.

## 2026-04-09 — [c22f2bb] NextAuth v5 Credentials provider + admin guard

- Split edge-safe `src/auth.config.ts` (used by `proxy.ts` middleware) from full-Node `src/auth.ts` (used by server components + route handlers). The proxy can't import Prisma or bcryptjs.
- Credentials provider validates email+password via Zod + bcrypt against the User table. JWT session strategy; jwt/session callbacks carry id and role.
- `src/lib/guards.ts` exports `getSession` / `requireAdmin` / `requireSessionForPage`. Casts around the NextAuth overload so the RSC signature type-checks.
- Root `proxy.ts` (Next 16 middleware replacement) protects `/admin/*`. Minimal `/login` page using `useActionState` + server action.

## 2026-04-09 — [4760ba2] Prisma 7 schema + seed parsed from reference HTML

- Schema with User, Investor, Company, Match, DoNotMatch, CustomerTarget, IndustryEvent, MethodologyDimension, MethodologyCard.
- Prisma 7 driver-adapter pattern (`@prisma/adapter-pg`) since `url` is no longer allowed in `schema.prisma`. `prisma.config.ts` supplies schema path + migrations + seed command.
- Runtime client in `src/lib/prisma.ts` constructs `PrismaPg(DATABASE_URL)` at request time with a dev-mode singleton.
- Seed script ingests all 24 investors, 10 companies, 38 matches, 27 do-not-match rows, 8 WIDMO customer targets, 3 events, 9 methodology dimensions, 4 cards verbatim from `reference/tbdc_investor_matching_poc_v2.html`.
- Bootstrap admins for korayem@ and youssry@ready4vc.com seeded only when User table is empty.

## 2026-04-09 — [fb004ba] Design doc + implementation plan for phases 2-11

- Locked all open roadmap decisions: single admin role, no password reset, no audit log, one-time seed, accept BL-001 workaround, accept BL-004, verify BL-003.
- Cleared backlog after grep-diffing `globals.css` against the reference HTML (BL-003 verified).
- Wrote `docs/superpowers/specs/2026-04-08-tbdc-poc-design.md` and `docs/superpowers/plans/2026-04-08-tbdc-poc-implementation-plan.md` per the superpowers brainstorming → writing-plans workflow.

## 2026-04-09 — [deploy] Production deployment to rafiq-dev

- Project isolated under `/root/tbdc-poc/` on the droplet (separate from `/root/Rafiq-v1/`).
- New DB `tbdc_poc` owned by new role `tbdc_app` inside the existing `shared-postgres` container (no new Postgres container).
- `tbdc-web` container on `docker_rafiq-shared` network (shared with caddy + shared-postgres). Restart policy `unless-stopped`. Env loaded from `/root/tbdc-poc/tbdc-web.env`.
- `prisma db push` + seed run via `docker exec`. Bootstrapped 2 admins.
- TBDC site block appended to `Rafiq-v1/docker/caddy/Caddyfile` with a clear "TBDC POC — isolated project, NOT part of Rafiq" comment header. `caddy reload` succeeded with only pre-existing warnings.
- DNS A record `tbdc.ready4vc.com` → `67.205.157.55` already in place. Caddy provisioned Let's Encrypt cert automatically.
- Smoke test: all 6 routes return correct status codes (200 for public, 307 for `/admin/users` redirect to login). Data renders (Radical Ventures, WIDMO Spectral, Tier 1 all present in HTML).

## 2026-04-08 — [69ac880] Add CLAUDE.md onboarding doc at repo root

- Generated via `/init`. Focused on non-obvious facts future sessions would otherwise rediscover the hard way: webpack-vs-Turbopack asymmetry, Tailwind v4 CSS-first token location, the `reference/` HTML being source-of-truth for data + design, the WIDMO hard-gate edge case, the inline-vs-modal editing rule, deployment target details, and where the memory files live.
- Deliberately terse on anything already documented in `docs/roadmap.md` — CLAUDE.md points at the roadmap/changelog/backlog as the primary project plan; it does not duplicate them.

## 2026-04-08 — [ee9495f] Fix Git Credential Manager config

- Root cause: two `credential.helper` values were stacked — system-level `manager` (correct) plus global `manager-core` (deprecated name, executable missing). Git ran `manager` first (sometimes returning stale creds) then tried `manager-core` and errored with "not a git command".
- Fix: `git config --global --unset credential.helper`. Only the system-level `manager` remains, backed by the working `git-credential-manager v2.6.0` executable at `/mingw64/bin/git-credential-manager`.
- Verified by running `git fetch origin` and this commit's `git push` without any credential bypass — both worked clean.
- BL-005 resolved and removed from backlog. Global `~/.claude/CLAUDE.md` no longer needs the URL-embedded-token workaround (but it's kept as a fallback note).

## 2026-04-08 — [bfe1f3f] Connect GitHub remote (Mr-Youssry/TBDC-POC)

- Created private GitHub repo `Mr-Youssry/TBDC-POC` and pushed all 6 local commits.
- Added `origin` remote with clean HTTPS URL (no token in `.git/config`); local `main` tracks `origin/main`.
- Used URL-embedded-token workaround to bypass Windows' broken Git Credential Manager (`manager-core` helper referenced but executable missing from PATH — see BL-005 in backlog). Workaround documented in global `~/.claude/CLAUDE.md`.
- Rotated the GitHub PAT: old classic token (`ghp_ilRV68...`) was invalid, replaced with fine-grained PAT `TBDC-POC-claude` scoped only to this repo with Contents R/W. Stored in global CLAUDE.md, flagged old token as invalid.
- BL-002 (missing GitHub remote) resolved and removed from backlog.

## 2026-04-08 — [a748a49] Docs handoff structure + dev server webpack fix

- Added `docs/roadmap.md`, `docs/changelog.md`, `docs/backlog.md` so new sessions can resume without losing context.
- Switched `npm run dev` from Turbopack to webpack. Root cause: Turbopack on Windows crashes when spawning the PostCSS loader subprocess (`STATUS_DLL_INIT_FAILED 0xc0000142`). `next build` with Turbopack is unaffected. `npm run dev:turbo` kept as an escape hatch for retesting the fix after future Next.js releases.

## 2026-04-08 — [a053202] Port original TBDC design tokens into Tailwind v4 + visual spike

- Replaced shadcn's default neutral palette with the exact warm off-white + Georgia serif aesthetic from `reference/tbdc_investor_matching_poc_v2.html`.
- All 28+ original tokens ported verbatim as CSS variables and exposed as Tailwind v4 utility classes via `@theme inline`: tier colors (`t1/t2/t3`), warn/hard-gate, blue accents, surface ramp (`surface/surface-2/surface-3`), text ramp (`text-1/text-2/text-3`), Georgia font stack.
- Dropped Geist Google Fonts in favor of system Georgia serif to match the original.
- Built a visual parity spike at `/` — header, nav tabs, tier badges, surface ramp — to verify the port against the reference HTML.
- Build smoke test passed clean (2.7s compile, TS passes, 4/4 static pages).

## 2026-04-08 — [10bfd93] shadcn/ui init (auto-commit)

- `npx shadcn@latest init -t next -d` generated `components.json` (base-nova preset, neutral base color), `src/lib/utils.ts`, `src/components/ui/button.tsx`, and installed `@base-ui/react`, `class-variance-authority`, `clsx`, `lucide-react`, `tailwind-merge`, `tw-animate-css`.
- Note: this commit was authored by `Ahmed Youssry` because shadcn auto-committed using the machine's global git config. All shadcn defaults (neutral baseColor) were overridden by the subsequent design token port.

## 2026-04-08 — [654ce7c] Scaffold Next.js 16 + TypeScript + Tailwind v4 + App Router

- `create-next-app@latest` now scaffolds Next.js 16.2.3 (not 15). Turbopack, Tailwind v4, ESLint, App Router, `@/*` alias are all defaults. Used `--typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --no-agents-md`.
- Because the scaffold CLI refuses to run in a directory with unknown files, the original HTML was moved into `reference/` first.
- Also had to work around `create-next-app` rejecting the directory name `TBDC-POC` ("npm name can no longer contain capital letters") — scaffolded into a sibling `tbdc-poc-scaffold` dir and moved files in.
- Build smoke test: compiled clean in 2.3s, TS passes, 4/4 static pages generate.

## 2026-04-08 — [a3bd463] Move original HTML to reference/

- Moved `tbdc_investor_matching_poc_v2.html` into `reference/` so `create-next-app` could run. Keeps the source-of-truth prototype preserved for design and data reference.

## 2026-04-08 — [830b751] Initial commit: static HTML prototype

- Committed the single-file static HTML prototype as the "before" state, so the evolution from prototype to functional Next.js app is preserved in git history.
- Added a `.gitignore` covering the standard Next.js, Node, and editor patterns (later replaced by the one create-next-app generated, which is essentially equivalent).
