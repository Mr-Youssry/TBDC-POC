# UI Consistency Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 15 UI consistency and usability issues identified in the front-end design audit (backlog BL-010 through BL-024, excluding BL-002 which is the blank Mission Control page — out of scope).

**Architecture:** Most fixes are CSS/layout changes to existing components. The layout padding issue (BL-010) is solved by adding a `<div class="px-8 py-7">` wrapper inside every page that needs it, so the layout's `<main>` stays padding-free for pages like investors that manage their own scroll. The analyst double-sidebar (BL-011) is solved by hiding the global sidebar on the `/analyst` route via a `pathname` check in the sidebar component. Frozen-pane tables (BL-012/013) follow the established investors page pattern.

**Tech Stack:** Next.js RSC, Tailwind v4 with TBDC design tokens, no new dependencies.

**Backlog IDs covered:** BL-010, BL-011, BL-012, BL-013, BL-014, BL-015, BL-016, BL-017, BL-018, BL-019, BL-020, BL-021, BL-022, BL-023, BL-024.

---

## File Structure

| File | Responsibility | Backlog |
|------|---------------|---------|
| `src/app/(site)/layout.tsx` | No change needed — keeps `overflow-y-auto` only; each page owns its padding | BL-010 |
| `src/components/sec-head.tsx` | Add optional `id` prop (forwarded to the root element) | BL-022 |
| `src/components/sidebar.tsx` | Hide on analyst route, fix active contrast, fix collapse button, fix admin label | BL-011, BL-017, BL-018, BL-024 |
| `src/components/site-header.tsx` | Responsive chips (wrap instead of hide) | BL-015 |
| `src/app/(site)/companies/page.tsx` | Frozen-pane table treatment | BL-012 |
| `src/app/(site)/pipeline/page.tsx` | Frozen-pane table, fix font size | BL-013, BL-019 |
| `src/app/(site)/match/page.tsx` | Sticky company nav sidebar | BL-014 |
| `src/app/(site)/investors/page.tsx` | Fix hover mismatch on frozen column | BL-020 |
| `src/app/login/page.tsx` | Add TBDC logo branding | BL-016 |
| `src/app/(site)/methodology/page.tsx` | Per-page title, sticky section nav | BL-021, BL-022 |
| `src/app/(site)/investors/page.tsx` | Per-page title | BL-021 |
| `src/app/(site)/companies/page.tsx` | Per-page title | BL-021 |
| `src/app/(site)/match/page.tsx` | Per-page title | BL-021 |
| `src/app/(site)/pipeline/page.tsx` | Per-page title | BL-021 |
| `src/app/(site)/analyst/page.tsx` | Per-page title | BL-021 |
| `src/app/(site)/admin/audit/page.tsx` | Per-page title, styled empty state | BL-021, BL-023 |
| `src/app/(site)/pipeline/page.tsx` | Styled empty/default state | BL-023 |

---

### Task 1: Page padding wrappers + analyst sidebar hide (BL-010, BL-011)

**Files:**
- Modify: `src/components/sidebar.tsx`
- Modify: `src/app/(site)/methodology/page.tsx`
- Modify: `src/app/(site)/admin/audit/page.tsx`

**No change to `layout.tsx`** — the layout keeps `<main className="flex-1 overflow-y-auto">` with no padding. Each page is responsible for its own padding.

**Padding strategy per page:**
- methodology — wrap return content in `<div className="px-8 py-7 max-w-[1200px]">`
- audit — wrap return content in `<div className="px-8 py-7 max-w-[1200px]">`
- companies — will get its own frozen-pane container in Task 3 (includes padding)
- match — will get its own split-pane container in Task 5 (includes its own `px-8 py-6` on the detail pane; do NOT add a separate padding wrapper)
- pipeline — will get its own frozen-pane container in Task 4 (includes padding)
- investors — already has frozen-pane container (no change)
- analyst — already has its own full-width layout (no change)
- ClawAdmin — serves native OpenClaw UI (no change)

- [ ] **Step 1: Add padding wrapper to methodology and audit pages**

In `src/app/(site)/methodology/page.tsx`, wrap the return JSX in `<div className="px-8 py-7 max-w-[1200px]">...</div>`.

