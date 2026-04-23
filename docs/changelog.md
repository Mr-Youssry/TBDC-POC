# Changelog

All notable changes to TBDC POC, newest first. Every entry corresponds to one or more git commits — see the commit hash in brackets.

Format: `## YYYY-MM-DD — [short hash] Title` followed by 1–3 lines explaining *why* and *what*.

---

## 2026-04-23 — Methodology page: Phase 1/2/3 card layout + live funnel

- **Layout rebuild (Level 1 of the preview adoption).** `/methodology` now matches the `docs/reference/tbdc-preview.txt` structure: page-header → Phase 1 hard-gate card grid → Phase 2 ranked-dimension card grid (colored left borders keyed to rank) → Phase 3 warm/cold execution-protocol cards → Filter Architecture anti-spam funnel → Score tiers → Design rationale → Summary.
- **Live funnel.** New `getFunnelData()` helper reads Investor × Company × Match at request time and produces a 5-stage drop: total pairs → after G1 → after G2 → after G3 → scored. Per-gate drops use coarse heuristics (G1 reads `Company.acceptsInvestorIntros`, G2 treats `Investor.region === "US"` as a fail, G3 assumes all active). Tier breakdown at the bottom is exact (`Match.tier` groupBy).
- **Rubric unchanged.** Still 3 gates / 7 dims / 14 pts. No schema migration, no `Match` recompute, no plugin edit, no seed rewrite. Every dimension and gate text still edits in-place via `LongTextModal`.
- **Components added under `src/app/(site)/methodology/_components/`:** `funnel-data.ts`, `funnel-chart.tsx`, `gate-card.tsx`, `dimension-card.tsx`, `execution-protocol.tsx`. Page-local, not exported to other routes.

## 2026-04-23 — Tier A visual reskin + methodology video hero

