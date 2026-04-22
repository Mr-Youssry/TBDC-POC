# TBDC Next.js Redesign Plan

## Goal

Apply the approved OpenVC-inspired design language to the actual Next.js product while also restructuring the densest workflows so the product feels calmer, more premium, and easier to scan.

This is a real app redesign, not a mockup-only exercise.

## Approved Direction

- Use the actual Next.js application as the target.
- Do both:
  - apply the new design system across the product
  - make crowded pages cleaner with better information hierarchy
- Keep `Investor Database` and `Portfolio Companies` visible in the main navigation.

## Context Reviewed

### Route and component files

- `src/app/(site)/layout.tsx`
- `src/components/site-header.tsx`
- `src/components/sidebar.tsx`
- `src/components/sec-head.tsx`
- `src/components/badges.tsx`
- `src/app/(site)/activation-playbook/page.tsx`
- `src/app/(site)/activation-playbook/playbook-helpers.ts`
- `src/app/(site)/investors/page.tsx`
- `src/app/(site)/companies/page.tsx`
- `src/app/(site)/match/page.tsx`
- `src/app/(site)/pipeline/page.tsx`

### Data model reviewed

- `prisma/schema.prisma`

Relevant entities and constraints:

- `Investor`, `Company`, `Match`, `CustomerTarget`, `IndustryEvent`, and `PipelineStatus` already support the cleaner UI patterns we want.
- No schema changes are required for the redesign.
- This is a presentation and interaction restructuring effort, not a data-model migration.

### Missing expected docs

The brainstorming workflow expects:

- `project-docs/bug-patterns.md`
- `project-docs/schemas/`

Those files are not present in this repo, so the plan is grounded in the live route code and Prisma schema instead.

## Main Problems in the Current App

1. The app shell still reflects the older editorial prototype, while newer route work is pushing toward a more operational product style.
2. Several pages lead with full-width tables or equal-weight sections, so the eye has no stable starting point.
3. Navigation and local sidebars compress the working canvas on the pages that most need focus.
4. Filters, counts, edit controls, and reference content often appear simultaneously instead of progressively.
5. The product lacks one coherent system for cards, rails, filters, tables, motion, and spacing.

## Recommended Approach

Use one shared visual system across all routes, then apply deeper structural cleanup only where density is currently hurting usability most.

### Why this approach

- It gives the product one clear identity.
- It avoids a risky big-bang rewrite of every screen.
- It solves real usability problems instead of just repainting them.
- It keeps implementation sympathy with the existing route structure and data access patterns.

## Design System

### Visual language

- Very light canvas
- Deep charcoal sidebar and header accents
- One vivid pink accent for primary action and active state
- Secondary green, amber, and blue accents for signal semantics
- Large, clear type with more spacing and less paragraph copy
- Cards and rails capped at 8px radius
- Strong icon usage for scanning
- Controlled motion only for polish and hierarchy

### Core tokens

- Background: soft light neutral with a faint pink-tinted top band
- Primary ink: near-black
- Accent: vivid pink
- Success: green
- Warning: amber
- Info: cool blue
- Borders: thin, low-contrast gray
- Shadows: soft depth, not floating-card clutter

### Component rules

- Sidebar: premium dark, full product nav, compact section labels, clear active state
- Header/topbar: lightweight, sticky, glass-like or bright surface, concise chips only
- Cards: short headlines, strong metric or decision surface, minimal filler copy
- Tables: secondary pattern, not the first-viewport default unless the task is truly tabular
- Filters: short grouped controls, ideally horizontal in the main canvas instead of permanent side columns
- Detail rails: one right rail when needed, quieter than the main list
- Buttons: icon plus text for primary actions where appropriate
- Empty states: active and specific, never dead whitespace

### Layout rule

At the desktop level, pages should usually read as at most three dominant zones:

1. global sidebar
2. main workspace
3. optional right detail/context rail

Do not create four competing columns.

## Product Shell Changes

### Site header

- Reduce the current heavy banner feel
- Keep counts available but quieter
- Make auth/admin controls more polished and less terminal-like

### Sidebar