In `src/app/(site)/admin/audit/page.tsx`, wrap the return JSX in `<div className="px-8 py-7 max-w-[1200px]">...</div>`.

- [ ] **Step 2: Hide sidebar on analyst route**

In `src/components/sidebar.tsx`, add a pathname check at the top of the component:

```tsx
// Hide global sidebar on analyst page — it has its own channel sidebar
if (pathname.startsWith("/analyst")) return null;
```

This completely removes the sidebar on `/analyst`, giving the chat pane full width.

- [ ] **Step 3: Commit**

```bash
git add src/components/sidebar.tsx src/app/\(site\)/methodology/page.tsx src/app/\(site\)/admin/audit/page.tsx
git commit -m "fix(ui): consistent page padding + hide sidebar on analyst route (BL-010, BL-011)"
```

---

### Task 2: Sidebar visual fixes (BL-017, BL-018, BL-024)

**Files:**
- Modify: `src/components/sidebar.tsx`

- [ ] **Step 1: Increase active state contrast (BL-017)**

Change the active item class from:
```
"bg-surface-3 text-text-1 font-semibold"
```
to:
```
"bg-[#e8e6e1] text-text-1 font-semibold border-l-[3px] border-l-t1-txt"
```

This adds a visible green left border AND a darker background that clearly distinguishes the selected item. Remove the green dot indicator (the left border replaces it).

- [ ] **Step 2: Fix collapse button positioning (BL-018)**

Replace the floating button that uses `-right-[20px]` absolute positioning with a button that's inset inside the sidebar's bottom area. Change from:

```tsx
<button className="absolute top-1/2 -translate-y-1/2 w-[20px] h-[40px] ... -right-[20px]">
```

to a fixed-position toggle at the bottom of the sidebar (above any scrollable content):

```tsx
<div className="flex-shrink-0 border-t border-border px-2 py-1.5">
  <button
    onClick={() => setCollapsed(!collapsed)}
    className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[0.65rem] text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
  >
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
      className={`w-3 h-3 transition-transform ${collapsed ? "rotate-180" : ""}`}>
      <path d="M8 2L4 6l4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {!collapsed && <span>Collapse</span>}
  </button>
</div>
```

This puts the toggle at the bottom of the sidebar, always visible, never overlapping content.

- [ ] **Step 3: Fix collapsed admin label (BL-024)**

When collapsed, show a small divider with a tiny lock icon instead of nothing:

```tsx
{isAdmin && (
  <>
    <div className="my-2 border-t border-border" />
    {collapsed ? (
      <div className="flex justify-center py-1">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-3 h-3 text-text-3">
          <rect x="2" y="6" width="8" height="5" rx="1" /><path d="M4 6V4a2 2 0 114 0v2" />
        </svg>
      </div>
    ) : (
      <div className="px-3 pb-1 font-mono text-[0.55rem] text-text-3 uppercase tracking-[0.1em]">
        Admin
      </div>
    )}
    {ADMIN_ITEMS.map(renderItem)}
  </>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/sidebar.tsx
git commit -m "fix(ui): sidebar active contrast, collapse button, admin label (BL-017/018/024)"
```

---

### Task 3: Companies page frozen panes (BL-012)

**Files:**
- Modify: `src/app/(site)/companies/page.tsx`

**Context:** Apply the same frozen-pane treatment as investors page. The companies table has columns: Name, Cohort, Stage, Sector, ARR/Traction, Ask Size, Home, Target, Founder, Intros, (delete button). Freeze the Name column and the header row.

- [ ] **Step 1: Wrap the return in a full-height flex container**

Replace the outer `<>...</>` fragment with:

```tsx
<div className="flex flex-col h-full overflow-hidden">
  {/* Pinned controls */}
  <div className="flex-shrink-0 px-8 py-4 bg-background border-b border-border">
    {/* title + add button + showing count */}
  </div>

  {/* Scrollable table */}
  <div className="flex-1 overflow-auto mx-8 my-4 border border-border rounded-[10px]">
    <table>...</table>
  </div>
</div>
```

- [ ] **Step 2: Make the header row sticky**

Change `<th>` class to include `sticky top-0 z-20`. The Name column header gets `sticky top-0 left-0 z-30 bg-surface-2` (intersection of frozen row + column).

