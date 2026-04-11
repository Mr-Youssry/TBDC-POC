# Agent Identity, Persistent Sessions & Media Understanding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the generic OpenClaw agent into Ahmed Korayem's Partnerships Manager assistant — with persistent chat history, company-organized workspace, pitch deck analysis capability, and an identity built from the Part 1 Build Documentation methodology.

**Architecture:** Five phases, each independently deployable:
1. **Agent identity** — Write SOUL.md, IDENTITY.md, USER.md, and SKILL.md for the TBDC partnerships context, deploying them to the gateway's workspace at `/home/node/.openclaw/workspace/`.
2. **Persistent chat history** — Add a `/history` endpoint to the HTTP bridge that reads OpenClaw's session JSONL files, and load history in the chat UI on mount.
3. **Company workspace structure** — Create per-company folders with structured profile templates in the workspace, so the agent has persistent knowledge per company.
4. **HEARTBEAT.md** — Write a maintenance-focused heartbeat that checks for stale Tier 1 matches and unactivated pipeline items.
5. **Media understanding** — Add a bridge endpoint that accepts file uploads, stores them in the workspace, and tells the agent to analyze them into structured markdown profiles.

**Tech Stack:** OpenClaw workspace files (markdown), Node.js bridge endpoints, Next.js RSC + client components, existing TBDC design tokens.

**Source of truth for agent personality:** `docs/reference/part1_build_documentation_v3.docx.md` — the 11-step methodology that defines how the agent thinks about investor matching.

---

## File Structure

| File | Location | Responsibility |
|------|----------|---------------|
| `deploy/workspace/SOUL.md` | Repo → gateway workspace | Agent's core personality and values |
| `deploy/workspace/IDENTITY.md` | Repo → gateway workspace | Agent's name, creature, vibe |
| `deploy/workspace/USER.md` | Repo → gateway workspace | Ahmed Korayem's profile + preferences |
| `deploy/workspace/SKILL.md` | Repo → gateway workspace | TBDC methodology: failure modes, routing, scoring, activation |
| `deploy/workspace/HEARTBEAT.md` | Repo → gateway workspace | Periodic maintenance checks |
| `deploy/workspace/companies/README.md` | Repo → gateway workspace | Company folder structure guide |
| `deploy/workspace/companies/{name}/profile.md` | Repo → gateway workspace | Per-company structured profile (10 companies) |
| `deploy/openclaw-chat-bridge.mjs` | Repo → gateway container | Add `/history` + `/upload` endpoints |
| `src/app/(site)/analyst/_components/use-openclaw-ws.ts` | Next.js app | Load session history on mount |
| `src/app/(site)/analyst/_components/message-pane.tsx` | Next.js app | Show loaded history + upload button |

---

### Phase 1: Agent Identity — SOUL.md, IDENTITY.md, USER.md, SKILL.md

**Goal:** Replace the generic OpenClaw templates with TBDC-specific identity files. These are what the LLM reads as context every turn.

**Context for the implementer:** OpenClaw's agent reads workspace markdown files as system context. The files at `/home/node/.openclaw/workspace/` are loaded into the LLM's prompt. The most important file is SKILL.md — it defines what the agent knows and how it reasons. The personality files (SOUL.md, IDENTITY.md) define tone and behavior. USER.md tells the agent about its operator.

The source material for SKILL.md is `docs/reference/part1_build_documentation_v3.docx.md` — a 420-line build documentation that explains Ahmed Korayem's 11-step investor matching methodology. The SKILL.md must distill this into actionable instructions the LLM can follow, not just knowledge it has.

#### Task 1.1: Write SOUL.md

**Files:**
- Create: `deploy/workspace/SOUL.md`

- [ ] **Step 1: Write the SOUL.md**

The SOUL.md defines the agent's core personality. Based on the build documentation's tone (direct, opinionated, methodology-driven, no bullshit), write a SOUL.md that:

