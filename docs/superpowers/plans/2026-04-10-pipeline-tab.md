# Pipeline Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Pipeline" tab that shows all scored matches as a filterable, sortable table with inline-editable pipeline status and a `warmPathBonus` rich-text column seeded from the v3 HTML prototype.

**Architecture:** Add a `pipelineStatus` enum + field to the Match model and a `warmPathBonus` text field (distinct from the existing short `warmPath` field). Create a new `/pipeline` page that renders a table with inline status dropdowns (reusing the existing `EditableCell` pattern from `/match`). Seed the 6 bonus entries from the v3 HTML into the matching Match rows. The tbdc-db plugin's `list_matches` tool automatically exposes the new fields to the analyst chat.

**Tech Stack:** Prisma (schema + migration), Next.js RSC, existing EditableCell/LongTextModal components, Tailwind v4 design tokens.

**Existing patterns to follow:**
- Match page: `src/app/(site)/match/page.tsx` — table layout, `scoreBadge()`, `dimSignal()`, server actions
- Match actions: `src/app/(site)/match/actions.ts` — `updateMatchStringField()` pattern
- Inline editing: `src/components/editable-cell.tsx` + `src/components/long-text-modal.tsx`
- Nav tabs: `src/components/nav-tabs.tsx` — where to add the new tab

---

## File Structure

| File | Responsibility |
|------|---------------|
| `prisma/schema.prisma` | **Modify.** Add `PipelineStatus` enum + `pipelineStatus` field on Match + `warmPathBonus` text field |
| `prisma/migrations/manual/v3_pipeline_status.sql` | **Create.** SQL to add enum + columns + seed bonus text |
| `src/app/(site)/pipeline/page.tsx` | **Create.** Pipeline table page |
| `src/app/(site)/pipeline/actions.ts` | **Create.** Server action for updating pipelineStatus |
| `src/components/nav-tabs.tsx` | **Modify.** Add Pipeline tab between Match Output and Analyst |
| `deploy/plugins/tbdc-db/src/tools.ts` | **Modify.** Add pipelineStatus + warmPathBonus to list_matches output |

---

### Task 1: Schema — add PipelineStatus enum + fields to Match

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/manual/v3_pipeline_status.sql`

- [ ] **Step 1: Add the enum and fields to schema.prisma**

Add after the `ChatScopeType` enum (~line 28):

```prisma
enum PipelineStatus {
  not_started
  researching
  outreach_sent
  meeting_set
  follow_up
  closed_won
  closed_pass
}
```

Add to the Match model (after `nextStep String` at ~line 120):

```prisma
  pipelineStatus PipelineStatus @default(not_started)
  warmPathBonus  String?
```

- [ ] **Step 2: Create the manual migration SQL**

Create `prisma/migrations/manual/v3_pipeline_status.sql`:

```sql
-- v3 Pipeline status enum + fields on Match
-- Run: docker exec shared-postgres psql -U tbdc_app -d tbdc_poc -f -