- [ ] **Step 3: Make the Name column sticky**

The Name `<td>` in each row gets: `sticky left-0 z-10 bg-background group-hover:bg-surface-2 border-r border-border`.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(site\)/companies/page.tsx
git commit -m "fix(ui): companies page frozen-pane table (BL-012)"
```

---

### Task 4: Pipeline page frozen panes + font size fix (BL-013, BL-019)

**Files:**
- Modify: `src/app/(site)/pipeline/page.tsx`

- [ ] **Step 1: Apply frozen-pane container**

Same pattern as Task 3: wrap in `h-full overflow-hidden` flex container, pinned title area, scrollable table container.

- [ ] **Step 2: Make header sticky + Company column frozen**

Apply `sticky top-0 z-20` to all `<th>`, `sticky top-0 left-0 z-30` to Company header. Apply `sticky left-0 z-10 bg-background` to Company `<td>`.

- [ ] **Step 3: Fix font size to match investors/companies**

Change the table's base class from `text-sm` to `text-[0.78rem]` to match the investors and companies tables.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(site\)/pipeline/page.tsx
git commit -m "fix(ui): pipeline frozen-pane table + font size consistency (BL-013/019)"
```

---

### Task 5: Match Output sticky company nav (BL-014)

**Files:**
- Modify: `src/app/(site)/match/page.tsx`

**Context:** The match page has a `grid grid-cols-[240px_1fr]` layout with a company selection sidebar (`<aside>`) + a detail pane. The aside currently uses `md:sticky md:top-0 md:max-h-[80vh]` which doesn't work properly since the layout's `<main>` handles scrolling.

- [ ] **Step 1: Wrap in a full-height container**

Replace the outer `<div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">` with:

```tsx
<div className="flex h-full overflow-hidden">
  {/* Company nav — fixed height, own scroll */}
  <aside className="w-[240px] flex-shrink-0 overflow-y-auto border-r border-border bg-surface">
    ...existing company buttons...
  </aside>

  {/* Detail pane — scrolls independently */}
  <div className="flex-1 overflow-y-auto px-8 py-6">
    ...existing match detail content...
  </div>
</div>
```

This gives the company nav its own independent scroll from the detail pane.

- [ ] **Step 2: Commit**

```bash
git add src/app/\(site\)/match/page.tsx
git commit -m "fix(ui): match output sticky company nav with independent scroll (BL-014)"
```

---

### Task 6: Header responsive chips (BL-015)

**Files:**
- Modify: `src/components/site-header.tsx`

- [ ] **Step 1: Change chips from hidden to wrapping**

Replace `hidden md:flex` with `flex flex-wrap`. On small screens, chips wrap to a second line instead of disappearing entirely. Also reduce the gap slightly:

```tsx
<div className="flex gap-1 flex-wrap">
  {chips.map((chip) => (
    <span key={chip} className="font-mono text-[0.55rem] px-[6px] py-[1px] border border-[#444] rounded-[4px] text-[#999]">
      {chip}
    </span>
  ))}
</div>
```

Make the chip font slightly smaller (`0.55rem`) so they fit better on narrow screens.

- [ ] **Step 2: Commit**

```bash
git add src/components/site-header.tsx
git commit -m "fix(ui): header chips wrap on small screens instead of hiding (BL-015)"
```

---

### Task 7: Login page branding (BL-016)

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Add TBDC logo above the form card**

Add the logo **inside** the card `div` (the `<div className="w-full max-w-sm border ...">` element), at the very top before the existing `<div className="mb-6">` header block:

```tsx
import Image from "next/image";

// Inside the card div, as the first child:
<div className="flex flex-col items-center mb-4">
  <Image src="/tbdc-logo.png" alt="TBDC" width={48} height={48} className="rounded-lg mb-2" />
  <p className="text-[0.7rem] font-mono text-text-3 tracking-[0.04em]">
    TBDC Investor Matching System
  </p>
</div>
```

This goes INSIDE `<div className="w-full max-w-sm border border-border rounded-[10px] bg-surface p-8">`, NOT outside it. Placing it outside would break the flex centering layout.