- Opens with: "You are the TBDC Partnerships Manager's analyst — not a chatbot, not a search engine. You are a working partner who has internalized the investor matching methodology and applies it with judgment."
- Core values: accuracy over speed, methodology over intuition, specificity over generality
- Communication style: Direct. No filler. Lead with the answer. Use the investor's name, not "the investor." Use specific numbers, not "strong traction."
- When uncertain: say so explicitly. "I don't have fund phase data for Earlybird — verify on LinkedIn before making this introduction" is better than a confident guess.
- Boundaries: Never fabricate investor data. Never claim a warm path exists if the data doesn't support it. Never recommend an introduction without stating the pre-conditions.
- On tool use: Always query the database before answering questions about companies, investors, or matches. Don't rely on training data for TBDC-specific facts.

- [ ] **Step 2: Commit**

```bash
git add deploy/workspace/SOUL.md
git commit -m "feat(agent): SOUL.md — partnerships analyst personality"
```

#### Task 1.2: Write IDENTITY.md + USER.md

**Files:**
- Create: `deploy/workspace/IDENTITY.md`
- Create: `deploy/workspace/USER.md`

- [ ] **Step 1: Write IDENTITY.md**

```markdown
# IDENTITY.md

- **Name:** TBDC Analyst
- **Creature:** Investment analyst AI — thinks in scoring dimensions and activation protocols
- **Vibe:** Direct, methodical, opinionated. Like a senior analyst who's done 200 investor intros and knows which ones were wasted.
- **Emoji:** 📊
```

- [ ] **Step 2: Write USER.md**

```markdown
# USER.md — About Ahmed Korayem

- **Name:** Ahmed Korayem
- **Role:** Partnerships Manager, TBDC (Toronto Business Development Centre)
- **What to call him:** Ahmed
- **Email:** korayem@ready4vc.com
- **Company:** Ready4VC Inc. / GatheringX / Toronto

## Context

Ahmed built the investor matching methodology from scratch (see SKILL.md). He manages a cohort of 10 portfolio companies and matches them against 171+ profiled investors. He values:
- Specificity over generality ("cold LinkedIn outreach to Jordan Jacobs" not "reach out to Radical Ventures")
- Methodology-driven decisions (routing before scoring, hard gates before matching)
- Honest assessment of warm paths (don't overstate relationship strength)
- Activation logic, not just match lists (every Tier 1 match needs a named next step)

Ahmed is the primary operator. His business partner is Ahmed Youssry (youssry@ready4vc.com) who handles the technical implementation.
```

- [ ] **Step 3: Commit**

```bash
git add deploy/workspace/IDENTITY.md deploy/workspace/USER.md
git commit -m "feat(agent): IDENTITY.md + USER.md — agent identity and operator profile"
```

#### Task 1.3: Write SKILL.md (the big one)

**Files:**
- Create: `deploy/workspace/SKILL.md`

**Context:** This is the most important file. It must distill the 420-line build documentation into LLM-actionable instructions. NOT a copy-paste of the document — a condensed instruction set that tells the agent HOW to think, not just WHAT to know.

- [ ] **Step 1: Write SKILL.md**

Structure the file as:

```markdown
# SKILL.md — TBDC Investor Matching Methodology

## Your role
You are the TBDC Partnerships Manager's investment analyst. You have access to a Postgres database with 10 portfolio companies, 171+ profiled investors, and 63+ scored matches. Your job is to help Ahmed make better investor introductions — not more introductions.

## The three failure modes you exist to prevent
1. Matching on sector+stage alone (ignoring cheque size, geography, revenue floor, founder fit, portfolio gap)
2. No exclusion logic (surfacing companies that declined intros, or investors who can't deploy)
3. Matching without activation logic (producing lists without named next steps, warm path classification, or pre-conditions)

## How matching works — the decision chain
[Distill Steps 2-8 into a decision flowchart the LLM can follow]

### Step 1: Route to investor type BEFORE scoring
[The routing table from Step 3 — which company characteristics map to which investor type]

### Step 2: Check hard gates
- Gate 1: Has the company declined investor intros? (acceptsInvestorIntros=false → stop)
- Gate 2: Geographic mandate categorical exclusion? → stop
- Gate 3: Fund phase — is the investor actively deploying? (Active/Unconfirmed/Fundraising/Follow-on)

### Step 3: Score on 7 weighted dimensions (max 16 points)
[The scoring table from Step 7 with weights and logic]

### Step 4: Classify the match
- 13-16: Tier 1 — priority introduction
- 8-12: Tier 2 — qualified outreach
- 4-7: Tier 3 — monitor
- 0-3: Do not match

### Step 5: Add activation logic
Every Tier 1 and Tier 2 match needs:
- Warm path classification: Warm / Possible / Cold
- Pre-conditions: what the company needs before this intro happens
- Specific next step: named person, named action, specific framing

## Your tools
[List the 8 tbdc-db tools with when to use each one]

## What you should NOT do
- Never fabricate investor data or match scores
- Never recommend introductions without checking the database first
- Never skip the routing step (some companies should not be matched to VCs at all)
- Never present a match list without activation logic
- Never overstate warm path strength

## Company workspace
Each company has a folder at `companies/{name}/profile.md` in your workspace. Read it before answering questions about that company. If it doesn't exist, tell Ahmed and offer to create one from the database.

## Session organization
- Company sessions (tbdc-co-*): Focus on that specific company's investor strategy
- General session (tbdc-general): Cross-company analysis, portfolio-wide questions, methodology discussions
```

