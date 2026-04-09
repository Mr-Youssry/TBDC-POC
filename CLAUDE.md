# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

TBDC Investor Matchmaking POC — a Next.js app being grown from a single-file static HTML prototype into a functional website with Postgres + login. Built for the Toronto Business Development Centre partnerships team to match portfolio companies to investors using a weighted 16-point scoring rubric (geography, stage, sector, revenue, cheque size, founder fit, portfolio gap, with hard gates for companies that decline investor intros).

**The project plan, history, and open issues live in [`docs/`](docs/). Read them before doing anything non-trivial:**
- [docs/roadmap.md](docs/roadmap.md) — current state, locked tech stack, 11-phase roadmap with tasks and subtasks
- [docs/changelog.md](docs/changelog.md) — reverse-chronological log of every commit with the "why"
- [docs/backlog.md](docs/backlog.md) — open issues only; **resolved items are deleted, not checked off**

## Commands

```bash
npm run dev        # dev server — uses WEBPACK (not Turbopack, see gotcha below)
npm run dev:turbo  # dev server with Turbopack — BROKEN on Windows, kept for retesting
npm run build      # production build — uses Turbopack (works fine)
npm run start      # run production build
npm run lint       # ESLint 9 flat config
```

Port 3000 is often occupied by another process on the dev machine; Next will auto-fall-back to 3001. On the deployment droplet (`rafiq-dev`), port 3000 is permanently taken by `dewey-api` — use 3010+ there.

## Critical gotchas

### Dev server must use webpack, not Turbopack

`npm run dev` is hard-pinned to `next dev --webpack`. Do NOT "fix" this back to plain `next dev`. Root cause: on Windows, Turbopack crashes with `STATUS_DLL_INIT_FAILED (0xc0000142)` when spawning the PostCSS loader subprocess. `next build` with Turbopack is unaffected — this asymmetry is intentional. Tracked as BL-001 in [docs/backlog.md](docs/backlog.md); retest with `npm run dev:turbo` after Next.js updates.

### Tailwind v4 is CSS-first — there is no `tailwind.config.ts`

All design tokens live in [src/app/globals.css](src/app/globals.css) using the `@theme inline` directive, not in a JS config. If you're looking for where `bg-t1-bg`, `text-text-3`, or `border-warn-bdr` come from, it's there. When you need to add a new color token: add a `--color-<name>` line inside `@theme inline { ... }` pointing to a CSS variable declared in `:root`.

### The reference HTML is source of truth for data + design

[docs/reference/tbdc_investor_matching_poc_v2.html](docs/reference/tbdc_investor_matching_poc_v2.html) is the original self-contained prototype. It contains:
- All 28+ design tokens ported verbatim into `globals.css` (colors, tiers, surface ramp, typography)
- The 24 investors, 10 portfolio companies, and every match/WIDMO row in `var INVESTORS`, `var COMPANIES`, `var MATCHES` (around line 318)
- The weighted scoring logic and tier thresholds

Treat it as read-only. When seeding the DB, parse data from this file — do not retype it. When building UI components, match the original's visual output pixel-for-pixel; Ahmed picked "same formatting" over modernization.

### shadcn was initialized with base-nova preset, all defaults overridden

[components.json](components.json) says `baseColor: neutral` and `style: base-nova`, but this is misleading — every color variable set by shadcn init is **overridden** by the TBDC token port in [src/app/globals.css](src/app/globals.css). Do not change shadcn's config to "stone" or "new-york" expecting a visual change; you'd need to edit globals.css instead. One shadcn commit (`10bfd93 feat: initial commit`) was made automatically by the shadcn CLI and is authored as Ahmed Youssry via the machine's global git config — it is not a hand-written commit.

### WIDMO is the canonical edge case

Company index 9 in the reference HTML (`WIDMO Spectral`) has `inv: false` — the founder explicitly declined investor introductions. The match output for WIDMO shows **customer meeting targets** instead of VC matches, and the hard gate is visually flagged. Any data model and any UI branch for "matches" must handle this case; do not simplify it away. The scoring rubric's **hard gate** runs before any scoring, and WIDMO is its only trigger in the seed data.

### Inline editing UX rule

Short fields (names, numbers, dropdowns) are **inline-editable** in the table when logged in. Long-form fields (rationale, descriptions, portfolio text) use **click-to-open modal** editors. Logged-out visitors see read-only everywhere. This is a locked decision, not a default — do not build a separate "admin forms" page.

## Architecture (what's built so far)

Only the foundation. Phase 2+ is pending — see roadmap.

- **[src/app/layout.tsx](src/app/layout.tsx)** — minimal root layout, Georgia serif via CSS tokens, no Google fonts
- **[src/app/globals.css](src/app/globals.css)** — Tailwind v4 + TBDC design tokens (the important file)
- **[src/app/page.tsx](src/app/page.tsx)** — visual spike rendering header + nav tabs + tier badges + surface ramp for parity verification against the reference HTML. **Not a real page** — will be replaced by the Methodology tab.
- **[src/lib/utils.ts](src/lib/utils.ts)** — shadcn `cn()` helper
- **[src/components/ui/button.tsx](src/components/ui/button.tsx)** — shadcn base component

No database, no Prisma schema, no auth, no API routes yet. Phase 2 in the roadmap covers Prisma + seed; Phase 3 covers NextAuth v5.

## Deployment target (not deployed yet)

**Droplet:** `rafiq-dev` (67.205.157.55) — a shared DigitalOcean droplet that already hosts other Ahmed projects. Infrastructure already in place:
- Docker 29 + Caddy container handling :80/:443 with automatic HTTPS
- `shared-postgres` container — **create a new `tbdc_poc` DB inside it**; do not spin up a new Postgres container
- Other co-located apps using port 3000 (dewey-api), 8080 (keycloak), etc. — use 3010+ for TBDC
- Deploy as a Docker container, add a Caddy route for `tbdc.ready4vc.com`, and reload Caddy

Full droplet context in the memory file `reference_rafiq_dev_droplet.md` (path below).

## Memory files (outside the repo)

Persistent context lives at `C:\Users\Ahmed\.claude\projects\c--my-code-TBDC-POC\memory\`:
- `user_ahmed.md` — primary user is Ahmed Youssry (youssry@ready4vc.com); business partner Ahmed Korayem (korayem@ready4vc.com) is co-admin. Commits should use the default global git config (Youssry) — do not override with `-c user.email`.
- `project_tbdc_poc.md` — full project overview and data model
- `reference_rafiq_dev_droplet.md` — droplet details for deployment
- `feedback_editing_ux.md` — inline-vs-modal editing preference rationale

These files are the agent-memory handoff between sessions. Update them when you learn something durable; don't duplicate their content into code comments.

## Git, GitHub, and credentials

- **Remote:** `origin` → https://github.com/Mr-Youssry/TBDC-POC (private)
- `git push` / `git pull` work through the normal Windows Git Credential Manager flow (fixed 2026-04-08 — BL-005 was removing a stale `credential.helper = manager-core` from global config)
- GitHub PAT `TBDC-POC-claude` is stored in `~/.claude/CLAUDE.md` (global) — fine-grained, scoped only to this repo
- When committing, do NOT use `-c user.email` overrides — the global git config (Ahmed Youssry) is the correct identity. Two commits in history were authored as Ahmed Korayem from an earlier assumption; those are historical, don't replicate the pattern.