-- 1. Create the enum
DO $$ BEGIN
  CREATE TYPE "PipelineStatus" AS ENUM (
    'not_started', 'researching', 'outreach_sent',
    'meeting_set', 'follow_up', 'closed_won', 'closed_pass'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add columns
ALTER TABLE "Match"
  ADD COLUMN IF NOT EXISTS "pipelineStatus" "PipelineStatus" NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS "warmPathBonus" TEXT;

-- 3. Seed warmPathBonus from v3 prototype data
-- Match on company×investor names since IDs are cuid-generated

UPDATE "Match" SET "warmPathBonus" =
  'My MENA network, combined with a shared Egyptian-Cairo background with Omniful''s CEO Mostafa Abolnasr, gives me a credible warm path to an STV introduction. STV is GCC''s most active Series A fund and Omniful is the strongest strategic fit in this cohort. I would approach this via the Arab tech community network — a shared-context introduction lands differently than a cold email from a Canadian accelerator.'
WHERE "companyId" IN (SELECT id FROM "Company" WHERE name = 'Omniful')
  AND "investorId" IN (SELECT id FROM "Investor" WHERE name = 'STV');

UPDATE "Match" SET "warmPathBonus" =
  'Wamda has MENA-network touchpoints I can access directly. This is a co-investor conversation rather than a round lead, but it adds GCC credibility to Omniful''s cap table that has value beyond the cheque size.'
WHERE "companyId" IN (SELECT id FROM "Company" WHERE name = 'Omniful')
  AND "investorId" IN (SELECT id FROM "Investor" WHERE name = 'Wamda Capital');

UPDATE "Match" SET "warmPathBonus" =
  'The Flipkart and Myntra reference customers are Accel India companies. An outreach framed around this shared ecosystem familiarity — ''you already trust the customers who trust Try and Buy'' — is a specific and plausible angle for a cold LinkedIn message to Anand Daniel. The conversion probability is real if the framing is precise.'
WHERE "companyId" IN (SELECT id FROM "Company" WHERE name = 'Try and Buy')
  AND "investorId" IN (SELECT id FROM "Investor" WHERE name = 'Accel India');

UPDATE "Match" SET "warmPathBonus" =
  'Earlybird''s deep tech fund thesis is well documented and Finnish deep tech is squarely in their mandate. A cold outreach to Hendrik Brandis referencing Bosch as a reference customer and the Canada GTM angle is a plausible conversion — I have done this type of outreach before with similar company profiles.'
WHERE "companyId" IN (SELECT id FROM "Company" WHERE name = 'Quanscient')
  AND "investorId" IN (SELECT id FROM "Investor" WHERE name = 'Earlybird');

UPDATE "Match" SET "warmPathBonus" =
  'Jordan Jacobs has written publicly about manufacturing as an underserved AI vertical in Canadian portfolios. A cold outreach that references this specific gap — framed around Zeiss Pharma and Agora Analytics as early paying customers — has a genuine conversion probability. I would not promise a meeting, but I would commit to a thoughtful approach.'
WHERE "companyId" IN (SELECT id FROM "Company" WHERE name = 'Fermi Dev')
  AND "investorId" IN (SELECT id FROM "Investor" WHERE name = 'Radical Ventures');
```

Note: The v3 "Tier C — BDC Capital, MaRS IAF, OMERS Ventures" entry is a general note about institutional paths, not tied to a specific company×investor match. Store it as a comment in the SQL file but don't seed it — it doesn't map to a Match row.

- [ ] **Step 3: Push schema to live DB**

```bash
# On the droplet:
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 '
  cat /root/tbdc-poc/repo/prisma/migrations/manual/v3_pipeline_status.sql | \
  docker exec -i shared-postgres psql -U tbdc_app -d tbdc_poc
'
```

Then regenerate the Prisma client locally (do NOT run `prisma db pull` — that would overwrite the schema file with an introspected version, losing relation names and annotations):

```bash
npx prisma generate
```

- [ ] **Step 4: Verify seed**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 \
  "docker exec shared-postgres psql -U tbdc_app -d tbdc_poc -c \
  'SELECT c.name, i.name, m.\"pipelineStatus\", LEFT(m.\"warmPathBonus\", 50) FROM \"Match\" m JOIN \"Company\" c ON m.\"companyId\"=c.id JOIN \"Investor\" i ON m.\"investorId\"=i.id WHERE m.\"warmPathBonus\" IS NOT NULL;'"
```

Expected: 5 rows with warmPathBonus text.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/manual/v3_pipeline_status.sql
git commit -m "feat(v3/pipeline): add PipelineStatus enum + warmPathBonus field to Match"
```

---

### Task 2: Pipeline page — filterable table with inline status

**Files:**
- Create: `src/app/(site)/pipeline/page.tsx`
- Create: `src/app/(site)/pipeline/actions.ts`

**Context for the implementer:**
Build a new page at `/pipeline` that shows ALL scored matches (excluding DoNotMatch/WIDMO) as a table. The table should be sortable by score (default: descending) and filterable by company, investor, tier, and pipelineStatus. The `pipelineStatus` column is an inline-editable dropdown (when logged in). The `warmPathBonus` column shows a truncated preview with a click-to-expand modal for the full text.

Follow the existing `/match` page patterns for table styling, `scoreBadge()`, and the `EditableCell` component. Follow `/match/actions.ts` for the server action pattern.

- [ ] **Step 1: Create the server action**

Create `src/app/(site)/pipeline/actions.ts`:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const statusEnum = z.enum([
  "not_started",
  "researching",
  "outreach_sent",
  "meeting_set",
  "follow_up",
  "closed_won",
  "closed_pass",
]);

export async function updatePipelineStatus(
  matchId: string,
  status: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const parsed = statusEnum.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid status" };

  await prisma.match.update({
    where: { id: matchId },
    data: { pipelineStatus: parsed.data as any },
  });
  revalidatePath("/pipeline");
  return { ok: true };
}
```

- [ ] **Step 2: Create the pipeline page**

Create `src/app/(site)/pipeline/page.tsx`. Key requirements:

1. Query all Match rows with company and investor relations, ordered by score descending
2. Render a `<table>` with columns: Company, Investor, Score (with tier badge), Warm Path (short), Pipeline Status (dropdown), Warm Path Bonus (truncated + modal), Next Step
3. Pipeline Status column: render as a `<select>` dropdown when logged in, plain text when logged out. On change, call `updatePipelineStatus` server action.
4. Warm Path Bonus column: show first 60 chars + "…" if longer. Click opens the existing `LongTextModal` component to show the full text.
5. Table rows should have alternating subtle background colors for readability.
6. Use the existing `scoreBadge()` function (copy from match page — it's a local function, not exported).

The status dropdown labels should be human-readable:
```typescript
const STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  researching: "Researching",
  outreach_sent: "Outreach Sent",
  meeting_set: "Meeting Set",
  follow_up: "Follow-up",
  closed_won: "Closed (Won)",
  closed_pass: "Closed (Pass)",
};
```

Color-code the status badge:
- `not_started`: neutral gray
- `researching` / `outreach_sent`: blue-ish (use `text-text-3` + `border-border`)
- `meeting_set`: green (use `bg-t1-bg text-t1-txt border-t1-bdr`)
- `follow_up`: amber (use `bg-t2-bg text-t2-txt border-t2-bdr`)
- `closed_won`: solid green
- `closed_pass`: muted gray

- [ ] **Step 3: Create the status dropdown client component**

The `<select>` needs `onChange` interactivity, so it **must** be a separate client component (the page itself is an RSC with `await` — mixing `"use client"` with top-level `await` in the same file causes a build error).

Create `src/app/(site)/pipeline/_components/status-select.tsx` with `"use client"` at the top. It should:
- Accept `matchId`, `currentStatus`, and the server action as props
- On change: call the server action, show a brief loading state
- Optimistically update the displayed value

- [ ] **Step 4: Local build check**

```bash
docker run -d --name pipe-build -e POSTGRES_PASSWORD=test -e POSTGRES_DB=tbdc_poc_test -p 15442:5432 postgres:15
sleep 4
DATABASE_URL="postgresql://postgres:test@localhost:15442/tbdc_poc_test" npx prisma db push --accept-data-loss
DATABASE_URL="postgresql://postgres:test@localhost:15442/tbdc_poc_test" npm run build
docker rm -f pipe-build
```

Expected: `/pipeline` listed as `ƒ (Dynamic)`.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(site\)/pipeline/
git commit -m "feat(v3/pipeline): pipeline table page with inline status editing"
```

---

### Task 3: Nav tab + plugin update

**Files:**
- Modify: `src/components/nav-tabs.tsx`
- Modify: `deploy/plugins/tbdc-db/src/tools.ts`

- [ ] **Step 1: Add Pipeline tab to nav**

In `src/components/nav-tabs.tsx`, add the Pipeline tab between "Match Output" and "Analyst":

```typescript
const TABS = [
  { id: "methodology", label: "Methodology", href: "/methodology" },
  { id: "investors", label: "Investor Database", href: "/investors" },
  { id: "companies", label: "Portfolio Companies", href: "/companies" },
  { id: "match", label: "Match Output", href: "/match" },
  { id: "pipeline", label: "Pipeline", href: "/pipeline" },
];

const ADMIN_TABS = [
  { id: "analyst", label: "Analyst", href: "/analyst" },
  { id: "audit", label: "Audit", href: "/admin/audit" },
  { id: "clawadmin", label: "Mission Control", href: "/ClawAdmin" },
];
```

Note: remove the "01 — ", "02 — " numbering prefixes — per Ahmed's request for the sidebar rework (numbers removed). Keep the labels clean.

- [ ] **Step 2: Update list_matches tool description**

In `deploy/plugins/tbdc-db/src/tools/listMatches.ts`, the tool uses `prisma.match.findMany()` (Prisma ORM, not raw SQL). After `prisma generate` runs with the updated schema, `pipelineStatus` and `warmPathBonus` will appear in the JSON output automatically — no query change needed.

The only required edit: update the tool's `description` string to mention that pipeline status and warm-path bonus are included in the output, so the LLM knows it can reference them.

- [ ] **Step 3: Rebuild + redeploy the plugin**

```bash
cd deploy/plugins/tbdc-db && npm run build
```

Then SCP to droplet and restart gateway:

```bash
scp -r deploy/plugins/tbdc-db/dist root@67.205.157.55:/root/tbdc-poc/repo/deploy/plugins/tbdc-db/dist
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'docker restart openclaw-gateway && sleep 12'
```

- [ ] **Step 4: Commit**

```bash
git add src/components/nav-tabs.tsx deploy/plugins/tbdc-db/
git commit -m "feat(v3/pipeline): add Pipeline nav tab, strip number prefixes from tab labels, expose pipelineStatus in list_matches"
```

---

### Task 4: Deploy + smoke test

**Files:** none (deployment task)

- [ ] **Step 1: Push + pull on droplet**

```bash
git push origin main
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'cd /root/tbdc-poc/repo && git pull origin main'
```

- [ ] **Step 2: Run the migration SQL on live DB**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 '
  cat /root/tbdc-poc/repo/prisma/migrations/manual/v3_pipeline_status.sql | \
  docker exec -i shared-postgres psql -U tbdc_app -d tbdc_poc
'
```

- [ ] **Step 3: Rebuild + restart tbdc-web**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 '
  docker build -t tbdc-web:v4-pipeline /root/tbdc-poc/repo
  docker stop tbdc-web && docker rm tbdc-web
  docker run -d --name tbdc-web --restart unless-stopped \
    --network docker_rafiq-shared \
    --env-file /root/tbdc-poc/tbdc-web.env \
    tbdc-web:v4-pipeline
'
```

- [ ] **Step 4: Smoke test**

1. Navigate to `https://demo.korayem.info/pipeline` — verify table renders with all matches
2. Verify 5 rows show warmPathBonus text (Omniful×STV, Omniful×Wamda, Try and Buy×Accel India, Quanscient×Earlybird, Fermi Dev×Radical)
3. Log in → change a pipeline status from "Not Started" to "Researching" → verify it persists on refresh
4. Verify `/match` still works (regression)
5. Verify `/analyst` still works
6. Ask the analyst: "What is the pipeline status for Omniful matches?" → verify it reads the new field

- [ ] **Step 5: Commit any deploy fixes + push**

```bash
git push origin main
```

---

## Rollback

If the pipeline page fails:
1. The schema change is additive (new columns with defaults) — no data loss risk
2. Remove the nav tab entry and the page directory, redeploy
3. The new DB columns are harmless and can stay