- [ ] **Step 2: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "fix(ui): add TBDC logo branding to login page (BL-016)"
```

---

### Task 8: Investor table hover fix (BL-020)

**Files:**
- Modify: `src/app/(site)/investors/page.tsx`

- [ ] **Step 1: Fix frozen column hover transition**

The frozen Name column has `bg-background` as its base, while non-frozen cells have no explicit background (transparent). On hover, both transition to `bg-surface-2`, but the starting point is different.

Fix: remove the explicit `bg-background` from the frozen `<td>` and replace with `bg-[var(--bg)]` (same visual result but using the CSS variable). Then on hover, use `group-hover:bg-surface-2` which transitions from the same effective color. Also ensure the `<tr>` has `group` class (already does).

Actually, the real fix is simpler: make the non-frozen cells ALSO have an explicit `bg-background` base so the transition is identical:

Change the `<tr>` from:
```
className="hover:bg-surface-2 group"
```
to:
```
className="group bg-background hover:bg-surface-2"
```

This gives ALL cells the same starting background, making the hover transition uniform.

- [ ] **Step 2: Commit**

```bash
git add src/app/\(site\)/investors/page.tsx
git commit -m "fix(ui): uniform hover transition for frozen vs non-frozen cells (BL-020)"
```

---

### Task 9: Per-page browser tab titles (BL-021)

**Files:**
- Modify: 7 page files

- [ ] **Step 1: Add `metadata` export to each page**

For RSC pages, add at the top of each file:

```typescript
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Page Name — TBDC POC" };
```

Page-specific titles:
- `methodology/page.tsx`: `"Methodology — TBDC POC"`
- `investors/page.tsx`: `"Investor Database — TBDC POC"`
- `companies/page.tsx`: `"Portfolio Companies — TBDC POC"`
- `match/page.tsx`: `"Match Output — TBDC POC"`
- `pipeline/page.tsx`: `"Pipeline — TBDC POC"`
- `analyst/page.tsx`: `"Analyst — TBDC POC"`
- `admin/audit/page.tsx`: `"Audit Log — TBDC POC"`

Note: `metadata` export is only valid in RSC pages (not client components). All 7 pages are server components, so this works.

- [ ] **Step 2: Commit**

```bash
git add src/app/\(site\)/*/page.tsx src/app/\(site\)/admin/audit/page.tsx
git commit -m "fix(ui): per-page browser tab titles (BL-021)"
```

---

### Task 10: Methodology sticky section nav (BL-022)

**Files:**
- Modify: `src/components/sec-head.tsx` (add `id` prop)
- Modify: `src/app/(site)/methodology/page.tsx`

- [ ] **Step 1: Add `id` prop to `SecHead` component**

In `src/components/sec-head.tsx`, add `id?: string` to the props interface and forward it to the root element:

```tsx
export function SecHead({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) {
  return <div id={id} className={...}>{children}</div>;
}
```

- [ ] **Step 2: Add anchor IDs to each section heading**

The methodology page has three main sections. Add `id` attributes:

```tsx
<SecHead id="gates">Hard gates — run before scoring begins</SecHead>
<SecHead id="dimensions">Scoring dimensions — weighted, not equal</SecHead>
<SecHead id="cards">Methodology cards</SecHead>
```

- [ ] **Step 3: Add a sticky sub-nav at the top**

Add a small sticky nav bar at the top of the methodology content. Use `top-0` because the methodology page scrolls inside `<main>` which starts below the sticky header — the scroll container's own top IS the correct position:

```tsx
<nav className="sticky top-0 z-10 bg-background border-b border-border py-2 mb-4 flex gap-4">
  <a href="#gates" className="text-[0.72rem] font-mono text-text-3 hover:text-text-1">Gates</a>
  <a href="#dimensions" className="text-[0.72rem] font-mono text-text-3 hover:text-text-1">Dimensions</a>
  <a href="#cards" className="text-[0.72rem] font-mono text-text-3 hover:text-text-1">Cards</a>
</nav>
```

Note: `top-0` is correct here because the sticky position is relative to the scroll container (`<main className="overflow-y-auto">`), which itself starts below the sticky site header. The sub-nav sticks to the top of the scroll viewport, not the page viewport.

- [ ] **Step 3: Commit**

```bash
git add src/components/sec-head.tsx src/app/\(site\)/methodology/page.tsx
git commit -m "fix(ui): methodology sticky section nav with anchor links (BL-022)"
```

---

### Task 11: Styled empty states (BL-023)

**Files:**
- Modify: `src/app/(site)/admin/audit/page.tsx`
- Modify: `src/app/(site)/pipeline/page.tsx`

- [ ] **Step 1: Style the audit empty state**

Replace the plain italic "No audit entries match the filter." with a styled card:

```tsx
<div className="border border-border rounded-lg bg-surface-2 px-6 py-8 text-center">
  <p className="text-sm text-text-3">No audit entries match the filter.</p>
  <p className="text-xs text-text-3 mt-1">Database writes by admins and the Assistant appear here automatically.</p>
</div>
```

- [ ] **Step 2: Add visual weight to pipeline "Not Started" rows**

In the pipeline page, the `StatusSelect` component already handles this. The improvement is in the status badge colors — make "Not Started" slightly more visible by using `text-text-3` with a dotted border instead of solid, so it reads as "pending" rather than "empty":

In `status-select.tsx`, when rendering the read-only `<span>` badge (the `disabled` branch), add a conditional class for `not_started`:

```tsx
className={`... ${value === "not_started" ? "border-dashed opacity-60" : ""}`}
```

Only `not_started` gets the muted treatment. All other statuses render with their normal solid border.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(site\)/admin/audit/page.tsx src/app/\(site\)/pipeline/_components/status-select.tsx
git commit -m "fix(ui): styled empty states for audit + pipeline (BL-023)"
```

---

### Task 12: Build + deploy

- [ ] **Step 1: Build check**

```bash
docker run -d --name ui-fix-build -e POSTGRES_PASSWORD=test -e POSTGRES_DB=tbdc_poc_test -p 15446:5432 postgres:15
sleep 4
DATABASE_URL="postgresql://postgres:test@localhost:15446/tbdc_poc_test" npx prisma db push --accept-data-loss
DATABASE_URL="postgresql://postgres:test@localhost:15446/tbdc_poc_test" npm run build
docker rm -f ui-fix-build
```

- [ ] **Step 2: Push + deploy**

```bash
git push origin main
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 '
  echo "--- current image ---"
  docker ps --filter name=tbdc-web --format "{{.Image}}"
  cd /root/tbdc-poc/repo && git pull origin main
  docker build -t tbdc-web:v8-ui-fixes /root/tbdc-poc/repo
  docker stop tbdc-web && docker rm tbdc-web
  docker run -d --name tbdc-web --restart unless-stopped \
    --network docker_rafiq-shared \
    --env-file /root/tbdc-poc/tbdc-web.env \
    tbdc-web:v8-ui-fixes
  sleep 5 && docker restart caddy
'
```

Note the "current image" line — use that tag (not an assumed `v7-table`) in the rollback command if needed.
```

- [ ] **Step 3: Visual smoke test**

Visit each page and verify:
1. `/methodology` — padding consistent, sticky section nav works, page title in tab
2. `/investors` — hover consistent on frozen column, page title
3. `/companies` — frozen-pane table works, page title
4. `/match` — company nav stays fixed while detail scrolls, page title
5. `/pipeline` — frozen-pane table, font matches investors, page title
6. `/analyst` — no global sidebar (full width for chat), page title
7. `/admin/audit` — styled empty state, page title
8. `/login` — TBDC logo above the form
9. Sidebar — clear active state, collapse button at bottom (no overlap), admin label visible when collapsed
10. Header — chips wrap on narrow window instead of hiding

- [ ] **Step 4: Delete resolved backlog items**

Remove BL-010 through BL-024 from `docs/backlog.md` (replace with `_No open issues._`). Add a changelog entry.

```bash
git add docs/backlog.md docs/changelog.md
git commit -m "docs: clear resolved backlog BL-010 through BL-024"
git push origin main
```

---

## Rollback

All changes are CSS/layout-only with no data model changes. If any page breaks:
1. `git revert HEAD~N` to the specific commit
2. Redeploy tbdc-web
3. The deploy step logs the previous image tag — use that for rollback: `docker run ... <previous-image-tag>`