The full SKILL.md will be ~200-300 lines. Every section should be actionable ("when X happens, do Y") not informational ("X is important because Y").

- [ ] **Step 2: Commit**

```bash
git add deploy/workspace/SKILL.md
git commit -m "feat(agent): SKILL.md — TBDC investor matching methodology distilled for LLM"
```

#### Task 1.4: Deploy workspace files to gateway

**Files:** none (deployment task)

- [ ] **Step 1: Copy files to the gateway workspace**

```bash
# Verify workspace directory exists in the container
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'docker exec openclaw-gateway ls -d /home/node/.openclaw/workspace/'

# SCP individual files (not the companies/ folder yet — that's Phase 3)
for f in SOUL.md IDENTITY.md USER.md SKILL.md; do
  scp -i ~/.ssh/id_ed25519 deploy/workspace/$f root@67.205.157.55:/tmp/$f
  ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 "docker cp /tmp/$f openclaw-gateway:/home/node/.openclaw/workspace/$f"
done

# Fix ownership
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 '
  docker exec openclaw-gateway chown -R node:node /home/node/.openclaw/workspace/
  docker exec openclaw-gateway ls -la /home/node/.openclaw/workspace/
'
```

- [ ] **Step 2: Verify the agent reads the files**

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 '
  docker exec openclaw-gateway sh -c "cd /app && node openclaw.mjs agent -m \"What is your name and role? What methodology do you follow?\" --session-id identity-test-1"