- **Palette + fonts.** Remapped the values of every `:root` design token in `src/app/globals.css` to the preview palette (navy sidebar #0f172a, light-slate content #f1f5f9, blue accent #2563eb, preview's green/amber/red tier ramp). Token NAMES unchanged, so all 100+ existing usages (`bg-surface`, `text-text-1`, `bg-t1-bg`, `border-warn-bdr`, etc.) pick up the new palette automatically with zero page-level churn. Font family swapped from Georgia to Inter via `next/font/google`, attached as `--font-inter` CSS variable.
- **Sidebar on a dark surface.** `src/components/sidebar.tsx` switches from `bg-surface` (now white) to `bg-sidebar` (navy); text uses `text-sidebar-foreground`, active items use blue `bg-sidebar-primary`, hover darkens to `bg-sidebar-accent`. Icons and the collapse footer updated to read on dark.
- **Site header flipped.** `src/components/site-header.tsx` moves from `bg-[var(--text-1)]` (which is now navy and would stack with the sidebar) to `bg-surface` + bottom border, so it reads as a white card-like top strip with slate info chips.
- **`DimCellGrid` on Match Output.** New presentational component in `src/components/dim-cell-grid.tsx` renders all 7 dimensions as coloured cells plus a score bar, replacing the row of pill-shaped `dimSignal()` spans on each match row. The old pill row only surfaced 5 of the 7 dimensions; the grid shows every dimension of the 14-point rubric. Scoring math and the tier badge are unchanged.
- **Methodology video hero.** Google Drive walkthrough (`file/d/1RppYj9i5s6F3wftbYCk3FuxQqV6AV6ck/preview`) embedded as the first section of `/methodology`, above the sticky sub-nav. 16:9 responsive iframe; file is shared "Anyone with the link".
- **Opt-in polish utilities.** New `.app-card`, `.app-table`, `.app-page*` classes in `globals.css` for pages that want to adopt the preview's tighter card + uppercase-micro-header look without a full restyle pass.
- **Explicitly not in this pass.** Methodology rubric unchanged (still 3 gates / 7 dims / 14 pts — not the preview's 5/6/10). No new routes (Investor Profile, Company Profile, Analytics). No radar, heatmap, funnel, or kanban. Those were scoped to Tier B/C plans and will ship separately if approved.

## 2026-04-23 — Mission Control moved off `/ClawAdmin`, one-click browser launch

- **Path conflict fixed.** Caddy routes `/ClawAdmin` and `/ClawAdmin/*` on `demo.korayem.info` to `openclaw-gateway:18789` (OpenClaw Control UI). The TBDC Next.js app also had a page at `/ClawAdmin` (the Mission Control dashboard), which meant clicking "Mission Control" in the nav landed on OpenClaw's login form instead of the TBDC dashboard — so users never saw the gateway token. Moved the route to `/mission-control`; nav and sidebar hrefs updated to match. OpenClaw keeps `/ClawAdmin/` on demo.korayem.info unchanged.
- **"Launch Control UI in Browser" button** added to Mission Control. Server-renders the token into an `href` of `https://demo.korayem.info/ClawAdmin/#token=<token>` so the Control UI auto-consumes it from the URL fragment on first load and caches it in localStorage for subsequent visits. This is now the primary launch path; the SSH-tunnel download script is demoted to a "power user" card below.
- **openclaw-chat-bridge durable restart.** The bridge was silently down for 11 days (the openclaw-gateway container was recreated at some point with the image's default entrypoint, so `/openclaw-init.sh` — which backgrounds `node /openclaw-chat-bridge.mjs` before execing the gateway — never ran). Recreated the container with `--entrypoint /openclaw-init.sh`; gateway state volume is preserved. All `/api/openclaw/*` endpoints functional again.

## 2026-04-10 — Mission Control dashboard (no SSH)

- **`/ClawAdmin`** now shows a live TBDC-branded Mission Control dashboard with gateway status, plugin details, model config, and sanitized JSON config — all fetched server-side from the openclaw-chat-bridge. No SSH tunnel required.
- **Three new bridge endpoints:** `/status` (gateway overview), `/plugins` (tbdc-db metadata + inspect output), `/config` (full config with token redacted). All accessible via Caddy at `/api/openclaw/*`.
- **SSH tunnel instructions** moved to a collapsible "Power User" section at the bottom of the page for operators who want the native OpenClaw Control UI.
- **Nav tab renamed** from "07 — ClawAdmin" to "07 — Mission Control".
- **z.ai API key** injected (`ZAI_API_KEY`), default model set to `zai/glm-4.5`. End-to-end chat verified: LLM + tbdc-db tool calls + Postgres query all working ("24 investors, first alphabetically is Accel India").
- **`/analyst` chat pane** rearchitected from broken WS protocol to an HTTP bridge (`POST /api/openclaw/chat`). The bridge wraps `openclaw agent -m ... --session-id ...` CLI inside the gateway container. Works end-to-end but has ~30-60s cold-start latency per turn (POC acceptable).
- **OpenClaw Control UI** confirmed to be unservable via reverse proxy (WS connect RPC requires loopback locality). SSH tunnel documented as the supported remote-access pattern per OpenClaw's own CLI.

## 2026-04-09 — [deploy] v2.0 OpenClaw analyst live on rafiq-dev (blocked on z.ai key)

- **Live at https://tbdc.ready4vc.com** alongside the v1 UI. New surfaces: `/analyst` (admin chat pane), `/admin/audit` (audit log + one-click revert), `/ClawAdmin/` (OpenClaw Control UI, basic-auth-gated). v1 pages (`/methodology`, `/investors`, `/companies`, `/match`, `/login`) unchanged and all smoke-tested green after redeploy.
- **New container:** `openclaw-gateway` pinned to `ghcr.io/openclaw/openclaw:2026.4.8`, running on the existing `docker_rafiq-shared` network, with the `tbdc-db` custom plugin installed at first boot via `openclaw plugins install -l`. Plugin registers 4 read tools (`list_investors`, `get_company`, `list_matches`, `get_methodology`) and 4 write tools (`update_match`, `update_company`, `update_investor`, `append_audit_note`), each requiring an explicit `actingUserId` param and appending to `AuditLog` in the same transaction as the content write.
- **Schema pushed to live DB** via `npx prisma db push --accept-data-loss` (the v1 DB had no migration history, so `migrate deploy` wasn't applicable). Added `AuditLog`, `ChatSession`, `UserRole`/`AuditOp`/`ChatScopeType` enums, `updatedByUserId`+`updatedAt` on 8 content tables. The `User.role` column was dropped and recreated as a UserRole enum — verified existing admins kept `role='admin'` after the change.
- **`tbdc_assistant` Postgres role** created via `prisma/migrations/manual/v2_roles_and_grants.sql` with SELECT on content tables + AuditLog + ChatSession + `v_user_public` view, INSERT/UPDATE on writable tables, and explicit NO access to the `User` table to prevent the plugin from leaking `passwordHash`. Plugin resolves the assistant user id via raw SQL against `v_user_public` at register time.
- **Rafiq Caddyfile** edited in-place (not appended): v1's single-line reverse_proxy block replaced with a multi-handle block routing `/ClawAdmin/*` (basic-auth) + `/analyst/ws/socket` to `openclaw-gateway:18789`, everything else to `tbdc-web:3000`. Pre-edit Caddyfile backed up at `/root/tbdc-poc/backups/Caddyfile.pre-v2-20260409-185717`.
- **Pre-deploy pg_dump** at `/root/tbdc-poc/backups/pre-v2-20260409-185717.sql` (50 KB). Restore recipe in the Korayem handoff doc.
- **Blocked on z.ai API key:** `ZAI_API_KEY=` is intentionally empty in `/root/tbdc-poc/openclaw.env`. The gateway boots cleanly without it; sending a chat message will surface a z.ai-auth error — that's the designed stop point. Full end-to-end commissioning happens in a joint session with Korayem per [docs/superpowers/plans/2026-04-09-v2-korayem-smoke-test.md](superpowers/plans/2026-04-09-v2-korayem-smoke-test.md).
- **Live-deploy discoveries folded back to the repo as fix commits** (see git log): Prisma client hoisting into plugin-local `node_modules` (postbuild copy script), `openclaw.plugin.json` configSchema made `databaseUrl` optional, plugin uses `v_user_public` view instead of `User` table, manual SQL switched from `format(%L)` to `ALTER ROLE` for password setting, `/admin/audit` redirects to `/login` for anon users instead of 500.

## 2026-04-09 — [v2-analyst branch] Phases 0-5 implementation

- Phase 0 — `ghcr.io/openclaw/openclaw:2026.4.8` pinned; throwaway `hello-world-db` plugin probe confirmed OpenClaw's Plugin SDK is the correct extension surface (NOT skills — skills are prompt-only SKILL.md manifests); plan addendum at [docs/superpowers/plans/2026-04-09-v2-plan-addendum-plugin-pivot.md](superpowers/plans/2026-04-09-v2-plan-addendum-plugin-pivot.md) rewrites Phase 2 from "TS skill" to "TS plugin".
- Phase 1 — Prisma schema additions + idempotent seed for Assistant user + 35 ChatSessions + defensive `role=assistant` auth guard + manual SQL grants.
- Phase 2 — `deploy/plugins/tbdc-db/` full plugin: 8 typed tools via `api.registerTool` with TypeBox/JSON Schema params, driver-adapter Prisma client, audit helper, vitest tests against a disposable Postgres (12 tests passing).
- Phase 3 — `/analyst` chat UI (server component page + `ChannelSidebar` + `MessagePane` + `useOpenClawWs` hook + `ToolCallPill`) and `/api/analyst/ws-token` HS256 JWT mint endpoint via `jose`.
- Phase 4 — `/admin/audit` page + `revertAuditEntry` server action with `oldValueJson → field` round-trip + `AuditRow` client component with `useTransition`.
- Phase 5 — `deploy/docker-compose-dev.yml` with root-entrypoint init that chowns state, copies plugin source into a root-owned `/state/custom-plugins/`, and runs `openclaw plugins install -l`. Plus `README-dev.md` and a `SMOKE-DEV.md` template.

## 2026-04-09 — [3bd9fd1] v2.0 plan addendum — role guard + prisma CLI pre-check

- Folded the two acted-on advisory items from the plan-document-reviewer pass: (1) Task 1.2b adds a defensive role check in `src/auth.ts` rejecting login for `role=assistant` users regardless of password hash state (belt-and-suspenders on top of the placeholder `!` hash from the seed); (2) Task 6.3 Step 0 adds a pre-check for Prisma CLI availability inside the live `tbdc-web` container with a documented fallback to a throwaway `node:20` container that mounts the repo.
- Plan reviewer had approved the base plan; these are quality-of-life additions that save implementer friction, not scope changes.

## 2026-04-09 — [59aafdf] v2.0 implementation plan committed

- 3,351-line implementation plan at [docs/superpowers/plans/2026-04-09-v2-openclaw-analyst-implementation-plan.md](superpowers/plans/2026-04-09-v2-openclaw-analyst-implementation-plan.md), broken into 7 phases: probe → data model → custom skill → chat UI → audit log admin → local dev stack → droplet deployment. Plus a Phase 7 that writes a separate Korayem commissioning handoff doc during execution.
- Each task has bite-sized steps with exact file paths, code snippets, commit boundaries, and gate conditions. Multi-agent dispatch guidance in the header: parallelize Phases 1+2 after Phase 0, then parallelize Phases 3+4+5.
- Folds all 4 advisory items from the spec-review loop: OpenClaw image pinned in Task 0.1, `clear_dnm` vs no-deletes clarified in the Phase 2 preamble, skill source-of-truth pinned as rsync-from-repo in Task 6.4, Caddyfile edit explicitly as in-place replacement (not append) in Task 6.6.
- Plan-document-reviewer ran against the committed plan and returned **Approved** with 5 advisory recommendations; the 2 that mattered were folded into the follow-up addendum commit.
- Execution deliberately stops one step before the z.ai API key — the final commissioning happens in a joint session with Korayem.

## 2026-04-09 — [a2a7579] v2.0 design document committed

- 519-line spec at [docs/superpowers/specs/2026-04-09-v2-openclaw-analyst-design.md](superpowers/specs/2026-04-09-v2-openclaw-analyst-design.md) for v2.0 of the TBDC POC — adds a "Chat with the Assistant" surface backed by an OpenClaw sidecar container running GLM-5.1 via z.ai Coding Plan subscription.
- Core decisions captured in the locked-decisions table: Assistant as a first-class `User` row (not a "tool"), per-entity channels (`#general` + one per company + one per investor), direct writes with `AuditLog` + one-click revert as the guardrail, custom Next.js chat pane as the only v2.0 surface, Control UI subpath-mounted at `/ClawAdmin/` behind Caddy basic auth. Deliberately sized for interview-demo load, not production resilience.
- Captures the full brainstorming session flow (6 sections, ~20 rounds of clarification) with all locked decisions, the custom `tbdc-db` skill with 10 read tools + 14 write tools, data model changes (new `AuditLog` + `ChatSession` tables + `UserRole` enum), Prisma role/grant SQL, Caddy snippet, docker layout on rafiq-dev, and risks scoped to interview-demo use profile.
- spec-document-reviewer ran against the committed spec and returned **Approved** with 4 advisory recommendations; all 4 were folded into the implementation plan rather than editing the spec.

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
- Seed script ingests all 24 investors, 10 companies, 38 matches, 27 do-not-match rows, 8 WIDMO customer targets, 3 events, 9 methodology dimensions, 4 cards verbatim from `docs/reference/tbdc_investor_matching_poc_v2.html`.
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

- Replaced shadcn's default neutral palette with the exact warm off-white + Georgia serif aesthetic from `docs/reference/tbdc_investor_matching_poc_v2.html`.
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
