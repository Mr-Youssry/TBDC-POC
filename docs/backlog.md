# Backlog

Open issues only. When an issue is resolved, **delete the row** — resolved work lives in [changelog.md](changelog.md), not here.

## Critical

| ID | Issue | Page | Description |
|----|-------|------|-------------|
| BL-010 | Layout padding inconsistency | All pages | Layout `<main>` has no padding; investors page manages its own, other pages have varying `px-8` from their content. Some pages render content flush against the sidebar. Need a consistent approach: either layout provides default padding with an opt-out class, or every page wraps its own content. |
| BL-011 | Analyst double sidebar | `/analyst` | Global sidebar + analyst channel sidebar stack side by side (~440px). On 1440px screens the chat pane is cramped. Global sidebar should auto-hide or collapse on the analyst route. |

## High

| ID | Issue | Page | Description |
|----|-------|------|-------------|
| BL-012 | Companies page missing frozen panes | `/companies` | Investors page has sticky header + frozen name column, but the structurally identical companies table still uses the old scroll-away layout. |
| BL-013 | Pipeline page missing frozen panes | `/pipeline` | Same as BL-012 — pipeline table scrolls the whole page instead of using the fixed-container pattern. |
| BL-014 | Match Output page scrolls everything | `/match` | Company nav sidebar + detail pane both scroll with the page. Company nav should be sticky. |
| BL-015 | Header chips invisible on small screens | Header | Count chips are `hidden md:flex` — disappear entirely below md breakpoint. Should wrap or collapse into a summary. |

## Medium

| ID | Issue | Page | Description |
|----|-------|------|-------------|
| BL-016 | Login page has no branding | `/login` | No header, sidebar, or logo. Generic floating form. Should show TBDC logo above the form. |
| BL-017 | Sidebar active state too subtle | Sidebar | Active item `bg-surface-3` barely distinguishable from `bg-surface` background. Needs more contrast. |
| BL-018 | Sidebar collapse arrow overlaps content | Sidebar | Floating `<` button at `-right-[20px]` renders on top of main content. Needs visible background or should be inset. |
| BL-019 | Font size inconsistency across tables | Investors/Companies/Pipeline | Investors/Companies: `text-[0.78rem]`, Pipeline: `text-sm` (0.875rem). All data tables should use the same base size. |
| BL-020 | Table row hover mismatch with frozen column | `/investors` | Frozen name column has `bg-background` base, non-frozen cells have transparent. Hover transition looks different between frozen and non-frozen cells. |

## Low

| ID | Issue | Page | Description |
|----|-------|------|-------------|
| BL-021 | No per-page browser tab titles | All pages | Every page shows "TBDC Investor Matching POC". Should show "Investors — TBDC POC", "Pipeline — TBDC POC", etc. |
| BL-022 | Methodology page has no internal navigation | `/methodology` | Very long page (7 dims + 3 gates + 6 cards) with no sticky sub-nav or anchor links. |
| BL-023 | Empty states are plain unstyled text | `/admin/audit`, `/pipeline` | "No audit entries" shown as plain italic text. Default pipeline statuses make the page look inactive. Needs styled empty-state cards. |
| BL-024 | Sidebar ADMIN label gone when collapsed | Sidebar | The "ADMIN" label disappears when collapsed but the divider line stays. Admin items look like part of main nav in collapsed state. |