- Keep the full operating-system navigation
- Explicitly include:
  - `Activation Playbook`
  - `Investor Database`
  - `Portfolio Companies`
  - `Match Output`
  - `Pipeline`
- Preserve admin links, but visually separate them from the main operating routes

### Shared primitives to introduce or adapt

- page hero
- stat card
- filter strip
- section card
- row card
- detail card
- icon badge
- quieter pills and badges
- upgraded table shell for pages that still require tables

## Route Strategy

### Deep redesigns

These pages need more than a reskin.

#### Activation Playbook

- Shift to action-first layout
- Hero shows readiness and current focus
- Main canvas becomes a ranked action queue
- Keep activation tiers and blocked/reactivation logic, but subordinate them below the action queue
- Right rail focuses on the selected play and next draft framing

#### Investor Database

- Move away from pure spreadsheet-first presentation
- Lead with search, filters, and curated segments
- Show high-signal investor cards or compact rows first
- Keep table editing available as a lower or alternate mode
- Make filter usage intentional, not omnipresent clutter

#### Portfolio Companies

- Shift from flat editable matrix toward a company index plus richer summary rows/cards
- Keep profile dimensions accessible, but avoid forcing every field to equal visual weight
- Preserve editing affordances without making the page look like a raw admin table

#### Match Output

- Keep company selection, but reduce the utilitarian left-rail feel
- Make ranked matches the center of gravity
- Surface fit signals as chips, badges, and short evidence blocks
- Use the right rail for selected investor rationale and next move framing

#### Pipeline

- Replace table-first presentation with queue or bucket-first overview
- Show current status bands and next actions up front
- Keep table/detail depth as a secondary view, not the hero surface

### Lighter redesigns

These pages should inherit the system strongly, but do not need a full conceptual rewrite first.

- `Methodology`
- `Analyst`
- `Training`
- `Admin Users`
- `Audit Log`
- `Mission Control`
- `Login`

## Interaction Patterns

### Reduce reading load

- Convert long explanations into icon-backed signal blocks
- Replace repeated prose with chips, tags, short labels, and grouped facts
- Use progressive disclosure for long text, history, and edit states

### Preserve editing without visual overload

- Keep inline editing where already useful
- Make editable states quieter until engaged
- Default to read/scan mode before edit mode

### Motion

- Use subtle rise/fade entrance animations
- Use hover elevation and color transitions for cards and controls
- Avoid ornamental motion that competes with content

## Error Handling and State Design

- Loading should use shaped skeletons for cards, tables, and detail rails
- Empty states must explain what is missing and what action to take
- Errors should appear inline inside the working surface, not only as vague text blocks
- Mobile layouts should collapse multi-column pages into one main stack plus optional drawers

## Verification Plan

### Functional verification

- `npm run lint`
- TypeScript check
- production build
- smoke test all route shells after redesign

### UX verification

- Desktop scan pass for all main routes
- Mobile pass on the densest pages
- Confirm no page exceeds the intended three-zone rule on desktop unless there is a justified exception
- Confirm `Investor Database` and `Portfolio Companies` are restored in the navigation

## Rollout Sequence

1. Update shared tokens, global CSS, header, and sidebar
2. Introduce shared page/chrome primitives
3. Redesign `Activation Playbook`
4. Redesign `Investor Database`
5. Redesign `Portfolio Companies`
6. Redesign `Match Output`
7. Redesign `Pipeline`
8. Reskin remaining routes to the new system
9. Run lint, build, and route smoke tests

## Risks

- Reworking dense routes can accidentally hide edit affordances if the read/edit modes are not balanced carefully.
- A product-wide shell change can cause visual regressions in routes that were built against the older spacing and token assumptions.
- Overusing cards can recreate clutter in a different form; section hierarchy must stay disciplined.

## Success Criteria

- The product reads as one coherent system instead of old and new UI mixed together.
- Main workflows start with a clear focal surface rather than an undifferentiated table.
- The app feels more premium and easier to scan without losing operational depth.
- `Investor Database` and `Portfolio Companies` are clearly present in the product navigation.