'
```

Expected: The agent responds with its TBDC Analyst identity and references the methodology from SKILL.md.

- [ ] **Step 3: Commit deployment script**

```bash
git add deploy/workspace/
git commit -m "feat(agent): deploy workspace files to gateway"
```

---

### Phase 2: Persistent Chat History

**Goal:** When you open a company session in the `/analyst` page, you see the previous messages — not a blank screen.

**Context:** OpenClaw already persists session history as JSONL files in `/state/agents/main/sessions/{sessionId}.jsonl`. Each line is a JSON object with `type`, `message`, `timestamp`, etc. The bridge can read these files and return them as JSON. The chat UI hook (`use-openclaw-ws.ts`) currently starts with an empty `messages` array — it needs to hydrate from the server on mount.

#### Task 2.1: Add `/history` endpoint to the bridge

**Files:**
- Modify: `deploy/openclaw-chat-bridge.mjs`

- [ ] **Step 0: Verify the session JSONL path**

Before writing any code, confirm the session storage path inside the container:

```bash
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'docker exec openclaw-gateway find /state -name "*.jsonl" -type f | head -5'
```

Expected: paths like `/state/agents/main/sessions/tbdc-general.jsonl`. If the path differs, adjust the endpoint accordingly.

- [ ] **Step 1: Add the endpoint**

Add a `GET /history?sessionId=X` handler to the bridge that:
1. Reads `/state/agents/main/sessions/{sessionId}.jsonl`
2. Parses each line as JSON
3. Filters to only `type: "message"` entries
4. Extracts `message.role` (user/assistant) and `message.content` (text array → joined string) and `timestamp`
5. Returns `{ ok: true, messages: [...] }` with the most recent 50 messages

The JSONL format (from the sample):
```json
{"type":"message","id":"xxx","parentId":"yyy","timestamp":"2026-04-10T00:05:16.855Z","message":{"role":"user","content":[{"type":"text","text":"the actual message"}]}}
```

Extract:
- `role`: from `message.role` ("user" or "assistant")
- `content`: join all `message.content` entries where `type === "text"` with newlines
- `timestamp`: parse the ISO timestamp to epoch ms
- Skip entries where `role` is not "user" or "assistant" (tool calls, system, model changes)

**Important:** Assistant message `content` arrays can contain both `{"type":"text","text":"..."}` AND `{"type":"tool_use","id":"...","name":"..."}` entries in the same array. The `type === "text"` filter is load-bearing — it excludes tool-call metadata that would produce garbage in the chat UI. Do NOT simplify to `content[0].text`.

- [ ] **Step 2: Commit**

```bash
git add deploy/openclaw-chat-bridge.mjs
git commit -m "feat(bridge): /history endpoint reads session JSONL for persistent chat"
```

#### Task 2.2: Load history in the chat UI

**Files:**
- Modify: `src/app/(site)/analyst/_components/use-openclaw-ws.ts`

- [ ] **Step 1: Add useEffect to load history on mount**

Add a `useEffect` that fires when `openclawSessionId` changes. **Do NOT set `setState("connecting")`** — that would disable the input and show "Reconnecting…" during the fetch. Instead, use a separate `historyLoading` ref or just leave the state as `"open"` while history loads silently in the background:

```typescript
useEffect(() => {
  let cancelled = false;
  // Do NOT setState("connecting") here — it disables the input field
  fetch(`/api/openclaw/history?sessionId=${encodeURIComponent(openclawSessionId)}`)
    .then(r => r.json())
    .then(data => {
      if (cancelled || !data.ok) return;
      const loaded: ChatMessage[] = data.messages.map((m: any) => ({
        id: `hist-${m.timestamp}-${m.role}`,
        sender: m.role === "assistant" ? "assistant" : "user",
        senderName: m.role === "assistant" ? "Assistant" : currentUserName,
        content: m.content,
        timestamp: m.timestamp,
      }));
      setMessages(loaded);
      setState("open");
    })
    .catch(() => setState("open")); // fail silently — empty history is fine
  return () => { cancelled = true; };
}, [openclawSessionId]);
```

Note: The component is re-mounted per channel via `key={openclawSessionId}` in page.tsx, so the effect fires once per channel switch.

- [ ] **Step 2: Update the Caddy route**

The `/api/openclaw/*` Caddy handler already covers `/api/openclaw/history` (the wildcard matches). The bridge handles `/history` directly. No Caddy change needed — but verify after deploy.

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/app/\(site\)/analyst/
git commit -m "feat(analyst): load persistent chat history on session mount"
```

#### Task 2.3: Deploy + test

- [ ] **Step 1: Deploy bridge + UI**

```bash
scp -i ~/.ssh/id_ed25519 deploy/openclaw-chat-bridge.mjs root@67.205.157.55:/root/tbdc-poc/openclaw-chat-bridge.mjs
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'docker restart openclaw-gateway && sleep 12'

# Rebuild + deploy tbdc-web
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 '
  cd /root/tbdc-poc/repo && git pull origin main
  echo "Current image:" && docker ps --filter name=tbdc-web --format "{{.Image}}"
  docker build -t tbdc-web:v-history /root/tbdc-poc/repo
  docker stop tbdc-web && docker rm tbdc-web
  docker run -d --name tbdc-web --restart unless-stopped --network docker_rafiq-shared --env-file /root/tbdc-poc/tbdc-web.env tbdc-web:v-history
  sleep 5 && docker restart caddy
'
```

- [ ] **Step 2: Verify**

1. Go to `/analyst` → General channel
2. Send a test message → wait for reply
3. Refresh the page
4. Previous messages should still be visible (loaded from JSONL history)
5. Switch to a company channel → history for that company loads (or empty if no prior messages)

- [ ] **Step 3: Commit**

```bash
git push origin main
```

---

### Phase 3: Company Workspace Structure

**Goal:** Create per-company folders in the agent workspace with structured profile templates, so the agent has persistent per-company knowledge.

#### Task 3.1: Create company profile template + folders

**Files:**
- Create: `deploy/workspace/companies/README.md`
- Create: `deploy/workspace/companies/{name}/profile.md` (for each of the 10 companies)

- [ ] **Step 1: Write README.md**

```markdown
# Company Workspace

Each company has a folder here with structured files the agent reads when working in that company's session.

## Files per company
- `profile.md` — Structured investability profile (auto-generated or manually written)
- `pitch-deck.md` — Converted pitch deck content (from PDF/images via media analysis)
- `research-notes.md` — Ongoing research findings (agent-maintained)
- `outreach-log.md` — Record of introductions made and their outcomes

## Adding a new company
1. Create a folder with the company's name (lowercase, hyphens for spaces)
2. Copy the profile template from any existing company
3. Fill in the fields from the company's database record
4. Tell the agent to read and update it: "Read the profile for {company} and update it with the latest database data"
```

- [ ] **Step 2: Generate initial profiles from the database**

For each of the 10 companies, create a `profile.md` with the investability dimensions from the build documentation (Step 6). The initial data comes from the Prisma database. Use a script or manual creation:

```markdown
# {Company Name} — Investability Profile
Generated: 2026-04-11 | Source: TBDC database

## Capital Type Route
{VC Track / Angel-Early Track / Corporate Strategic Track / Non-dilutive Track / Mixed-Hold}

## Current Stage (verified)
{stage from database, with traction evidence}

## Revenue & Traction
- ARR: {arrTraction}
- Paying customers: {from database}

## Ask Size & Round Structure
- Raising: {askSize}
- Home market: {homeMarket}
- Target market: {targetMarket}

## Founder Profile
{founderProfile}

## Investor Intro Status
{Open / Paused / Declined}

## Match Summary
{Count of Tier 1, Tier 2, Tier 3 matches from database}

## Key Investors to Watch
{Top 3 Tier 1 matches with warm path and next step}

## Notes
{Empty — agent fills this in during conversations}
```

Create these for: Fermi Dev, Aibo Fintech, Try and Buy, Monk Trader, Omniful, Voltie, SaMMY PC, Quanscient, VEMOCO, WIDMO Spectral.

- [ ] **Step 3: Deploy to gateway workspace**

```bash
# SCP the companies directory contents (note trailing slash to copy CONTENTS, not the folder itself)
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 'rm -rf /tmp/workspace-companies && mkdir -p /tmp/workspace-companies'
scp -r -i ~/.ssh/id_ed25519 deploy/workspace/companies/ root@67.205.157.55:/tmp/workspace-companies/

# Create the target directory in the container and copy
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 '
  docker exec openclaw-gateway mkdir -p /home/node/.openclaw/workspace/companies
  # Copy each company folder individually to avoid nesting issues
  for d in /tmp/workspace-companies/*/; do
    name=$(basename "$d")
    docker cp "$d" "openclaw-gateway:/home/node/.openclaw/workspace/companies/$name"
  done
  # Also copy README.md if it exists
  [ -f /tmp/workspace-companies/README.md ] && docker cp /tmp/workspace-companies/README.md openclaw-gateway:/home/node/.openclaw/workspace/companies/README.md
  docker exec openclaw-gateway chown -R node:node /home/node/.openclaw/workspace/companies/
  docker exec openclaw-gateway ls /home/node/.openclaw/workspace/companies/
