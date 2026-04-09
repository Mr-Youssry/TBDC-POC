# Changelog

All notable changes to TBDC POC, newest first. Every entry corresponds to one or more git commits — see the commit hash in brackets.

Format: `## YYYY-MM-DD — [short hash] Title` followed by 1–3 lines explaining *why* and *what*.

---

## 2026-04-08 — [pending] Add CLAUDE.md onboarding doc at repo root

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