'
```

- [ ] **Step 4: Verify**

Ask the agent: "Read the profile for Omniful and summarize their investor readiness."
Expected: The agent reads `companies/omniful/profile.md` and gives a structured answer referencing the profile data.

- [ ] **Step 5: Commit**

```bash
git add deploy/workspace/companies/
git commit -m "feat(agent): per-company workspace profiles for all 10 portfolio companies"
```

---

### Phase 4: HEARTBEAT.md — Maintenance Checks

**Goal:** The agent periodically checks for stale matches, unactivated Tier 1 intros, and pipeline items stuck in "Not Started."

#### Task 4.1: Write HEARTBEAT.md

**Files:**
- Create: `deploy/workspace/HEARTBEAT.md`

- [ ] **Step 1: Write the heartbeat instructions**

```markdown
# HEARTBEAT.md — Periodic Maintenance

Check the following on each heartbeat. Report only items that need attention.

## 1. Stale Tier 1 Matches
Use list_matches for each company. If any Tier 1 match has pipelineStatus "not_started" AND the match was created more than 7 days ago, flag it:
"⚠ {Company} × {Investor} is Tier 1 (score {X}/16) but pipeline status is still 'Not Started'. Consider activating."

## 2. Pipeline Stuck Items
Check for any match with pipelineStatus "outreach_sent" for more than 14 days without moving to "meeting_set" or "follow_up". Flag these for review.

## 3. Company Profile Gaps
Check if companies/*/profile.md exists for each company in the database. If any company is missing a profile, flag it.

## 4. Quick Summary
End with a one-line status: "{N} companies healthy, {M} items need attention."

If everything is fine, reply: HEARTBEAT_OK
```

- [ ] **Step 2: Deploy + commit**

```bash
scp -i ~/.ssh/id_ed25519 deploy/workspace/HEARTBEAT.md root@67.205.157.55:/tmp/HEARTBEAT.md
ssh -i ~/.ssh/id_ed25519 root@67.205.157.55 '
  docker cp /tmp/HEARTBEAT.md openclaw-gateway:/home/node/.openclaw/workspace/HEARTBEAT.md
  docker exec openclaw-gateway chown node:node /home/node/.openclaw/workspace/HEARTBEAT.md
'
git add deploy/workspace/HEARTBEAT.md
git commit -m "feat(agent): HEARTBEAT.md — periodic maintenance checks for stale matches"
```

---

### Phase 5: Media Understanding — PDF/Image Analysis

**Goal:** Ahmed can upload a pitch deck PDF or image to a company session, the agent analyzes it and writes a structured profile.md.

**Context:** The z.ai GLM-4.5 model has media understanding capability (registered in the gateway as `zai` media provider). OpenClaw's agent has `file.read` and `file.write` tools for workspace files. The missing piece is getting the file FROM the browser INTO the workspace.

#### Task 5.1: Add `/upload` endpoint to the bridge

**Files:**
- Modify: `deploy/openclaw-chat-bridge.mjs`

- [ ] **Step 1: Add file upload handler**

Add a `POST /upload` endpoint that:
1. Accepts multipart/form-data with fields: `file` (the binary), `companySlug` (e.g., "omniful"), `filename` (original name)
2. Saves the file to `/home/node/.openclaw/workspace/companies/{companySlug}/{filename}`
3. Returns `{ ok: true, path: "companies/{companySlug}/{filename}" }`

Use Node's built-in `http` module to parse multipart. Since we can't use npm packages, implement a minimal multipart parser or use a simpler approach: accept the file as a base64-encoded JSON body instead of multipart:

```json
POST /upload
{
  "companySlug": "omniful",
  "filename": "pitch-deck.pdf",
  "contentBase64": "JVBERi0xLjQK..."
}
```

The bridge decodes base64 and writes to the workspace.

For PDFs specifically: after saving the file, run a conversion step. The container has Node but not `pdftotext`. Two options:
- Option A: Use a Node-based PDF text extractor (pdf-parse) — but we can't install npm packages in the container.
- Option B: Save the raw file and tell the agent to analyze it using its media understanding capability. GLM-4.5 can process images — if the PDF is converted to images first.
- Option C (simplest for POC): Accept already-converted markdown or plain text uploads. Ahmed pastes the pitch deck content into a text field, the bridge saves it as `pitch-deck.md`.

**Recommendation for POC:** Option C. Accept text content directly. The upload endpoint saves it as a markdown file in the company workspace. PDF-to-markdown conversion is a future enhancement.

```json
POST /upload
{
  "companySlug": "omniful",
  "filename": "pitch-deck.md",
  "content": "# Omniful Pitch Deck\n\n## Problem\n..."
}
```

- [ ] **Step 2: Commit**

```bash
git add deploy/openclaw-chat-bridge.mjs
git commit -m "feat(bridge): /upload endpoint saves files to company workspace folders"
```

#### Task 5.2: Add upload UI to the analyst chat pane

**Files:**
- Create: `src/app/(site)/analyst/_components/upload-modal.tsx`
- Modify: `src/app/(site)/analyst/_components/message-pane.tsx`

- [ ] **Step 1: Create upload modal component**

A client component with a text area for pasting pitch deck content (or other documents).

**Props:** `openclawSessionId: string`, `sendMessage: (content: string) => void` (from the hook — NOT a bare fetch)

**Deriving companySlug from session ID:**
The session ID format is `tbdc-co-{companyId}` where `companyId` is a cuid like `cmnrud20300122qqf14aaxejh`. The company FOLDER name in the workspace is the company's actual name (e.g., "omniful"), not the cuid. The upload modal needs to know the folder name. Two options:
- Option A (simple): Add a `companyName` prop passed from the page component, slugify it: `companyName.toLowerCase().replace(/\s+/g, "-")`
- Option B: The bridge resolves the cuid to a folder name by querying the database

Use Option A for POC. The page already has the `displayName` from the channel sidebar.

**Fields:** Company folder (pre-filled from `displayName` slugified), Filename (default: "pitch-deck.md"), Content (large textarea)

**On submit:**
1. POST to `/api/openclaw/upload` with `companySlug`, `filename`, and `content`
2. On success: call `sendMessage(...)` (the prop from the hook — this respects the in-flight lock and prevents concurrent agent turns) with: "I just uploaded {filename} to your workspace at companies/{companySlug}/{filename}. Please read it and create/update the company profile at companies/{companySlug}/profile.md."

**IMPORTANT:** The automatic post-upload message MUST go through the `sendMessage` function from the `useOpenClawWs` hook, NOT a direct `fetch` to the chat endpoint. This ensures the in-flight lock (`inFlightRef`) prevents race conditions if the user types something at the same time.

- [ ] **Step 2: Add upload button to MessagePane**

Add a small "📎 Upload" button next to the message input. Clicking it opens the upload modal.

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/app/\(site\)/analyst/
git commit -m "feat(analyst): upload modal for pitch deck content → agent workspace"
```

#### Task 5.3: Deploy + test end-to-end

- [ ] **Step 1: Deploy bridge + UI**

Same deploy pattern as Phase 2 Task 2.3.

- [ ] **Step 2: Test the full workflow**

1. Go to `/analyst` → Omniful channel
2. Click "📎 Upload"
3. Paste some pitch deck content into the textarea
4. Submit → file saved to workspace
5. Agent automatically receives the message about the upload
6. Agent reads the file, analyzes it, creates/updates `companies/omniful/profile.md`
7. In a future session, ask "What does Omniful's pitch deck say about their revenue model?" → agent reads the profile and answers

- [ ] **Step 3: Commit + push**

```bash
git push origin main
```

---

## Phase Dependency Graph

```
Phase 1 (Identity) ──→ Phase 3 (Company workspace) ──→ Phase 5 (Upload)
                   ──→ Phase 4 (Heartbeat)
Phase 2 (History)  ──→ independent, can run in parallel with Phase 1
```

Phase 1 and 2 are independent and can run in parallel. Phase 3 depends on Phase 1 (SKILL.md references the company workspace structure). Phase 4 depends on Phase 1 (heartbeat references the methodology). Phase 5 depends on Phase 3 (uploads go into company folders).

## Session Organization (for reference)

After implementation, the session model is:

| Session ID | Purpose | What the agent knows |
|------------|---------|---------------------|
| `tbdc-general` | Portfolio-wide analysis, cross-company questions, methodology | SKILL.md + all company profiles (can read any) |
| `tbdc-co-{companyId}` | Deep work on one company | SKILL.md + that company's profile, pitch deck, notes |

No investor-specific sessions — investors are discussed in the context of a company match or in the general session.

## Rollback

Each phase is independently reversible:
- Phase 1: Delete workspace files from gateway container
- Phase 2: Remove the useEffect from use-openclaw-ws.ts; bridge endpoint is harmless
- Phase 3: Delete company folders from workspace
- Phase 4: Empty HEARTBEAT.md to disable checks
- Phase 5: Remove upload modal component; bridge endpoint is harmless
